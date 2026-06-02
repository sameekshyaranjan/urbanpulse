# UrbanPulse 🏙️

> **Civic & Tourism Safety, Pondicherry** — A real-time issue reporting and volunteer resolution platform built to make the city safer for citizens and tourists alike.

---

## 🌟 Overview

UrbanPulse is a full-stack civic-tech web application designed specifically for **Pondicherry** that bridges the gap between problem visibility and action.

Today, tourists unknowingly enter unsafe areas, civic issues go unreported, and even when they are reported, nothing happens because there is no system to track or act on them.

UrbanPulse fixes this by connecting three groups:
- **Citizens & Tourists** — report unsafe or inconvenient conditions on the spot
- **Visitors** — browse live, nearby issues *before* reaching a location so they can make informed decisions
- **Volunteers & Local Communities** — transparently track and resolve reported issues

The result: fewer surprises for tourists, faster resolution for communities, and a safer Pondicherry for everyone.

---

## ✨ Features

### Public Pages (Unauthenticated)
- 🌃 **Cyber-Pulse Landing Page** — Dark glassmorphism hero with neon gradients, animated background blobs, and a structured grid pattern
- 👁️ **Tourist Awareness** — Visitors can browse and discover live issues near a location *before* they arrive, helping them avoid unsafe or inconvenient areas proactively
- 🔐 **Secure Auth Forms** — Glass-panel login and registration forms with neon accent inputs
- 🎭 **Role Selection** — Register as a **Citizen** (report issues) or **Volunteer** (resolve issues)

### Authenticated Dashboard
- 📊 **Issues Overview** — Live grid/list of nearby reported issues within 10km of Pondicherry
- 📍 **Geo-Targeted Reporting** — Report issues with live GPS coordinates, view on Google Maps
- 🗺️ **Tourist Mode** — One-click filter to show only safety-relevant issues for visitors
- 🔍 **Smart Filtering** — Filter by status (Reported, Assigned, In Progress, Resolved, Verified)
- 🎯 **Priority Filter** — Auto-categorised as 🔴 Unsafe, 🟡 Attention, or 🟢 Minor based on keywords
- 🔢 **Sort Order** — Sort issues by Newest First or Oldest First
- ⊞ **View Mode Toggle** — Switch between a Masonry Grid view and a dense List view
- 📸 **Image Uploads** — Upload photos via file picker or live camera capture (ImageKit-backed)
- 🙋 **Volunteer Portal** — Accept and resolve assigned issues with atomic race-condition-safe locking
- 🏆 **Leaderboard** — Points system (+10 for resolving, +5 for verifying), ranked volunteer list
- 📱 **Sidebar Navigation** — Dark slate sidebar with mobile-responsive tab strip

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js + Express.js + MongoDB (Mongoose) |
| **Frontend** | Next.js 14 (Pages Router) + Tailwind CSS |
| **Auth** | JWT — 15min access token + 7-day refresh token |
| **Images** | ImageKit |
| **Geo** | MongoDB 2dsphere index + `$nearSphere` queries |
| **Styling** | Tailwind CSS + Custom Glassmorphism CSS Utilities |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- ImageKit account (free tier works)

### 1. Backend

```bash
cd backend
cp .env.example .env     # Fill in your values (see below)
npm install
npm run dev              # Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                         # Runs on http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (default: 5000) |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | 64-char random hex string |
| `JWT_REFRESH_SECRET` | ✅ | 64-char random hex string (different from above) |
| `JWT_EXPIRES_IN` | ✅ | Access token expiry (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | Refresh token expiry (e.g. `7d`) |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated allowed frontend URLs |
| `IMAGEKIT_PUBLIC_KEY` | ⚠️ | Required for image uploads |
| `IMAGEKIT_PRIVATE_KEY` | ⚠️ | Required for image uploads |
| `IMAGEKIT_URL_ENDPOINT` | ⚠️ | Required for image uploads |

**Generate JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `http://localhost:5000/api`) |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Register as citizen or volunteer |
| POST | `/auth/login` | public | Login → returns access & refresh tokens |
| POST | `/auth/refresh` | public | Refresh expired access token |

### Issues
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/issues` | citizen | Create issue (with optional image) |
| GET | `/issues/nearby` | any | Geo-query issues near a coordinate |
| GET | `/issues/:id` | any | Get issue by ID |
| PATCH | `/issues/:id` | reporter/admin | Update issue details |
| DELETE | `/issues/:id` | reporter/admin | Delete issue |
| PATCH | `/issues/:id/status` | volunteer/admin | Update issue lifecycle status |
| PATCH | `/issues/:id/verify` | admin | Mark issue as Verified |

### Volunteer
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/volunteer/accept/:id` | volunteer | Atomically accept an issue |
| GET | `/volunteer/assigned` | volunteer | List my assigned issues |
| PATCH | `/volunteer/status/:id` | volunteer/admin | Update status of assigned issue |

### Leaderboard & Sponsorship
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/leaderboard` | public | Get ranked volunteer list with points |
| POST | `/sponsorship` | any | Create a sponsorship link for an issue |
| PATCH | `/sponsorship/:id` | admin | Update sponsorship status |

---

## 🔄 Issue Lifecycle

```
Reported → Assigned → In Progress → Resolved → Verified
```

| Transition | Who | Points |
|---|---|---|
| Reported → Assigned | Volunteer accepts | — |
| Assigned → In Progress | Volunteer updates | — |
| In Progress → Resolved | Volunteer marks resolved | +10 pts |
| Resolved → Verified | Admin verifies | +5 pts to volunteer |

---

## 🗂️ Project Structure

```
urbanpulse/
├── backend/
│   ├── config/            # env validation, DB connection
│   ├── middleware/         # JWT auth, RBAC, validation, error handler
│   ├── modules/
│   │   ├── auth/          # register, login, refresh
│   │   ├── issues/        # CRUD, geo queries, status lifecycle
│   │   ├── volunteer/     # atomic issue acceptance, status updates
│   │   ├── sponsorship/   # sponsorship creation and lifecycle
│   │   └── leaderboard/   # points calculation and ranking
│   ├── utils/             # AppError, imageUpload (ImageKit)
│   ├── app.js
│   └── server.js
└── frontend/
    ├── components/
    │   ├── Navbar.js       # Dark glassmorphic public navbar
    │   ├── SidebarLayout.js # Authenticated dark sidebar + mobile strip
    │   ├── IssueCard.js    # Issue card with priority/location inference
    │   ├── Toast.js        # Toast notifications
    │   └── ProgressBar.js  # Loading progress indicator
    ├── hooks/
    │   ├── useAuth.js      # Auth state + JWT decode
    │   └── useProgress.js  # Progress bar state hook
    ├── lib/
    │   └── api.js          # Axios instance with refresh token interceptors
    ├── pages/
    │   ├── index.js        # Public home (Cyber-Pulse theme)
    │   ├── login.js        # Auth form (glass panel)
    │   ├── register.js     # Auth form (glass panel)
    │   ├── dashboard.js    # Issues overview with filters, sort, view modes
    │   ├── create-issue.js # Report issue form with camera/upload
    │   ├── volunteer.js    # Volunteer portal
    │   └── leaderboard.js  # Ranked leaderboard
    └── styles/
        └── globals.css     # Tailwind + Cyber-Pulse glassmorphism utilities
```

---

## 🌏 Location

This platform is configured for **Pondicherry, India**.

- Default coordinates: `11.9139°N, 79.8145°E`
- Issue discovery radius: **10 km**
- Location zones auto-detected from issue content: **Coastal/Auroville**, **Market Area**, **Heritage Zone**

---

## 📄 License

MIT — feel free to fork and adapt for your own city.
