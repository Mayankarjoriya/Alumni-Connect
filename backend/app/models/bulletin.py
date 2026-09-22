from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime
from app.core.database import Base

class BulletinPost(Base):
    __tablename__ = "bulletin_posts"

    id = Column(String, primary_key=True)
    board = Column(String, nullable=False, index=True)  # 'jobs' | 'collab'
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    link = Column(String, nullable=True)
    author_id = Column(String, nullable=False)
    author_name = Column(String, nullable=False)
    author_role = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
