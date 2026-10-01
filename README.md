# Alumni Connect Platform

## Collabrators
* [Gaurav](https://github.com/stargaurav2004-hhh)
* [Mayank](https://github.com/Mayankarjoriya)

> A full-stack, role-based academic networking platform for Students, Faculty, Alumni, and College Admins — built with FastAPI + React.

![Platform Preview](https://img.shields.io/badge/Status-Active_Development-brightgreen?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite)

---

## 📌 What is Alumni Connect?

Alumni Connect is a centralized academic social platform that bridges the gap between students, faculty, alumni, and college administration. It enables:

- 🎓 **Students** to build portfolios, showcase projects, earn badges, and connect with mentors
- 👩‍🏫 **Faculty** to evaluate students, post research opportunities, and manage department insights
- 🏢 **Alumni** to give back, mentor students, and stay connected with their college network
- 🛡️ **College Admins** to manage departments, approve users, and oversee platform activity

---

## 📁 Project Structure

```
Alumni-Connect-Project/
├── backend/                    # FastAPI Python Backend
│   ├── app/
│   │   ├── core/               # Config, DB, Security, Middleware, Logging
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   ├── middleware.py
│   │   │   └── logging_config.py
│   │   ├── models/             # SQLAlchemy ORM Models
│   │   │   ├── user.py
│   │   │   ├── portfolio.py    # Project + Badge
│   │   │   ├── post.py
│   │   │   ├── message.py
│   │   │   ├── bulletin.py
│   │   │   └── college.py
│   │   ├── routers/            # FastAPI Route Handlers
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── posts.py
│   │   │   ├── projects.py
│   │   │   ├── messages.py
│   │   │   ├── faculty.py
│   │   │   ├── admin.py
│   │   │   └── bulletin.py
│   │   ├── schemas/            # Pydantic Request/Response Schemas
│   │   ├── seed.py             # Demo data seeder
│   │   └── main.py             # App entry point + middleware stack
│   ├── alumni_connect.db       # SQLite database (auto-created)
│   ├── requirements.txt
│   └── logs/                   # Rotating log files (auto-created)
│
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Axios-style fetch wrapper with JWT
│   │   ├── components/
│   │   │   ├── admin/          # Admin dashboard components
│   │   │   ├── alumni/         # Alumni hub
│   │   │   ├── common/         # Header, Sidebar
│   │   │   ├── faculty/        # Faculty hub
│   │   │   ├── feed/           # Post, Chat, Search modals
│   │   │   ├── profile/        # Profile header, edit modal, project modal
│   │   │   └── three/          # Three.js 3D scene components
│   │   ├── App.jsx             # Root component with routing
│   │   ├── AuthPage.jsx
│   │   ├── DesktopFeed.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── BulletinBoard.jsx
│   │   └── LandingPage.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── frontend.md
│   ├── backend.md
│   ├── database.md
│   ├── security.md
│   └── TechStack.md
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+ (Anaconda recommended)
- Node.js 18+
- npm / yarn

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create and activate a virtual environment
uv venv
source .venv/bin/activate # On Windows use .venv\Scripts\activate

# Install dependencies
uv sync

# Start the server (auto-seeds demo data on first run)
uv run uvicorn main:app --reload --port 8000
```

> **API:** `http://localhost:8000`
> **Swagger Docs:** `http://localhost:8000/docs` *(dev only)*

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

> **Frontend:** `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | `student@ciitm.org` | `password123` |
| Alumni | `alumni@ciitm.org` | `password123` |
| Faculty | `faculty@ciitm.org` | `password123` |
| College Admin | `admin@ciitm.org` | `password123` |

---

## 🔑 Key Features

| Feature | Description |
|---|---|
| 🔐 Role-Based Auth | JWT authentication for 4 distinct user roles |
| 👤 Rich Profiles | Cover photo, avatar, resume, skills, LinkedIn/GitHub links |
| 📂 Project Portfolio | LinkedIn-style project cards with dates, contributors, media |
| 🏆 Badge System | Faculty awards verified achievement badges to students |
| 📰 Social Feed | Posts with likes, comments, and real-time-style updates |
| 📢 Bulletin Board | Announcements categorized by role (Jobs, Research, Events) |
| 💬 End-to-End Encrypted Messaging | Direct messaging secured with ECDH (P-256) & AES-GCM cryptography directly in the browser |
| 🛡️ Admin Panel | Department management, user approvals, platform oversight |
| 🎨 3D UI | Interactive Three.js 3D desk scenes on the feed page |

---

## 🌐 Deployment

### Backend (Render / Railway)
```
Build Command : pip install -r requirements.txt
Start Command : uvicorn main:app --host 0.0.0.0 --port $PORT
Environment   : ENVIRONMENT=production
               SECRET_KEY=<your-secret-key>
               CORS_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel / Netlify)
```
Root Directory : frontend
Build Command  : npm run build
Output Dir     : dist
Env Variable   : VITE_API_BASE_URL=https://your-api.onrender.com
```

---

## 📖 Documentation

| Doc | Description |
|---|---|
| [Frontend Guide](docs/frontend.md) | Component architecture, routing, API client |
| [Backend Guide](docs/backend.md) | API endpoints, routers, schemas |
| [Database Guide](docs/database.md) | Schema, table relationships, ER diagram |
| [Security Guide](docs/security.md) | JWT, bcrypt, middleware, rate limiting |
| [Tech Stack](docs/TechStack.md) | Full dependency list with versions and purpose |

---

## 📄 License

MIT License — Built for academic purposes at CIITM Institute of Technology.
