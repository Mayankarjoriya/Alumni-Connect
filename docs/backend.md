# Backend Guide

> FastAPI + SQLAlchemy + SQLite — Alumni Connect Backend Architecture

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Settings (env vars, JWT, CORS, rate limit)
│   │   ├── database.py        # SQLAlchemy engine + session factory
│   │   ├── security.py        # JWT, bcrypt, auth dependencies
│   │   ├── middleware.py      # RequestLogging + SecurityHeaders middleware
│   │   └── logging_config.py  # Rotating file + console logger
│   ├── models/                # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── portfolio.py       # Project + Badge
│   │   ├── post.py
│   │   ├── message.py
│   │   ├── bulletin.py
│   │   └── college.py
│   ├── routers/               # FastAPI APIRouter instances
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── posts.py
│   │   ├── projects.py
│   │   ├── messages.py
│   │   ├── faculty.py
│   │   ├── admin.py
│   │   └── bulletin.py
│   ├── schemas/               # Pydantic v2 request/response models
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── faculty.py
│   │   ├── post.py
│   │   ├── message.py
│   │   ├── bulletin.py
│   │   └── admin.py
│   ├── seed.py                # Demo data seeder (runs once on startup)
│   └── main.py                # App factory + middleware stack
├── alumni_connect.db          # SQLite database (auto-created)
├── requirements.txt
└── logs/                      # Rotating logs (auto-created)
```

---

## 🔌 API Endpoints

### Auth  (`/api/auth`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login, returns JWT | No |
| `POST` | `/api/auth/signup` | Register new user | No |
| `GET` | `/api/colleges` | List all colleges | No |

**Login Response:**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": { "id": "u1", "name": "...", "role": "student", ... }
}
```

---

### Users  (`/api/users`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `PATCH` | `/api/users/me` | Update own profile | ✅ Bearer |
| `GET` | `/api/users/{user_id}` | Get any user profile | No |
| `GET` | `/api/users/search` | Search users by name/role/college | No |

**PATCH `/api/users/me` — Accepted Fields:**
```json
{
  "bio": "string",
  "profile_picture_url": "base64 or URL",
  "cover_picture_url": "base64 or URL",
  "resume_url": "base64 or URL",
  "linkedin_url": "https://...",
  "github_url": "https://...",
  "portfolio_url": "https://...",
  "location": "City, Country",
  "skills": "Python,React,ML",
  "graduation_year": "2025",
  "industry": "Technology",
  "open_to_mentor": true,
  "designation": "Assistant Professor",
  "experience_years": 5,
  "research_interests": "AI,Blockchain",
  "courses_taught": "DSA,DBMS"
}
```
> All fields are optional. Only provided non-null fields are updated.

---

### Projects  (`/api/projects`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/projects` | Add project to portfolio | ✅ Bearer |

**POST Body:**
```json
{
  "title": "Encrypted Password Manager",
  "tech_stack": "Python,SQLite,AES",
  "description": "A secure vault application...",
  "github_link": "https://github.com/...",
  "media_url": "base64 image",
  "is_current": false,
  "start_month": "January",
  "start_year": "2024",
  "end_month": "June",
  "end_year": "2024",
  "contributors": "Alice,Bob",
  "associated_with": "Personal Project"
}
```

---

### Posts  (`/api/posts`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/posts` | Get all posts (feed) | No |
| `POST` | `/api/posts` | Create a post | ✅ Bearer |
| `POST` | `/api/posts/{id}/like` | Like/unlike a post | ✅ Bearer |
| `POST` | `/api/posts/{id}/comment` | Comment on a post | ✅ Bearer |

---

### Messages  (`/api/messages`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/messages/{user_id}` | Get conversation with user | ✅ Bearer |
| `POST` | `/api/messages` | Send a message | ✅ Bearer |

---

### Faculty  (`/api/faculty`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/faculty/evaluate` | Award credits + badge to student | ✅ Bearer (faculty) |
| `GET` | `/api/faculty/assigned-students` | Get students in faculty's dept | ✅ Bearer (faculty) |

---

### Admin  (`/api/admin`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/admin/departments` | List departments by college | No |
| `POST` | `/api/admin/departments` | Create department | ✅ Bearer (admin) |
| `PATCH` | `/api/admin/departments/{id}/hod` | Change HOD | ✅ Bearer (admin) |
| `GET` | `/api/admin/pending-users` | List unapproved users | ✅ Bearer (admin) |
| `POST` | `/api/admin/approve/{user_id}` | Approve a user | ✅ Bearer (admin) |
| `GET` | `/api/admin/users` | List all platform users | ✅ Bearer (admin) |

---

### Bulletin  (`/api/bulletin`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/bulletin` | Get bulletin posts (filterable by board) | No |
| `POST` | `/api/bulletin` | Create bulletin post | ✅ Bearer |

---

## ⚙️ Configuration (Environment Variables)

Set these in your shell or a `.env` file (loaded via `os.getenv`):

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./alumni_connect.db` | DB connection string |
| `SECRET_KEY` | `alumni-connect-super-secret-...` | JWT signing key — **change in production!** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT lifetime (24 hours) |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated allowed origins |
| `RATE_LIMIT` | `60/minute` | Requests per IP per minute |
| `ENVIRONMENT` | `development` | `development` or `production` |

---

## 🏃 Running the Server

```bash
cd backend

# Development (auto-reload, Swagger UI at /docs)
uvicorn main:app --reload --port 8000

# Production (multiple workers, no reload)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 🌱 Seeding

On first startup, `seed.py` automatically populates the database with:
- 1 College + Departments
- 7 demo users (student, faculty×2, alumni×2, admin, student)
- Sample projects, badges, posts, and messages

To reset: delete `alumni_connect.db` and restart the server.
