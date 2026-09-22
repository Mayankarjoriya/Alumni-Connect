from pydantic import BaseModel
from typing import Optional

class CreateBulletinRequest(BaseModel):
    board: str          # 'jobs' | 'collab'
    title: str
    content: Optional[str] = None
    link: Optional[str] = None
