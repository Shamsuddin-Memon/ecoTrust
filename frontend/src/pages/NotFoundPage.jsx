import { Link } from 'react-router-dom';

/**
 * NotFoundPage — 404 error page with EcoTrust branding.
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl mb-6 animate-float">🍂</div>
        <h1 className="text-7xl font-display font-bold text-gradient-eco mb-4">
          404
        </h1>
        <h2 className="text-2xl font-display font-semibold text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-dark-300 max-w-md mx-auto mb-8">
          The page you&apos;re looking for seems to have wandered off into the forest.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-eco">
            Go Home
          </Link>
          <Link to="/dashboard" className="btn-ghost">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
