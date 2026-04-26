import { useState } from 'react';
import { HiClipboardList, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import projectService from '../services/projectService';
import useAuth from '../hooks/useAuth';

const ProjectForm = () => {
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Reforestation',
    targetFunding: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsLoading(true);
      await projectService.createProject(formData, token);
      setSuccess('Project submitted successfully! It is now pending admin approval.');
      setFormData({ title: '', description: '', category: 'Reforestation', targetFunding: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to submit project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-eco animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <HiClipboardList size={120} />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <HiClipboardList className="text-eco-400" /> Start a New Project
      </h2>

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

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-dark-300 text-sm font-medium mb-1">Project Title</label>
          <input
            type="text"
            name="title"
            required
            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500 transition-colors"
            placeholder="e.g., Save the Amazon"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-dark-300 text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            required
            rows="4"
            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500 transition-colors"
            placeholder="Describe your environmental mission..."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500 transition-colors"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Reforestation">Reforestation</option>
              <option value="Ocean Cleanup">Ocean Cleanup</option>
              <option value="Renewable Energy">Renewable Energy</option>
              <option value="Wildlife Protection">Wildlife Protection</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-1">Target Funding (PKR)</label>
            <input
              type="number"
              name="targetFunding"
              min="0"
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500 transition-colors"
              placeholder="e.g. 5000"
              value={formData.targetFunding}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.title || !formData.description}
          className="w-full py-3 px-4 bg-eco-500 hover:bg-eco-600 disabled:bg-dark-700 disabled:text-dark-400 text-white font-bold rounded-xl transition-colors flex justify-center items-center"
        >
          {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Submit Project'}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;
