import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlineFolderOpen,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiPencil,
  HiTrash,
  HiX,
  HiSave,
  HiExclamationCircle,
} from 'react-icons/hi';
import projectService from '../services/projectService';
import useAuth from '../hooks/useAuth';

const CATEGORIES = ['Reforestation', 'Ocean Cleanup', 'Renewable Energy', 'Wildlife Protection', 'Other'];

const MyProjectsView = ({ onProjectsChanged }) => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirm state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectService.getMyProjects(token);
      setProjects(res.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'completed':
        return <HiCheckCircle className="text-eco-400" size={20} />;
      case 'declined':
        return <HiXCircle className="text-red-400" size={20} />;
      default:
        return <HiClock className="text-amber-400" size={20} />;
    }
  };

  // ── Edit Handlers ──────────────────────────────────────
  const openEditModal = (project) => {
    setEditingProject(project);
    setEditForm({
      title: project.title,
      description: project.description,
      category: project.category,
      targetFunding: project.targetFunding,
    });
    setEditError('');
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      setEditError('Title and description are required.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      const res = await projectService.updateProject(editingProject._id, editForm, token);
      // Update list in-place
      setProjects((prev) =>
        prev.map((p) => (p._id === editingProject._id ? res.data : p))
      );
      setEditingProject(null);
      // Notify parent (ProjectFeed) to refresh
      if (onProjectsChanged) onProjectsChanged();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update project. Try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete Handlers ────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await projectService.deleteProject(id, token);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setDeletingId(null);
      // Notify parent (ProjectFeed) to refresh
      if (onProjectsChanged) onProjectsChanged();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <div className="w-8 h-8 border-4 border-eco-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 p-4 bg-red-500/10 rounded-xl">{error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineFolderOpen className="text-eco-400" /> My Projects
        </h2>
        <span className="bg-dark-800 text-white px-4 py-1.5 rounded-full text-sm font-medium border border-dark-700">
          Total: {projects.length}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="card-eco text-center p-12">
          <HiOutlineFolderOpen size={60} className="text-dark-400 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold mb-2">No Projects Yet</h3>
          <p className="text-dark-400">You haven&apos;t created any environmental projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="card-eco flex flex-col justify-between hover:border-eco-500/30 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark-300 bg-dark-800 px-3 py-1 rounded-md">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-1.5 bg-dark-800 px-3 py-1 rounded-full border border-dark-700">
                    {getStatusIcon(project.status)}
                    <span className="text-xs font-medium text-white capitalize">{project.status}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-dark-300 text-sm line-clamp-3 mb-4">{project.description}</p>
              </div>

              <div className="pt-4 border-t border-dark-700/50 mt-auto">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-dark-400 mb-0.5">Project ID</p>
                    <code className="text-xs text-eco-400 bg-eco-400/10 px-2 py-1 rounded block w-max mt-1">
                      {project._id}
                    </code>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark-400">Target</p>
                    <p className="text-sm font-bold text-white">PKR {project.targetFunding?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(project)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-dark-700 hover:bg-eco-500/20 hover:text-eco-400 text-dark-300 text-sm font-medium transition-colors border border-dark-600 hover:border-eco-500/30"
                  >
                    <HiPencil size={15} /> Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(project._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-dark-700 hover:bg-red-500/20 hover:text-red-400 text-dark-300 text-sm font-medium transition-colors border border-dark-600 hover:border-red-500/30"
                  >
                    <HiTrash size={15} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────── */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
            onClick={() => setEditingProject(null)}
          />
          <div className="relative bg-dark-900 border border-dark-700 w-full max-w-xl rounded-2xl shadow-2xl p-6 animate-slide-up z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HiPencil className="text-eco-400" /> Edit Project
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="p-2 rounded-full hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
              >
                <HiX size={20} />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                <HiExclamationCircle className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{editError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-1">Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500 transition-colors text-sm"
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows="4"
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500 transition-colors text-sm"
                  placeholder="Describe your environmental mission..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500 transition-colors text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-1">Target Funding (PKR)</label>
                  <input
                    type="number"
                    name="targetFunding"
                    value={editForm.targetFunding}
                    onChange={handleEditChange}
                    min="0"
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-eco-500 transition-colors text-sm"
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingProject(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-300 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-eco-500 hover:bg-eco-600 disabled:bg-dark-700 disabled:text-dark-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {editLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><HiSave size={16} /> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ────────────────────────── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
            onClick={() => setDeletingId(null)}
          />
          <div className="relative bg-dark-900 border border-red-500/30 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-slide-up z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <HiTrash className="text-red-400" size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
            <p className="text-dark-400 text-sm mb-6">
              This action cannot be undone. The project will be permanently removed and disappear from all dashboards.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-300 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-dark-700 disabled:text-dark-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {deleteLoading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Yes, Delete'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjectsView;
