import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import ngoService from '../services/ngoService';
import projectService from '../services/projectService';
import plantationService from '../services/plantationService';
import useAuth from '../hooks/useAuth';
import { 
  HiGlobeAlt, 
  HiX, 
  HiLocationMarker, 
  HiShieldCheck, 
  HiChevronLeft, 
  HiOfficeBuilding,
  HiClipboardList,
  HiChevronRight,
  HiCheckCircle,
  HiExclamationCircle,
  HiCalendar
} from 'react-icons/hi';

// ─── Trust Score Badge ───────────────────────────────────
const TrustScoreBadge = ({ score, size = 'sm' }) => {
  if (score === undefined || score === null) return null;
  
  let color, label;
  if (score >= 90) {
    color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    label = 'Expert (Gold)';
  } else if (score >= 75) {
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    label = 'Trusted (Silver)';
  } else if (score >= 50) {
    color = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    label = 'Standard (Bronze)';
  } else {
    color = 'text-red-400 bg-red-500/10 border-red-500/20';
    label = 'Unverified / High Risk';
  }

  if (size === 'lg') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${color}`}>
        <HiShieldCheck size={16} />
        <span className="text-xs font-bold">{score}</span>
        <span className="text-[10px] font-medium opacity-80">{label}</span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${color}`}>
      <HiShieldCheck size={12} />
      {score}
    </span>
  );
};

const NGOProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [ngoInfo, setNgoInfo] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Project detail modal states
  const [selectedProject, setSelectedProject] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Survival Tracking states
  const [showSurvivalModal, setShowSurvivalModal] = useState(false);
  const [monitoringReports, setMonitoringReports] = useState([]);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);

  useEffect(() => {
    const fetchNGOData = async () => {
      setLoading(true);
      try {
        // Fetch NGO details
        const infoRes = await ngoService.getNGOProfile(userId);
        setNgoInfo(infoRes.data.data);

        // Fetch NGO projects
        const projRes = await projectService.getNGOProjects(userId, token);
        setProjects(projRes.data || []);
      } catch (error) {
        console.error('Failed to load NGO profile data', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchNGOData();
    }
  }, [userId, token]);

  // Load Monitoring Reports for Survival & Carbon Footprint
  useEffect(() => {
    if (projects.length > 0 && token) {
      const fetchAllMonitoring = async () => {
        setLoadingMonitoring(true);
        try {
          const reportsList = [];
          for (const proj of projects) {
            const res = await plantationService.getMonitoringReportsByProject(proj._id, token);
            if (res.data && res.data.length > 0) {
              reportsList.push({
                projectId: proj._id,
                projectTitle: proj.title,
                category: proj.category,
                reports: res.data
              });
            }
          }
          setMonitoringReports(reportsList);
        } catch (err) {
          console.error("Failed to load monitoring reports for profile", err);
        } finally {
          setLoadingMonitoring(false);
        }
      };
      fetchAllMonitoring();
    }
  }, [projects, token]);

  // ─── Carbon Footprint Calculations ──────────────────────
  const carbonStats = (() => {
    let initialAITrees = 0;
    let survivingAITrees = 0;
    const carbonHistory = [];

    projects.forEach((proj) => {
      const initialCount = proj.fieldData?.aiTreeCount || proj.fieldData?.treeCount || 0;
      initialAITrees += initialCount;

      // Find the latest monitoring report for this project (reports list is sorted descending by date)
      const projReport = monitoringReports.find(mr => mr.projectId === proj._id);
      const latestReport = projReport?.reports?.[0]; // reports[0] is the latest report

      if (latestReport) {
        survivingAITrees += latestReport.aiTreeCount;
      } else {
        survivingAITrees += initialCount;
      }
    });

    // Translate to CO2 offset: 22kg per tree per year
    const initialCO2Kg = initialAITrees * 22;
    const activeCO2Kg = survivingAITrees * 22;

    // CO2 offset in Tonnes:
    const initialCO2Tonnes = Math.round((initialCO2Kg / 1000) * 100) / 100;
    const activeCO2Tonnes = Math.round((activeCO2Kg / 1000) * 100) / 100;

    // Carbon reduction efficiency percentage
    const efficiency = initialCO2Kg > 0 ? Math.round((activeCO2Kg / initialCO2Kg) * 1000) / 10 : 100;

    // Carbon Rating Grade
    let ratingGrade = 'New NGO';
    let ratingColor = 'text-dark-400 bg-dark-700/50 border-dark-600/30';
    if (initialAITrees > 0) {
      if (efficiency >= 90 && survivingAITrees >= 500) {
        ratingGrade = 'A+';
        ratingColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      } else if (efficiency >= 80) {
        ratingGrade = 'A';
        ratingColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      } else if (efficiency >= 70) {
        ratingGrade = 'B';
        ratingColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      } else if (efficiency >= 50) {
        ratingGrade = 'C';
        ratingColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      } else {
        ratingGrade = 'D';
        ratingColor = 'text-red-400 bg-red-500/10 border-red-500/20';
      }
    }

    // Compile carbon history timeline logs from monitoring reports
    monitoringReports.forEach((projReport) => {
      projReport.reports.forEach((report) => {
        const offsetTonnes = Math.round(((report.aiTreeCount * 22) / 1000) * 100) / 100;
        const initialOffsetTonnes = Math.round(((report.initialTreeCount * 22) / 1000) * 100) / 100;
        const diff = Math.round((offsetTonnes - initialOffsetTonnes) * 100) / 100;

        carbonHistory.push({
          id: report._id,
          projectTitle: projReport.projectTitle,
          date: new Date(report.createdAt),
          aiTreeCount: report.aiTreeCount,
          initialTreeCount: report.initialTreeCount,
          survivalRate: report.survivalRate,
          status: report.status,
          offsetTonnes,
          diff
        });
      });
    });

    // Sort history by date descending
    carbonHistory.sort((a, b) => b.date - a.date);

    return {
      initialAITrees,
      survivingAITrees,
      initialCO2Tonnes,
      activeCO2Tonnes,
      efficiency,
      ratingGrade,
      ratingColor,
      carbonHistory
    };
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-eco-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ngoInfo) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-center p-6">
        <Navbar />
        <div className="card-eco p-12 max-w-md w-full">
          <HiOfficeBuilding size={60} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">NGO Profile Not Found</h2>
          <p className="text-dark-400 mb-6">This NGO might not be approved or does not exist.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-eco w-full">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-dark-400 hover:text-white mb-8 transition-colors text-sm font-semibold"
        >
          <HiChevronLeft size={20} /> Back
        </button>
 
        {/* NGO Profile Header / Hero card */}
        <div className="relative rounded-3xl border border-dark-800 bg-dark-900/60 p-8 sm:p-10 shadow-xl overflow-hidden mb-12 animate-slide-up">
          {/* Ambient background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-eco-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
            {/* NGO Meta */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl">🏢</span>
                <h1 className="text-3xl sm:text-4xl font-display font-black text-white">{ngoInfo.name}</h1>
                <TrustScoreBadge score={ngoInfo.trustScore} size="lg" />
              </div>

              <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-dark-300">
                {ngoInfo.location && (
                  <span className="flex items-center gap-1.5">
                    <HiLocationMarker className="text-eco-500" /> {ngoInfo.location}
                  </span>
                )}
              </div>

              {/* Highly visible Navigation Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  onClick={() => setShowSurvivalModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-eco-600 hover:from-emerald-600 hover:to-eco-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2 border border-emerald-400/20"
                >
                  🌳 Real-time Survival Tracking
                </button>
                <button
                  onClick={() => navigate(`/ngo/${userId}/trust-history`)}
                  className="bg-dark-950/90 hover:bg-dark-800 text-eco-400 hover:text-white font-bold text-xs py-2.5 px-5 rounded-xl border border-dark-800 transition-all hover:scale-105 flex items-center gap-2 shadow-md"
                >
                  📈 View Trust History & Trend
                </button>
              </div>
            </div>

            {/* Stats Block */}
            <div className="grid grid-cols-3 gap-6 sm:gap-10 border-t md:border-t-0 md:border-l border-dark-800 pt-6 md:pt-0 md:pl-10 w-full md:w-auto shrink-0 text-center md:text-left">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Trust Score</p>
                <p className="text-3xl font-black text-eco-400">{ngoInfo.trustScore}%</p>
              </div>
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Verified Trees</p>
                <p className="text-3xl font-black text-emerald-400">{ngoInfo.totalVerifiedTrees?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Projects</p>
                <p className="text-3xl font-black text-white">{ngoInfo.approvedProjectsCount || 0}</p>
              </div>
            </div>
          </div>

          {/* NGO Mission */}
          {ngoInfo.mission && (
            <div className="mt-8 pt-8 border-t border-dark-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-2">NGO Mission & Vision</h3>
              <p className="text-dark-200 text-base leading-relaxed italic max-w-3xl">
                "{ngoInfo.mission}"
              </p>
            </div>
          )}
        </div>

        {/* 🌿 Dedicated Carbon Footprint & Impact Tracking Section */}
        <div className="mb-12 rounded-3xl border border-dark-800 bg-dark-900/40 p-6 sm:p-8 shadow-xl relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2.5 mb-6 border-b border-dark-800 pb-4">
            <span className="text-2xl">🌿</span>
            <div>
              <h2 className="text-xl font-bold text-white">Environmental Impact & Carbon Footprints</h2>
              <p className="text-xs text-dark-400 mt-0.5">Objective calculations derived from AI-detected tree baselines and survival tracking history</p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center text-dark-400 text-sm bg-dark-950/40 rounded-2xl border border-dark-800/80">
              No projects available.
            </div>
          ) : (
            <>
              {/* Telemetry Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Active Carbon Offset */}
                <div className="bg-dark-950/80 border border-dark-800 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                  <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Active Carbon Offset</p>
                  <p className="text-2xl font-black text-emerald-400">{carbonStats.activeCO2Tonnes} <span className="text-xs font-normal text-dark-400">Tonnes / Year</span></p>
                  <p className="text-[10px] text-dark-500 mt-2 font-mono">CO2 absorbed from environment</p>
                </div>

                {/* Carbon Rating Grade */}
                <div className="bg-dark-950/80 border border-dark-800 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-eco-500/5 rounded-full blur-2xl group-hover:bg-eco-500/10 transition-colors"></div>
                  <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Carbon Rating Grade</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-lg text-sm font-black uppercase border ${carbonStats.ratingColor}`}>
                      {carbonStats.ratingGrade}
                    </span>
                    <span className="text-[10px] text-dark-400">Rating Grade</span>
                  </div>
                  <p className="text-[10px] text-dark-500 mt-2 font-mono">Based on AI tree survival rates</p>
                </div>

                {/* Carbon Retention Efficiency */}
                <div className="bg-dark-950/80 border border-dark-800 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
                  <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Carbon Retention Efficiency</p>
                  <p className="text-2xl font-black text-white">{carbonStats.efficiency}%</p>
                  <p className="text-[10px] text-dark-500 mt-2 font-mono">Offset successfully maintained</p>
                </div>

                {/* Total Contributing Trees */}
                <div className="bg-dark-950/80 border border-dark-800 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors"></div>
                  <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Surviving AI Trees</p>
                  <p className="text-2xl font-black text-emerald-400">{carbonStats.survivingAITrees} <span className="text-xs font-normal text-dark-400">trees</span></p>
                  <p className="text-[10px] text-dark-500 mt-2 font-mono">Active carbon absorbers</p>
                </div>
              </div>

              {/* Carbon History Log & Trend */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-dark-800 pb-2 flex items-center gap-1.5">
                  📜 Carbon Rating & Offset History
                </h3>
                
                {carbonStats.carbonHistory.length === 0 ? (
                  <div className="bg-dark-950/40 border border-dark-800/80 rounded-2xl p-6 text-center text-dark-400 text-sm">
                    No historic monitoring reports available yet. Footprint reduction is currently at 100% of baseline targets ({carbonStats.activeCO2Tonnes} Tonnes/yr).
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scroll pr-2">
                    {carbonStats.carbonHistory.map((item) => (
                      <div key={item.id} className="bg-dark-950/60 border border-dark-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all gap-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-white text-xs line-clamp-1">{item.projectTitle}</h4>
                            <p className="text-[10px] text-dark-400 mt-0.5">{item.date.toLocaleDateString()} @ {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase shrink-0 ${
                            item.survivalRate >= 70
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-red-400 bg-red-500/10 border-red-500/20'
                          }`}>
                            {item.survivalRate}% Survival
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs bg-dark-900/60 p-3 rounded-xl border border-dark-800/40">
                          <div>
                            <span className="text-dark-500 text-[9px] uppercase font-bold block">Carbon Offset</span>
                            <span className="font-black text-white">{item.offsetTonnes} Tonnes CO2/yr</span>
                          </div>
                          <div className="text-right">
                            <span className="text-dark-500 text-[9px] uppercase font-bold block">Offset Adjustment</span>
                            <span className={`font-black ${item.diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {item.diff >= 0 ? '+' : ''}{item.diff} Tonnes/yr
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* NGO Projects Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <HiClipboardList className="text-eco-500" /> Approved Projects by {ngoInfo.name}
          </h2>

          {projects.length === 0 ? (
            <div className="card-eco p-12 text-center flex flex-col items-center">
              <HiGlobeAlt size={50} className="text-dark-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No Projects Available</h3>
              <p className="text-dark-400 text-sm">This NGO does not have any approved projects live at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div 
                  key={proj._id} 
                  className="card-eco p-0 overflow-hidden group flex flex-col cursor-pointer ring-0 hover:ring-2 hover:ring-eco-500 transition-all transform hover:-translate-y-1"
                  onClick={() => setSelectedProject(proj)}
                >
                  <div className="h-48 bg-dark-800 relative flex items-center justify-center border-b border-dark-700/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent z-10"></div>
                    
                    {proj.fieldData?.imageUrl || (proj.fieldData?.imageUrls && proj.fieldData.imageUrls.length > 0) ? (
                      <img 
                        src={`http://localhost:5000/${(proj.fieldData.imageUrls?.[0] || proj.fieldData.imageUrl).replace(/\\/g, '/').replace(/^\//, '')}`} 
                        alt="Project Cover" 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-eco-900/20 flex items-center justify-center group-hover:bg-eco-900/40 transition-colors">
                        <span className="text-6xl opacity-30">🌿</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-4 flex gap-2 z-20">
                      <span className="bg-dark-900/80 text-xs px-2 py-1 rounded-md font-bold text-white shadow-xl backdrop-blur-md uppercase border border-dark-700/50">
                        {proj.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col pointer-events-none">
                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-eco-400 transition-colors line-clamp-1">{proj.title}</h4>
                    <p className="text-xs text-eco-400 font-bold mb-3 uppercase tracking-wider">
                      {ngoInfo.name}
                    </p>
                    
                    <p className="text-dark-300 text-sm mb-4 line-clamp-2">{proj.description}</p>
                    
                    <div className="flex justify-between items-end border-t border-dark-700/50 pt-4 mt-auto">
                      <div>
                        <p className="text-xs text-dark-400 mb-0.5">Target Funding</p>
                        <p className="text-sm font-bold text-white">PKR {proj.targetFunding?.toLocaleString()} <span className="text-dark-500 font-normal">req</span></p>
                      </div>
                      <button className="text-sm font-bold text-dark-900 bg-white px-5 py-2 rounded-lg pointer-events-auto hover:bg-eco-200 transition-colors">Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Pop-up Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProject(null)}></div>
          
          <div className="relative bg-dark-900 border border-dark-700 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 bg-dark-950/50 hover:bg-red-500 hover:text-white text-dark-300 p-2 rounded-full backdrop-blur-md z-30 transition-colors"
            >
              <HiX size={20} />
            </button>

            {/* Header Image Gallery */}
            <div className="h-64 sm:h-80 bg-dark-800 relative shrink-0">
              {selectedProject.fieldData?.imageUrls && selectedProject.fieldData.imageUrls.length > 0 ? (
                <div className="flex overflow-x-auto snap-x h-full w-full custom-scroll">
                  {selectedProject.fieldData.imageUrls.map((imgUrl, idx) => (
                      <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative group/img">
                        <img 
                          src={`http://localhost:5000/${imgUrl.replace(/\\/g, '/').replace(/^\//, '')}`} 
                          className="w-full h-full object-cover" 
                          alt={`Cover ${idx}`} 
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm z-20 pointer-events-none">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setFullscreenImage(`http://localhost:5000/${imgUrl.replace(/\\/g, '/').replace(/^\//, '')}`); }}
                              className="bg-dark-900/80 hover:bg-eco-500 text-white font-medium py-2 px-6 rounded-full pointer-events-auto transition-colors shadow-lg"
                            >
                                View Full Picture
                            </button>
                        </div>
                      </div>
                  ))}
                </div>
              ) : selectedProject.fieldData?.imageUrl ? (
                <div className="w-full h-full relative group/img">
                    <img src={`http://localhost:5000/${selectedProject.fieldData.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm z-20 pointer-events-none">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFullscreenImage(`http://localhost:5000/${selectedProject.fieldData.imageUrl.replace(/\\/g, '/').replace(/^\//, '')}`); }}
                          className="bg-dark-900/80 hover:bg-eco-500 text-white font-medium py-2 px-6 rounded-full pointer-events-auto transition-colors shadow-lg"
                        >
                            View Full Picture
                        </button>
                    </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-eco-900/20"><span className="text-7xl opacity-20">🌿</span></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent pointer-events-none"></div>
              
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none z-30">
                <span className="bg-eco-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block shadow-lg">
                  {selectedProject.category}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight shadow-sm">{selectedProject.title}</h2>
                <p className="text-eco-400 font-bold mt-1 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                  Organized by {ngoInfo.name}
                  <TrustScoreBadge score={ngoInfo.trustScore} size="lg" />
                </p>
                {selectedProject.fieldData?.imageUrls?.length > 1 && (
                  <p className="text-dark-300 text-xs mt-2 animate-pulse">Scroll horizontally for more pictures ({selectedProject.fieldData.imageUrls.length})</p>
                )}
              </div>
            </div>

            {/* Content Scrollable */}
            <div className="p-6 sm:p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Description */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-2 w-full border-b border-dark-800 pb-2">About The Project</h3>
                    <p className="text-dark-200 leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
                  </div>

                  {selectedProject.fieldData && (
                    <div className="bg-dark-950 p-5 rounded-2xl border border-dark-800 space-y-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                        <HiLocationMarker className="text-eco-400" size={18} /> Field Operations Map Location
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-dark-400 mb-1 text-xs uppercase font-bold">Trees Planted</p>
                          <p className="text-white font-bold text-2xl">{selectedProject.fieldData.treeCount}</p>
                        </div>
                        <div>
                          <p className="text-dark-400 mb-1 text-xs uppercase font-bold">GPS Coordinate</p>
                          <p className="text-eco-400 font-mono text-xs">{selectedProject.fieldData.gpsLocation?.latitude}°<br/>{selectedProject.fieldData.gpsLocation?.longitude}°</p>
                        </div>
                      </div>
                      {selectedProject.fieldData.aiVerified && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-2 mt-4 rounded flex justify-center">
                          AI Verification Passed ({selectedProject.fieldData.confidenceScore}% Confidence)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Panel Funding */}
                <div className="space-y-6">
                  <div className="card-eco p-5 bg-dark-800 border-dark-700">
                    <p className="text-dark-400 text-xs font-bold uppercase mb-1">Target Funding Required</p>
                    <p className="text-3xl font-black text-white mb-6">PKR {selectedProject.targetFunding?.toLocaleString()}</p>
                    
                    <button className="w-full bg-eco-500 hover:bg-eco-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
                       Fund this Project
                    </button>
                    <p className="text-center text-[10px] text-dark-400 mt-3">* Payments are simulated in this beta environment</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Survival Tracking Modal */}
      {showSurvivalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowSurvivalModal(false)}></div>
          
          <div className="relative bg-dark-900 border border-dark-700 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setShowSurvivalModal(false)}
              className="absolute top-4 right-4 bg-dark-950/50 hover:bg-red-500 hover:text-white text-dark-300 p-2 rounded-full backdrop-blur-md z-30 transition-colors"
            >
              <HiX size={20} />
            </button>

            <div className="p-6 border-b border-dark-800 shrink-0">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🌳 Real-time AI Survival Tracking
              </h2>
              <p className="text-xs text-dark-400 mt-1">Periodic drone & satellite analysis of tree counts compared with plantation baseline data</p>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 custom-scroll">
              {loadingMonitoring ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-eco-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : monitoringReports.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <HiOfficeBuilding size={50} className="text-dark-500 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">No Survival History</h3>
                  <p className="text-dark-400 text-sm">This NGO has not submitted any periodic monitoring updates yet.</p>
                </div>
              ) : (
                <>
                  {/* Premium Survival Rate Trend Line Chart */}
                  <div className="bg-dark-950/40 border border-dark-850 p-5 rounded-3xl space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">📈 Global Survival Trend Analytics</h4>
                      <p className="text-[10px] text-dark-400">Aggregated real-time survival rates across all approved projects</p>
                    </div>
                    
                    {(() => {
                      const allReportsSorted = monitoringReports
                        .flatMap(pr => pr.reports.map(r => ({ ...r, projectTitle: pr.projectTitle })))
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                      if (allReportsSorted.length === 0) return null;

                      return (
                        <div className="w-full">
                          <svg className="w-full h-44 bg-dark-950/60 rounded-2xl border border-dark-800 p-4 overflow-visible" viewBox="0 0 600 150" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            
                            {/* Grid Lines */}
                            <line x1="40" y1="20" x2="560" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />
                            <line x1="40" y1="75" x2="560" y2="75" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />
                            <line x1="40" y1="130" x2="560" y2="130" stroke="#1e293b" strokeWidth="1" />
                            
                            {/* 70% Threshold Line */}
                            <line x1="40" y1="51" x2="560" y2="51" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6" />
                            <text x="45" y="46" fill="#ef4444" className="text-[9px] font-black uppercase tracking-wider">70% Critical Threshold</text>
                            
                            {/* Area Fill */}
                            {allReportsSorted.length > 1 && (
                              <path
                                d={`M 40,130 L ${allReportsSorted.map((r, i) => `${40 + (i / (allReportsSorted.length - 1)) * 520},${20 + (100 - r.survivalRate) * 1.1}`).join(" L ")} L 560,130 Z`}
                                fill="url(#chartGlow)"
                              />
                            )}
                            
                            {/* Line path */}
                            {allReportsSorted.length > 1 ? (
                              <path
                                d={`M ${allReportsSorted.map((r, i) => `${40 + (i / (allReportsSorted.length - 1)) * 520},${20 + (100 - r.survivalRate) * 1.1}`).join(" L ")}`}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            ) : null}
                            
                            {/* Data Dots & Hover Labels */}
                            {allReportsSorted.map((r, i) => {
                              const cx = allReportsSorted.length > 1 
                                ? 40 + (i / (allReportsSorted.length - 1)) * 520
                                : 300;
                              const cy = 20 + (100 - r.survivalRate) * 1.1;
                              
                              return (
                                <g key={r._id} className="group/dot cursor-pointer">
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r="6"
                                    fill={r.survivalRate >= 70 ? "#10b981" : "#ef4444"}
                                    className="transition-all duration-300 group-hover/dot:r-8 hover:scale-125"
                                  />
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r="12"
                                    fill="transparent"
                                    className="group-hover/dot:fill-white/10"
                                  />
                                  <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <rect
                                      x={cx - 75}
                                      y={cy - 45}
                                      width="150"
                                      height="35"
                                      rx="6"
                                      fill="#0f172a"
                                      stroke="#1e293b"
                                      strokeWidth="1"
                                    />
                                    <text x={cx} y={cy - 33} fill="#ffffff" textAnchor="middle" className="text-[9px] font-bold">{r.projectTitle}</text>
                                    <text x={cx} y={cy - 22} fill={r.survivalRate >= 70 ? "#34d399" : "#f87171"} textAnchor="middle" className="text-[10px] font-black">{r.survivalRate}% Survival</text>
                                  </g>
                                </g>
                              );
                            })}
                            
                            {/* Y Axis Labels */}
                            <text x="15" y="24" fill="#64748b" className="text-[9px] font-bold">100%</text>
                            <text x="15" y="79" fill="#64748b" className="text-[9px] font-bold">50%</text>
                            <text x="20" y="134" fill="#64748b" className="text-[9px] font-bold">0%</text>
                          </svg>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Real-time Project Logs and side-by-side Then & Now comparisons */}
                  <div className="space-y-10">
                    {monitoringReports.map((projReport) => (
                      <div key={projReport.projectId} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-dark-800 pb-2">
                          <h3 className="font-black text-white text-lg flex items-center gap-2">
                            🌱 {projReport.projectTitle}
                          </h3>
                          <span className="text-[10px] bg-dark-950 text-eco-400 border border-dark-800 font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                            {projReport.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          {projReport.reports.map((report) => {
                            const date = new Date(report.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });

                            // Fetch related project initial approved photo
                            const relatedProject = projects.find(p => p._id === projReport.projectId);
                            const initialImgUrl = relatedProject?.fieldData?.imageUrls?.[0] || relatedProject?.fieldData?.imageUrl;

                            return (
                              <div key={report._id} className="bg-dark-950/60 border border-dark-800/80 rounded-2xl overflow-hidden flex flex-col p-6 space-y-5 shadow-lg">
                                {/* Header Info */}
                                <div className="flex justify-between items-center text-xs border-b border-dark-800/50 pb-3">
                                  <span className="text-dark-400 flex items-center gap-1.5 font-bold">
                                    <HiCalendar /> {date}
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                    report.status === 'normal'
                                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                      : report.status === 'warning'
                                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                        : 'text-red-400 bg-red-500/10 border-red-500/20'
                                  }`}>
                                    Status: {report.status}
                                  </span>
                                </div>

                                {/* Then & Now Comparison Columns */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  {/* Initial Photo (Then) */}
                                  <div className="space-y-2">
                                    <h4 className="text-[10px] text-dark-400 uppercase font-black tracking-wider flex items-center gap-1">
                                      <span>📸</span> Initial Plantation Photo
                                    </h4>
                                    <div 
                                      className="h-44 bg-dark-800 rounded-2xl overflow-hidden relative border border-dark-700/50 group/img cursor-pointer" 
                                      onClick={() => setFullscreenImage(initialImgUrl ? `http://localhost:5000/${initialImgUrl.replace(/\\/g, '/').replace(/^\//, '')}` : '')}
                                    >
                                      {initialImgUrl ? (
                                        <img 
                                          src={`http://localhost:5000/${initialImgUrl.replace(/\\/g, '/').replace(/^\//, '')}`} 
                                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" 
                                          alt="Initial plantation approved" 
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-dark-500 text-xs">No Initial Photo</div>
                                      )}
                                      <div className="absolute top-3 left-3 bg-dark-950/80 text-[10px] font-bold text-white px-2.5 py-0.5 rounded-md border border-dark-800/80 backdrop-blur-sm">
                                        Baseline Count: {report.initialTreeCount}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Latest Photo (Now) */}
                                  <div className="space-y-2">
                                    <h4 className="text-[10px] text-dark-400 uppercase font-black tracking-wider flex items-center gap-1">
                                      <span>🤖</span> Latest AI-Monitored Photo
                                    </h4>
                                    <div 
                                      className="h-44 bg-dark-800 rounded-2xl overflow-hidden relative border border-dark-700/50 group/img cursor-pointer" 
                                      onClick={() => setFullscreenImage(`http://localhost:5000${report.imageUrl}`)}
                                    >
                                      <img 
                                        src={`http://localhost:5000${report.imageUrl}`} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" 
                                        alt="Latest monitoring verified" 
                                      />
                                      <div className="absolute top-3 left-3 bg-dark-950/80 text-[10px] font-bold text-eco-400 px-2.5 py-0.5 rounded-md border border-dark-800/80 backdrop-blur-sm">
                                        AI Count: {report.aiTreeCount}
                                      </div>
                                      <div className="absolute bottom-3 right-3">
                                        <span className={`px-2.5 py-1.5 rounded-xl text-xs font-black border uppercase shadow-xl ${
                                          report.survivalRate >= 70
                                            ? 'text-emerald-400 bg-emerald-500/90 border-emerald-500'
                                            : 'text-red-400 bg-red-500/90 border-red-500'
                                        }`}>
                                          Survival: {report.survivalRate}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Analytics Panel */}
                                <div className="bg-dark-900/60 border border-dark-800 p-4 rounded-xl flex items-center justify-between text-xs">
                                  <div>
                                    <span className="text-dark-500 text-[10px] font-bold uppercase mb-0.5 block">Net Surviving / Initial</span>
                                    <span className={`font-black text-sm ${report.aiTreeCount >= report.initialTreeCount ? 'text-emerald-400' : 'text-amber-400'}`}>
                                      {report.aiTreeCount} of {report.initialTreeCount} trees
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-dark-500 text-[10px] font-bold uppercase mb-0.5 block">Real-time Telemetry</span>
                                    <span className={`font-extrabold text-xs uppercase ${report.survivalRate >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {report.survivalRate >= 70 ? '🟢 Stable Plantation' : '⚠️ Low Survival Alert'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-dark-800 shrink-0 flex justify-end">
              <button onClick={() => setShowSurvivalModal(false)} className="btn-eco px-6">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setFullscreenImage(null)}>
          <button 
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 bg-dark-900/50 hover:bg-red-500 text-white p-3 rounded-full transition-colors z-[70]"
          >
            <HiX size={24} />
          </button>
          <img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default NGOProfilePage;
