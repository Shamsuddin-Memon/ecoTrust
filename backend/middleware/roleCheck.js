/**
 * Middleware: Role-based access control.
 * Restricts access to specific roles (admin, ngo, donor).
 *
 * Usage: router.get('/admin-only', protect, authorize('admin'), handler)
 *
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — please log in',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — role '${req.user.role}' is not authorized for this resource`,
      });
    }

    next();
  };
};

module.exports = { authorize };
