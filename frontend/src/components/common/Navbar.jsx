import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiLogout, HiUser, HiBell } from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/themeConfig';
import notificationService from '../../services/notificationService';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const roleInfo = user?.role ? theme.roles[user.role] : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-950/80 backdrop-blur-xl border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-float">🌿</span>
            <span className="text-xl font-display font-bold text-gradient-eco">
              EcoTrust
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-dark-200 hover:text-eco-400 transition-colors font-medium"
                >
                  Dashboard
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/ngos"
                    className="text-dark-200 hover:text-eco-400 transition-colors font-medium"
                  >
                    Admin Panel
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-dark-300 hover:text-white transition-colors"
                  >
                    <HiBell size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden animate-slide-down">
                      <div className="p-3 border-b border-dark-700 flex justify-between items-center bg-dark-800">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-eco-400 hover:underline">
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-dark-400">No new notifications</div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => !notif.isRead && markAsRead(notif._id)}
                              className={`p-4 border-b border-dark-700/50 cursor-pointer transition-colors ${notif.isRead ? 'opacity-60 bg-transparent' : 'bg-dark-800/20 hover:bg-dark-800/40'}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                                {!notif.isRead && <span className="h-2 w-2 rounded-full bg-eco-500"></span>}
                              </div>
                              <p className="text-xs text-dark-300 leading-tight">{notif.message}</p>
                              <p className="text-[10px] text-dark-500 mt-2 tracking-wide uppercase">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 pl-6 border-l border-dark-700">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800/50 hover:bg-dark-800/80 transition-colors group" title="View Profile">
                    {roleInfo && <span className="text-sm group-hover:scale-110 transition-transform">{roleInfo.icon}</span>}
                    <span className="text-sm font-medium text-dark-200 group-hover:text-eco-400 transition-colors">{user?.name}</span>
                    {roleInfo && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${roleInfo.color}20`, color: roleInfo.color }}
                      >
                        {roleInfo.label}
                      </span>
                    )}
                  </Link>
                  <button onClick={handleLogout} className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-400/10 transition-all" title="Logout">
                    <HiLogout size={20} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-dark-200 hover:text-eco-400 transition-colors font-medium">Login</Link>
                <Link to="/register" className="btn-eco text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-all">
            {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-900/95 backdrop-blur-xl border-t border-dark-700/50 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-4 py-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 mb-3 border border-dark-700/30 group transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-eco flex items-center justify-center group-hover:scale-105 transition-transform">
                      <HiUser size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-eco-400 transition-colors">{user?.name}</p>
                      <p className="text-xs text-dark-400">{roleInfo?.label}</p>
                    </div>
                  </div>
                  <span className="text-xs text-eco-400 font-semibold group-hover:translate-x-1 transition-transform">Edit Profile →</span>
                </Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-dark-200 hover:text-white hover:bg-dark-800 transition-all">Dashboard</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/ngos" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-dark-200 hover:text-white hover:bg-dark-800 transition-all">Admin Panel</Link>
                )}
                <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-dark-200 hover:text-white hover:bg-dark-800 transition-all">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-center btn-eco">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
