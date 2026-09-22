from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.post import Post, Comment, PostLike
from app.models.user import User
from app.schemas.post import CreatePostRequest, CommentRequest

router = APIRouter(prefix="/api/posts", tags=["Posts"])

def format_post_dict(post: Post) -> dict:
    return {
        "id": post.id,
        "author_id": post.author_id,
        "author_name": post.author_name,
        "author_role": post.author_role,
        "author_college": post.author_college,
        "content": post.content,
        "post_type": post.post_type,
        "likes": [like.user_id for like in post.likes],
        "comments": [
            {"id": c.id, "author_name": c.author_name, "content": c.content}
            for c in post.comments
        ],
        "timestamp": post.timestamp
    }

@router.get("")
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).all()
    return [format_post_dict(p) for p in posts]

@router.post("")
def create_post(
    request: CreatePostRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    current_user_id = get_current_user_id(authorization)
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        user = db.query(User).filter(User.role == "student").first()

    total_posts = db.query(Post).count()
    new_post = Post(
        id=f"post_{total_posts + 1}",
        author_id=user.id,
        author_name=user.name,
        author_role=user.role,
        author_college=user.college,
        content=request.content,
        post_type=request.post_type or "update",
        timestamp="Just now"
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return format_post_dict(new_post)

@router.post("/{post_id}/like")
def toggle_like(
    post_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(authorization)
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == user_id
    ).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()
        liked = False
    else:
        new_like = PostLike(post_id=post_id, user_id=user_id)
        db.add(new_like)
        db.commit()
        liked = True

    current_likes_count = db.query(PostLike).filter(PostLike.post_id == post_id).count()
    return {"likes_count": current_likes_count, "liked": liked}

@router.post("/{post_id}/comment")
def add_comment(
    post_id: str,
    request: CommentRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(authorization)
    user = db.query(User).filter(User.id == user_id).first()
    author_name = user.name if user else "Anonymous"

    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    total_comments = db.query(Comment).count()
    new_comment = Comment(
        id=f"c_{total_comments + 1}",
        post_id=post_id,
        author_name=author_name,
        content=request.content
    )

    db.add(new_comment)
    db.commit()

    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    return [{"id": c.id, "author_name": c.author_name, "content": c.content} for c in comments]
