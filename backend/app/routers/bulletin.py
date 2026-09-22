from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.bulletin import BulletinPost
from app.schemas.bulletin import CreateBulletinRequest

router = APIRouter(prefix="/api/bulletin", tags=["Bulletin Board"])

JOBS_ROLES  = {"faculty", "alumni", "college_admin"}
COLLAB_ROLES = {"student"}

def _format(p: BulletinPost) -> dict:
    return {
        "id": p.id,
        "board": p.board,
        "title": p.title,
        "content": p.content,
        "link": p.link,
        "author_id": p.author_id,
        "author_name": p.author_name,
        "author_role": p.author_role,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }

@router.get("")
def get_bulletin_posts(
    board: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(BulletinPost)
    if board:
        query = query.filter(BulletinPost.board == board)
    posts = query.order_by(BulletinPost.created_at.desc()).all()
    return [_format(p) for p in posts]

@router.post("")
def create_bulletin_post(
    request: CreateBulletinRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(authorization)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if request.board == "jobs" and user.role not in JOBS_ROLES:
        raise HTTPException(status_code=403, detail="Only faculty, alumni, and admins can post to the Jobs board.")
    if request.board == "collab" and user.role not in COLLAB_ROLES:
        raise HTTPException(status_code=403, detail="Only students can post to the Collaboration board.")
    if request.board not in ("jobs", "collab"):
        raise HTTPException(status_code=400, detail="Invalid board. Use 'jobs' or 'collab'.")

    total = db.query(BulletinPost).count()
    new_post = BulletinPost(
        id=f"bp_{total + 1}",
        board=request.board,
        title=request.title,
        content=request.content,
        link=request.link,
        author_id=user.id,
        author_name=user.name,
        author_role=user.role,
        created_at=datetime.utcnow()
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return _format(new_post)

@router.delete("/{post_id}")
def delete_bulletin_post(
    post_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(authorization)
    user = db.query(User).filter(User.id == user_id).first()
    post = db.query(BulletinPost).filter(BulletinPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != user_id and (not user or user.role != "college_admin"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this post.")

    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully."}
