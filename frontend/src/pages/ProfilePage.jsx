import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import theme from '../theme/themeConfig';
import { HiUser, HiMail, HiLockClosed, HiCalendar, HiShieldCheck, HiArrowLeft, HiKey } from 'react-icons/hi';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const roleInfo = user?.role ? theme.roles[user.role] : null;

  // Active Portion/Tab State
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'password'

  // Edit Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Change Password Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Handle Profile Details Submit
  const handleUpdateDetailsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await authService.updateProfile({ name, email });
      if (res.data.success) {
        setSuccess('Profile updated successfully!');
        await updateUser(); // Update global auth state & localStorage
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Update Submit
  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.updateProfile({ password });
      if (res.data.success) {
        setSuccess('Password changed successfully!');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
        >
          <HiArrowLeft size={18} /> Back
        </button>

        {/* Page Title */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
            My Account Settings
          </h1>
          <p className="text-dark-300">
            View your details and manage your profile configurations.
          </p>
        </div>

        {/* Main Grid: Info Sidebar & Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-slide-up">
          
          {/* Portion 1: Profile Summary Card */}
          <div className="card-eco p-6 text-center flex flex-col items-center border border-dark-700/50">
            <div className="w-24 h-24 rounded-full bg-gradient-eco flex items-center justify-center text-white mb-4 relative shadow-eco">
              <span className="text-4xl font-bold uppercase">{user?.name?.charAt(0)}</span>
              <span className="absolute bottom-0 right-1 bg-eco-500 text-white rounded-full p-1 border-2 border-dark-900 shadow">
                <HiShieldCheck size={16} />
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
            <p className="text-dark-400 text-sm mb-4">{user?.email}</p>

            {/* Custom Role Badge */}
            {roleInfo && (
              <span
                className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-6 border"
                style={{
                  backgroundColor: `${roleInfo.color}15`,
                  borderColor: `${roleInfo.color}30`,
                  color: roleInfo.color,
                }}
              >
                {roleInfo.label}
              </span>
            )}

            {/* Additional meta */}
            <div className="w-full border-t border-dark-800 pt-5 mt-2 text-left space-y-4">
              <div className="flex items-center gap-3 text-sm text-dark-300">
                <HiCalendar className="text-eco-400 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-dark-400">Joined Platform</p>
                  <p className="font-semibold text-white">{formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-dark-300">
                <HiShieldCheck className="text-eco-400 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-dark-400">Account Status</p>
                  <p className="font-semibold text-emerald-400">Verified & Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Portion 2 & 3: Configuration Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Header */}
            <div className="flex bg-dark-900 p-1.5 rounded-2xl border border-dark-700/50">
              <button
                onClick={() => {
                  setActiveTab('details');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'details'
                    ? 'bg-eco-500 text-white shadow-lg shadow-eco/25'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <HiUser size={18} /> Edit Profile Details
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('password');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  activeTab === 'password'
                    ? 'bg-eco-500 text-white shadow-lg shadow-eco/25'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <HiKey size={18} /> Change Password
              </button>
            </div>

            {/* Alert Boxes */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in">
                🎉 {success}
              </div>
            )}

            {/* Edit Profile Tab Content */}
            {activeTab === 'details' && (
              <div className="card-eco p-6 sm:p-8 space-y-6 border border-dark-700/50">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Personal Information</h3>
                  <p className="text-dark-400 text-sm">Update your public profile name and registered email address.</p>
                </div>

                <form onSubmit={handleUpdateDetailsSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-eco-500 focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-eco-500 focus:outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    <p className="text-[11px] text-dark-500">Only Gmail, Hotmail, Yahoo or SZABIST email domains are accepted.</p>
                  </div>

                  <div className="pt-4 border-t border-dark-800 flex justify-end">
                    <Button type="submit" loading={loading} className="w-full sm:w-48 py-3">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Tab Content */}
            {activeTab === 'password' && (
              <div className="card-eco p-6 sm:p-8 space-y-6 border border-dark-700/50">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Update Security Password</h3>
                  <p className="text-dark-400 text-sm">Create a strong new password containing numbers and letters to keep your account secure.</p>
                </div>

                <form onSubmit={handleUpdatePasswordSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-eco-500 focus:outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-eco-500 focus:outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dark-800 flex justify-end">
                    <Button type="submit" loading={loading} className="w-full sm:w-48 py-3">
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
