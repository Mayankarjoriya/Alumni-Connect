# Production Architecture & Requirements Guide

> **Alumni Connect Platform** — Comprehensive Production Architecture, Feature Inventory, Cloud Infrastructure, External Tooling, and Deployment Runbook.

---

## 📑 Table of Contents

1. [Executive Summary & Platform Architecture](#1-executive-summary--platform-architecture)
2. [Complete Feature Inventory](#2-complete-feature-inventory)
3. [Production Tooling & External Services](#3-production-tooling--external-services)
   - [3.1 Specialized LinkedIn & Web Scraping Tools](#31-specialized-linkedin--web-scraping-tools)
   - [3.2 Production AI & LLM Processing](#32-production-ai--llm-processing)
   - [3.3 Object & Media Storage (Resumes, Avatars, Covers)](#33-object--media-storage-resumes-avatars-covers)
   - [3.4 Transactional Email & Messaging](#34-transactional-email--messaging)
   - [3.5 Caching, Rate Limiting & Background Queues](#35-caching-rate-limiting--background-queues)
   - [3.6 Observability, Logging & Error Tracking](#36-observability-logging--error-tracking)
4. [Production System Requirements & Sizing](#4-production-system-requirements--sizing)
5. [Security Hardening & Compliance Checklist](#5-security-hardening--compliance-checklist)
6. [Database Migration Strategy (SQLite → PostgreSQL)](#6-database-migration-strategy-sqlite--postgresql)
7. [Step-by-Step Production Deployment Runbook](#7-step-by-step-production-deployment-runbook)
8. [Total Cost of Ownership (TCO) Analysis](#8-total-cost-of-ownership-tco-analysis)

---

## 1. Executive Summary & Platform Architecture

Alumni Connect is designed as a **high-throughput, modular academic networking system**. It bridges students, alumni, faculty, and administrative leadership within higher education institutions.

### High-Level Production Architecture

```
                                  ┌────────────────────────┐
                                  │      Cloudflare        │
                                  │   DNS / WAF / CDN      │
                                  └───────────┬────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     │ HTTPS (443)                                     │ HTTPS (443) / Static Assets
                     ▼                                                 ▼
       ┌───────────────────────────┐                     ┌───────────────────────────┐
       │   FastAPI ASGI Cluster    │                     │     Vercel / Cloudflare   │
       │  Gunicorn + Uvicorn (x4)  │                     │   React 18 SPA (Vite)     │
       └─────────────┬─────────────┘                     └───────────────────────────┘
                     │
      ┌──────────────┼──────────────┬──────────────────────────────┐
      │              │              │                              │
      ▼              ▼              ▼                              ▼
┌───────────┐  ┌───────────┐  ┌───────────────┐           ┌──────────────────┐
│PostgreSQL │  │   Redis   │  │ Cloudflare R2 │           │  External APIs   │
│  Primary  │  │ Cache/Lim │  │  S3 Storage   │           │  (LLMs / Scraper)│
│ + Pooling │  │  Queues   │  │ Resumes/Images│           │  OpenRouter/Groq │
└───────────┘  └───────────┘  └───────────────┘           │  ScrapingDog/SES │
                                                          └──────────────────┘
```

---

## 2. Complete Feature Inventory

The following table itemizes all functional modules currently implemented in Alumni Connect:

| Module | Feature | Implementation Details | Production Status |
|---|---|---|---|
| **Identity & Access** | Multi-Role Authentication | JWT HS256 (`python-jose`), bcrypt password hashing (`passlib`), role claims (`student`, `faculty`, `alumni`, `college_admin`). | Ready (Swap JWT secret & set secure HTTP-only cookies) |
| **Identity & Access** | Department-Bound Signups | User accounts tied to institutional colleges and departments with automated demo seeder. | Ready |
| **Student Portfolio** | Digital Project Showcase | Full project cards featuring live demos, GitHub repositories, media previews, contributor lists, and tech stack tags. | Ready |
| **Student Portfolio** | Verified Badges & Skills | Faculty-endorsed achievement badges; skill chips displayed on profile headers. | Ready |
| **AI Profile Autofill** | 1-Click LinkedIn AutoFill | Social crawler emulation (`facebookexternalhit/1.1`) bypassing LinkedIn 999 login wall + JSON-LD/OpenGraph scraping. | Ready (Production upgrade to residential API available) |
| **AI Profile Autofill** | Small LLM Profile Structuring | Integration with OpenRouter, DeepSeek, and Groq to transform raw profile text into structured JSON schema with regex fallback. | Ready |
| **Communication** | E2E Encrypted Messaging | Client-side ECDH (P-256) key generation and AES-GCM 256-bit payload encryption using Web Crypto API. Server only stores ciphertext. | Ready |
| **Social Feed** | Academic Micro-Feed | Posts with like counter, threaded comments, image attachments, user badges, and real-time refresh. | Ready |
| **Social Feed** | Three.js 3D Interactive Scenes | Interactive 3D desk & book models (`@react-three/fiber`, `@react-three/drei`) with mouse tracking and dynamic lighting. | Ready |
| **Alumni Hub** | Mentorship & Job Board | Mentorship flags (`open_to_mentor`), industry tags, graduation years, and career opportunity posts. | Ready |
| **Faculty Hub** | Academic Evaluation & Badging | Faculty interface for awarding verified badges and submitting peer reviews directly to student profiles. | Ready |
| **Admin Portal** | College Governance | Department CRUD, HOD assignment, user role management, pending approvals, and institutional metrics. | Ready |
| **Discovery** | Leaderboard & Directory | Searchable user directory filtered by role, graduation year, and department with skill-based rankings. | Ready |
| **Bulletin Board** | Campus Announcements | Categorized notice boards (Career, Research, Hackathons, Campus News) with role-targeted visibility. | Ready |

---

## 3. Production Tooling & External Services

### 3.1 Specialized LinkedIn & Web Scraping Tools

#### Current Implementation vs Production Reality
- **Current Approach**: Uses social preview user agents (`facebookexternalhit/1.1`, `Twitterbot`) to bypass LinkedIn's `HTTP 999 Request Denied` wall without proxies.
- **Limitation**: LinkedIn only reveals public metadata (Headline, Summary, Name, Location, Posts) to public crawlers. Detailed internal sections (full chronological work history, multiple internship roles, private certifications) require logged-in authentication or residential proxy rotation.

#### Recommended Production Scraping Services

| Service | Price per Profile | Free Tier | Features | Best For |
|---|---|---|---|---|
| **ScrapingDog** | ~$0.003 - $0.005 | 1,000 free credits | Dedicated LinkedIn Profile API, bypasses CAPTCHAs, returns full JSON work experience. | **Recommended for cost-effectiveness** |
| **Proxycurl** | ~$0.01 - $0.03 | 100 free credits | Rich enterprise LinkedIn data enrichment (companies, funding, schools, complete resume). | Best for high-accuracy enterprise data |
| **RapidAPI LinkedIn Data** | ~$0.002 - $0.01 | 50-100 free/mo | Multiple community scrapers, fast response times. | Quick prototyping |
| **ScrapingBee / Bright Data** | ~$0.003 + proxy | 1,000 free requests | General-purpose headless browser scraping with stealth residential proxies. | Custom scraping workflows |

#### Production Drop-In Code: ScrapingDog Integration
To integrate ScrapingDog alongside our existing crawler fallback, update `backend/app/services/linkedin_extractor.py`:

```python
async def fetch_profile_via_scrapingdog(linkedin_url: str, api_key: str) -> Optional[dict]:
    """Fetch complete LinkedIn profile including all internships and jobs via ScrapingDog API."""
    endpoint = "https://api.scrapingdog.com/linkedin"
    params = {
        "api_key": api_key,
        "type": "profile",
        "linkId": linkedin_url.rstrip("/").split("/")[-1]
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            resp = await client.get(endpoint, params=params)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "full_name": data.get("fullName"),
                    "designation": data.get("headline"),
                    "location": data.get("location"),
                    "company": data.get("experience", [{}])[0].get("companyName"),
                    "skills": [s.get("name") for s in data.get("skills", [])],
                    "experience_list": data.get("experience", []),
                    "education_list": data.get("education", [])
                }
        except Exception as e:
            logger.warning(f"ScrapingDog API failed: {e}")
    return None
```

---

### 3.2 Production AI & LLM Processing

Alumni Connect leverages small LLMs (<8B parameters) to clean, structure, and enrich profile descriptions, projects, and resumes.

#### Production Provider Comparison

| Provider | Model | Input Cost / 1M Tokens | Output Cost / 1M Tokens | Latency | Recommended Use |
|---|---|---|---|---|---|
| **DeepSeek** | `deepseek-chat` (V3) | **$0.14** | **$0.28** | ~800ms | **Primary Production Choice** (Extremely cheap, superior reasoning) |
| **Groq Cloud** | `llama-3.1-8b-instant` | **$0.05** | **$0.08** | **~150ms** | **Fastest Response** (Near-zero latency profile autofill) |
| **OpenRouter** | `nvidia/nemotron-3.5-lightning` | **$0.00 (Free)** | **$0.00 (Free)** | ~1.2s | **Development / Staging** (Currently active in `.env`) |
| **AWS Bedrock** | `anthropic.claude-3-haiku` | $0.25 | $1.25 | ~450ms | Enterprise compliance / ISO certified |

#### Recommended Production Strategy
1. **Primary**: Groq (`llama-3.1-8b-instant`) or DeepSeek Direct API for sub-second, sub-cent profile extraction.
2. **Fallback**: Rule-based regex parser (already built into `linkedin_extractor.py`) if API limits or network drops occur.

---

### 3.3 Object & Media Storage (Resumes, Avatars, Covers)

#### Current State vs Production State
- **Current State**: Small avatar photos and resumes stored as base64 strings or direct URLs in database columns (`profile_picture_url`, `resume_url`).
- **Production Risk**: Base64 inflates payload size by 33%, increases database I/O, and causes slow SQL queries on user tables.

#### Recommended Storage Architecture: Cloudflare R2 / AWS S3
- **Storage**: Cloudflare R2 (S3-compatible, **$0 egress fees**, 10 GB free storage).
- **Upload Flow**: 
  1. Frontend calls `POST /api/media/presigned-url` with file type and size.
  2. Backend validates MIME type, user auth, and generates an AWS S3/R2 pre-signed PUT URL.
  3. Browser uploads binary file directly to S3/R2 (bypassing backend server RAM).
  4. Database saves the permanent CDN URL (e.g., `https://cdn.alumniconnect.edu/avatars/user-u1.webp`).

---

### 3.4 Transactional Email & Messaging

| Tool | Monthly Free Tier | Purpose |
|---|---|---|
| **Resend** | 3,000 emails / month | Modern developer email API for alumni invites, password resets, and badge awards. |
| **SendGrid** | 100 emails / day | Reliable transactional delivery. |
| **AWS SES** | 62,000 free if on EC2 ($0.10/10k emails) | High volume enterprise mailing for whole-campus announcements. |

---

### 3.5 Caching, Rate Limiting & Background Queues

- **Redis Cloud / Upstash**:
  - Replace memory-based SlowAPI rate limiter with Redis backend (`REDIS_URL=redis://...`).
  - Cache high-read endpoints (`/api/colleges`, `/api/users/search`, `/api/bulletin`) with 5-minute TTL.
  - Invalidate user profile caches on `PATCH /api/users/me`.
- **Background Worker (Celery / ARQ)**:
  - Offload heavy tasks (PDF resume parsing, batch alumni invitation emails, LinkedIn data enrichment) away from FastAPI's main event loop.

---

### 3.6 Observability, Logging & Error Tracking

- **Sentry**: Capture frontend React errors and backend uncaught Python exceptions with breadcrumbs and user context.
- **Log Management**: Better Stack (Logtail) or AWS CloudWatch for structured JSON log aggregation from `backend/app/core/logging_config.py`.
- **Health Checks**: UptimeRobot or Better Uptime monitoring `/health` with 60-second ping.

---

## 4. Production System Requirements & Sizing

### Recommended Server Specifications

| User Scale | Monthly Active Users | Backend Compute | Database (PostgreSQL) | Cache (Redis) | Estimated Server Cost |
|---|---|---|---|---|---|
| **Tier 1 (College Pilot)** | 500 – 3,000 | 1x Shared vCPU, 1 GB RAM (e.g. Render / Railway / Droplet) | 1 vCPU, 1 GB RAM, 10 GB SSD | 256 MB (Upstash Free) | ~$10 - $25 / month |
| **Tier 2 (Campus Production)** | 3,000 – 25,000 | 2x Dedicated vCPU, 4 GB RAM (2 app replicas) | 2 vCPU, 4 GB RAM, 50 GB SSD (Managed RDS/Neon) | 1 GB RAM | ~$60 - $120 / month |
| **Tier 3 (Multi-University)** | 25,000 – 150,000+ | Auto-scaling cluster (AWS ECS / Kubernetes, 4-10 nodes) | 4 vCPU, 16 GB RAM + Read Replica, 200 GB NVMe | 4 GB Redis Cluster | ~$250 - $600 / month |

---

## 5. Security Hardening & Compliance Checklist

Before deploying to production, verify each of the following security items:

- [ ] **Environment Separation**: Ensure `.env` is never committed; set `ENVIRONMENT=production` in cloud dashboard.
- [ ] **Cryptographic Secrets**: Generate a 256-bit cryptographic secret for `SECRET_KEY`:
  ```bash
  openssl rand -hex 32
  ```
- [ ] **Strict CORS Enforcement**: In `backend/app/core/config.py`, restrict `CORS_ORIGINS` to the exact frontend domain (e.g., `https://alumni.yourcollege.edu`), avoiding `*`.
- [ ] **HTTPS / HSTS**: Enforce SSL/TLS 1.3 at Cloudflare or Nginx reverse proxy.
- [ ] **Secure Cookies**: If migrating JWT tokens from `localStorage` to cookies, use `HttpOnly; Secure; SameSite=Strict`.
- [ ] **File Upload Validation**: Ensure file uploads validate magic bytes (not just extension names) and limit payload size to 5MB.
- [ ] **Rate Limiting**: Configure Redis backend for `SlowAPI` to prevent brute-force attacks on `/api/auth/login` (5 req/min) and `/api/users/extract-linkedin` (10 req/min).

---

## 6. Database Migration Strategy (SQLite → PostgreSQL)

### Step 1: Install PostgreSQL Driver & Alembic
Add the binary PostgreSQL driver and migration toolkit to `backend/requirements.txt`:
```bash
psycopg2-binary>=2.9.9
alembic>=1.13.0
```

### Step 2: Initialize Alembic
```bash
cd backend
alembic init alembic
```

Configure `alembic/env.py` to target our SQLAlchemy metadata:
```python
from app.core.database import Base
import app.models  # Imports all models
target_metadata = Base.metadata
```

### Step 3: Generate and Apply Initial Migration
```bash
alembic revision --autogenerate -m "Initial schema for production"
alembic upgrade head
```

### Step 4: Data Export / Import
To copy existing seed data from SQLite to PostgreSQL:
```bash
# Export from SQLite
pgloader sqlite:///backend/alumni_connect.db postgresql://user:password@host:5432/alumni_db
```

---

## 7. Step-by-Step Production Deployment Runbook

### Option A: Fully Managed (Render / Railway + Vercel) — Fastest (30 mins)

#### 1. Backend Deployment (Render / Railway)
1. Link your GitHub repository.
2. Select root directory as `backend`.
3. Set environment type to **Python 3**.
4. Configure Build Command:
   ```bash
   pip install -r requirements.txt
   ```
5. Configure Start Command:
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
   ```
6. Add Environment Variables:
   - `ENVIRONMENT=production`
   - `DATABASE_URL=postgresql://user:password@postgres-host:5432/alumnidb`
   - `SECRET_KEY=<your-generated-openssl-key>`
   - `CORS_ORIGINS=https://alumni.yourcollege.edu`
   - `LLM_PROVIDER=openrouter` (or `groq` / `deepseek`)
   - `LLM_API_KEY=<your-key>`
   - `LLM_MODEL=nvidia/nemotron-3.5-lightning:free`

#### 2. Frontend Deployment (Vercel)
1. Import GitHub repository into Vercel.
2. Set Framework Preset: **Vite**.
3. Set Root Directory: `frontend`.
4. Build Command: `npm run build` | Output Directory: `dist`.
5. Add Environment Variable:
   - `VITE_API_BASE_URL=https://your-backend-api.onrender.com`
6. Deploy and attach your college domain (`alumni.yourcollege.edu`).

---

### Option B: Self-Hosted Docker Compose (AWS EC2 / DigitalOcean Droplet)

#### `docker-compose.prod.yml`
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: alumni_connect
      POSTGRES_USER: alumni_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U alumni_user -d alumni_connect"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://alumni_user:${DB_PASSWORD}@db:5432/alumni_connect
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
      - CORS_ORIGINS=${FRONTEND_URL}
      - LLM_API_KEY=${LLM_API_KEY}
    command: gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 8. Total Cost of Ownership (TCO) Analysis

Estimated monthly operating costs for an active deployment of **5,000 students and alumni**:

| Component | Provider / Service | Monthly Cost | Notes |
|---|---|---|---|
| **Frontend Hosting & CDN** | Vercel / Cloudflare Pages | **$0.00** | Free tier covers 100GB bandwidth |
| **Backend Compute** | Render Standard / DigitalOcean | **$12.00 - $20.00** | 1-2 vCPUs, 2GB RAM |
| **Production Database** | Supabase Pro / Neon / AWS RDS | **$0.00 - $25.00** | Free up to 500MB, $25 for 8GB+ managed |
| **Object Storage (Media)** | Cloudflare R2 | **$0.00** | 10GB free, $0 egress fees |
| **AI LLM Extraction** | Groq / DeepSeek | **$1.50** | ~10,000 profile parses @ $0.14 / 1M tokens |
| **LinkedIn Enrichment API** | ScrapingDog | **$0.00 - $15.00** | 1,000 free requests, $15 for 5,000 requests |
| **Transactional Email** | Resend | **$0.00** | 3,000 free emails/month |
| **SSL, DNS & DDoS** | Cloudflare Free | **$0.00** | Enterprise-grade edge protection |
| **TOTAL ESTIMATED COST** | — | **~$13.50 - $60.00 / mo** | Cost-effective institutional deployment |
