import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ProtectedRoute — Wraps routes that require authentication.
 *
 * Props:
 *  - children: ReactNode — the page to render
 *  - roles: string[] — optional list of allowed roles (e.g., ['admin', 'ngo'])
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <LoadingSpinner size="lg" message="Verifying session..." />
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check (if roles prop is provided)
  if (roles && !roles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Access Denied
          </h2>
          <p className="text-dark-300 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <a href="/dashboard" className="btn-eco">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
