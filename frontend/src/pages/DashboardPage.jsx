import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import theme from '../theme/themeConfig';
import ngoService from '../services/ngoService';
import plantationService from '../services/plantationService';
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
  HiArrowRight,
  HiBell,
  HiRefresh,
  HiUpload,
  HiCheckCircle,
  HiX
} from 'react-icons/hi';

const DashboardPage = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get('view');
  
  const roleInfo = user?.role ? theme.roles[user.role] : null;
  const [ngoStatus, setNgoStatus] = useState(null);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  // Monitoring States
  const [monitoringList, setMonitoringList] = useState([]);
  const [refreshMonitoring, setRefreshMonitoring] = useState(0);
  const [activePlantation, setActivePlantation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const handleProjectsChanged = useCallback(() => {
    setFeedRefreshKey((k) => k + 1);
  }, []);

  // Fetch NGO status for Donors
  // Fetch NGO status for Donors & NGOs
  useEffect(() => {
    if (user?.role === 'donor' || user?.role === 'ngo') {
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
  }, [user, refreshMonitoring]);

  // Fetch Monitoring Statuses for NGOs
  useEffect(() => {
    if (user?.role === 'ngo' && token) {
      const fetchMonitoring = async () => {
        try {
          const res = await plantationService.getMyMonitoringStatus(token);
          setMonitoringList(res.data || []);
        } catch (err) {
          console.error("Failed to load monitoring statuses", err);
        }
      };
      fetchMonitoring();
    }
  }, [user, token, refreshMonitoring]);

  // Handle Simulate 10 Minutes
  const handleSimulateTime = async (plantationId) => {
    try {
      await plantationService.simulatePlantationTime(plantationId, token);
      setRefreshMonitoring(k => k + 1);
      alert("Success! Plantation time backdated by 11 minutes. It will now require monitoring.");
    } catch (err) {
      console.error("Failed to simulate time", err);
      alert("Failed to simulate time. Please ensure the Python model server is running.");
    }
  };

  // Handle Monitoring Image Upload
  const handleFileChange = async (e, plantationId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setActivePlantation(plantationId);
    try {
      const res = await plantationService.uploadMonitoringData(plantationId, formData, token);
      setSuccessResult(res.data);
      setRefreshMonitoring(k => k + 1);
    } catch (err) {
      console.error("Failed to upload monitoring report", err);
      alert("Verification failed. Please verify that the Flask server (port 5001) is running and loads the YOLO model.");
    } finally {
      setUploading(false);
    }
  };

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
        
        {/* Dashboard Greeting Header with Trust Score Widget */}
        <div className="mb-10 animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-dark-900/30 p-6 sm:p-8 rounded-3xl border border-dark-800/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-eco-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{roleInfo?.icon}</span>
              <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
                Hello, {user?.name?.split(' ')[0]}
              </h1>
            </div>
            <p className="text-dark-300 text-base max-w-xl">
              {user?.role === 'donor' 
                ? 'Explore active environmental projects, fund reforestation campaigns, and monitor ecological progress in real time.' 
                : `Welcome back! Manage your plantation projects, track AI verification results, and maintain your trust rating.`}
            </p>
            {user?.role === 'ngo' && ngoStatus && (
              <p className="text-xs text-dark-500 mt-3 font-mono">NGO Partner ID: {ngoStatus._id}</p>
            )}
          </div>

          {/* Real-time Trust Score Radial Gauge */}
          {user?.role === 'ngo' && ngoStatus && (
            <div className="flex items-center gap-5 bg-dark-950/80 p-5 rounded-2xl border border-dark-800 shadow-xl shrink-0 w-full md:w-auto relative group">
              <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    strokeWidth="4"
                    stroke="#1e293b"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    strokeWidth="5"
                    stroke={
                      ngoStatus.trustScore >= 90 ? '#10b981' :
                      ngoStatus.trustScore >= 75 ? '#f59e0b' :
                      ngoStatus.trustScore >= 50 ? '#f97316' : '#ef4444'
                    }
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - ngoStatus.trustScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-sm font-black text-white">{ngoStatus.trustScore}%</span>
              </div>
              <div>
                <p className="text-[10px] text-dark-400 uppercase font-black tracking-wider">NGO Trust Rating</p>
                <h4 className="text-sm font-black text-white mt-0.5">{ngoStatus.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    ngoStatus.trustScore >= 90 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                    ngoStatus.trustScore >= 75 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                    ngoStatus.trustScore >= 50 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                    'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    {ngoStatus.trustTier || 'Standard (Bronze)'}
                  </span>
                  <Link
                    to={`/ngo/${user.id}/trust-history`}
                    className="text-[10px] text-eco-400 hover:text-white transition-colors underline font-semibold"
                  >
                    View History
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── ALAG SECTION: Action Required Survival Monitoring ─── */}
        {user?.role === 'ngo' && !currentView && monitoringList.filter(p => p.needsMonitoring).length > 0 && (
          <div className="mb-10 card-eco p-6 border-red-500/30 bg-red-500/5 relative overflow-hidden animate-slide-up">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-start gap-3 mb-4">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-400 shrink-0">
                <HiBell size={24} className="animate-bounce" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  🚨 Action Required: Survival Monitoring Update Due!
                </h2>
                <p className="text-sm text-dark-300 mt-1">
                  The following tree plantations have exceeded the **10-minute monitoring window**. To maintain ecological trust and prevent a **-15 points trust score penalty**, you must immediately upload a drone or satellite picture showing current tree survival rates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {monitoringList.filter(p => p.needsMonitoring).map((p) => (
                <div key={p._id} className="bg-dark-900 border border-red-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div>
                    <h3 className="font-bold text-white text-base line-clamp-1">{p.projectTitle}</h3>
                    <p className="text-xs text-dark-400 mt-0.5">Approved: {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex justify-between items-center bg-dark-950 p-3 rounded-xl border border-dark-800 text-xs">
                    <div>
                      <span className="text-dark-400 block uppercase font-bold text-[9px]">Baseline trees</span>
                      <span className="text-white font-bold text-sm">{p.treeCount}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-dark-400 block uppercase font-bold text-[9px]">Time elapsed</span>
                      <span className="text-red-400 font-bold text-sm">{p.minutesElapsed} minutes</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {uploading && activePlantation === p._id ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-eco-400 font-bold py-2 bg-dark-950 rounded-xl border border-dark-800">
                        <span className="w-4 h-4 border-2 border-eco-400 border-t-transparent rounded-full animate-spin"></span>
                        AI inference in progress...
                      </div>
                    ) : (
                      <div className="relative">
                        <label className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-transform hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2 text-sm text-center">
                          <HiUpload size={16} /> Upload Monitoring Pic
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, p._id)}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SURVIVAL TRACKING LOG SECTION (All Approved) ─── */}
        {user?.role === 'ngo' && !currentView && (
          <div className="mb-10 card-eco p-6 border-dark-800 bg-dark-900/40 relative overflow-hidden animate-slide-up">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🌱 Survival Tracking Status & History
            </h2>
            <p className="text-sm text-dark-300 mb-6">
              A comprehensive list of all approved plantations under your management. Use the **Simulate 10m** tool to accelerate testing and trigger updates.
            </p>

            {monitoringList.length === 0 ? (
              <div className="p-8 text-center text-dark-400 text-sm bg-dark-950/40 rounded-2xl border border-dark-800/80">
                No projects available.
              </div>
            ) : (
              <div className="overflow-x-auto custom-scroll">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-800 text-xs font-bold text-dark-400 uppercase tracking-wider">
                      <th className="pb-3">Project Title</th>
                      <th className="pb-3">Initial Count</th>
                      <th className="pb-3">Minutes Elapsed</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Simulation / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-dark-200">
                    {monitoringList.map((p) => (
                      <tr key={p._id} className="border-b border-dark-800/50 hover:bg-dark-900/20">
                        <td className="py-4 font-bold text-white">{p.projectTitle}</td>
                        <td className="py-4">{p.treeCount} trees</td>
                        <td className="py-4 text-dark-300">{p.minutesElapsed} minutes</td>
                        <td className="py-4">
                          {p.monitored ? (
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              p.monitoringReport.survivalRate >= 70
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                : 'text-red-400 bg-red-500/10 border-red-500/20'
                            }`}>
                              Monitored ({p.monitoringReport.survivalRate}%)
                            </span>
                          ) : p.needsMonitoring ? (
                            <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse">
                              Pending Update
                            </span>
                          ) : (
                            <span className="text-dark-400 bg-dark-800/60 border border-dark-700/50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              Monitoring Locked
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          {/* Simulation trigger */}
                          <button
                            onClick={() => handleSimulateTime(p._id)}
                            className="text-xs bg-dark-800 hover:bg-eco-500/10 hover:text-eco-400 text-dark-300 px-3 py-1.5 rounded-lg border border-dark-700 transition-colors inline-flex items-center gap-1"
                          >
                            <HiRefresh size={14} /> Simulate 10m Reset
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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

      {/* AI Survival Verification Result Modal */}
      {successResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setSuccessResult(null)}></div>
          
          <div className="relative bg-dark-900 border border-dark-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-slide-up p-6 text-center space-y-6">
            <button 
              onClick={() => setSuccessResult(null)}
              className="absolute top-4 right-4 bg-dark-950/50 hover:bg-red-500 hover:text-white text-dark-300 p-2 rounded-full backdrop-blur-md transition-colors"
            >
              <HiX size={20} />
            </button>

            <HiCheckCircle size={60} className="text-emerald-400 mx-auto" />
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">AI Verification Finished</h3>
              <p className="text-sm text-dark-300">YOLO model successfully verified the tree survival count.</p>
            </div>

            <div className="bg-dark-950 p-5 rounded-2xl border border-dark-800 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-dark-400 uppercase font-bold mb-1">Initial</p>
                <p className="text-lg font-black text-white">{successResult.initialTreeCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-dark-400 uppercase font-bold mb-1">Surviving</p>
                <p className="text-lg font-black text-eco-400">{successResult.aiTreeCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-dark-400 uppercase font-bold mb-1">Rate</p>
                <p className={`text-lg font-black ${successResult.survivalRate >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>{successResult.survivalRate}%</p>
              </div>
            </div>

            <div className="text-left text-xs space-y-2 bg-dark-950/50 p-4 rounded-xl border border-dark-800/50 text-dark-300 leading-relaxed">
              {successResult.survivalRate < 70 ? (
                <p className="text-red-400 font-semibold">⚠️ Alert: Low survival rate (&lt; 70%) detected! A trust score penalty of **-15 points** has been applied to your profile and an alert email has been sent.</p>
              ) : (
                <p className="text-emerald-400 font-semibold">✅ Success: High survival rate verified! Your trust score remains healthy.</p>
              )}
            </div>

            <button onClick={() => setSuccessResult(null)} className="btn-eco w-full">Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
