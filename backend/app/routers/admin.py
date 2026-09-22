from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.college import Department
from app.schemas.admin import VerifyUserRequest, CreateDepartmentRequest, AssignFacultyRequest, InviteRequest
from app.routers.auth import format_user_dict

router = APIRouter(prefix="/api/admin", tags=["College Admin"])

@router.get("/pending-users")
def get_pending_users(
    college: Optional[str] = "CIITM Institute of Technology",
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.is_approved == False)
    if college:
        query = query.filter(User.college == college)
    pending = query.all()
    return [format_user_dict(u) for u in pending]

@router.post("/verify-user")
def verify_user(request: VerifyUserRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if request.approve:
        user.is_approved = True
        db.commit()
        return {"message": f"Approved user {user.name} successfully!"}
    else:
        db.delete(user)
        db.commit()
        return {"message": "Rejected and removed user request."}

@router.get("/departments")
def get_departments(
    college: Optional[str] = "CIITM Institute of Technology",
    db: Session = Depends(get_db)
):
    query = db.query(Department)
    if college:
        query = query.filter(Department.college == college)
    depts = query.all()
    
    result = []
    for d in depts:
        base_query = db.query(User).filter(User.department == d.name, User.is_approved == True)
        if college:
            base_query = base_query.filter(User.college == college)
            
        students = base_query.filter(User.role == "student").count()
        faculty = base_query.filter(User.role == "faculty").count()
        alumni = base_query.filter(User.role == "alumni").count()
        
        result.append({
            "name": d.name,
            "college": d.college,
            "head": d.head,
            "total_students": students,
            "total_faculty": faculty,
            "total_alumni": alumni
        })
    return result

@router.post("/departments")
def create_department(
    request: CreateDepartmentRequest,
    college: Optional[str] = "CIITM Institute of Technology",
    db: Session = Depends(get_db)
):
    new_dept = Department(
        name=request.name,
        college=college,
        head="Unassigned",
        total_faculty=0,
        total_students=0
    )
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)

    return {
        "name": new_dept.name,
        "college": new_dept.college,
        "head": new_dept.head,
        "total_faculty": new_dept.total_faculty,
        "total_students": new_dept.total_students
    }

@router.delete("/departments/{department_name}")
def delete_department(
    department_name: str,
    college: Optional[str] = "CIITM Institute of Technology",
    db: Session = Depends(get_db)
):
    dept = db.query(Department).filter(
        Department.name == department_name,
        Department.college == college
    ).first()
    
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
        
    db.delete(dept)
    db.commit()
    return {"message": f"Department {department_name} deleted successfully"}

@router.post("/assign-faculty")
def assign_faculty(request: AssignFacultyRequest, db: Session = Depends(get_db)):
    faculty = db.query(User).filter(User.id == request.faculty_id).first()
    if not faculty or faculty.role != "faculty":
        raise HTTPException(status_code=400, detail="Valid faculty user required")

    faculty.department = request.department_name
    dept = db.query(Department).filter(
        Department.name == request.department_name,
        Department.college == faculty.college
    ).first()

    if dept:
        dept.head = faculty.name

    db.commit()
    return {"message": f"Assigned {faculty.name} as head of {request.department_name}"}

@router.get("/stats")
def get_admin_stats(
    college: Optional[str] = "CIITM Institute of Technology",
    db: Session = Depends(get_db)
):
    base_query = db.query(User).filter(User.college == college) if college else db.query(User)

    students = base_query.filter(User.role == "student", User.is_approved == True).count()
    faculty = base_query.filter(User.role == "faculty", User.is_approved == True).count()
    alumni = base_query.filter(User.role == "alumni", User.is_approved == True).count()
    pending = base_query.filter(User.is_approved == False).count()

    dept_query = db.query(Department)
    if college:
        dept_query = dept_query.filter(Department.college == college)
    departments_count = dept_query.count()

    return {
        "total_students": students,
        "total_faculty": faculty,
        "total_alumni": alumni,
        "pending_verifications": pending,
        "departments_count": departments_count
    }

@router.post("/invite")
def invite_alumni(request: InviteRequest):
    """Send email invitations to alumni. Stub — wire in SMTP/SendGrid for production."""
    valid_emails = [e.strip() for e in request.emails if e.strip() and '@' in e]
    if not valid_emails:
        raise HTTPException(status_code=400, detail="No valid email addresses provided.")

    # Stub: log invitation (replace with actual email sender)
    print(f"[INVITE] Subject: {request.subject}")
    print(f"[INVITE] Recipients: {valid_emails}")
    print(f"[INVITE] Message: {request.message}")

    return {
        "message": f"Invitations queued for {len(valid_emails)} recipient(s). Configure SMTP to enable real delivery.",
        "sent_to": valid_emails
    }

@router.get("/departments/{department_name}/users")
def get_department_users(
    department_name: str,
    college: Optional[str] = "CIITM Institute of Technology",
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.department == department_name, User.is_approved == True)
    if college:
        query = query.filter(User.college == college)
    users = query.all()
    return [format_user_dict(u) for u in users]

