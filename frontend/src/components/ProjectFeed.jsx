import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiGlobeAlt, HiX, HiLocationMarker, HiShieldCheck } from 'react-icons/hi';
import projectService from '../services/projectService';
import useAuth from '../hooks/useAuth';

// ─── Trust Score Badge ───────────────────────────────────
const TrustScoreBadge = ({ score, size = 'sm' }) => {
  if (score === undefined || score === null) return null;
  
  let color, label;
  if (score >= 80) {
    color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    label = 'Highly Trusted';
  } else if (score >= 60) {
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    label = 'Trusted';
  } else if (score >= 40) {
    color = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    label = 'Building Trust';
  } else {
    color = 'text-dark-400 bg-dark-700/50 border-dark-600/30';
    label = 'New NGO';
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

const ProjectFeed = ({ refreshKey = 0 }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null); // Used to render the expansion modal
  const [fullscreenImage, setFullscreenImage] = useState(null); // Used to show an image in fullscreen

  useEffect(() => {
    const fetchGlobalProjects = async () => {
      setIsLoading(true);
      try {
        const payload = await projectService.getGlobalProjects(token);
        setProjects(payload.data || []);
      } catch (error) {
        console.error('Failed to load global projects');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      fetchGlobalProjects();
    }
  }, [token, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-eco-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="card-eco p-12 text-center flex flex-col items-center">
        <HiGlobeAlt size={60} className="text-dark-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Active Projects Yet</h3>
        <p className="text-dark-400">Approved projects will appear here for everyone to discover.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <HiGlobeAlt className="text-eco-400" /> Discover Environmental Projects
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div 
            key={proj._id} 
            className="card-eco p-0 overflow-hidden group flex flex-col cursor-pointer ring-0 hover:ring-2 hover:ring-eco-500 transition-all transform hover:-translate-y-1"
            onClick={() => setSelectedProject(proj)}
          >
            <div className="h-48 bg-dark-800 relative flex items-center justify-center border-b border-dark-700/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent z-10"></div>
              
              {/* Load accurate cover image from Database, fallback to placeholder */}
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
              <p className="text-xs text-eco-400 font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                {proj.ngoCompanyName || 'Verified NGO'}
                <TrustScoreBadge score={proj.trustScore} />
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

      {/* Pop-up Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in" 
            onClick={() => setSelectedProject(null)}
          ></div>
          
          {/* Modal Body */}
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
                  Organized by {selectedProject.ngoCompanyName}
                  <TrustScoreBadge score={selectedProject.trustScore} size="lg" />
                  {selectedProject.ngoId && (
                    <button 
                      onClick={() => navigate(`/ngo/profile/${selectedProject.ngoId._id || selectedProject.ngoId}`)}
                      className="ml-2 bg-eco-500/10 hover:bg-eco-500 hover:text-white text-eco-400 text-xs font-bold py-1 px-3 rounded-lg border border-eco-500/20 transition-all cursor-pointer pointer-events-auto shadow-md"
                    >
                      View NGO Profile
                    </button>
                  )}
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

export default ProjectFeed;
