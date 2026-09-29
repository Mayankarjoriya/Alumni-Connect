from pydantic import BaseModel
from typing import Optional

class SendMessageRequest(BaseModel):
    receiver_id: str
    content: str
    iv: Optional[str] = None
    is_encrypted: Optional[bool] = True

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    receiver_id: str
    receiver_name: str
    content: str
    iv: Optional[str] = None
    is_encrypted: Optional[bool] = True
    timestamp: str

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    user_id: str
    name: str
    role: str
    college: str
    last_message: str
    last_message_iv: Optional[str] = None
    last_message_is_encrypted: Optional[bool] = True
    timestamp: str
    unread_count: Optional[int] = 0
