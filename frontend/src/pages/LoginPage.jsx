import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';

/**
 * LoginPage — Full-page login layout with branding and form.
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-eco opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="animate-float mb-8">
            <span className="text-8xl">🌿</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">
            EcoTrust
          </h1>
          <p className="text-xl text-emerald-100/80 max-w-md leading-relaxed">
            Building trust for the environment. Connect NGOs, donors, and field teams on one transparent platform.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-emerald-100/60 mt-1">NGO Partners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-emerald-100/60 mt-1">Trees Planted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99%</div>
              <div className="text-sm text-emerald-100/60 mt-1">Transparency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🌿</span>
            <h1 className="text-3xl font-display font-bold text-gradient-eco mt-2">
              EcoTrust
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-white">
              Welcome back
            </h2>
            <p className="text-dark-300 mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

          <div className="mt-6 text-center space-y-3">
            <Link
              to="/forgot-password"
              className="text-sm text-dark-300 hover:text-eco-400 transition-colors"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-dark-400">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-eco-400 font-semibold hover:text-eco-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
