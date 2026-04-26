# 🌿 EcoTrust — Environmental Trust Platform

A full-stack environmental project built with **React.js**, **Node.js/Express**, and **MongoDB**.  
Connecting NGOs, donors, and field teams on one transparent platform.

---

## 📁 Project Structure

```
ecoTrust/
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── passport.js             # Google OAuth strategy
│   ├── controllers/
│   │   └── authController.js       # Auth business logic
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification middleware
│   │   ├── roleCheck.js            # Role-based access control
│   │   └── errorHandler.js         # Global error handler
│   ├── models/
│   │   └── User.js                 # Mongoose User schema
│   ├── routes/
│   │   └── authRoutes.js           # Auth API endpoints
│   ├── services/
│   │   └── emailService.js         # Nodemailer for password reset
│   ├── utils/
│   │   ├── generateToken.js        # JWT token generator
│   │   └── validators.js           # Express-validator rules
│   ├── .env                        # Environment variables (DO NOT commit)
│   ├── .env.example                # Template for .env
│   ├── package.json
│   └── server.js                   # Express server entry point
│
├── frontend/                       # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Toast.jsx
│   │   │   └── auth/               # Auth-specific components
│   │   │       ├── ForgotPasswordForm.jsx
│   │   │       ├── GoogleLoginButton.jsx
│   │   │       ├── LoginForm.jsx
│   │   │       ├── ProtectedRoute.jsx
│   │   │       ├── RegisterForm.jsx
│   │   │       └── ResetPasswordForm.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state (React Context)
│   │   ├── hooks/
│   │   │   └── useAuth.js          # Custom hook for auth context
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx   # Role-based dashboard
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── OAuthSuccessPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance with interceptors
│   │   │   └── authService.js      # Auth API call functions
│   │   ├── theme/
│   │   │   └── themeConfig.js      # Global theme tokens
│   │   ├── App.jsx                 # Root component + routing
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Tailwind + global styles
│   ├── index.html
│   ├── tailwind.config.js          # Theme configuration
│   ├── postcss.config.js
│   ├── vite.config.js              # Dev server + API proxy
│   └── package.json
│
├── .gitignore
└── README.md                       # ← You're here
```

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally (or a MongoDB Atlas connection string)
- **npm** (comes with Node.js)

### Step 1 — Backend Setup

```bash
cd backend
npm install
```

Edit the `.env` file with your values (MongoDB URI, JWT secret, etc.).

```bash
npm run dev      # Starts backend on http://localhost:5000
```

### Step 2 — Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Starts frontend on http://localhost:5173
```

### Step 3 — Open in Browser

Go to **http://localhost:5173** — that's it!

> The frontend dev server automatically proxies `/api` requests to `localhost:5000` (configured in `vite.config.js`), so you don't need to worry about CORS during development.

---

## 🔑 API Endpoints (Module 1)

| Method | Endpoint                         | Auth | Description                    |
|--------|----------------------------------|------|--------------------------------|
| POST   | `/api/auth/register`             | ❌   | Register a new user            |
| POST   | `/api/auth/login`                | ❌   | Login with email & password    |
| GET    | `/api/auth/me`                   | ✅   | Get current user profile       |
| POST   | `/api/auth/forgot-password`      | ❌   | Send password reset email      |
| PUT    | `/api/auth/reset-password/:token`| ❌   | Reset password with token      |
| GET    | `/api/auth/google`               | ❌   | Start Google OAuth flow        |
| GET    | `/api/auth/google/callback`      | ❌   | Google OAuth callback          |
| POST   | `/api/auth/logout`               | ✅   | Logout                         |
| GET    | `/api/health`                    | ❌   | Server health check            |

---

## 🎨 Theme System

The project uses a **centralized theme** to keep all modules consistent:

- **`tailwind.config.js`** — Tailwind CSS tokens (colors, fonts, animations)
- **`src/theme/themeConfig.js`** — JavaScript theme object (for runtime use)
- **`src/index.css`** — Reusable CSS component classes (`.btn-eco`, `.glass-card`, etc.)

When building future modules, always import from `themeConfig.js` and use Tailwind classes defined in the config.

---

## 📦 Adding Future Modules

### Backend
1. Create model in `backend/models/` (e.g., `Project.js`)
2. Create controller in `backend/controllers/` (e.g., `projectController.js`)
3. Create routes in `backend/routes/` (e.g., `projectRoutes.js`)
4. Mount routes in `server.js`: `app.use('/api/projects', require('./routes/projectRoutes'))`

### Frontend
1. Create components in `frontend/src/components/<module>/`
2. Create pages in `frontend/src/pages/`
3. Add routes in `App.jsx` (wrap with `<ProtectedRoute>` if needed)
4. Add API functions in `frontend/src/services/`

---

## 👥 Roles

| Role    | Icon | Access Level                                    |
|---------|------|------------------------------------------------|
| Admin   | 🛡️  | Full access — manage users, verify projects     |
| NGO     | 🌱  | Create projects, upload docs, capture field data|
| Donor   | 💎  | Browse projects, view progress, make donations  |

---

## 🛡️ Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens with configurable expiry
- Input validation via **express-validator**
- CORS configured for frontend origin only
- Password reset tokens hashed with SHA-256, expire in 15 min
- Google OAuth via **Passport.js**

---

## License

MIT — free to use for educational and environmental projects.
