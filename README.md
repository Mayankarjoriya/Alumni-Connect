# Alumni Connect Platform - Full Stack Project

A comprehensive centralized platform for Students, Faculty, Alumni, and College Admins with role-based dashboarding, project showcases, badge verification, and interactive feeds.

---

## 📁 Project Structure

```
Alumni-Connect-Project/
├── backend/
│   ├── main.py            # FastAPI Backend API Server
│   └── requirements.txt   # Python Dependencies
├── frontend/
│   ├── public/            # Static Icons & Assets
│   ├── src/               # React Components & Styles
│   │   ├── AdminDashboard.jsx
│   │   ├── AuthPage.jsx
│   │   ├── DesktopFeed.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json       # Frontend Dependencies & Scripts
│   ├── vite.config.js     # Vite Configuration
│   └── tailwind.config.js # Tailwind CSS Configuration
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
- API Endpoint: `http://localhost:8000`
- Swagger API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

## 🌐 How to Deploy Live

### Option A: Deploying on Render / Railway (Recommended)

#### Backend Deployment (FastAPI on Render):
1. Create a new Web Service on [Render](https://render.com).
2. Connect your repository and choose the `backend` folder as the Root Directory.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Frontend Deployment (Static Site / Vercel / Netlify / Render):
1. Connect your repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`

---

## 🔑 Demo User Credentials

| Role | Email | Password |
|---|---|---|
| Student | `student@ciitm.org` | `password123` |
| Alumni | `alumni@ciitm.org` | `password123` |
| Faculty | `faculty@ciitm.org` | `password123` |
| College Admin | `admin@ciitm.org` | `password123` |
