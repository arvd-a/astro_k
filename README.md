<p align="center">
  <strong style="font-size: 2rem;">✦</strong>
</p>

<h1 align="center">Astro K</h1>

<p align="center">
  <em>Privacy-first, ephemeral Vedic astrology chart engine</em>
</p>

<p align="center">
  <a href="https://frontend-ten-omega-60.vercel.app">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a>
</p>

---

## Overview

Astro K is a full-stack Vedic (Jyotish) astrology chart engine built for privacy and precision. It computes sidereal planetary positions using the **Swiss Ephemeris** (NASA JPL precision), renders an interactive **North Indian diamond chart**, and includes an **AI-powered Vedic astrologer chatbox** for personalized readings — all without storing a single byte of user data.

**Zero data storage. Zero tracking. Everything computed in RAM and discarded.**

---

## Features

### 🪐 Professional-Grade Vedic Engine
- **Swiss Ephemeris** (`pyswisseph`) — sub-arcsecond planetary precision using NASA JPL data
- **Multi-Ayanamsa Support** — Lahiri (default), Raman, Krishnamurti (KP), True Chitrapaksha
- **Topocentric Mode** — optional surface-level calculations for precise Moon positioning
- **Whole-Sign Houses** — traditional Vedic house system from Lagna
- **9 Graha Positions** — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- **Nakshatra & Pada** — full 27-nakshatra data with pada calculations

### 📊 Interactive North Indian Chart
- **SVG-based diamond chart** — 12-house North Indian layout with precise geometry
- **Vedic Drishti (Aspects)** — togglable aspect lines showing planetary relationships
- **Retrograde markers** — planets in retrograde clearly marked with (R)
- **Responsive design** — works on desktop and mobile viewports

### 🤖 AI Vedic Astrologer (Groq)
- **Powered by Llama 3.3 70B** via Groq's free API
- **Full chart context** — the AI receives complete chart data including houses, nakshatras, and house placements
- **Conversational** — maintains chat history for follow-up questions
- **Suggested questions** — starter prompts for career, strengths, Yogas, remedies
- **Server-side API key** — Groq key never exposed to the browser

### 📄 PDF Export
- **Chart diagram included** — North Indian diamond chart drawn with fpdf2 primitives
- **Tabular data** — planetary positions, nakshatras, padas, retrograde status
- **House cusps table** — whole-sign house assignments
- **In-memory generation** — no temporary files, pure bytes

### ✨ Animated Homepage
- **Canvas cursor trail** — gold and green particle effects following mouse movement
- **Twinkling star field** — 80 randomized stars with staggered animations
- **Orbiting zodiac ring** — 12 zodiac symbols rotating slowly behind content
- **Shimmer gradient title** — animated gradient text effect
- **Staggered hero entrance** — sequenced fade-in animations

### 🔒 Privacy by Design
- **Stateless architecture** — no database, no disk writes, no sessions
- **RAM-only processing** — all computation discarded after response
- **No analytics or tracking** — zero third-party scripts
- **Open source** — fully auditable codebase

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vercel)                         │
│                     Next.js 14 (App Router)                  │
│                                                              │
│  /  ──────── Animated Landing Page                           │
│  /chart ──── Chart Generation + AI Chat                      │
│                                                              │
│  Components:                                                 │
│  • BirthDataForm (date, time, location, ayanamsa, topo)     │
│  • NorthIndianChart (SVG diamond with planets + aspects)     │
│  • AstrologerChat (floating Groq-powered chat panel)        │
│  • CursorTrail (canvas particle effects)                    │
│  • CosmicBackground (ambient star field)                    │
└──────────────────┬───────────────────────────────────────────┘
                   │  HTTPS (CORS)
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND (Render)                          │
│                     FastAPI (Python)                          │
│                                                              │
│  POST /api/chart     ── Vedic chart computation (JSON)       │
│  POST /api/chart/pdf ── PDF with diagram + tables            │
│  POST /api/chat      ── AI astrologer via Groq               │
│  GET  /              ── Health check                         │
│                                                              │
│  Engine Stack:                                               │
│  • pyswisseph (Swiss Ephemeris)                              │
│  • timezonefinder (offline IANA timezone from lat/lon)       │
│  • zoneinfo (historical DST handling)                        │
│  • fpdf2 (PDF generation)                                   │
│  • httpx (async Groq API calls)                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Vanilla CSS, Canvas API |
| **Backend** | FastAPI, Python 3.11+, Uvicorn |
| **Ephemeris** | pyswisseph (Swiss Ephemeris / NASA JPL) |
| **AI** | Groq API (Llama 3.3 70B Versatile) |
| **PDF** | fpdf2 |
| **Timezone** | timezonefinder + zoneinfo |
| **Geocoding** | OpenStreetMap Nominatim |
| **Hosting** | Vercel (frontend) + Render (backend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- C/C++ build tools (for pyswisseph compilation)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Vercel / `.env.local` | Backend API URL |
| `GROQ_API_KEY` | Render | Groq API key for AI astrologer |

---

## API Reference

### `POST /api/chart`

Generate a Vedic birth chart.

```json
{
  "date": "1990-01-15",
  "time": "05:30",
  "lat": 8.5241,
  "lon": 76.9366,
  "ayanamsa": "lahiri",
  "topocentric": false
}
```

**Ayanamsa options:** `lahiri`, `raman`, `kp`, `true_chitrapaksha`

### `POST /api/chart/pdf`

Same payload as above. Returns `application/pdf` binary.

### `POST /api/chat`

AI astrologer conversation.

```json
{
  "chart_data": { /* full ChartResponse object */ },
  "messages": [
    { "role": "user", "content": "What are the key strengths in my chart?" }
  ]
}
```

---

## Deployment

### Render (Backend)

- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
- **Env Vars:** `GROQ_API_KEY`

### Vercel (Frontend)

- **Root Directory:** `frontend`
- **Framework:** Next.js
- **Env Vars:** `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`

---

## Accuracy

The core engine uses the **exact same mathematical foundation** as professional astrology software (Jagannatha Hora, AstroSage, AstroGold):

- **Swiss Ephemeris** — based on NASA JPL Development Ephemeris
- **Lahiri Ayanamsa** — officially adopted by the Government of India
- **Historical DST** — handled correctly via Python's `zoneinfo` stdlib
- **Sub-arcsecond precision** — planetary positions accurate to fractions of an arcsecond
- **6-decimal Julian Day** — ~0.08 second time precision

---

## License

MIT

---

<p align="center">
  <em>Built with ✦ by the Astro K team</em>
</p>
