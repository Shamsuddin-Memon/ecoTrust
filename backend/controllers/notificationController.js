const Notification = require('../models/Notification');

// ────────────────────────────────────────────────────────
// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
// ────────────────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
// ────────────────────────────────────────────────────────
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Checking if the notification belongs to the user
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
// ────────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
