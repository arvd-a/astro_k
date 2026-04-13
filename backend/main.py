"""
Astro K — FastAPI application.
Stateless. No database. No disk writes. All processing in RAM.
"""

import os
import httpx
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from timezonefinder import TimezoneFinder

from models import (
    ChartRequest,
    ChartResponse as ChartResponseModel,
    ChatRequest,
    ChatResponse as ChatResponseModel,
)
from engine import compute_chart
from pdf_export import generate_chart_pdf

# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

app = FastAPI(
    title="Astro K",
    description="Privacy-first ephemeral Vedic astrology chart engine",
    version="1.0.0",
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, so any Vercel domain works!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize timezone finder once (loads boundary data into RAM)
tf = TimezoneFinder(in_memory=True)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def health_check():
    return {"status": "ok", "engine": "Astro K"}


@app.post("/api/chart", response_model=ChartResponseModel)
def generate_chart(req: ChartRequest):
    """
    Generate a Vedic birth chart.
    Receives lat/lon, resolves IANA timezone from coordinates,
    computes chart via pyswisseph, returns JSON.
    """
    # Resolve IANA timezone from coordinates
    tz = tf.timezone_at(lng=req.lon, lat=req.lat)
    if tz is None:
        # Fallback for ocean/polar coordinates
        tz = "UTC"

    try:
        chart_data = compute_chart(req.date, req.time, req.lat, req.lon, tz, req.ayanamsa, req.topocentric)
        return chart_data
    except Exception as e:
        import traceback
        return Response(content=traceback.format_exc(), status_code=500)


@app.post("/api/chart/pdf")
def generate_chart_pdf_endpoint(req: ChartRequest):
    """
    Generate a Vedic birth chart as a downloadable PDF.
    Same computation as /api/chart, but returns PDF bytes.
    """
    tz = tf.timezone_at(lng=req.lon, lat=req.lat)
    if tz is None:
        tz = "UTC"

    try:
        chart_data = compute_chart(req.date, req.time, req.lat, req.lon, tz, req.ayanamsa, req.topocentric)
        pdf_bytes = generate_chart_pdf(chart_data)

        # fpdf2's output() returns bytearray; Starlette needs bytes
        pdf_bytes = bytes(pdf_bytes)

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'attachment; filename="astro_k_chart.pdf"',
            },
        )
    except Exception as e:
        import traceback
        return Response(content=traceback.format_exc(), status_code=500)


# ---------------------------------------------------------------------------
# AI Astrologer Chat (Groq)
# ---------------------------------------------------------------------------

NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha",
    "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha",
    "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
]


def _build_chart_summary(chart_data: dict) -> str:
    """Build a detailed text summary of the chart for the AI system prompt."""
    asc = chart_data["ascendant"]
    meta = chart_data["metadata"]
    loc = meta["user_location"]

    lines = [
        "=== VEDIC BIRTH CHART DATA ===",
        f"Ayanamsa: {meta['ayanamsa']}",
        f"Location: {loc['lat']:.4f}°N, {loc['lon']:.4f}°E | TZ: {loc['tz']}",
        f"Julian Day: {meta['julian_day']}",
        "",
        f"ASCENDANT (Lagna): {asc['sign_name']} at {asc['sign_degree']:.2f}°",
        "",
        "PLANETARY POSITIONS:",
    ]

    for p in chart_data["planets"]:
        nak_name = NAKSHATRA_NAMES[p["nakshatra_index"]] if 0 <= p["nakshatra_index"] < 27 else f"Nak#{p['nakshatra_index']}"
        retro = " (Retrograde)" if p["is_retrograde"] else ""
        house_num = (p["sign_index"] - asc["sign_index"]) % 12 + 1
        lines.append(
            f"  {p['name']}: {p['sign_name']} {p['sign_degree']:.2f}° | "
            f"Nakshatra: {nak_name} Pada {p['nakshatra_pada']} | "
            f"House {house_num}{retro}"
        )

    lines.append("")
    lines.append("HOUSE CUSPS (Whole-Sign from Lagna):")
    for h in chart_data["houses"]:
        lines.append(f"  House {h['house_number']}: {h['sign_name']}")

    return "\n".join(lines)


SYSTEM_PROMPT = """You are a wise and experienced Vedic astrologer (Jyotishi). You have deep knowledge of:
- Vedic/Sidereal astrology (Parashari system)
- Nakshatras, Dashas, and Yogas
- Planetary strengths, aspects (Drishti), and house significations
- Remedial measures and practical life guidance

The user has generated a birth chart using the Astro K engine. The complete chart data is provided below. 
Use this data to answer the user's questions with detailed, insightful, and compassionate Vedic astrology readings.

When answering:
1. Reference specific planetary placements from the chart data
2. Explain the astrological reasoning behind your interpretations
3. Mention relevant Yogas if any are formed
4. Be balanced — highlight both strengths and challenges
5. Suggest practical remedies when appropriate (mantras, gems, lifestyle)
6. Be warm and encouraging, like a trusted astrologer
7. Use both Sanskrit terms and English explanations
8. Keep responses focused and readable (use paragraphs, not walls of text)

IMPORTANT: If the user asks non-astrology questions, politely redirect them to astrology-related topics.

"""


@app.post("/api/chat")
async def chat_with_astrologer(req: ChatRequest):
    """
    AI astrologer chat powered by Groq.
    Receives chart data + conversation history, returns AI response.
    """
    if not GROQ_API_KEY:
        return Response(
            content="Groq API key not configured on the server.",
            status_code=503,
        )

    # Build the system prompt with full chart context
    chart_summary = _build_chart_summary(req.chart_data.model_dump())
    system_message = SYSTEM_PROMPT + chart_summary

    # Assemble messages for Groq (OpenAI-compatible format)
    messages = [{"role": "system", "content": system_message}]
    for msg in req.messages:
        messages.append({"role": msg.role, "content": msg.content})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1024,
                },
            )

        if resp.status_code != 200:
            return Response(
                content=f"Groq API error: {resp.status_code} — {resp.text}",
                status_code=502,
            )

        data = resp.json()
        reply = data["choices"][0]["message"]["content"]
        return {"reply": reply}

    except httpx.TimeoutException:
        return Response(content="Groq API timed out.", status_code=504)
    except Exception as e:
        import traceback
        return Response(content=traceback.format_exc(), status_code=500)
