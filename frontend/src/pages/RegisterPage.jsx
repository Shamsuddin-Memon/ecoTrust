import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import RegisterForm from '../components/auth/RegisterForm';

/**
 * RegisterPage — Full-page registration layout.
 */
const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (name, email, password, role) => {
    setLoading(true);
    setError('');
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-forest opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="animate-float mb-8">
            <span className="text-8xl">🌱</span>
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">
            Join EcoTrust
          </h1>
          <p className="text-xl text-teal-100/80 max-w-md leading-relaxed">
            Whether you&apos;re an NGO, a donor, or an administrator — your journey toward environmental transparency starts here.
          </p>
          <div className="mt-12 space-y-6 text-left max-w-sm">
            {[
              { icon: '🌱', title: 'NGO Partners', desc: 'Onboard projects and track field data' },
              { icon: '💎', title: 'Donors', desc: 'Fund projects with full transparency' },
              { icon: '🛡️', title: 'Administrators', desc: 'Verify, approve, and manage operations' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-white/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in py-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🌱</span>
            <h1 className="text-3xl font-display font-bold text-gradient-eco mt-2">
              EcoTrust
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-white">
              Create your account
            </h2>
            <p className="text-dark-300 mt-2">
              Get started with EcoTrust in minutes
            </p>
          </div>

          <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />

          <p className="mt-6 text-center text-sm text-dark-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-eco-400 font-semibold hover:text-eco-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
