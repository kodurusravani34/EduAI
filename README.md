# EduAI – AI-Powered Study Planner 🎓

🔗 **Live Demo:** [eduai-ochre.vercel.app](https://eduai-ochre.vercel.app/)

A powerful full-stack web application that helps students create personalized, AI-generated study plans, manage daily tasks, and track their learning progress.  
Built using **React**, **Node.js**, **Express**, **MongoDB**, and **Firebase Auth**, enhanced with **AI-powered schedule generation** via OpenRouter/OpenAI.

---

## ✨ Features

- **🤖 AI-Generated Study Plans**  
  Provide your goal, deadline, and preferences — AI creates a complete day-by-day study schedule tailored to you.

- **📅 Daily Task Management**  
  Break down study plans into actionable daily tasks with checkbox completion and time tracking.

- **📊 Analytics & Insights Dashboard**  
  Visualize study hours, completion rates, streaks, weekly stats, and per-plan progress with interactive charts.

- **🎯 Goal-Oriented Planning**  
  Set study goals for exams, certifications, or skill mastery with customizable deadlines and daily hours.

- **⏱️ Smart Break Scheduling**  
  Choose from Pomodoro, long-block, or flexible study session styles to match your preferred rhythm.

- **📚 Multi-Subject Support**  
  Manage multiple study plans simultaneously — from coding to science to languages.

- **🔒 Secure Firebase Authentication**  
  User accounts protected with Firebase Auth (email/password), with automatic token management.

- **👤 User Profile & Preferences**  
  Customize daily goal hours, preferred study time, break preferences, and theme settings.

- **📱 Fully Responsive UI**  
  Built with Tailwind CSS v4 for seamless experience across all screen sizes.

- **🛡️ Production-Ready Backend**  
  Helmet security headers, rate limiting, input validation, CORS configuration, and graceful shutdown.

---

## 🛠️ Tech Stack

### Frontend (Client)

| Technology | Purpose |
|-----------|--------|
| **React (v19)** | UI framework |
| **Vite (v7)** | Fast build tool & dev server |
| **Tailwind CSS (v4)** | Utility-first styling |
| **React Router DOM (v7)** | Client-side routing |
| **Firebase SDK (v12)** | Authentication (client-side) |
| **Axios** | API requests with interceptors |
| **Lucide React** | Beautiful icon library |
| **Context API** | Global auth state management |

---

### Backend (Server)

| Technology | Purpose |
|-----------|--------|
| **Node.js (≥18) + Express** | Server & REST API |
| **MongoDB + Mongoose (v8)** | Database & ODM |
| **Firebase Admin SDK** | Token verification & auth |
| **OpenAI SDK (OpenRouter)** | AI study plan generation |
| **Helmet** | Security HTTP headers |
| **Express Rate Limit** | API rate limiting |
| **Express Validator** | Input validation middleware |
| **Morgan** | HTTP request logging |
| **CORS** | Cross-origin resource sharing |

---

## 🚀 Getting Started

### 🔹 Prerequisites

- Node.js (v18+)
- MongoDB Atlas or local MongoDB
- Firebase Project (for Authentication)
- OpenAI / OpenRouter API Key

---

### 🔹 1. Clone the Repository

```bash
git clone https://github.com/kodurusravani34/EduAI.git
cd EduAI
```

### 🔹 2. Setup Backend

```bash
cd server
npm install
```

Create `.env` in `server/`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/eduai?retryWrites=true&w=majority

# Firebase Admin SDK
# Option A – path to service-account JSON file
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
# Option B – inline JSON (for cloud deployments)
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# OpenAI / LLM
OPENAI_API_KEY=your_openai_or_openrouter_key
OPENAI_MODEL=gpt-4o-mini

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

Run backend:

```bash
npm run dev
# or
npm run start
```

### 🔹 3. Setup Frontend

```bash
cd client
npm install
```

Create `.env` in `client/`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Backend API base URL
VITE_API_BASE_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

### 🔹 4. Open the App

Visit:

```
http://localhost:5173
```

---

## 📂 Project Structure

```
EduAI/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── FormInput.jsx       # Form input component
│   │   │   ├── Modal.jsx           # Modal dialog
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── PlanCard.jsx        # Study plan card
│   │   │   ├── ProgressBar.jsx     # Progress bar component
│   │   │   ├── ProtectedRoute.jsx  # Auth route guard
│   │   │   ├── Sidebar.jsx         # Dashboard sidebar
│   │   │   └── MobileSidebar.jsx   # Mobile sidebar
│   │   ├── config/
│   │   │   └── firebase.js         # Firebase client SDK setup
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state provider
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # Dashboard layout wrapper
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Public landing page
│   │   │   ├── LoginPage.jsx       # Login form
│   │   │   ├── SignupPage.jsx      # Registration form
│   │   │   ├── DashboardPage.jsx   # Main dashboard
│   │   │   ├── CreatePlanPage.jsx  # AI plan creation form
│   │   │   ├── MyPlansPage.jsx     # Plan list/management
│   │   │   ├── PlanDetailPage.jsx  # Single plan detail view
│   │   │   ├── DailyPlannerPage.jsx# Daily task checklist
│   │   │   ├── AnalyticsPage.jsx   # Study analytics
│   │   │   └── ProfilePage.jsx     # User profile & prefs
│   │   ├── services/
│   │   │   ├── api.js              # Axios API layer
│   │   │   └── mockData.js         # Dropdown option data
│   │   ├── App.jsx                 # Root component & routing
│   │   └── main.jsx                # App entry point
│   ├── index.html
│   └── package.json
│
└── server/                     # Express backend
    ├── config/
    │   ├── cors.js                 # CORS configuration
    │   ├── db.js                   # MongoDB connection
    │   └── firebase.js             # Firebase Admin SDK init
    ├── controllers/
    │   ├── planController.js       # Study plan CRUD + AI
    │   ├── taskController.js       # Daily task operations
    │   ├── userController.js       # User profile management
    │   └── analyticsController.js  # Study analytics
    ├── middleware/
    │   ├── authenticate.js         # Firebase token verification
    │   ├── errorHandler.js         # Global error handler
    │   └── validators.js           # Input validation chains
    ├── models/
    │   ├── User.js                 # User schema
    │   ├── StudyPlan.js            # Study plan schema
    │   └── DailyTask.js            # Daily task schema
    ├── routes/
    │   ├── userRoutes.js           # /api/users routes
    │   ├── planRoutes.js           # /api/plans routes
    │   ├── taskRoutes.js           # /api/tasks routes
    │   └── analyticsRoutes.js      # /api/analytics routes
    ├── services/
    │   └── aiService.js            # AI/LLM study plan generator
    ├── utils/
    │   ├── AppError.js             # Custom error class
    │   └── asyncHandler.js         # Async error wrapper
    ├── app.js                      # Express app setup
    ├── server.js                   # Server entry point
    └── package.json
```

---

## 🔌 API Endpoints

### Health Check

`GET /api/health`

### Users

`GET /api/users/me` — Get current user profile

`PUT /api/users/preferences` — Update user preferences

### Study Plans

`POST /api/plans` — Create AI-generated study plan

`GET /api/plans` — List all plans (supports `?status=`, `?page=`, `?limit=`)

`GET /api/plans/:id` — Get single plan with full schedule

`PUT /api/plans/:id` — Update plan fields

`DELETE /api/plans/:id` — Delete plan and associated tasks

### Daily Tasks

`GET /api/tasks/:planId/:date` — Get tasks for a specific day (YYYY-MM-DD)

`PUT /api/tasks/:taskId` — Update task completion / time spent

### Analytics

`GET /api/analytics` — Get aggregated study analytics

---

## 🤖 AI Capabilities

- **Personalized Study Plan Generation** — AI creates day-by-day schedules based on your goal, deadline, topics, current level, and daily availability.
- **Smart Task Breakdown** — Each day is broken down into individual tasks with title, description, duration, topic, and type (study/review/practice/quiz/break).
- **Milestone Tracking** — AI generates milestones and study tips alongside the schedule.
- **Configurable LLM Model** — Supports OpenAI GPT models or any OpenRouter-compatible model (default: `meta-llama/llama-3.1-8b-instruct`).
- **Robust JSON Parsing** — Built-in cleaning and extraction handles malformed AI responses gracefully.

---

## 🔐 Security

- **Firebase Authentication** — Email/password auth with token-based session management
- **Server-Side Token Verification** — Firebase Admin SDK verifies ID tokens on every API request
- **Helmet.js** — Sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate Limiting** — Configurable API rate limiter (default: 100 requests per 15 minutes)
- **Input Validation** — express-validator chains on all endpoints with detailed error messages
- **CORS Protection** — Whitelist-based origin control with configurable allowed origins
- **Auto User Provisioning** — New users are automatically created in MongoDB on first authenticated request
- **Graceful Shutdown** — Server handles SIGTERM/SIGINT signals cleanly, closing DB connections

---

## 🤝 Contributing

Pull requests are welcome! Feel free to fork and improve.

---

## 📄 License

Licensed under the **ISC License**.
