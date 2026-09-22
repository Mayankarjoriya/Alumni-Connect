from pydantic import BaseModel
from typing import List, Optional

class CreatePostRequest(BaseModel):
    content: str
    post_type: Optional[str] = "update" # 'project', 'job', 'update'
    project_link: Optional[str] = None

class CommentRequest(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: str
    author_name: str
    content: str

    class Config:
        from_attributes = True

class PostResponse(BaseModel):
    id: str
    author_id: str
    author_name: str
    author_role: str
    author_college: str
    content: str
    post_type: str
    likes: List[str] = [] # list of user_ids
    comments: List[CommentResponse] = []
    timestamp: str

    class Config:
        from_attributes = True
