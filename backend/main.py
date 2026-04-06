"""
Astro K — FastAPI application.
Stateless. No database. No disk writes. All processing in RAM.
"""

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from timezonefinder import TimezoneFinder

from models import ChartRequest, ChartResponse
from engine import compute_chart
from pdf_export import generate_chart_pdf

# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Astro K",
    description="Privacy-first ephemeral Vedic astrology chart engine",
    version="1.0.0",
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # Local dev
        "https://astro-k.vercel.app",  # Production (update after deploy)
    ],
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


@app.post("/api/chart", response_model=ChartResponse)
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

    chart_data = compute_chart(req.date, req.time, req.lat, req.lon, tz)
    return chart_data


@app.post("/api/chart/pdf")
def generate_chart_pdf_endpoint(req: ChartRequest):
    """
    Generate a Vedic birth chart as a downloadable PDF.
    Same computation as /api/chart, but returns PDF bytes.
    """
    tz = tf.timezone_at(lng=req.lon, lat=req.lat)
    if tz is None:
        tz = "UTC"

    chart_data = compute_chart(req.date, req.time, req.lat, req.lon, tz)
    pdf_bytes = generate_chart_pdf(chart_data)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="astro_k_chart.pdf"',
        },
    )
