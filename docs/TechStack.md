# Tech Stack

> Complete dependency list, versions, and purpose — Alumni Connect Platform

---

## 🖥️ Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18 | UI component library |
| **Vite** | 5.x | Build tool & dev server (HMR) |
| **React Router** | v6 | Client-side routing |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Lucide React** | Latest | Icon library (SVG icons) |
| **Three.js** | Latest | 3D graphics engine |
| **@react-three/fiber** | Latest | React renderer for Three.js |
| **@react-three/drei** | Latest | Three.js helpers & abstractions |

### Frontend Dev Dependencies

| Tool | Purpose |
|---|---|
| `@vitejs/plugin-react` | React fast-refresh support in Vite |
| `autoprefixer` | PostCSS vendor prefix automation |
| `postcss` | CSS transformation pipeline |

---

## 🔧 Backend

### Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.10+ | Programming language |
| **FastAPI** | 0.115+ | ASGI web framework |
| **Uvicorn** | 0.38+ | ASGI server (development) |
| **Gunicorn** | — | WSGI/ASGI server (production, with Uvicorn workers) |
| **Pydantic** | v2 | Data validation & serialization |
| **python-multipart** | — | Form data / file upload parsing |

### Database

| Technology | Version | Purpose |
|---|---|---|
| **SQLAlchemy** | 2.x | ORM — models, sessions, queries |
| **SQLite** | 3 (built-in) | Embedded database (development) |
| **PostgreSQL** | — | Recommended production database |

### Security

| Package | Version | Purpose |
|---|---|---|
| **python-jose** | 3.5+ | JWT creation & verification (HS256) |
| `cryptography` | — | Dependency for python-jose |
| **passlib** | 1.7.4 | Password hashing context manager |
| **bcrypt** | 4.0.1 | bcrypt hashing algorithm backend |
| **slowapi** | 0.1.10 | Rate limiting middleware (SlowAPI) |
| **limits** | 5.8+ | Storage backends for slowapi |
| **secure** | 2.0+ | Security header helpers |

### Logging & Utilities

| Package | Purpose |
|---|---|
| `logging` (stdlib) | Python standard library logger |
| `RotatingFileHandler` (stdlib) | Log rotation at 5MB |
| `uuid` (stdlib) | Request trace ID generation |

---

## 🌐 APIs & External Services

| Service | Usage |
|---|---|
| **Google Fonts** | *Plus Jakarta Sans* typography (loaded via CSS) |
| **Lucide Icons CDN** | SVG icons (bundled via npm package) |

---

## 📦 Full `requirements.txt`

```
fastapi
uvicorn[standard]
pydantic
python-multipart
sqlalchemy

# Security
python-jose[cryptography]
passlib[bcrypt]
bcrypt

# Rate limiting
slowapi

# Security headers
secure
```

---

## 📦 Full `package.json` Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "three": "latest",
    "@react-three/fiber": "latest",
    "@react-three/drei": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "latest",
    "autoprefixer": "latest",
    "postcss": "latest",
    "tailwindcss": "^3.x",
    "vite": "^5.x"
  }
}
```

---

## 🗄️ Database Options

| Environment | Recommended DB | `DATABASE_URL` format |
|---|---|---|
| Development | SQLite (default) | `sqlite:///./alumni_connect.db` |
| Production | PostgreSQL | `postgresql://user:pass@host:5432/alumni_db` |
| Production | MySQL / MariaDB | `mysql+pymysql://user:pass@host:3306/alumni_db` |

---

## 🚀 Deployment Stack

| Component | Development | Production |
|---|---|---|
| Backend server | `uvicorn --reload` | Gunicorn + Uvicorn workers |
| Frontend server | `vite dev` | `npm run build` → static files |
| Database | SQLite file | PostgreSQL (Supabase / Neon / RDS) |
| File storage | Base64 in DB | AWS S3 / Cloudinary |
| Reverse proxy | — | Nginx / Caddy / Cloudflare |
| CI/CD | Manual | GitHub Actions |
| Backend hosting | localhost:8000 | Render / Railway / Fly.io |
| Frontend hosting | localhost:5173 | Vercel / Netlify |

---

## 🏗️ Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                       │
│                                                          │
│   React 18 + Vite + Tailwind CSS + Three.js              │
│   └── src/api/client.js  →  Authorization: Bearer JWT   │
└──────────────────────────────┬───────────────────────────┘
                               │ HTTP/HTTPS
                               ▼
┌──────────────────────────────────────────────────────────┐
│               FASTAPI BACKEND (Python)                   │
│                                                          │
│  Middleware Stack:                                       │
│  ┌────────────────────────────────────────────────┐     │
│  │ TrustedHost → CORS → SlowAPI → Logging → Headers│     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Routers:  auth / users / posts / projects /             │
│            messages / faculty / admin / bulletin         │
│                                                          │
│  Security: python-jose (JWT) + passlib (bcrypt)         │
└──────────────────────────────┬───────────────────────────┘
                               │ SQLAlchemy ORM
                               ▼
┌──────────────────────────────────────────────────────────┐
│                     DATABASE                             │
│                                                          │
│   SQLite (dev)  /  PostgreSQL (prod)                    │
│                                                          │
│   Tables: users, projects, badges, posts, comments,     │
│           post_likes, messages, bulletin_posts,          │
│           colleges, departments                          │
└──────────────────────────────────────────────────────────┘
```
