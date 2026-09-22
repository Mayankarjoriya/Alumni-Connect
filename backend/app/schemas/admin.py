from pydantic import BaseModel
from typing import Optional

class VerifyUserRequest(BaseModel):
    user_id: str
    approve: bool

class CreateDepartmentRequest(BaseModel):
    name: str
    head_id: Optional[str] = None

class AssignFacultyRequest(BaseModel):
    faculty_id: str
    department_name: str

class AdminStatsResponse(BaseModel):
    total_students: int
    total_faculty: int
    total_alumni: int
    pending_verifications: int
    departments_count: int

class InviteRequest(BaseModel):
    emails: list[str]
    subject: str
    message: str
