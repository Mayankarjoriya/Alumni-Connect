from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.user import User
from app.routers.auth import format_user_dict, get_current_user
from app.schemas.user import UserUpdateProfileSchema, PublicKeyUpdate, LinkedInExtractRequest, LinkedInSnippetRequest
from app.services.linkedin_extractor import fetch_linkedin_profile, parse_pasted_linkedin_text

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/public-key")
def upload_public_key(
    data: PublicKeyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.public_key = data.public_key
    db.commit()
    return {"message": "Public key uploaded successfully"}

@router.get("/{user_id}/public-key")
def get_public_key(
    user_id: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.public_key:
        raise HTTPException(status_code=404, detail="Public key not found for this user")
    return {"public_key": user.public_key}

@router.patch("/me")
def update_profile(
    update_data: UserUpdateProfileSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if update_data.bio is not None:
        current_user.bio = update_data.bio
    if update_data.profile_picture_url is not None:
        current_user.profile_picture_url = update_data.profile_picture_url
    if update_data.cover_picture_url is not None:
        current_user.cover_picture_url = update_data.cover_picture_url
    if update_data.resume_url is not None:
        current_user.resume_url = update_data.resume_url
    if update_data.linkedin_url is not None:
        current_user.linkedin_url = update_data.linkedin_url
    if update_data.github_url is not None:
        current_user.github_url = update_data.github_url
    if update_data.portfolio_url is not None:
        current_user.portfolio_url = update_data.portfolio_url
    # Extended fields
    if update_data.location is not None:
        current_user.location = update_data.location
    if update_data.skills is not None:
        current_user.skills = update_data.skills
    if update_data.designation is not None:
        current_user.designation = update_data.designation
    if update_data.experience_years is not None:
        current_user.experience_years = update_data.experience_years
    if update_data.research_interests is not None:
        current_user.research_interests = update_data.research_interests
    if update_data.courses_taught is not None:
        current_user.courses_taught = update_data.courses_taught
    if update_data.open_to_mentor is not None:
        current_user.open_to_mentor = update_data.open_to_mentor
    if update_data.graduation_year is not None:
        current_user.graduation_year = update_data.graduation_year
    if update_data.industry is not None:
        current_user.industry = update_data.industry
        
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

@router.post("/extract-linkedin")
async def extract_linkedin_data(
    payload: LinkedInExtractRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Extract public profile details (bio, headline, company, designation, skills, photo)
    from a LinkedIn URL.
    """
    try:
        result = await fetch_linkedin_profile(payload.linkedin_url)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract LinkedIn profile: {str(e)}")

@router.post("/parse-linkedin-text")
async def parse_linkedin_text(
    payload: LinkedInSnippetRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Parse a copied/pasted LinkedIn profile or resume snippet to extract structured details.
    Uses DeepSeek / LLM if configured, with regex fallback.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    data = await parse_pasted_linkedin_text(payload.text)
    return {
        "success": True,
        "data": data,
        "message": "Successfully parsed profile snippet."
    }

@router.get("/{user_id}")
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return format_user_dict(user)
