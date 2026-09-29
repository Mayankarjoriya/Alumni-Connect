from typing import Optional
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.portfolio import Project
from app.schemas.faculty import AddProjectRequest

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.post("")
def add_project(
    request: AddProjectRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(authorization)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).filter(User.role == "student").first()

    total_projects = db.query(Project).count()
    new_project = Project(
        id=f"p_{total_projects + 1}",
        user_id=user.id,
        title=request.title,
        tech=request.tech_stack,
        description=request.description or "",
        github=request.github_link or "",
        media_url=request.media_url,
        start_month=request.start_month,
        start_year=request.start_year,
        end_month=request.end_month,
        end_year=request.end_year,
        is_current=request.is_current or False,
        contributors=request.contributors,
        associated_with=request.associated_with,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "id": new_project.id,
        "title": new_project.title,
        "tech": new_project.tech,
        "description": new_project.description,
        "github": new_project.github,
        "media_url": new_project.media_url,
        "start_month": new_project.start_month,
        "start_year": new_project.start_year,
        "end_month": new_project.end_month,
        "end_year": new_project.end_year,
        "is_current": new_project.is_current,
        "contributors": new_project.contributors,
        "associated_with": new_project.associated_with,
    }
