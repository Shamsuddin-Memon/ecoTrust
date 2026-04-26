import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

/**
 * AuthContext — Global authentication state for EcoTrust.
 *
 * Provides:
 *  - user       : Current user object (or null)
 *  - token      : JWT token string (or null)
 *  - loading    : Boolean for initial auth check
 *  - login()    : Login function
 *  - register() : Register function
 *  - logout()   : Logout function
 *  - updateUser(): Refresh user data from server
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecotrust_token'));
  const [loading, setLoading] = useState(true);

  // ─── On mount: verify existing token ─────────────────
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('ecotrust_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        setUser(res.data.user);
        setToken(savedToken);
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('ecotrust_token');
        localStorage.removeItem('ecotrust_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // ─── Save auth data to localStorage ──────────────────
  const saveAuth = (tokenValue, userData) => {
    localStorage.setItem('ecotrust_token', tokenValue);
    localStorage.setItem('ecotrust_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  // ─── Login ───────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      saveAuth(res.data.token, res.data.user);
    }
    return res.data;
  }, []);

  // ─── Register ────────────────────────────────────────
  const register = useCallback(async (name, email, password, role) => {
    const res = await authService.register({ name, email, password, role });
    if (res.data.success) {
      saveAuth(res.data.token, res.data.user);
    }
    return res.data;
  }, []);

  // ─── Logout ──────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Proceed with local logout even if API call fails
    }
    localStorage.removeItem('ecotrust_token');
    localStorage.removeItem('ecotrust_user');
    setUser(null);
    setToken(null);
  }, []);

  // ─── Update user from server ─────────────────────────
  const updateUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
      localStorage.setItem('ecotrust_user', JSON.stringify(res.data.user));
    } catch (e) {
      console.error('Failed to update user:', e);
    }
  }, []);

  // ─── Handle OAuth token from URL ─────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    if (oauthToken) {
      localStorage.setItem('ecotrust_token', oauthToken);
      setToken(oauthToken);
      // Fetch user data
      authService.getMe().then((res) => {
        setUser(res.data.user);
        localStorage.setItem('ecotrust_user', JSON.stringify(res.data.user));
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
