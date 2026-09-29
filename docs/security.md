# Security Guide

> JWT Authentication, bcrypt Passwords, Rate Limiting & Middleware — Alumni Connect Security Architecture

---

## Overview

Alumni Connect implements a layered defence security strategy:

```
Client Request
      │
      ▼
 TrustedHostMiddleware      ← Block unknown hostnames (production)
      │
 CORSMiddleware             ← Restrict cross-origin requests
      │
 SlowAPIMiddleware          ← IP-based rate limiting
      │
 RequestLoggingMiddleware   ← Trace IDs + structured logging
      │
 SecurityHeadersMiddleware  ← OWASP response headers
      │
 Route Handler              ← JWT auth dependency
      │
 Database
```

---

## 🔒 End-to-End Encryption (E2EE) Messaging

To protect sensitive user communications, all direct messages are strictly end-to-end encrypted directly within the browser using the **Web Crypto API**. The server only ever sees and stores the AES-GCM ciphertext, preventing unauthorized data access or database breaches from exposing message content.

- **Key Generation**: Browser generates an ECDH P-256 Keypair; the private key is stored non-extractably in IndexedDB.
- **Key Exchange**: The public key is sent to the backend. When messaging, users fetch each other's public keys.
- **Shared Secret**: Browsers derive a robust shared secret using Elliptic-Curve Diffie-Hellman (ECDH).
- **Encryption Algorithm**: AES-GCM (256-bit) secures the message payloads using random Initialization Vectors (IV).

---

## 1. Authentication — JWT (JSON Web Tokens)

**Library:** `python-jose[cryptography]`  
**Algorithm:** `HS256`  
**Expiry:** 24 hours (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)

### How Tokens Work

```
Login (POST /api/auth/login)
  → Server verifies email + bcrypt password
  → Server creates JWT: { sub: user_id, role: ..., exp: ... }
  → Client stores token in localStorage

Every subsequent API call:
  → Client sends: Authorization: Bearer <jwt>
  → Server decodes JWT → extracts user_id
  → Server queries DB for user object
```

### Token Structure (Payload)
```json
{
  "sub": "u1",
  "role": "student",
  "iat": 1727500000,
  "exp": 1727586400
}
```

### Key Functions (`app/core/security.py`)

| Function | Purpose |
|---|---|
| `create_access_token(user_id, extra)` | Creates a signed JWT |
| `decode_access_token(token)` | Decodes JWT → returns user_id or None |
| `get_current_user_id(authorization)` | FastAPI dependency — extracts user ID from header |
| `get_current_user(db, user_id)` | FastAPI dependency — returns full User ORM object |

### Auth Dependency Usage in Routers

```python
from app.routers.auth import get_current_user
from app.models.user import User

@router.patch("/me")
def update_profile(
    update_data: UserUpdateProfileSchema,
    current_user: User = Depends(get_current_user)  # ← injects authenticated user
):
    ...
```

---

## 2. Password Security — bcrypt

**Library:** `passlib[bcrypt]`  
**Work factor:** Default (12 rounds)

### Flow

```
Registration:
  plain password → bcrypt.hash() → stored in DB as "$2b$12$..."

Login:
  plain password + stored hash → bcrypt.verify() → True / False
```

### Backward Compatibility

The `verify_password()` function includes a fallback for **legacy demo seed users** whose passwords are stored as plain text (`password123`). New users registered via the API always get bcrypt-hashed passwords.

```python
def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)  # bcrypt check
    except Exception:
        return plain == hashed                     # legacy plain-text fallback
```

> **In production:** Re-hash all legacy passwords on next login using `hash_password()`.

---

## 3. Rate Limiting — SlowAPI

**Library:** `slowapi` (Starlette/FastAPI port of Flask-Limiter)  
**Default limit:** `60 requests / minute / IP`  
**Configurable via:** `RATE_LIMIT` environment variable

### Configuration (`main.py`)

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
```

### When Limit Exceeded

Returns HTTP `429 Too Many Requests`:
```json
{ "error": "Rate limit exceeded: 60 per 1 minute" }
```

### Per-Route Custom Limits

```python
from app.main import limiter

@router.post("/api/auth/login")
@limiter.limit("10/minute")   # stricter limit for auth
def login(request: Request, ...):
    ...
```

---

## 4. CORS — Cross-Origin Resource Sharing

**Middleware:** FastAPI built-in `CORSMiddleware`

### Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,   # ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
)
```

### ⚠️ Important

- **Development:** `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
- **Production:** Set `CORS_ORIGINS=https://your-frontend.vercel.app` — **never use `*` in production**

---

## 5. Security Response Headers

**Applied by:** `SecurityHeadersMiddleware` (`app/core/middleware.py`)

Every API response includes:

| Header | Value | Protection |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-sniffing attacks |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `0` | Disables old XSS filter (use CSP instead) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | *(see below)* | Disables risky browser APIs |
| `Content-Security-Policy` | *(see below)* | Restricts resource loading |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS |
| `Cache-Control` | `no-store, no-cache, must-revalidate` | Prevents caching of API responses |
| `X-Request-ID` | `<uuid8>` | Unique trace ID per request |

**Permissions-Policy disables:** accelerometer, camera, geolocation, gyroscope, magnetometer, microphone, payment, USB

**Content-Security-Policy baseline:**
```
default-src 'self';
img-src 'self' data: blob: https:;
font-src 'self' https://fonts.gstatic.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
script-src 'self';
connect-src 'self' http://localhost:* http://127.0.0.1:*;
frame-ancestors 'none';
```

---

## 6. Request Logging & Tracing

Every request is logged with:
- Unique `X-Request-ID` (8-char UUID prefix)
- HTTP method + path
- Client IP address
- Response status code
- Latency in milliseconds

**Log format:**
```
2026-09-28 09:15:23 | INFO     | alumni_connect | [abc12345] → PATCH /api/users/me  client=127.0.0.1
2026-09-28 09:15:23 | INFO     | alumni_connect | [abc12345] ← PATCH /api/users/me  status=200  12.4ms
```

Logs are written to:
- **Console:** INFO level
- **File:** `backend/logs/alumni_connect.log` (rotates at 5MB, keeps 3 backups)

---

## 7. TrustedHost (Production Only)

Prevents HTTP Host Header injection attacks:

```python
# Only activated when ENVIRONMENT=production
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["alumni-connect.example.com", "*.alumni-connect.example.com"],
)
```

Update `allowed_hosts` in `main.py` to match your actual production domain.

---

## 8. Production Security Checklist

- [ ] Set a strong random `SECRET_KEY` (min 32 chars)
- [ ] Set `ENVIRONMENT=production`
- [ ] Set `CORS_ORIGINS` to your actual frontend domain
- [ ] Update `TrustedHostMiddleware` `allowed_hosts` to your domain
- [ ] Deploy behind HTTPS (use Nginx / Caddy / Cloudflare)
- [ ] Use PostgreSQL instead of SQLite
- [ ] Run with Gunicorn: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`
- [ ] Disable Swagger UI in production (`docs_url=None` — already done when `ENVIRONMENT=production`)
- [ ] Set rate limits per sensitive route (login, signup)
- [ ] Enable Redis-backed rate limiting for multi-worker setups

---

## 9. Known Limitations (Current Demo State)

| Limitation | Impact | Fix |
|---|---|---|
| Plain-text passwords in seed data | Demo users have unhashed passwords | Re-hash on first login or re-seed |
| Token stored in `localStorage` | Vulnerable to XSS | Move to `httpOnly` cookie in production |
| SQLite file locking | Concurrent writes fail | Use PostgreSQL in production |
| No refresh tokens | Users must re-login after 24h | Implement refresh token endpoint |
| Base64 image storage in DB | Large payloads, slow queries | Use S3 / Cloudinary for file uploads |
