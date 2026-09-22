from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_current_user_id
from app.models.college import College
from app.models.user import User
from app.schemas.auth import LoginRequest, SignUpRequest

router = APIRouter(tags=["Authentication"])

def format_user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "college": user.college,
        "department": user.department,
        "batch": user.batch,
        "company": user.company,
        "job_title": user.job_title,
        "bio": user.bio,
        "profile_picture_url": user.profile_picture_url,
        "linkedin_url": user.linkedin_url,
        "github_url": user.github_url,
        "portfolio_url": user.portfolio_url,
        "is_approved": user.is_approved,
        "credits": user.credits,
        "badges": [{"name": b.name, "issuer": b.issuer, "date": b.date} for b in user.badges],
        "projects": [{"id": p.id, "title": p.title, "tech": p.tech, "description": p.description, "github": p.github} for p in user.projects]
    }

def get_current_user(
    db: Session = Depends(get_db), 
    user_id: str = Depends(get_current_user_id)
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/api/colleges")
def get_colleges(db: Session = Depends(get_db)):
    colleges = db.query(College).all()
    return [{"id": c.id, "name": c.name} for c in colleges]

@router.post("/api/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_approved:
        raise HTTPException(
            status_code=403, 
            detail="Your account is pending approval from your College Admin."
        )

    return {
        "access_token": f"token_{user.id}",
        "token_type": "bearer",
        "user": format_user_dict(user)
    }

@router.post("/api/auth/signup")
def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Students and college admins are auto-approved. Faculty and Alumni require approval.
    is_approved = (request.role == "student" or request.role == "college_admin")

    # Generate next ID
    total_users = db.query(User).count()
    new_id = f"u{total_users + 1}"

    new_user = User(
        id=new_id,
        email=request.email,
        password=request.password,
        name=request.name,
        role=request.role,
        college=request.college,
        department=request.department or "General",
        batch=request.batch,
        company=request.company,
        job_title=request.job_title,
        bio=f"{request.role.capitalize()} at {request.college}",
        is_approved=is_approved,
        credits=0
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    user_dict = format_user_dict(new_user)

    if not is_approved:
        return {
            "message": "Registration successful! Your profile is pending verification by your College Admin.",
            "requires_approval": True,
            "user": user_dict
        }

    return {
        "access_token": f"token_{new_id}",
        "token_type": "bearer",
        "user": user_dict,
        "requires_approval": False
    }
