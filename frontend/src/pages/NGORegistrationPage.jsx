import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ngoService from '../services/ngoService';
import { HiOfficeBuilding, HiLocationMarker, HiPhone, HiClipboardList, HiUpload, HiDocumentText } from 'react-icons/hi';

const NGORegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact: '',
    mission: '',
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) {
      setError('Please upload your NGO verification document.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Build FormData for multipart upload
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('location', formData.location);
      payload.append('contact', formData.contact);
      payload.append('mission', formData.mission);
      payload.append('document', documentFile);

      await ngoService.registerNGO(payload);
      setSuccess('NGO Registration request submitted successfully!');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col justify-center animate-fade-in">
        <div className="mb-8 text-center">
          <span className="text-4xl mb-4 block">🌱</span>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Register your NGO</h1>
          <p className="text-dark-300">Submit your details to gain access to fundraising and field tools.</p>
        </div>

        <div className="card-eco p-6 sm:p-10 shadow-eco">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-eco-500/10 border border-eco-500/30 text-eco-400 text-sm">
              {success} Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="NGO Name"
              type="text"
              name="name"
              placeholder="Enter your NGO name"
              value={formData.name}
              onChange={handleChange}
              icon={<HiOfficeBuilding size={20} />}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location (City, Country)"
                type="text"
                name="location"
                placeholder="Enter city and country"
                value={formData.location}
                onChange={handleChange}
                icon={<HiLocationMarker size={20} />}
                required
              />
              <Input
                label="Contact Number / Email"
                type="text"
                name="contact"
                placeholder="Enter contact number or email"
                value={formData.contact}
                onChange={handleChange}
                icon={<HiPhone size={20} />}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-200">Mission &amp; Vision</label>
              <div className="relative">
                <div className="absolute top-3 pl-3 flex items-center pointer-events-none text-dark-400">
                  <HiClipboardList size={20} />
                </div>
                <textarea
                  name="mission"
                  rows="4"
                  className="w-full bg-dark-900 border border-dark-700 text-white text-sm rounded-xl py-3 pl-10 pr-3 outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-all placeholder:text-dark-500"
                  placeholder="Describe your goals and environmental impact..."
                  value={formData.mission}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-200">
                Verification Document <span className="text-dark-500 font-normal">(PDF, DOC, DOCX, JPG, PNG — max 10MB)</span>
              </label>
              <label
                htmlFor="document-upload"
                className={`flex items-center gap-4 w-full cursor-pointer border-2 border-dashed rounded-xl px-5 py-4 transition-all
                  ${documentFile
                    ? 'border-eco-500/60 bg-eco-500/5'
                    : 'border-dark-600 bg-dark-900 hover:border-eco-500/40 hover:bg-dark-800'
                  }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 ${documentFile ? 'bg-eco-500/20 text-eco-400' : 'bg-dark-700 text-dark-400'}`}>
                  {documentFile ? <HiDocumentText size={22} /> : <HiUpload size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                  {documentFile ? (
                    <>
                      <p className="text-sm font-semibold text-white truncate">{documentFile.name}</p>
                      <p className="text-xs text-eco-400 mt-0.5">
                        {(documentFile.size / 1024 / 1024).toFixed(2)} MB — Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-white">Click to upload your NGO certificate/document</p>
                      <p className="text-xs text-dark-500 mt-0.5">The file will be saved under your NGO name</p>
                    </>
                  )}
                </div>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <Button type="submit" fullWidth loading={loading} className="mt-4">
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NGORegistrationPage;
