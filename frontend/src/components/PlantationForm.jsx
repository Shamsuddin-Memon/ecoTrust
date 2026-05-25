import { useState, useEffect } from 'react';
import { HiLocationMarker, HiPhotograph, HiCheckCircle, HiExclamationCircle, HiXCircle, HiClipboardList } from 'react-icons/hi';
import plantationService from '../services/plantationService';
import projectService from '../services/projectService';
import useAuth from '../hooks/useAuth';

const PlantationForm = () => {
  const { token } = useAuth();
  
  // High-Level Form Mode
  const [formMode, setFormMode] = useState('existing'); // 'existing' | 'new'

  // Pre-fetch User Projects
  const [existingProjects, setExistingProjects] = useState([]);
  const [isFetchingProjects, setIsFetchingProjects] = useState(true);

  // Project State
  const [projectId, setProjectId] = useState(''); // Only used if 'existing'
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: 'Reforestation',
    targetFunding: ''
  });

  // Plantation State
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [treeCount, setTreeCount] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectService.getMyProjects(token);
        setExistingProjects(res.data);
        if(res.data.length > 0) {
          setProjectId(res.data[0]._id);
        } else {
          setFormMode('new');
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setIsFetchingProjects(false);
      }
    };
    if (token) {
      loadProjects();
    }
  }, [token]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setError(null);

    // Limit to 10
    if (images.length + files.length > 10) {
      setError('You can only upload up to 10 images.');
      return;
    }

    const validFiles = [];
    const previews = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            setError('One or more files are not valid JPG or PNG images.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('One or more images exceed the 5MB size limit.');
            return;
        }
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
    }

    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setIsLoading(false);
      },
      (err) => {
        setError('Unable to fetch GPS location. Please enter manually.');
        setIsLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate Plantation Fields
    if (images.length === 0 || !latitude || !longitude || !treeCount) {
      setError('All field data (At least 1 Image, GPS, Tree Count) must be provided.');
      return;
    }
    if (parseInt(treeCount, 10) <= 0) {
      setError('Tree count must be a positive integer.');
      return;
    }

    try {
      setIsLoading(true);
      let targetProjectId = projectId;

      if (formMode === 'new') {
        if (!projectData.title || !projectData.description) {
           setError('Project title and description are required.');
           setIsLoading(false);
           return;
        }
        
        const newProjectRes = await projectService.createProject(projectData, token);
        targetProjectId = newProjectRes.data._id;
        
        setExistingProjects([{ ...newProjectRes.data, _id: targetProjectId }, ...existingProjects]);
      }

      if (!targetProjectId) {
         setError('A valid Project must be selected or created.');
         setIsLoading(false);
         return;
      }

      const formData = new FormData();
      formData.append('projectId', targetProjectId);
      images.forEach(img => {
          formData.append('images', img);
      });
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('treeCount', treeCount);

      const result = await plantationService.uploadPlantationData(formData, token);
      
      setSuccess(`✅ ${formMode === 'new' ? 'Project created and ' : ''}Plantation submitted! AI verified ${result.aiTreeCount || '?'} trees (${result.confidenceScore || '?'}% confidence). Sent for admin review.`);
      
      setImages([]);
      setImagePreviews([]);
      setLatitude('');
      setLongitude('');
      setTreeCount('');
      
      if (formMode === 'new') {
          setFormMode('existing');
          setProjectId(targetProjectId);
          setProjectData({title: '', description: '', category: 'Reforestation', targetFunding: ''});
      }

    } catch (err) {
      const errData = err.response?.data;
      if (errData?.mismatch) {
        setError(`🔍 Tree count mismatch: You reported ${errData.userTreeCount} trees but AI detected ${errData.aiTreeCount} trees. Please verify your count or re-upload a clearer image.`);
      } else {
        setError(errData?.message || errData?.errors?.[0]?.msg || 'Action failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProjects) {
      return <div className="p-8 text-center text-dark-300">Loading modules...</div>;
  }

  return (
    <div className="card-eco animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <HiClipboardList size={120} />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-6 pr-10">
        Start Project &amp; Upload Data
      </h2>

      {/* Toast Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <HiExclamationCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-eco-500/10 border border-eco-500/30 flex items-start gap-3">
          <HiCheckCircle className="text-eco-400 shrink-0 mt-0.5" size={20} />
          <p className="text-eco-400 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10 block">
        
        {/* --- STEP 1: PROJECT SECTION --- */}
        <div className="bg-dark-900/50 p-5 rounded-2xl border border-dark-700/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">1. Project Details</h3>
                <div className="flex bg-dark-800 p-1 rounded-lg">
                    <button 
                        type="button" 
                        onClick={() => setFormMode('existing')} 
                        disabled={existingProjects.length === 0}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${formMode === 'existing' ? 'bg-eco-500 text-white' : 'text-dark-400 hover:text-white disabled:opacity-30'}`}
                    >
                        Select Existing
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setFormMode('new')} 
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${formMode === 'new' ? 'bg-eco-500 text-white' : 'text-dark-400 hover:text-white'}`}
                    >
                        Create New
                    </button>
                </div>
            </div>

            {formMode === 'existing' ? (
                <div>
                    <label className="block text-dark-300 text-sm font-medium mb-1">Select Active Project</label>
                    <select
                        className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500 transition-colors"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                    >
                        {existingProjects.map(proj => (
                            <option key={proj._id} value={proj._id}>{proj.title} ({proj.status})</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-dark-300 text-sm font-medium mb-1">Project Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500"
                            placeholder="e.g., Save the Amazon"
                            value={projectData.title}
                            onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-dark-300 text-sm font-medium mb-1">Description</label>
                        <textarea
                            required rows="2"
                            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500"
                            value={projectData.description}
                            onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-dark-300 text-sm font-medium mb-1">Category</label>
                            <select
                                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500"
                                value={projectData.category}
                                onChange={(e) => setProjectData({...projectData, category: e.target.value})}
                            >
                                <option>Reforestation</option>
                                <option>Ocean Cleanup</option>
                                <option>Renewable Energy</option>
                                <option>Wildlife Protection</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-dark-300 text-sm font-medium mb-1">Target Funding</label>
                            <input
                                type="number"
                                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500"
                                placeholder="Auto: 0 PKR"
                                value={projectData.targetFunding}
                                onChange={(e) => setProjectData({...projectData, targetFunding: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- STEP 2: FIELD DATA SECTION --- */}
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-2">2. Field Capture Data</h3>
            
            {/* Tree Count */}
            <div>
                <label className="block text-dark-300 text-sm font-medium mb-1">Total Trees Planted in this batch</label>
                <input
                    type="number" min="1"
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500"
                    placeholder="e.g. 50"
                    value={treeCount}
                    onChange={(e) => setTreeCount(e.target.value)}
                />
            </div>

            {/* GPS Section */}
            <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700/50">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-dark-300 text-sm font-medium">GPS Coordinates</label>
                    <button
                        type="button"
                        onClick={handleGetLocation}
                        className="text-xs bg-dark-800 hover:bg-dark-700 text-white py-1 px-3 rounded-lg flex items-center gap-1 transition-colors"
                    >
                        <HiLocationMarker /> Auto-Detect via GPS
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="any" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm" />
                    <input type="number" step="any" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm" />
                </div>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-dark-300 text-sm font-medium mb-1">Photographic Evidence <span className="text-dark-500 font-normal">(Max 10 images)</span></label>
                
                {/* AI Guidance Message */}
                <div className="mb-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-start gap-2">
                  <span className="text-lg">📡</span>
                  <p className="text-sky-300 text-xs leading-relaxed">
                    <span className="font-bold">Please upload a satellite or drone image of your plantation area.</span> Our AI model will analyze the image to verify tree count. Make sure the image clearly shows the planted trees for accurate verification.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {/* File Imput Trigger */}
                  {images.length < 10 && (
                    <label className="border-2 border-dashed border-dark-600 hover:border-eco-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-dark-800/50">
                      <HiPhotograph size={32} className="text-dark-400 mb-2" />
                      <span className="text-dark-300 text-sm">Click to upload JPG/PNG ({images.length}/10 selected)</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/png, image/jpeg" 
                        multiple 
                        onChange={handleImageChange} 
                      />
                    </label>
                  )}

                  {/* Previews Gallery */}
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
                      {imagePreviews.map((previewUrl, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden bg-dark-800 min-w-[150px] aspect-square flex-shrink-0 flex items-center justify-center border border-dark-700 snap-center">
                          <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button 
                                type="button" 
                                onClick={() => removeImage(index)} 
                                className="bg-red-500 text-white hover:bg-red-600 p-2 rounded-full shadow-lg transition-colors"
                              >
                                <HiXCircle size={24} />
                              </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!projectId && formMode === 'existing')}
          className="w-full py-4 px-4 bg-eco-500 hover:bg-eco-600 disabled:bg-dark-700 disabled:text-dark-400 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 text-lg shadow-lg"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            `Submit All Data`
          )}
        </button>
      </form>
    </div>
  );
};

export default PlantationForm;
