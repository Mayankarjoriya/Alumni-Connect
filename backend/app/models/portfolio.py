from sqlalchemy import Column, String, Integer, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    date = Column(String, nullable=False)

    user = relationship("User", back_populates="badges")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    tech = Column(String, nullable=False)
    description = Column(Text, default="")
    github = Column(String, default="")
    media_url = Column(Text, nullable=True)
    start_month = Column(String, nullable=True)
    start_year = Column(String, nullable=True)
    end_month = Column(String, nullable=True)
    end_year = Column(String, nullable=True)
    is_current = Column(Boolean, default=False)
    contributors = Column(Text, nullable=True)    # comma-separated names
    associated_with = Column(String, nullable=True)

    user = relationship("User", back_populates="projects")
