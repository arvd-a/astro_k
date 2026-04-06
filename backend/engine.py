"""
Astro K — Vedic astrology calculation engine.
Uses pyswisseph with Lahiri ayanamsa in sidereal mode.
All computation in RAM. No file writes.
"""

import swisseph as swe
from datetime import datetime
from zoneinfo import ZoneInfo

# ---------------------------------------------------------------------------
# Reference Data
# ---------------------------------------------------------------------------

SIGN_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha",
    "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha",
    "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
]

# Planet identifiers and their swisseph constants
# Rahu = Mean Node, Ketu = 180° opposite
PLANETS = [
    {"id": "su", "name": "Sun",     "swe_id": swe.SUN},
    {"id": "mo", "name": "Moon",    "swe_id": swe.MOON},
    {"id": "ma", "name": "Mars",    "swe_id": swe.MARS},
    {"id": "me", "name": "Mercury", "swe_id": swe.MERCURY},
    {"id": "ju", "name": "Jupiter", "swe_id": swe.JUPITER},
    {"id": "ve", "name": "Venus",   "swe_id": swe.VENUS},
    {"id": "sa", "name": "Saturn",  "swe_id": swe.SATURN},
    {"id": "ra", "name": "Rahu",    "swe_id": swe.MEAN_NODE},
    # Ketu is derived, not a direct swisseph body
]


# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

def get_sign_index(degree: float) -> int:
    """0 (Aries) to 11 (Pisces)"""
    return int(degree / 30) % 12


def get_sign_name(index: int) -> str:
    return SIGN_NAMES[index]


def get_sign_degree(degree: float) -> float:
    """Degree within the sign (0–29.999...)"""
    return round(degree % 30, 4)


def get_nakshatra_index(degree: float) -> int:
    """0 (Ashwini) to 26 (Revati). Each nakshatra spans 13°20' = 13.3333°"""
    return int(degree / (360 / 27))


def get_nakshatra_pada(degree: float) -> int:
    """1 to 4. Each pada spans 3°20' = 3.3333°"""
    nakshatra_span = 360 / 27  # 13.3333...
    pada_span = nakshatra_span / 4  # 3.3333...
    remainder = degree % nakshatra_span
    pada = int(remainder / pada_span) + 1
    # Clamp to 4 in edge case of floating point at exact boundary
    return min(pada, 4)


def _build_planet_data(degree: float, speed: float, pid: str, name: str, force_retrograde: bool = False) -> dict:
    """Build a planet data dict from raw degree and speed."""
    abs_deg = round(degree % 360, 4)
    si = get_sign_index(abs_deg)
    return {
        "id": pid,
        "name": name,
        "absolute_degree": abs_deg,
        "sign_index": si,
        "sign_name": get_sign_name(si),
        "sign_degree": get_sign_degree(abs_deg),
        "nakshatra_index": get_nakshatra_index(abs_deg),
        "nakshatra_pada": get_nakshatra_pada(abs_deg),
        "is_retrograde": force_retrograde or speed < 0,
    }


# ---------------------------------------------------------------------------
# Core Computation
# ---------------------------------------------------------------------------

def compute_chart(date_str: str, time_str: str, lat: float, lon: float, tz: str) -> dict:
    """
    Compute a full Vedic birth chart.

    Args:
        date_str: "YYYY-MM-DD"
        time_str: "HH:MM"
        lat: Geographic latitude
        lon: Geographic longitude
        tz: IANA timezone string (e.g. "Asia/Kolkata")

    Returns:
        dict matching the ChartResponse schema
    """

    # --- 1. Parse local time and convert to UTC ---
    year, month, day = map(int, date_str.split("-"))
    hour, minute = map(int, time_str.split(":"))

    local_dt = datetime(year, month, day, hour, minute, tzinfo=ZoneInfo(tz))
    utc_dt = local_dt.astimezone(ZoneInfo("UTC"))

    # Fractional hour in UTC for swisseph
    ut_hour = utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0

    # --- 2. Julian Day ---
    jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, ut_hour)

    # --- 3. Configure sidereal mode (Lahiri) ---
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    calc_flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL

    # --- 4. Ascendant & House Cusps ---
    # swe.houses_ex returns (cusps_tuple, ascmc_tuple)
    # cusps_tuple: 13 elements — [0] unused, [1]-[12] are house cusps (tropical)
    # ascmc_tuple: [0] = ASC, [1] = MC, etc.
    # For sidereal cusps we use houses_ex with sidereal flag
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'P', swe.FLG_SIDEREAL)
    # Note: houses_ex with FLG_SIDEREAL is available in pyswisseph >= 2.10

    asc_degree = round(ascmc[0] % 360, 4)
    asc_si = get_sign_index(asc_degree)

    ascendant = {
        "absolute_degree": asc_degree,
        "sign_index": asc_si,
        "sign_name": get_sign_name(asc_si),
        "sign_degree": get_sign_degree(asc_degree),
    }

    # --- 5. Houses ---
    # In Vedic (whole-sign houses from Ascendant), the house system is often
    # whole-sign: House 1 = Ascendant's sign, House 2 = next sign, etc.
    houses = []
    for i in range(12):
        h_si = (asc_si + i) % 12
        houses.append({
            "house_number": i + 1,
            "sign_index": h_si,
            "sign_name": get_sign_name(h_si),
        })

    # --- 6. Planetary Positions ---
    planets = []

    for p in PLANETS:
        result, ret_flags = swe.calc_ut(jd, p["swe_id"], calc_flags)
        # result: (longitude, latitude, distance, speed_in_longitude, ...)
        degree = result[0] % 360
        speed = result[3]

        # Rahu is always retrograde by definition
        force_retro = p["id"] == "ra"
        planets.append(_build_planet_data(degree, speed, p["id"], p["name"], force_retrograde=force_retro))

    # --- 7. Ketu = Rahu + 180° (always retrograde) ---
    rahu_data = next(p for p in planets if p["id"] == "ra")
    ketu_degree = (rahu_data["absolute_degree"] + 180) % 360
    planets.append(_build_planet_data(ketu_degree, -1, "ke", "Ketu", force_retrograde=True))

    # --- 8. Metadata ---
    metadata = {
        "calculation_engine": "pyswisseph",
        "ayanamsa": "Lahiri",
        "julian_day": round(jd, 6),
        "user_location": {
            "lat": lat,
            "lon": lon,
            "tz": tz,
        },
    }

    return {
        "metadata": metadata,
        "ascendant": ascendant,
        "planets": planets,
        "houses": houses,
    }
