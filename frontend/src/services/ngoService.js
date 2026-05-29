import api from './api';

const ngoService = {
  /**
   * Register a new NGO — sends FormData to support file upload
   */
  registerNGO: (formData) =>
    api.post('/ngos/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Get current user's NGO status
   */
  getMyNGOStatus: () => api.get('/ngos/me'),

  /**
   * Admin: Get all pending NGOs
   */
  getPendingNGOs: () => api.get('/ngos/admin/pending'),

  /**
   * Admin: Approve NGO
   */
  approveNGO: (id) => api.put(`/ngos/admin/${id}/approve`),

  /**
   * Admin: Decline NGO
   */
  declineNGO: (id, reason) => api.put(`/ngos/admin/${id}/decline`, { reason }),

  /**
   * Get NGO public profile (trust score, stats)
   */
  getNGOProfile: (userId) => api.get(`/ngos/profile/${userId}`),

  /**
   * Get NGO trust score history & trends
   */
  getNGOTrustHistory: (userId) => api.get(`/ngos/profile/${userId}/trust-history`),
};

export default ngoService;
