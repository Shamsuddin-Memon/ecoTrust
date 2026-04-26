import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import ngoService from '../services/ngoService';
import projectService from '../services/projectService';
import useAuth from '../hooks/useAuth';
import { HiCheck, HiX, HiExternalLink, HiClipboardList, HiUsers } from 'react-icons/hi';

const AdminPanelPage = () => {
  const { token } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('ngos'); // 'ngos' | 'projects'

  // Data State
  const [ngos, setNgos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ngos') {
        const res = await ngoService.getPendingNGOs();
        setNgos(res.data.data);
      } else {
        const payload = await projectService.getPendingProjects(token);
        setProjects(payload.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  // --- NGO Actions ---
  const handleApproveNGO = async (id) => {
    setActionLoading(id);
    try {
      await ngoService.approveNGO(id);
      setNgos((prev) => prev.filter((ngo) => ngo._id !== id));
    } catch (error) {
      alert('Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineNGO = async (id) => {
    const reason = window.prompt("Reason for declining (optional):");
    if (reason === null) return;
    setActionLoading(id);
    try {
      await ngoService.declineNGO(id, reason);
      setNgos((prev) => prev.filter((ngo) => ngo._id !== id));
    } catch (error) {
      alert('Decline failed.');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Project Actions ---
  const handleApproveProject = async (id) => {
    setActionLoading(id);
    try {
      await projectService.approveProject(id, token);
      setProjects((prev) => prev.filter((proj) => proj._id !== id));
    } catch (error) {
      alert('Project approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineProject = async (id) => {
    const confirm = window.confirm("Are you sure you want to decline this project?");
    if (!confirm) return;
    setActionLoading(id);
    try {
      await projectService.declineProject(id, token);
      setProjects((prev) => prev.filter((proj) => proj._id !== id));
    } catch (error) {
      alert('Project decline failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header & Tabs */}
        <div className="mb-10 block sm:flex justify-between items-end border-b border-dark-800 pb-4">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Control Center</h1>
            <p className="text-dark-300">Centralized hub for reviewing platform submissions.</p>
          </div>
          
          <div className="flex bg-dark-800 p-1.5 rounded-xl border border-dark-700">
            <button 
              onClick={() => setActiveTab('ngos')}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'ngos' ? 'bg-eco-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
            >
              <HiUsers size={18} /> NGO Accounts
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-eco-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
            >
              <HiClipboardList size={18} /> New Projects
            </button>
          </div>
        </div>

        {/* Content Logic */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-eco-500/20 border-t-eco-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* NGO TAB RENDER */}
            {activeTab === 'ngos' && (
              ngos.length === 0 ? (
                <div className="card-eco p-12 text-center flex flex-col items-center">
                  <span className="text-4xl mb-4 text-dark-500">🎉</span>
                  <h3 className="text-xl font-bold text-white">All Caught Up!</h3>
                  <p className="text-dark-400">No pending NGO registrations.</p>
                </div>
              ) : (
                ngos.map((ngo) => (
                  <div key={ngo._id} className="card-eco flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{ngo.name}</h3>
                        <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-sm border border-amber-500/20">NGO Request</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                        <p className="text-dark-300"><span className="text-dark-400 w-20 inline-block font-medium">Applicant:</span> <span className="text-white">{ngo.createdBy.name}</span></p>
                        <p className="text-dark-300"><span className="text-dark-400 w-20 inline-block font-medium">Location:</span> <span className="text-white">{ngo.location}</span></p>
                        <p className="text-dark-300 flex items-center gap-2">
                           <span className="text-dark-400 w-20 inline-block font-medium">Docs:</span> 
                           <a href={`http://localhost:5000${ngo.documents}`} target="_blank" rel="noopener noreferrer" className="text-eco-400 hover:text-eco-300 flex items-center gap-1 transition-colors">
                              View Certificate <HiExternalLink />
                           </a>
                        </p>
                      </div>
                      <div className="pt-2">
                        <p className="text-dark-200 text-sm bg-dark-900 border border-dark-700/50 p-3 rounded-lg italic">"{ngo.mission}"</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-48 shrink-0">
                      <Button onClick={() => handleApproveNGO(ngo._id)} loading={actionLoading === ngo._id} disabled={actionLoading !== null} className="flex-1 flex justify-center gap-2 py-3"><HiCheck size={20} /> Approve</Button>
                      <Button onClick={() => handleDeclineNGO(ngo._id)} disabled={actionLoading !== null} variant="danger" className="flex-1 flex justify-center gap-2 py-3"><HiX size={20} /> Decline</Button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* PROJECTS TAB RENDER */}
            {activeTab === 'projects' && (
              projects.length === 0 ? (
                <div className="card-eco p-12 text-center flex flex-col items-center">
                  <span className="text-4xl mb-4 text-dark-500">🌍</span>
                  <h3 className="text-xl font-bold text-white">No New Projects</h3>
                  <p className="text-dark-400">All submitted projects have been reviewed.</p>
                </div>
              ) : (
                projects.map((proj) => (
                  <div key={proj._id} className="card-eco flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group border-l-4 hover:border-eco-500 border-l-eco-500/50">
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{proj.title}</h3>
                        <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-sm border border-teal-400/20">{proj.category}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-24 inline-block font-medium">Submitted by:</span> 
                          <span className="text-white font-medium">{proj.ngoCompanyName || proj.ngoId?.name || 'Unknown NGO'}</span>
                        </p>
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-24 inline-block font-medium">Target Cost:</span> 
                          <span className="text-white font-bold">${proj.targetFunding?.toLocaleString()}</span>
                        </p>
                      </div>
                      <div className="pt-2">
                        <p className="text-dark-200 text-sm line-clamp-2">{proj.description}</p>
                      </div>

                      {/* Initial Field Data Attachment */}
                      {proj.fieldData && (
                        <div className="mt-4 bg-dark-900/50 p-4 rounded-xl border border-dark-700/50">
                          <p className="text-xs font-bold text-dark-400 mb-2 uppercase tracking-wider">Initial Field Capture Attached</p>
                          <div className="flex gap-4">
                            {proj.fieldData.imageUrl && (
                              <img src={`http://localhost:5000${proj.fieldData.imageUrl}`} alt="Evidence" className="w-24 h-24 object-cover rounded-lg border border-dark-700" />
                            )}
                            <div className="text-sm space-y-1 py-1">
                              <p className="text-dark-300"><span className="text-dark-400 w-24 inline-block">Trees Planted:</span> <span className="text-white font-bold">{proj.fieldData.treeCount}</span></p>
                              <p className="text-dark-300"><span className="text-dark-400 w-24 inline-block">GPS Location:</span> <span className="text-eco-400 font-medium">{proj.fieldData.gpsLocation?.latitude}, {proj.fieldData.gpsLocation?.longitude}</span></p>
                              {proj.fieldData.aiVerified && (
                                <p className="text-dark-300 mt-2 inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold border border-emerald-500/20">
                                  ✓ AI Verified ({proj.fieldData.confidenceScore}%)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-48 shrink-0">
                      <Button onClick={() => handleApproveProject(proj._id)} loading={actionLoading === proj._id} disabled={actionLoading !== null} className="flex-1 flex justify-center gap-2 py-3"><HiCheck size={20} /> Approve</Button>
                      <Button onClick={() => handleDeclineProject(proj._id)} disabled={actionLoading !== null} variant="danger" className="flex-1 flex justify-center gap-2 py-3"><HiX size={20} /> Decline</Button>
                    </div>
                  </div>
                ))
              )
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelPage;
