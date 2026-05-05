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
    crisis_type_other: Optional[str] = None
    debris_present: Optional[str] = "no"
    location: Location
    text_location: Optional[str] = None
    video_url: Optional[str] = None
    is_duplicate: bool = False
    
    # Contact info
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    allow_contact: bool = True
    user_id: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Annexe 1 - Questions Modulaires (Sliders 0-100)
    electricity_status: Optional[int] = 50
    health_services_status: Optional[int] = 50
    urgent_needs: List[str] = []
    
    # NSFW Content Moderation
    nsfw_score: float = 0.0
    is_nsfw: bool = False
    is_flagged: bool = False
    nsfw_detection_method: Optional[str] = None
    image_blurred: bool = False

Report.model_rebuild()
