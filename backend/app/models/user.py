from sqlalchemy import Column, String, Boolean, Integer, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, index=True) # student, faculty, alumni, college_admin
    college = Column(String, nullable=False, index=True)
    department = Column(String, default="General", index=True)
    batch = Column(String, nullable=True)
    company = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    cover_picture_url = Column(String, nullable=True)
    resume_url = Column(Text, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    is_approved = Column(Boolean, default=True)
    credits = Column(Integer, default=0)

    # Extended profile fields
    location = Column(String, nullable=True)                # "Mumbai, India"
    skills = Column(Text, nullable=True)                    # comma-separated: "Python,React,ML"
    designation = Column(String, nullable=True)             # Faculty: "Assistant Professor"
    experience_years = Column(Integer, nullable=True)       # Faculty/Alumni
    research_interests = Column(Text, nullable=True)        # Faculty: comma-separated tags
    courses_taught = Column(Text, nullable=True)            # Faculty: comma-separated
    open_to_mentor = Column(Boolean, default=False)         # Alumni
    graduation_year = Column(String, nullable=True)         # Alumni / Student
    industry = Column(String, nullable=True)                # Alumni industry sector

    # Relationships
    badges = relationship("Badge", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
