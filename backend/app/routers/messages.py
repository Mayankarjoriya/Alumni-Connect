from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.message import Message
from app.models.user import User
from app.schemas.message import SendMessageRequest

router = APIRouter(prefix="/api/messages", tags=["Messages"])

@router.get("/conversations")
def get_conversations(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    current_id = get_current_user_id(authorization)

    # Get all messages where current user is sender or receiver
    messages = db.query(Message).filter(
        or_(Message.sender_id == current_id, Message.receiver_id == current_id)
    ).order_by(Message.created_at.asc()).all()

    conversations = {}
    for m in messages:
        other_id = m.receiver_id if m.sender_id == current_id else m.sender_id
        other_user = db.query(User).filter(User.id == other_id).first()
        if other_user:
            conversations[other_id] = {
                "user_id": other_id,
                "name": other_user.name,
                "role": other_user.role,
                "college": other_user.college,
                "last_message": m.content,
                "timestamp": m.timestamp
            }

    return list(conversations.values())

@router.get("/{other_user_id}")
def get_messages_with_user(
    other_user_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    current_id = get_current_user_id(authorization)

    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_id)
        )
    ).order_by(Message.created_at.asc()).all()

    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_name": m.sender_name,
            "receiver_id": m.receiver_id,
            "receiver_name": m.receiver_name,
            "content": m.content,
            "timestamp": m.timestamp
        }
        for m in messages
    ]

@router.post("")
def send_message(
    request: SendMessageRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    sender_id = get_current_user_id(authorization)
    sender = db.query(User).filter(User.id == sender_id).first()
    if not sender:
        sender = db.query(User).filter(User.role == "student").first()

    receiver = db.query(User).filter(User.id == request.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver user not found")

    total_msgs = db.query(Message).count()
    new_msg = Message(
        id=f"m_{total_msgs + 1}",
        sender_id=sender.id,
        sender_name=sender.name,
        receiver_id=receiver.id,
        receiver_name=receiver.name,
        content=request.content,
        timestamp=datetime.now().strftime("%I:%M %p")
    )

    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return {
        "id": new_msg.id,
        "sender_id": new_msg.sender_id,
        "sender_name": new_msg.sender_name,
        "receiver_id": new_msg.receiver_id,
        "receiver_name": new_msg.receiver_name,
        "content": new_msg.content,
        "timestamp": new_msg.timestamp
    }
