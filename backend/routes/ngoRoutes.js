const express = require('express');
const router = express.Router();
const {
  registerNGO,
  getPendingNGOs,
  approveNGO,
  declineNGO,
  getMyNGOStatus,
} = require('../controllers/ngoController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const ngoUpload = require('../middleware/ngoUploadMiddleware');

// ─── Donor/NGO Routes ────────────────────────────────────
router.post('/register', protect, authorize('donor'), ngoUpload.single('document'), registerNGO);
router.get('/me', protect, getMyNGOStatus);

// ─── Admin Routes ────────────────────────────────────────
router.get('/admin/pending', protect, authorize('admin'), getPendingNGOs);
router.put('/admin/:id/approve', protect, authorize('admin'), approveNGO);
router.put('/admin/:id/decline', protect, authorize('admin'), declineNGO);

module.exports = router;
