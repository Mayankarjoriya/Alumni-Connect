"""
middleware.py – Custom FastAPI/Starlette middleware stack

Middleware applied (in order, outermost → innermost):
  1. RequestLoggingMiddleware   – structured request/response logging
  2. SecurityHeadersMiddleware  – OWASP security response headers
  3. (SlowAPI rate limiting is added directly in main.py)
"""

import logging
import time
import uuid
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("alumni_connect")


# ── 1. Request Logging ────────────────────────────────────────────────────────
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs every incoming request and its response status + latency.
    Adds a unique X-Request-ID header so requests can be traced.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        logger.info(
            "[%s] → %s %s  client=%s",
            request_id,
            request.method,
            request.url.path,
            request.client.host if request.client else "unknown",
        )

        response: Response = await call_next(request)

        latency_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "[%s] ← %s %s  status=%d  %.1fms",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            latency_ms,
        )

        response.headers["X-Request-ID"] = request_id
        return response


# ── 2. Security Headers ──────────────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds OWASP-recommended security headers to every response.

    Headers added:
      - X-Content-Type-Options:   nosniff          → prevent MIME sniffing
      - X-Frame-Options:          DENY             → prevent clickjacking
      - X-XSS-Protection:         0                → let CSP handle XSS (modern browsers)
      - Referrer-Policy:          strict-origin-when-cross-origin
      - Permissions-Policy:       disable risky browser features
      - Content-Security-Policy:  tight baseline (can be extended per route)
      - Strict-Transport-Security: (HTTPS only)    → HSTS
      - Cache-Control:            no-store for API responses
    """

    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "0",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": (
            "accelerometer=(), camera=(), geolocation=(), "
            "gyroscope=(), magnetometer=(), microphone=(), "
            "payment=(), usb=()"
        ),
        "Content-Security-Policy": (
            "default-src 'self'; "
            "img-src 'self' data: blob: https:; "
            "font-src 'self' https://fonts.gstatic.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "connect-src 'self' http://localhost:* http://127.0.0.1:*; "
            "frame-ancestors 'none';"
        ),
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
    }

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response: Response = await call_next(request)
        for header, value in self.SECURITY_HEADERS.items():
            response.headers[header] = value
        # HSTS – only meaningful over HTTPS; safe to add always
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        return response
