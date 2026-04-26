import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import theme from '../theme/themeConfig';
import ngoService from '../services/ngoService';
import PlantationForm from '../components/PlantationForm';
import ProjectForm from '../components/ProjectForm';
import MyProjectsView from '../components/MyProjectsView';
import ProjectFeed from '../components/ProjectFeed';
import {
  HiUsers,
  HiClipboardList,
  HiLocationMarker,
  HiShieldCheck,
  HiDocumentText,
  HiCurrencyDollar,
  HiArrowRight
} from 'react-icons/hi';

const DashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get('view');
  
  const roleInfo = user?.role ? theme.roles[user.role] : null;
  const [ngoStatus, setNgoStatus] = useState(null);
  // Increment this to trigger a ProjectFeed re-fetch when an NGO edits/deletes a project
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  const handleProjectsChanged = useCallback(() => {
    setFeedRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (user?.role === 'donor') {
      const fetchStatus = async () => {
        try {
          const res = await ngoService.getMyNGOStatus();
          setNgoStatus(res.data.data);
        } catch (error) {
          console.error("Could not fetch NGO status");
        }
      };
      fetchStatus();
    }
  }, [user]);

  // Modifying donor content to integrate blog/feed placeholders and Ngo registration logic
  const renderDonorContent = () => (
    <div className="space-y-10 animate-fade-in">
      {/* Dynamic NGO Registration Alert / Button */}
      {ngoStatus ? (
        <div className={`p-6 rounded-2xl border flex items-center justify-between ${ngoStatus.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30' : ngoStatus.status === 'declined' ? 'bg-red-500/10 border-red-500/30' : 'bg-eco-500/10 border-eco-500/30'}`}>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">NGO Application: <span className="uppercase">{ngoStatus.status}</span></h3>
            <p className="text-dark-300 text-sm">
              {ngoStatus.status === 'pending' && "Your request to register an NGO is under review by our team."}
              {ngoStatus.status === 'declined' && "Unfortunately, your application was declined. Check your notifications for details."}
              {ngoStatus.status === 'approved' && "You are now an approved NGO! Please log out and log back in to access your tools."}
            </p>
          </div>
          {ngoStatus.status === 'declined' && (
            <Link to="/register-ngo" className="btn-eco text-sm">Re-apply</Link>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-gradient-forest flex items-center justify-between shadow-eco overflow-hidden relative">
          <div className="relative z-10 w-2/3">
            <h2 className="text-2xl font-bold text-white mb-2">Want to fundraise for your cause?</h2>
            <p className="text-teal-100/80 mb-6">Register your NGO with EcoTrust today to gain access to global donors and field tracking tools.</p>
            <Link to="/register-ngo" className="bg-white text-forest-700 py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2">
              Register NGO <HiArrowRight />
            </Link>
          </div>
          <div className="text-9xl absolute right-[-20px] bottom-[-30px] opacity-30 animate-pulse-slow">🌿</div>
        </div>
      )}

      {/* Blog/Project Feed Placeholder was moved to the universal ProjectFeed section */}
    </div>
  );

  const dashboardCards = {
    admin: [
      { icon: <HiUsers size={28} />, title: 'User Management', desc: 'Manage all users, roles, and permissions', color: '#ef4444', route: '/dashboard' },
      { icon: <HiShieldCheck size={28} />, title: 'Pending NGOs', desc: 'Review and approve NGO submissions', color: '#22c55e', route: '/admin/ngos' },
      { icon: <HiLocationMarker size={28} />, title: 'Field Data', desc: 'Monitor field submissions (Module 3)', color: '#f59e0b', route: '/dashboard' },
    ],
    ngo: [
      { icon: <HiClipboardList size={28} />, title: 'My Projects', desc: 'Manage your existing environmental projects', color: '#22c55e', route: '?view=my-projects' },
      { icon: <HiLocationMarker size={28} />, title: 'Field Capture & Projects', desc: 'Create projects & upload field data seamlessly', color: '#14b8a6', route: '?view=plantation' },
    ]
  };

  const cards = user?.role !== 'donor' ? dashboardCards[user?.role] : null;

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{roleInfo?.icon}</span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Hello, {user?.name?.split(' ')[0]}
            </h1>
          </div>
          <p className="text-dark-300 text-lg">
            {user?.role === 'donor' ? 'Explore active projects and fund environmental causes.' : `Here is an overview of your ${roleInfo?.label} operations.`}
          </p>
        </div>

        {user?.role === 'donor' ? renderDonorContent() : (
          <div className="animate-slide-up">
            {currentView ? (
              <div className="relative">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="mb-6 flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
                >
                  <HiArrowRight className="rotate-180" /> Back to Dashboard
                </button>
                <div className={currentView === 'my-projects' ? 'w-full' : 'max-w-2xl mx-auto'}>
                  {currentView === 'plantation' && <PlantationForm />}
                  {currentView === 'my-projects' && (
                    <MyProjectsView onProjectsChanged={handleProjectsChanged} />
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards?.map((card, index) => (
                  <Link
                    to={card.route}
                    key={index}
                    className="card-eco group cursor-pointer hover:scale-[1.02] transition-transform duration-300 block"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                        <span style={{ color: card.color }}>{card.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-eco-400 transition-colors mb-1">
                          {card.title}
                        </h3>
                        <p className="text-dark-400 text-sm">{card.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Universal Global Feeds */}
        {!currentView && (
            <div className="mt-16 pt-8 border-t border-dark-800/50">
                <ProjectFeed refreshKey={feedRefreshKey} />
            </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
