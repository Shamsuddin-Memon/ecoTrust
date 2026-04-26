import api from './api';

/**
 * Auth API Service
 * All authentication-related API calls in one place.
 * Each function returns the Axios response promise.
 */
const authService = {
  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string, role?: string }} data
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Login with email and password
   * @param {{ email: string, password: string }} data
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * Get current authenticated user's profile
   */
  getMe: () => api.get('/auth/me'),

  /**
   * Send a password reset email
   * @param {{ email: string }} data
   */
  forgotPassword: (data) => api.post('/auth/forgot-password', data),

  /**
   * Reset password using token from email
   * @param {string} token - Reset token from URL
   * @param {{ password: string }} data
   */
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),

  /**
   * Logout (clears server session if applicable)
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Get Google OAuth URL — redirects browser to Google login
   */
  getGoogleAuthUrl: () => '/api/auth/google',
};

export default authService;
