import axios from 'axios';

/**
 * Axios instance pre-configured for the EcoTrust API.
 * - Base URL uses Vite proxy in development (/api → localhost:5000/api)
 * - Automatically attaches JWT token from localStorage
 * - Handles 401 responses by clearing auth state
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach JWT token ───────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecotrust_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle auth errors ────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local auth state
      localStorage.removeItem('ecotrust_token');
      localStorage.removeItem('ecotrust_user');

      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
