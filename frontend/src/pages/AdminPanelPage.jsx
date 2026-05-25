import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import PlantationReviewModal from '../components/PlantationReviewModal';
import ngoService from '../services/ngoService';
import projectService from '../services/projectService';
import userService from '../services/userService';
import plantationService from '../services/plantationService';
import useAuth from '../hooks/useAuth';
import { HiCheck, HiX, HiExternalLink, HiClipboardList, HiUsers, HiPencil, HiTrash } from 'react-icons/hi';

const AdminPanelPage = () => {
  const { token } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('ngos'); // 'ngos' | 'projects' | 'all_projects' | 'all_users' | 'plantations'

  // Data State
  const [ngos, setNgos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingPlantations, setPendingPlantations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', category: '', targetFunding: '' });

  // Plantation Review Modal State
  const [selectedPlantation, setSelectedPlantation] = useState(null);

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
      } else if (activeTab === 'projects') {
        const payload = await projectService.getPendingProjects(token);
        setProjects(payload.data || []);
      } else if (activeTab === 'all_projects') {
        const payload = await projectService.getAllProjectsAdmin(token);
        setAllProjects(payload.data || []);
      } else if (activeTab === 'all_users') {
        const payload = await userService.getUsers(token);
        setAllUsers(payload.data || []);
      } else if (activeTab === 'plantations') {
        const res = await plantationService.getPendingPlantations(token);
        setPendingPlantations(res.data || []);
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
    const reason = window.prompt("Reason for declining (optional):");
    if (reason === null) return;
    setActionLoading(id);
    try {
      await projectService.declineProject(id, reason, token);
      setProjects((prev) => prev.filter((proj) => proj._id !== id));
    } catch (error) {
      alert('Project decline failed.');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Admin All Projects Actions ---
  const handleEditClick = (proj) => {
    setEditingProject(proj);
    setEditFormData({
      title: proj.title,
      description: proj.description,
      category: proj.category,
      targetFunding: proj.targetFunding,
    });
  };

  const handleUpdateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setActionLoading(editingProject._id);
    try {
      await projectService.updateProject(editingProject._id, editFormData, token);
      setEditingProject(null);
      // Refresh project list
      const payload = await projectService.getAllProjectsAdmin(token);
      setAllProjects(payload.data || []);
    } catch (error) {
      alert('Failed to update project.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProject = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this project permanently?");
    if (!confirm) return;
    setActionLoading(id);
    try {
      await projectService.deleteProject(id, token);
      setAllProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      alert('Failed to delete project.');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Admin User Actions ---
  const handleDeleteUser = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this user permanently?");
    if (!confirm) return;
    setActionLoading(id);
    try {
      await userService.deleteUser(id, token);
      setAllUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Plantation Review Action ---
  const handlePlantationAction = (status) => {
    // Remove from list after approve/reject
    setPendingPlantations((prev) => prev.filter((p) => p._id !== selectedPlantation._id));
    setSelectedPlantation(null);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header & Tabs */}
        <div className="mb-10 block lg:flex justify-between items-end border-b border-dark-800 pb-4">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Control Center</h1>
            <p className="text-dark-300">Centralized hub for platform administration and reviews.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-dark-800 p-1.5 rounded-xl border border-dark-700">
            <button 
              onClick={() => setActiveTab('ngos')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'ngos' ? 'bg-eco-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
            >
              <HiUsers size={18} /> NGO Approvals
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-eco-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
            >
              <HiClipboardList size={18} /> Project Approvals
            </button>
            <button 
              onClick={() => setActiveTab('plantations')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'plantations' ? 'bg-eco-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
            >
              🌳 Plantation Reviews
            </button>
            <button 
              onClick={() => setActiveTab('all_projects')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'all_projects' ? 'bg-eco-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
            >
              <HiClipboardList size={18} /> Manage Projects
            </button>
            <button 
              onClick={() => setActiveTab('all_users')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'all_users' ? 'bg-eco-500 text-white shadow-lg' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
            >
              <HiUsers size={18} /> Manage Users
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
                        <p className="text-dark-300"><span className="text-dark-400 w-20 inline-block font-medium">Applicant:</span> <span className="text-white">{ngo.createdBy?.name || 'Unknown User'}</span></p>
                        <p className="text-dark-300"><span className="text-dark-400 w-20 inline-block font-medium">Location:</span> <span className="text-white">{ngo.location}</span></p>
                        <p className="text-dark-300 flex items-center gap-2">
                           <span className="text-dark-400 w-20 inline-block font-medium">Docs:</span> 
                           <a href={`http://localhost:5000/${ngo.documents?.replace(/\\/g, '/').replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-eco-400 hover:text-eco-300 flex items-center gap-1 transition-colors">
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
                               <img src={`http://localhost:5000/${proj.fieldData.imageUrl?.replace(/\\/g, '/').replace(/^\//, '')}`} alt="Evidence" className="w-24 h-24 object-cover rounded-lg border border-dark-700" />
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

            {/* PLANTATION REVIEWS TAB RENDER */}
            {activeTab === 'plantations' && (
              pendingPlantations.length === 0 ? (
                <div className="card-eco p-12 text-center flex flex-col items-center">
                  <span className="text-4xl mb-4 text-dark-500">🌳</span>
                  <h3 className="text-xl font-bold text-white">No Pending Plantations</h3>
                  <p className="text-dark-400">All plantation submissions have been reviewed.</p>
                </div>
              ) : (
                pendingPlantations.map((plantation) => (
                  <div key={plantation._id} className="card-eco flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group border-l-4 border-l-amber-500/50 hover:border-l-amber-500 transition-colors">
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{plantation.projectId?.title || 'Unknown Project'}</h3>
                        <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-sm border border-amber-500/20">Pending Review</span>
                        {plantation.aiVerified && (
                          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-sm border border-emerald-400/20">
                            AI Verified
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-28 inline-block font-medium">NGO:</span> 
                          <span className="text-white font-medium">{plantation.ngoCompanyName || plantation.ngoId?.name || 'Unknown'}</span>
                        </p>
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-28 inline-block font-medium">Reported Trees:</span> 
                          <span className="text-white font-bold">{plantation.treeCount}</span>
                        </p>
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-28 inline-block font-medium">AI Tree Count:</span> 
                          <span className="text-eco-400 font-bold">{plantation.aiTreeCount ?? '—'}</span>
                        </p>
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-28 inline-block font-medium">AI Confidence:</span> 
                          <span className={`font-bold ${plantation.confidenceScore >= 85 ? 'text-emerald-400' : plantation.confidenceScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {plantation.confidenceScore ?? '—'}%
                          </span>
                        </p>
                      </div>

                      {/* Image Thumbnails */}
                      {plantation.imageUrls?.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {plantation.imageUrls.slice(0, 4).map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={`http://localhost:5000/${imgUrl.replace(/\\/g, '/').replace(/^\//, '')}`}
                              alt={`Thumb ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-dark-700"
                            />
                          ))}
                          {plantation.imageUrls.length > 4 && (
                            <div className="w-16 h-16 rounded-lg border border-dark-700 bg-dark-800 flex items-center justify-center text-dark-400 text-xs font-bold">
                              +{plantation.imageUrls.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-48 shrink-0">
                      <Button 
                        onClick={() => setSelectedPlantation(plantation)} 
                        disabled={actionLoading !== null} 
                        className="flex-1 flex justify-center gap-2 py-3"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* MANAGE PROJECTS TAB RENDER */}
            {activeTab === 'all_projects' && (
              allProjects.length === 0 ? (
                <div className="card-eco p-12 text-center flex flex-col items-center">
                  <span className="text-4xl mb-4 text-dark-500">🌍</span>
                  <h3 className="text-xl font-bold text-white">No Projects Found</h3>
                  <p className="text-dark-400">There are no projects on the platform.</p>
                </div>
              ) : (
                allProjects.map((proj) => (
                  <div key={proj._id} className="card-eco flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group border-l-4 hover:border-eco-500 border-l-eco-500/50">
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{proj.title}</h3>
                        <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-sm border border-teal-400/20">{proj.category}</span>
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-sm border ${
                          proj.status === 'approved' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                          proj.status === 'pending' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                          'text-rose-400 bg-rose-400/10 border-rose-400/20'
                        }`}>{proj.status}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-24 inline-block font-medium">Submitted by:</span> 
                          <span className="text-white font-medium">{proj.ngoId?.name || 'Unknown NGO'}</span>
                        </p>
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-24 inline-block font-medium">Target Cost:</span> 
                          <span className="text-white font-bold">PKR {proj.targetFunding?.toLocaleString()}</span>
                        </p>
                      </div>
                      <div className="pt-2">
                        <p className="text-dark-200 text-sm line-clamp-2">{proj.description}</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-48 shrink-0">
                      <Button onClick={() => handleEditClick(proj)} disabled={actionLoading !== null} className="flex-1 flex justify-center gap-2 py-3"><HiPencil size={20} /> Edit</Button>
                      <Button onClick={() => handleDeleteProject(proj._id)} loading={actionLoading === proj._id} disabled={actionLoading !== null} variant="danger" className="flex-1 flex justify-center gap-2 py-3"><HiTrash size={20} /> Delete</Button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* MANAGE USERS TAB RENDER */}
            {activeTab === 'all_users' && (
              allUsers.length === 0 ? (
                <div className="card-eco p-12 text-center flex flex-col items-center">
                  <span className="text-4xl mb-4 text-dark-500">👥</span>
                  <h3 className="text-xl font-bold text-white">No Users Found</h3>
                  <p className="text-dark-400">There are no user accounts on the platform.</p>
                </div>
              ) : (
                allUsers.map((u) => (
                  <div key={u._id} className="card-eco flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{u.name}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-sm border ${
                          u.role === 'admin' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                          u.role === 'ngo' ? 'text-teal-400 bg-teal-400/10 border-teal-400/20' :
                          'text-sky-400 bg-sky-400/10 border-sky-400/20'
                        }`}>{u.role}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-24 inline-block font-medium">Email:</span> 
                          <span className="text-white font-medium">{u.email}</span>
                        </p>
                        <p className="text-dark-300">
                          <span className="text-dark-400 w-24 inline-block font-medium">Joined:</span> 
                          <span className="text-white">{new Date(u.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-48 shrink-0">
                      <Button 
                        onClick={() => handleDeleteUser(u._id)} 
                        loading={actionLoading === u._id} 
                        disabled={actionLoading !== null} 
                        variant="danger" 
                        className="flex-1 flex justify-center gap-2 py-3"
                      >
                        <HiTrash size={20} /> Delete
                      </Button>
                    </div>
                  </div>
                ))
              )
            )}
            
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setEditingProject(null)}></div>
          <div className="relative bg-dark-900 border border-dark-700 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl animate-slide-up">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Project Details</h3>
            <form onSubmit={handleUpdateProjectSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Project Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:border-eco-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  required
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:border-eco-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:border-eco-500 focus:outline-none"
                  >
                    <option value="Reforestation">Reforestation</option>
                    <option value="Afforestation">Afforestation</option>
                    <option value="Urban Greenery">Urban Greenery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Target Funding (PKR)</label>
                  <input
                    type="number"
                    required
                    value={editFormData.targetFunding}
                    onChange={(e) => setEditFormData({ ...editFormData, targetFunding: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:border-eco-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingProject(null)} className="flex-1">Cancel</Button>
                <Button type="submit" loading={actionLoading === editingProject._id} className="flex-1">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plantation Review Modal */}
      {selectedPlantation && (
        <PlantationReviewModal
          plantation={selectedPlantation}
          token={token}
          onClose={() => setSelectedPlantation(null)}
          onActionComplete={handlePlantationAction}
        />
      )}
    </div>
  );
};

export default AdminPanelPage;
