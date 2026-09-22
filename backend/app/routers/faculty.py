from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.portfolio import Badge, Project
from app.schemas.faculty import EvaluateStudentRequest
from app.routers.auth import format_user_dict

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])

@router.get("/assigned-students")
def get_assigned_students(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(authorization)
    faculty = db.query(User).filter(User.id == user_id).first()
    if not faculty:
        faculty = db.query(User).filter(User.role == "faculty").first()

    dept = faculty.department if faculty else "Computer Science"
    college = faculty.college if faculty else "CIITM Institute of Technology"

    students = db.query(User).filter(
        User.role == "student",
        User.college == college,
        User.department == dept,
        User.is_approved == True
    ).all()

    return [format_user_dict(s) for s in students]

@router.post("/evaluate")
def evaluate_student(
    request: EvaluateStudentRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(authorization)
    faculty = db.query(User).filter(User.id == user_id).first()
    issuer_name = faculty.name if faculty else "Faculty Reviewer"

    student = db.query(User).filter(User.id == request.student_id).first()
    if not student or student.role != "student":
        raise HTTPException(status_code=404, detail="Student not found")

    # Increment student academic credits
    student.credits = (student.credits or 0) + request.credits

    # Award badge
    new_badge = Badge(
        user_id=student.id,
        name=request.badge_name,
        issuer=issuer_name,
        date=datetime.now().strftime("%b %Y")
    )
    db.add(new_badge)

    # If project details provided, create a project entry for the student
    if request.project_title:
        total_projects = db.query(Project).count()
        new_project = Project(
            id=f"p_{total_projects + 1}",
            user_id=student.id,
            title=request.project_title,
            tech=request.project_tech or "",
            description=request.project_description or (request.reason or ""),
            github=request.project_github or ""
        )
        db.add(new_project)

    db.commit()
    db.refresh(student)

    return {
        "message": f"Successfully awarded {request.credits} credits and '{request.badge_name}' badge to {student.name}!",
        "student": format_user_dict(student)
    }
