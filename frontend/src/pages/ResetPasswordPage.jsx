import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import authService from '../services/authService';
import Toast from '../components/common/Toast';

/**
 * ResetPasswordPage — Token-based password reset form.
 * Token is extracted from the URL: /reset-password/:token
 */
const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (password) => {
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, { password });
      setShowToast(true);
      // Redirect to login after short delay
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to reset password. The link may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      {showToast && (
        <Toast
          message="Password reset successful! Redirecting to login..."
          type="success"
          duration={3000}
        />
      )}

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <span className="text-5xl">🔐</span>
          <h2 className="text-3xl font-display font-bold text-white mt-4">
            Reset Password
          </h2>
          <p className="text-dark-300 mt-2">
            Enter your new password below
          </p>
        </div>

        <div className="glass-card p-8">
          <ResetPasswordForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>

        <p className="mt-6 text-center text-sm text-dark-400">
          <Link
            to="/login"
            className="text-eco-400 font-semibold hover:text-eco-300 transition-colors"
          >
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
