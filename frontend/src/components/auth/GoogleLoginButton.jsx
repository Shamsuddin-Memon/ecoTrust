import { FcGoogle } from 'react-icons/fc';
import authService from '../../services/authService';

/**
 * Google OAuth login button.
 * Redirects the browser to the backend's Google OAuth endpoint.
 */
const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="
        w-full flex items-center justify-center gap-3
        bg-white/5 hover:bg-white/10
        border border-dark-600 hover:border-dark-500
        text-white font-medium py-3 px-6 rounded-xl
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-white/20
      "
    >
      <FcGoogle size={22} />
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
