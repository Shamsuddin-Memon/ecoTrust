import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// ─── Pages ──────────────────────────────────────────────
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import OAuthSuccessPage from './pages/OAuthSuccessPage';
import NotFoundPage from './pages/NotFoundPage';
import NGORegistrationPage from './pages/NGORegistrationPage';
import AdminPanelPage from './pages/AdminPanelPage';

/**
 * App — Root component.
 * Wraps the entire app in AuthProvider and defines routes.
 *
 * Route Structure:
 *   /login              → LoginPage (public)
 *   /register           → RegisterPage (public)
 *   /forgot-password    → ForgotPasswordPage (public)
 *   /reset-password/:t  → ResetPasswordPage (public)
 *   /oauth-success      → OAuthSuccessPage (public)
 *   /dashboard          → DashboardPage (protected)
 *   /register-ngo       → NGORegistrationPage (protected: donor)
 *   /admin/ngos         → AdminPanelPage (protected: admin)
 *   *                   → NotFoundPage
 *
 * To add future modules:
 *   1. Create page in /pages
 *   2. Add route here, wrap with <ProtectedRoute roles={[...]}> if needed
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ─── Public Routes ──────────────────────── */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />

          {/* ─── Protected Routes ───────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/register-ngo"
            element={
              <ProtectedRoute roles={['donor']}>
                <NGORegistrationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/ngos"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />

          {/* ─── Future Module Routes (uncomment when ready) ─── */}
          {/*
          <Route path="/projects/*" element={
            <ProtectedRoute roles={['admin', 'ngo']}>
              <ProjectRoutes />
            </ProtectedRoute>
          } />
          <Route path="/field-data/*" element={
            <ProtectedRoute roles={['admin', 'ngo']}>
              <FieldDataRoutes />
            </ProtectedRoute>
          } />
          <Route path="/donor/*" element={
            <ProtectedRoute roles={['admin', 'donor']}>
              <DonorRoutes />
            </ProtectedRoute>
          } />
          */}

          {/* ─── 404 ────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
