"""
Astro K — Pydantic models for the chart API contract.
Matches the JSON data contract exactly.
"""

from pydantic import BaseModel, Field
from typing import List


class ChartRequest(BaseModel):
    """
    Incoming birth data from the frontend.
    Timezone is NOT sent — backend resolves it from lat/lon via timezonefinder.
    """
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="YYYY-MM-DD")
    time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="HH:MM (24h)")
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
    ayanamsa: str = Field("lahiri", description="Ayanamsa system: lahiri, raman, kp, true_chitrapaksha")
    topocentric: bool = Field(False, description="Use topocentric (surface-level) calculations")


class UserLocation(BaseModel):
    lat: float
    lon: float
    tz: str = Field(..., description="IANA timezone string, e.g. Asia/Kolkata")


class Metadata(BaseModel):
    calculation_engine: str = "pyswisseph"
    ayanamsa: str = "Lahiri"
    topocentric: bool = False
    julian_day: float
    user_location: UserLocation


class AscendantData(BaseModel):
    absolute_degree: float = Field(..., ge=0, lt=360)
    sign_index: int = Field(..., ge=0, le=11)
    sign_name: str
    sign_degree: float = Field(..., ge=0, lt=30)


class PlanetData(BaseModel):
    id: str = Field(..., description="Short id: su, mo, ma, me, ju, ve, sa, ra, ke")
    name: str
    absolute_degree: float = Field(..., ge=0, lt=360)
    sign_index: int = Field(..., ge=0, le=11)
    sign_name: str
    sign_degree: float = Field(..., ge=0, lt=30)
    nakshatra_index: int = Field(..., ge=0, le=26)
    nakshatra_pada: int = Field(..., ge=1, le=4)
    is_retrograde: bool


class HouseData(BaseModel):
    house_number: int = Field(..., ge=1, le=12)
    sign_index: int = Field(..., ge=0, le=11)
    sign_name: str


class ChartResponse(BaseModel):
    metadata: Metadata
    ascendant: AscendantData
    planets: List[PlanetData]
    houses: List[HouseData]


# ---------------------------------------------------------------------------
# Chat Models (Groq-powered astrologer)
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str

class ChatRequest(BaseModel):
    chart_data: ChartResponse
    messages: List[ChatMessage] = Field(..., description="Conversation history")

class ChatResponse(BaseModel):
    reply: str
