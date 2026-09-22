from pydantic import BaseModel
from typing import Optional

class SendMessageRequest(BaseModel):
    receiver_id: str
    content: str

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    receiver_id: str
    receiver_name: str
    content: str
    timestamp: str

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    user_id: str
    name: str
    role: str
    college: str
    last_message: str
    timestamp: str
