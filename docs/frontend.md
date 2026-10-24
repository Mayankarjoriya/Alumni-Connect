# Frontend Guide

> React 18 + Vite — Alumni Connect Frontend Architecture

---

## 📁 Directory Structure

```
frontend/src/
├── api/
│   └── client.js              # Centralized fetch wrapper with JWT auth
├── components/
│   ├── admin/
│   │   ├── AdminStats.jsx     # Dashboard KPI cards
│   │   ├── AllUsersList.jsx   # All users table view
│   │   ├── ChangeHodModal.jsx # Change department HOD
│   │   ├── AddDeptModal.jsx   # Add department modal
│   │   ├── DepartmentDetails.jsx
│   │   ├── DepartmentList.jsx
│   │   ├── InvitePanel.jsx    # Alumni invitation system
│   │   ├── PendingUsersList.jsx
│   │   └── UserCard.jsx
│   ├── alumni/
│   │   └── AlumniHub.jsx      # Alumni mentoring / opportunity hub
│   ├── common/
│   │   ├── Header.jsx         # Global top nav bar
│   │   └── Sidebar.jsx        # Left navigation sidebar
│   ├── faculty/
│   │   └── FacultyHub.jsx     # Faculty dashboard panel
│   ├── feed/
│   │   ├── PostCard.jsx       # Single post with likes & comments
│   │   ├── CreatePostModal.jsx
│   │   ├── ChatModal.jsx      # Direct message thread
│   │   ├── EvaluateModal.jsx  # Faculty evaluation form
│   │   └── SearchModal.jsx    # User search
│   ├── profile/
│   │   ├── ProfileHeader.jsx  # Cover photo + avatar banner
│   │   ├── EditProfileModal.jsx   # Full edit form
│   │   ├── AddProjectModal.jsx    # LinkedIn-style project form
│   │   ├── ProjectCard.jsx    # Portfolio project card
│   │   ├── BadgeList.jsx      # Achievement badges display
│   │   ├── AlumniProfilePanel.jsx
│   │   ├── FacultyProfilePanel.jsx
│   │   └── FacultyEvalPanel.jsx
│   └── three/
│       ├── DeskScene.jsx      # Three.js 3D desk on Feed page
│       └── BooksScene.jsx     # Three.js 3D books decorations
├── App.jsx                    # Root router + auth context
├── pages/
│   ├── LeaderboardPage.jsx    # Campus achievement leaderboard
│   ├── DirectoryPage.jsx      # Discover students, alumni & faculty
│   └── MessagesPage.jsx       # Dedicated E2E encrypted messenger
├── App.jsx                    # Root router + role-based auth guard
├── AuthPage.jsx               # Login + Registration form
├── DesktopFeed.jsx            # Main social feed page
├── ProfilePage.jsx            # User profile with sidebar layout
├── AdminDashboard.jsx         # Admin control panel
├── BulletinBoard.jsx          # Announcement boards
└── LandingPage.jsx            # Public landing page
```

---

## 🔀 Routing

Handled with **React Router v6** in [`App.jsx`](../frontend/src/App.jsx).

| Path | Component | Auth Required | Allowed Roles |
|---|---|---|---|
| `/` | `LandingPage` | No | Public |
| `/login` | `AuthPage` | No | Public |
| `/feed` | `DesktopFeed` | Yes | `student`, `faculty`, `alumni` |
| `/profile/:id` | `ProfilePage` | Yes | All authenticated |
| `/leaderboard` | `LeaderboardPage` | Yes | `student`, `faculty`, `alumni` |
| `/directory` | `DirectoryPage` | Yes | `student`, `faculty`, `alumni` |
| `/messages` | `MessagesPage` | Yes | `student`, `faculty`, `alumni` |
| `/admin` | `AdminDashboard` | Yes | `college_admin` only |

---

## 🔌 API Client

Located at [`src/api/client.js`](../frontend/src/api/client.js).

A thin fetch wrapper that automatically:
- Reads the JWT token from `localStorage`
- Adds `Authorization: Bearer <token>` to every request
- Parses JSON responses
- Throws typed errors with `error.status` and `error.data`

```js
import api from './api/client.js';

// GET
const user = await api.get('/api/users/me');

// PATCH
const updated = await api.patch('/api/users/me', { bio: 'Hello!' });

// POST
const project = await api.post('/api/projects', { title: 'My App', tech_stack: 'React' });
```

**Base URL** is read from the Vite env variable `VITE_API_BASE_URL`.  
Default: `http://127.0.0.1:8000`

---

## 🗝️ Auth Flow

1. User fills the **Login** form on `AuthPage`
2. `POST /api/auth/login` returns `{ access_token, user }`
3. Token is saved to `localStorage` as `token`
4. User object is saved to `localStorage` as `user`
5. On every page load, `App.jsx` reads these and sets React state
6. The API client attaches `Bearer <token>` on every subsequent request
7. Logout clears `localStorage` and redirects to `/auth`

---

## 🎨 Styling

- **Tailwind CSS** (utility-first)
- **Custom CSS** in `src/index.css` for scrollbar, animations, etc.
- **Google Fonts** — *Plus Jakarta Sans* as the primary typeface
- **Three.js** (`@react-three/fiber` + `@react-three/drei`) for 3D scenes
- **Lucide React** for icons
- **Comprehensive Guide** — See [Theme & Design System Guide](./Theme.md) for full color tokens, typography scales, role identities, and UI specifications.


---

## 🧩 Key Component Patterns

### Profile Page Layout (2-column grid)
```
┌─────────────────────────────────────────────────────┐
│                   ProfileHeader                     │
│         (cover photo, avatar, name, stats)          │
├─────────────────────────────┬───────────────────────┤
│   LEFT (lg:col-span-2)      │  RIGHT (sidebar)      │
│   - Faculty/Alumni Panels   │  - Skills pills card  │
│   - Student Projects Tabs   │  - (more cards TBD)   │
│   - Badges                  │                       │
└─────────────────────────────┴───────────────────────┘
```

### EditProfileModal — Field Sections by Role

| Section | Student | Faculty | Alumni |
|---|:---:|:---:|:---:|
| Profile & Cover Photo | ✅ | ✅ | ✅ |
| Resume Upload | ✅ | — | — |
| Bio / Location | ✅ | ✅ | ✅ |
| Graduation Year | ✅ | — | ✅ |
| Designation / Experience | — | ✅ | — |
| Research Interests | — | ✅ | — |
| Courses Taught | — | ✅ | — |
| Skills (pill input) | ✅ | ✅ | ✅ |
| Industry / Open to Mentor | — | — | ✅ |
| LinkedIn / GitHub / Portfolio | ✅ | ✅ | ✅ |

### 🤖 1-Click LinkedIn AI AutoFill
- **Auto-Extraction Card**: Embedded directly at the top of [`EditProfileModal.jsx`](../frontend/src/components/profile/EditProfileModal.jsx).
- **One-Click Parse**: Inputting a profile URL and clicking "Auto Fill" triggers `POST /api/users/extract-linkedin`.
- **Live Visual State**: Displays animated spinner, glowing indicator, and auto-populates Bio, Location, Company, Designation, Graduation Year, Profile Photo, and merges parsed skills directly into active tags.
- **Raw Text / Summary Fallback**: Collapsible drawer allows pasting raw LinkedIn experience summaries or "About" text with instant AI structuring via `POST /api/users/parse-linkedin-text`.

---

## 🚀 Running Locally

```bash
cd frontend
npm install
npm run dev        # → http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

### Environment Variables

Create `frontend/.env` for custom API URL:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```
