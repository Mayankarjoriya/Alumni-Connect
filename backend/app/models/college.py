from sqlalchemy import Column, String, Integer
from app.core.database import Base

class College(Base):
    __tablename__ = "colleges"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, index=True)
    college = Column(String, nullable=False, index=True)
    head = Column(String, default="Unassigned")
    total_faculty = Column(Integer, default=0)
    total_students = Column(Integer, default=0)
