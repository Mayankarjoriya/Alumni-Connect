from pydantic import BaseModel
from typing import List, Optional

class BadgeSchema(BaseModel):
    name: str
    issuer: str
    date: str

    class Config:
        from_attributes = True

class ProjectSchema(BaseModel):
    id: str
    title: str
    tech: str
    description: Optional[str] = ""
    github: Optional[str] = ""

    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    college: str
    department: Optional[str] = "General"
    batch: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    is_approved: bool = True
    credits: int = 0
    badges: List[BadgeSchema] = []
    projects: List[ProjectSchema] = []

    class Config:
        from_attributes = True

class UserUpdateProfileSchema(BaseModel):
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
