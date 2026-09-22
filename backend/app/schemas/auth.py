from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str

class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str  # 'student', 'faculty', 'alumni', 'college_admin'
    college: str
    department: Optional[str] = "General"
    batch: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    requires_approval: Optional[bool] = False
    message: Optional[str] = None
