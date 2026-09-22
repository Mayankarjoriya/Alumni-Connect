from typing import Optional
from fastapi import Header, HTTPException, status

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract user id from Authorization header formatted as 'Bearer token_<user_id>'."""
    if not authorization:
        # Default fallback for demo / unauthenticated calls
        return "u1"
    
    token = authorization.replace("Bearer ", "").strip()
    if token.startswith("token_"):
        return token.replace("token_", "")
    return token

def verify_password(plain_password: str, stored_password: str) -> bool:
    return plain_password == stored_password
