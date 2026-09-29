from pydantic import BaseModel
from typing import Optional

class EvaluateStudentRequest(BaseModel):
    student_id: str
    credits: int
    badge_name: str
    # Optional: faculty uploads a project on behalf of the student
    project_title: Optional[str] = None
    project_tech: Optional[str] = None
    project_description: Optional[str] = None
    project_github: Optional[str] = None
    # Evaluation essay / reason
    reason: Optional[str] = None

class AddProjectRequest(BaseModel):
    title: str
    tech_stack: str
    description: Optional[str] = ""
    github_link: Optional[str] = ""
    media_url: Optional[str] = None
    start_month: Optional[str] = None
    start_year: Optional[str] = None
    end_month: Optional[str] = None
    end_year: Optional[str] = None
    is_current: Optional[bool] = False
    contributors: Optional[str] = None
    associated_with: Optional[str] = None
