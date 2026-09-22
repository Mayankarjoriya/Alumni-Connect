from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from app.core.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    sender_name = Column(String, nullable=False)
    receiver_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    receiver_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
