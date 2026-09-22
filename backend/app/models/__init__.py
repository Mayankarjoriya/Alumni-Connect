from app.models.college import College, Department
from app.models.user import User
from app.models.portfolio import Project, Badge
from app.models.post import Post, Comment, PostLike
from app.models.message import Message
from app.models.bulletin import BulletinPost

__all__ = [
    "College",
    "Department",
    "User",
    "Project",
    "Badge",
    "Post",
    "Comment",
    "PostLike",
    "Message",
    "BulletinPost"
]
