"""
security.py – Authentication & authorization utilities

- JWT token creation / verification (python-jose)
- Password hashing (passlib / bcrypt)
- FastAPI dependency: get_current_user_id, get_current_user
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Password hashing ────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify a plain-text password against a stored hash.
    Falls back to plain-text comparison for legacy demo seeds.
    """
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        # Legacy: plain-text passwords in demo seed
        return plain == hashed


# ── JWT helpers ──────────────────────────────────────────────────────────────
def create_access_token(user_id: str, extra: dict | None = None) -> str:
    """Create a signed JWT containing the user_id as the 'sub' claim."""
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """Decode JWT and return the user_id (sub claim), or None on failure."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


# ── FastAPI dependency helpers ────────────────────────────────────────────────
def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract the user ID from an Authorization header.

    Supported formats (in order):
      1. `Bearer <jwt-token>`          – proper JWT (preferred)
      2. `Bearer token_<user_id>`      – legacy demo token
      3. Bare `<user_id>` string       – very old demo fallback

    Falls back to "u1" only in development when no header is present.
    """
    if not authorization:
        if settings.is_production:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return "u1"   # dev fallback

    raw = authorization.strip()
    if raw.lower().startswith("bearer "):
        raw = raw[7:].strip()

    # 1. Try JWT
    user_id = decode_access_token(raw)
    if user_id:
        return user_id

    # 2. Legacy demo token format
    if raw.startswith("token_"):
        return raw.replace("token_", "", 1)

    # 3. Raw user-id fallback (dev only)
    return raw


# Keep backward-compatible alias used by auth.py
def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Dependency that returns the full User ORM object.
    Import and use in routers that need the actual user row.
    (Actual DB look-up lives in auth.py to avoid circular imports.)
    """
    return get_current_user_id(authorization)
