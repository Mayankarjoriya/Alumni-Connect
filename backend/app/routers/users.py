from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.user import User
from app.routers.auth import format_user_dict, get_current_user
from app.schemas.user import UserUpdateProfileSchema

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.put("/me")
def update_profile(
    update_data: UserUpdateProfileSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if update_data.bio is not None:
        current_user.bio = update_data.bio
    if update_data.profile_picture_url is not None:
        current_user.profile_picture_url = update_data.profile_picture_url
    if update_data.linkedin_url is not None:
        current_user.linkedin_url = update_data.linkedin_url
    if update_data.github_url is not None:
        current_user.github_url = update_data.github_url
    if update_data.portfolio_url is not None:
        current_user.portfolio_url = update_data.portfolio_url
        
    db.commit()
    db.refresh(current_user)
    return format_user_dict(current_user)

@router.get("/search")
def search_users(
    q: Optional[str] = "",
    role: Optional[str] = "",
    college: Optional[str] = "",
    top_students: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.is_approved == True)

    if q:
        search_pattern = f"%{q.lower()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_pattern),
                User.department.ilike(search_pattern),
                User.college.ilike(search_pattern)
            )
        )

    if role:
        query = query.filter(User.role == role)

    if college:
        query = query.filter(User.college == college)

    if top_students:
        query = query.filter(User.role == "student").order_by(User.credits.desc())

    users = query.all()
    return [format_user_dict(u) for u in users]

@router.get("/{user_id}")
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return format_user_dict(user)
