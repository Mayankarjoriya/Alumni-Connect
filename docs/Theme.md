# Theme & Design System Guide

> Visual Identity, Color Palette, Typography, and UI/UX Design System — Alumni Connect Platform

---

## 🎨 Design Philosophy & Vision

**Alumni Connect** is designed as a modern, high-trust **Academic Proof-of-Work and Professional Networking Platform**. 

The design aesthetic strikes a deliberate balance between:
1. **Academic Credibility**: Clean layouts, verified credentials, faculty endorsements, structured department hierarchies, and clear institutional metadata.
2. **Modern SaaS & Social Dynamism**: Inspired by modern platforms (Linear, Stripe, Twitter/X, and LinkedIn), featuring soft tinted canvases, pill badges, subtle glowing borders, micro-interactions, and 3D interactive scenes.
3. **Role-First Visual Identity**: Clear color-coded role cues across students, faculty, alumni, and administrators so that users can instantly discern the authority and context of any post, message, or project.

---

## 🏛️ Color Palette & Design Tokens

### 1. Brand & Accent Colors

The primary brand identity is centered on **Electric Violet / Indigo**, representing intellect, ambition, and modern connectivity.

| Token | Hex / Class | Preview / Usage |
|---|---|---|
| **Primary Brand** | `#5B4DFB` / `violet-600` | Primary CTA buttons, active sidebar tabs, brand logos, focus rings |
| **Primary Hover** | `#4F46E5` / `violet-700` | Button hover states, active press states |
| **Primary Light Surface** | `#EEF2FF` / `violet-50` | Badge backgrounds, highlighted container accents |
| **Primary Tint** | `#DDD6FE` / `violet-200` | Subtle borders, active avatar backgrounds, glow highlights |
| **Brand Glow** | `from-violet-500 to-indigo-500` | Gradient avatar placeholders, banner highlights, hero titles |

---

### 2. Role-Based Identity Palette

Every user role within the platform is mapped to a dedicated semantic color for instant recognition across avatars, badges, and dashboard headers:

| Role | Primary Color | Background Tint | Border Tint | Semantic Purpose |
|---|---|---|---|---|
| **Student** | `bg-emerald-500` (`#10B981`) | `bg-emerald-50` | `border-emerald-200` | Growth, fresh learning, project portfolios, and achievements |
| **Faculty** | `bg-blue-600` (`#2563EB`) | `bg-blue-50` | `border-blue-200` | Academic authority, verification, evaluation, and research |
| **Alumni** | `bg-purple-600` (`#9333EA`) | `bg-purple-50` | `border-purple-200` | Mentorship, professional industry experience, career guidance |
| **College Admin** | `bg-amber-500` (`#F59E0B`) | `bg-amber-50` | `border-amber-200` | Institutional governance, verification, and oversight |

---

### 3. Feed Post-Type Semantic System

Posts in the universal feed feature distinct color-coded pill tags and glow gradients to categorize content types at a glance:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Tag              Background     Text              Border              │
├────────────────────────────────────────────────────────────────────────┤
│  🚀 Project       bg-violet-50   text-violet-700   border-violet-200   │
│  💼 Job           bg-amber-50    text-amber-700    border-amber-200    │
│  🏆 Achievement   bg-emerald-50  text-emerald-700  border-emerald-200  │
│  📢 Update        bg-blue-50     text-blue-700     border-blue-200     │
│  💬 General       bg-gray-100    text-gray-600     border-gray-200     │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Neutral Canvas & Background Scale

To maintain a breathable, crisp visual hierarchy, content sits on an off-white canvas with pure white elevated surfaces:

- **Global Page Canvas**: `#F4F5FA` (Soft neutral slate that eliminates stark contrast glare)
- **Elevated Card Surface**: `#FFFFFF` (Pure white for cards, sidebars, modals, and sheets)
- **Dividers & Subtle Borders**: `#F3F4F6` (`border-gray-100`) and `#E5E7EB` (`border-gray-200`)
- **Text Primary**: `#111827` (`text-gray-900` — High-contrast headlines and author names)
- **Text Secondary**: `#4B5563` (`text-gray-600` — Descriptions, post body, subheadings)
- **Text Muted / Meta**: `#9CA3AF` (`text-gray-400` — Timestamps, captions, uppercase category labels)

---

## 🔤 Typography

### Typeface Families
- **Primary Typeface**: **`Plus Jakarta Sans`** (`Google Fonts`), system-ui, -apple-system, sans-serif
  - Geometric, clean, and legible at small sizes with distinct numerals and letterforms.
  - Weights: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold), `800` (ExtraBold), `900` (Black).
- **Secondary Fallback**: `Inter`, sans-serif (configured in `tailwind.config.js`).

### Typography Hierarchy

| Style | Tailwind Classes | Usage Example |
|---|---|---|
| **Display / Hero** | `text-3xl md:text-5xl font-black tracking-tight` | Landing page hero titles, Auth page welcome headers |
| **Section Header (H1)** | `text-2xl font-extrabold text-gray-900 tracking-tight` | Page headers (Profile, Admin Dashboard, Directory) |
| **Card Header (H2)** | `text-lg font-bold text-gray-900` | Project card titles, Post author names, Section titles |
| **Subheader (H3)** | `text-sm font-semibold text-gray-800` | Widget titles, Modal section dividers |
| **Body Standard** | `text-sm font-normal text-gray-600 leading-relaxed` | Post content text, bio descriptions, modal explanations |
| **Small / Meta** | `text-xs font-medium text-gray-500` | Role and college labels, follower counts, dates |
| **Micro / Overline** | `text-[10px] font-bold text-gray-400 uppercase tracking-widest` | Navigation section labels (`OVERVIEW`, `NETWORK`, `SETTINGS`) |

---

## 🧱 Elevation, Borders & Geometry

### 1. Border Radius Scale
The UI adopts a soft, friendly rounded geometry:
- **`rounded-3xl` (24px)**: Outer containers, auth dialog cards, profile cover banners, major feature containers.
- **`rounded-2xl` (16px)**: Feed post cards, project cards, sidebar container, interactive modals, avatar containers.
- **`rounded-xl` (12px)**: Buttons, search inputs, form text fields, action icons.
- **`rounded-full` (9999px)**: Tags, pills, status indicators, notification counters, and circular avatars.

### 2. Shadows & Elevation
Instead of heavy dark drop-shadows, the theme uses diffused ambient glows:

```css
/* Defined in src/index.css */
.card-shadow {
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.07);
}

.card-shadow-md {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.09);
}
```

- **Buttons & Badges**: `shadow-md shadow-violet-100` / `shadow-lg shadow-violet-200` (creates a soft colored halo).
- **Modals & Overlays**: `shadow-2xl` accompanied by `bg-black/40 backdrop-blur-sm`.

---

## 📐 Layout Architecture

The application implements a multi-column desktop layout that cleanly organizes dense academic and social content:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Global Header (Sticky)                           │
│     [✦ Alumni Connect]  [Universal Feed]             [User Info] [Avatar]   │
├───────────────┬──────────────────────────────────────────────┬──────────────┤
│               │                                              │              │
│  Sidebar      │             Main Content Stream              │  Right Rail  │
│  (w-56)       │             (Feed / Projects / Directory)    │  (Hub / 3D)  │
│               │                                              │              │
│  • Dashboard  │  ┌────────────────────────────────────────┐  │  • Faculty/  │
│  • Messages   │  │ Create Post Bar (Greeting + Avatar)    │  │    Alumni    │
│  • Profile    │  └────────────────────────────────────────┘  │    Hub       │
│  • Directory  │                                              │  • Leader-   │
│  • Leader-    │  ┌────────────────────────────────────────┐  │    board     │
│    board      │  │ PostCard / ProjectCard                 │  │  • Three.js  │
│  • Admin      │  │ (Avatar, Role Badge, Rich Media,       │  │    Canvas    │
│  • Logout     │  │  Reactions, Faculty Badges, Comments)  │  │    Scene     │
│               │  └────────────────────────────────────────┘  │              │
└───────────────┴──────────────────────────────────────────────┴──────────────┘
```

---

## ✨ Interactive & Motion Metaphors

### 1. Three.js 3D Visuals
To bridge physical academic environments with a digital social experience, the platform integrates real-time 3D elements powered by `@react-three/fiber` and `@react-three/drei`:
- **`BooksScene.jsx`**: Floating, rotating 3D textbooks with lighting on the Landing Page.
- **`DeskScene.jsx`**: Stylized 3D study desk with a computer monitor, lamp, and accessories embedded in the Feed view.

### 2. Micro-Interactions & Hover States
- **Scale feedback**: Reaction buttons scale up slightly on hover (`group-hover:scale-110`) and on active state (`scale-105`).
- **Smooth transitions**: Every interactive element utilizes `transition-all duration-200`.
- **Skeleton Loaders**: Custom `SkeletonCard` shimmer placeholders with pulsing gradient blocks match exact component geometry during API fetches.

### 3. Glassmorphism & Frosted Layers
- **Sticky Headers & Navbars**: `bg-white/80 backdrop-blur-md` and `bg-white/95 backdrop-blur-md`.
- **Auth Page Floating Badges**: `bg-white/10 backdrop-blur-md border border-white/20`.

---

## 🧩 Component Design Guidelines

### Buttons

| Variant | Classes | Example Use |
|---|---|---|
| **Primary** | `bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl shadow-lg shadow-violet-200` | "New Post", "Publish", "Save Changes" |
| **Secondary / Ghost** | `bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200` | "Cancel", "Filter", "Preview" |
| **Subtle Icon** | `w-9 h-9 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl border border-gray-200` | Direct Message trigger, Close buttons |
| **Destructive** | `text-red-500 hover:bg-red-50 rounded-xl font-semibold` | "Logout", "Delete Project" |

### Inputs & Form Controls
- Clean light background: `bg-gray-50` with subtle border `border border-gray-200`.
- Rounded corners: `rounded-xl`.
- Focus state: `focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600`.
- Placeholder text: `text-gray-400 font-medium`.

---

## 📱 Responsive & Accessibility Standards

- **Mobile First**: Layout stacks vertically on `< 768px` (`md`), collapsible sidebars, and full-width modals.
- **Accessible Color Contrast**: All primary text (`#111827`, `#4B5563`) exceeds WCAG AA standards (4.5:1 ratio) against `#FFFFFF` and `#F4F5FA`.
- **Custom Slim Scrollbars**: Styled with `.custom-scrollbar` (4px width, thumb `#D1D5DB`, hover `#9CA3AF`) to prevent visual clutter in feed and chat windows.
