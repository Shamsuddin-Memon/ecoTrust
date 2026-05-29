const express = require('express');
const {
  uploadPlantationData,
  getPlantationsByProject,
  getPendingPlantations,
  getPlantationById,
  approvePlantation,
  rejectPlantation,
  uploadMonitoringData,
  getMonitoringReportsByProject,
  simulatePlantationTime,
  getMyMonitoringStatus,
} = require('../controllers/plantationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const plantationUpload = require('../middleware/plantationUploadMiddleware');
const setUploadFolder = require('../middleware/setPlantationFolder');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware for plantation upload
const validatePlantation = [
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('treeCount')
    .notEmpty().withMessage('Tree count is required')
    .isInt({ min: 1 }).withMessage('Tree count must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

// POST /api/plantations
// NGO only: Uploads plantation data (supports multiple images)
router.post(
  '/',
  protect,
  authorize('ngo'),
  setUploadFolder, // dynamically resolves path from req.body.projectId or headers
  plantationUpload.array('images', 10), // Handle up to 10 images
  validatePlantation,
  uploadPlantationData
);

// GET /api/plantations/my-monitoring-status — NGO only: get all project monitoring statuses
router.get('/my-monitoring-status', protect, authorize('ngo'), getMyMonitoringStatus);

// GET /api/plantations/project/:projectId
// Fetch all plantation data for a certain project
router.get('/project/:projectId', protect, getPlantationsByProject);

// ─── Admin Routes ────────────────────────────────────────
// GET /api/plantations/admin/pending — all pending plantation reviews
router.get('/admin/pending', protect, authorize('admin'), getPendingPlantations);

// GET /api/plantations/:id — single plantation detail
router.get('/:id', protect, authorize('admin'), getPlantationById);

// PUT /api/plantations/:id/approve — approve a plantation
router.put('/:id/approve', protect, authorize('admin'), approvePlantation);

// PUT /api/plantations/:id/reject — reject a plantation
router.put('/:id/reject', protect, authorize('admin'), rejectPlantation);

// POST /api/plantations/:id/monitoring — upload monitoring image
router.post(
  '/:id/monitoring',
  protect,
  authorize('ngo'),
  setUploadFolder, // resolves path
  plantationUpload.single('image'), // monitoring uses single image
  uploadMonitoringData
);

// GET /api/plantations/project/:projectId/monitoring — get monitoring reports
router.get('/project/:projectId/monitoring', protect, getMonitoringReportsByProject);

// PUT /api/plantations/:id/simulate-time — simulate 12 hours passing
router.put('/:id/simulate-time', protect, simulatePlantationTime);

module.exports = router;
