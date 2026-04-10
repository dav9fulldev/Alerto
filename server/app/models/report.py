from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime

class Location(BaseModel):
    type: str = "Point"
    coordinates: list[float]  # [longitude, latitude]

class Report(BaseModel):
    image_url: Optional[str] = None
    description: str = Field(..., min_length=3)
    translated_description: Optional[str] = None
    ai_suggested_level: Optional[str] = None
    damage_level: Literal["minime", "partiel", "complet"]
    infrastructure_type: str
    crisis_type: str
    debris_present: bool = False
    location: Location
    text_location: Optional[str] = None
    is_duplicate: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Annexe 1 - Questions Modulaires
    electricity_status: Optional[str] = None
    health_services_status: Optional[str] = None
    urgent_needs: List[str] = []

Report.model_rebuild()
