import { useState } from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import authService from '../services/authService';

/**
 * ForgotPasswordPage — Centered form for requesting a password reset email.
 */
const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (email) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await authService.forgotPassword({ email });
      setSuccess(res.data.message || 'Reset link sent! Check your email.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <span className="text-5xl">🔑</span>
          <h2 className="text-3xl font-display font-bold text-white mt-4">
            Forgot Password?
          </h2>
          <p className="text-dark-300 mt-2">
            No worries, we&apos;ll help you reset it.
          </p>
        </div>

        <div className="glass-card p-8">
          <ForgotPasswordForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            success={success}
          />
        </div>

        <p className="mt-6 text-center text-sm text-dark-400">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-eco-400 font-semibold hover:text-eco-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
