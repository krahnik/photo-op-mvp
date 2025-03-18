from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class TransformationStyle(BaseModel):
    id: str
    name: str
    prompt: str
    is_active: bool = True

class EventConfig(BaseModel):
    event_name: str
    start_date: datetime
    end_date: datetime
    transformation_styles: List[TransformationStyle]
    email_template: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ImageMetadata(BaseModel):
    original_image_path: str
    transformed_image_path: str
    transformation_style: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserLead(BaseModel):
    email: EmailStr
    name: str
    event_id: str
    images: List[ImageMetadata] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow) 