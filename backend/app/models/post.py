from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True, index=True)
    author_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    author_name = Column(String, nullable=False)
    author_role = Column(String, nullable=False)
    author_college = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    post_type = Column(String, default="update") # update, project, job
    timestamp = Column(String, default="Just now")
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan", lazy="selectin")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan", lazy="selectin")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, index=True)
    post_id = Column(String, ForeignKey("posts.id"), nullable=False, index=True)
    author_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="comments")

class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(String, ForeignKey("posts.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    post = relationship("Post", back_populates="likes")
