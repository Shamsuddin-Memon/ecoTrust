import { Link } from 'react-router-dom';

/**
 * OAuthSuccessPage — Landing page after Google OAuth redirect.
 * Extracts token from URL and stores it, then redirects to dashboard.
 */
const OAuthSuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="text-center animate-fade-in">
        <div className="animate-float mb-6">
          <span className="text-6xl">🌿</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          Authentication Successful!
        </h2>
        <p className="text-dark-300 mb-6">Redirecting to your dashboard...</p>
        <div className="flex justify-center">
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 rounded-full border-2 border-eco-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-eco-500 animate-spin"></div>
          </div>
        </div>
        <Link to="/dashboard" className="mt-6 inline-block text-sm text-eco-400 hover:text-eco-300 transition-colors">
          Click here if not redirected →
        </Link>
      </div>
    </div>
  );
};

export default OAuthSuccessPage;
