import api from './api';

const notificationService = {
  /**
   * Get recent notifications
   */
  getNotifications: () => api.get('/notifications'),

  /**
   * Mark single notification as read
   */
  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default notificationService;
