# Database Guide

> SQLite 3 via SQLAlchemy ORM — Alumni Connect Schema Reference

---

## Overview

The platform uses **SQLite** as its embedded database during development, managed through **SQLAlchemy** as the ORM layer. The database file is `backend/alumni_connect.db` and is automatically created + seeded on first server startup.

> **Note:** SQLite can be swapped for PostgreSQL or MySQL in production by simply changing the `DATABASE_URL` environment variable.

---

## 📊 Entity Relationship Diagram

```
colleges ─────────────────┐
  │ id (PK)               │
  │ name                  │
                          │
departments ──────────────┤
  │ id (PK)               │ college (FK → colleges)
  │ name                  │
  │ head                  │
  │ total_faculty         │
  │ total_students        │
                          │
users ────────────────────┼──────────────────────────────────┐
  │ id (PK)               │                                  │
  │ email (UNIQUE)        │                                  │
  │ password (bcrypt)     │                                  │
  │ name                  │                                  │
  │ role                  │ ← student/faculty/alumni/admin   │
  │ college               │                                  │
  │ department            │                                  │
  │ ...profile fields...  │                                  │
  │                       │                                  │
  ├── badges ─────────────┘                                  │
  │     id (PK, auto)                                        │
  │     user_id (FK → users)                                 │
  │     name, issuer, date                                   │
  │                                                          │
  ├── projects ──────────────────────────────────────────────┘
  │     id (PK)
  │     user_id (FK → users)
  │     title, tech, description, github
  │     media_url, start_month/year, end_month/year
  │     is_current, contributors, associated_with
  │
posts
  │ id (PK)
  │ author_id (FK → users)
  │ author_name, author_role, author_college
  │ content, post_type, timestamp
  │
  ├── comments
  │     id (PK)
  │     post_id (FK → posts)
  │     author_name, content, created_at
  │
  └── post_likes
        id (PK)
        post_id (FK → posts)
        user_id (FK → users)

messages
  id (PK)
  sender_id (FK → users)
  sender_name
  receiver_id (FK → users)
  receiver_name
  content, timestamp, created_at

bulletin_posts
  id (PK)
  board          ← "Jobs" / "Research" / "Events" / "General"
  title, content, link
  author_id (FK → users)
  author_name, author_role
  created_at
```

---

## 📋 Table Schemas

### `users`

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | VARCHAR | NOT NULL PK | e.g. `u1`, `u2` |
| `email` | VARCHAR | NOT NULL UNIQUE | Login email |
| `password` | VARCHAR | NOT NULL | bcrypt hash |
| `name` | VARCHAR | NOT NULL | Full name |
| `role` | VARCHAR | NOT NULL | `student` / `faculty` / `alumni` / `college_admin` |
| `college` | VARCHAR | NOT NULL | Institution name |
| `department` | VARCHAR | — | Department name |
| `batch` | VARCHAR | — | Batch / admission year |
| `company` | VARCHAR | — | Alumni current company |
| `job_title` | VARCHAR | — | Alumni job title |
| `bio` | TEXT | — | About / bio text |
| `profile_picture_url` | VARCHAR | — | Base64 or URL |
| `cover_picture_url` | VARCHAR | — | Banner image |
| `resume_url` | TEXT | — | Resume PDF (Base64 or URL) |
| `linkedin_url` | VARCHAR | — | LinkedIn profile link |
| `github_url` | VARCHAR | — | GitHub profile link |
| `portfolio_url` | VARCHAR | — | Personal website |
| `is_approved` | BOOLEAN | — | Account approved by admin |
| `credits` | INTEGER | — | Gamification credits (default 0) |
| `location` | VARCHAR | — | City, Country |
| `skills` | TEXT | — | Comma-separated skill tags |
| `designation` | VARCHAR | — | Faculty: Professor / HOD etc. |
| `experience_years` | INTEGER | — | Faculty / Alumni years of exp |
| `research_interests` | TEXT | — | Faculty: comma-separated topics |
| `courses_taught` | TEXT | — | Faculty: comma-separated courses |
| `open_to_mentor` | BOOLEAN | — | Alumni mentoring flag |
| `graduation_year` | VARCHAR | — | Student / Alumni grad year |
| `industry` | VARCHAR | — | Alumni industry sector |

---

### `projects`

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR PK | e.g. `p_1`, `p_2` |
| `user_id` | VARCHAR FK | Owner (users.id) |
| `title` | VARCHAR | Project name |
| `tech` | VARCHAR | Comma-separated tech stack |
| `description` | TEXT | Project description |
| `github` | VARCHAR | GitHub / project URL |
| `media_url` | TEXT | Screenshot / image (Base64) |
| `start_month` | VARCHAR | e.g. `January` |
| `start_year` | VARCHAR | e.g. `2024` |
| `end_month` | VARCHAR | — if `is_current` |
| `end_year` | VARCHAR | — if `is_current` |
| `is_current` | INTEGER | 1 = currently working on |
| `contributors` | TEXT | Comma-separated names |
| `associated_with` | VARCHAR | CIITM / Personal / Internship etc. |

---

### `badges`

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK auto | |
| `user_id` | VARCHAR FK | Recipient (users.id) |
| `name` | VARCHAR | Badge title |
| `issuer` | VARCHAR | Issuing faculty name |
| `date` | VARCHAR | Award date string |

---

### `posts`

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR PK | |
| `author_id` | VARCHAR FK | Poster (users.id) |
| `author_name` | VARCHAR | Denormalized for display |
| `author_role` | VARCHAR | Denormalized for display |
| `author_college` | VARCHAR | Denormalized for display |
| `content` | TEXT | Post body |
| `post_type` | VARCHAR | `general` / `achievement` / `opportunity` |
| `timestamp` | VARCHAR | Human-readable timestamp |
| `created_at` | DATETIME | ISO datetime |

---

### `messages`

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR PK | |
| `sender_id` | VARCHAR FK | |
| `sender_name` | VARCHAR | Denormalized |
| `receiver_id` | VARCHAR FK | |
| `receiver_name` | VARCHAR | Denormalized |
| `content` | TEXT | Message body |
| `timestamp` | VARCHAR | Human-readable |
| `created_at` | DATETIME | ISO datetime |

---

### `bulletin_posts`

| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR PK | |
| `board` | VARCHAR | `Jobs` / `Research` / `Events` / `General` |
| `title` | VARCHAR | Post title |
| `content` | TEXT | Post body |
| `link` | VARCHAR | Optional external link |
| `author_id` | VARCHAR FK | |
| `author_name` | VARCHAR | Denormalized |
| `author_role` | VARCHAR | Denormalized |
| `created_at` | DATETIME | |

---

### `colleges` & `departments`

| Table | Key Columns |
|---|---|
| `colleges` | `id` (PK), `name` |
| `departments` | `id` (PK auto), `name`, `college` (FK), `head`, `total_faculty`, `total_students` |

---

## 🔄 Schema Migration

> This project does **not** use Alembic migrations.

To apply schema changes:

1. Run the ALTER TABLE command directly on the SQLite file:
```bash
python3 -c "import sqlite3; conn=sqlite3.connect('alumni_connect.db'); conn.execute('ALTER TABLE users ADD COLUMN new_field TEXT'); conn.commit()"
```

2. **OR** delete `alumni_connect.db` and restart the server to get a clean seeded database.

---

## 🔗 SQLAlchemy Session Management

```python
# Dependency injection pattern used in all routers:
from app.core.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

@router.get("/example")
def handler(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
```

The `get_db` generator creates a session per request and ensures it is closed after the response, even on errors.
