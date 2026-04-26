const express = require('express');
const { createProject, getMyProjects, getPendingProjects, approveProject, declineProject, getGlobalProjects, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const validateProject = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('category').notEmpty().withMessage('Category is required'),
  body('targetFunding').optional().isNumeric().withMessage('Funding must be a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

// Routes
router.post('/', protect, authorize('ngo'), validateProject, createProject);
router.get('/my-projects', protect, authorize('ngo'), getMyProjects);
router.get('/global', protect, getGlobalProjects);

// NGO: Edit / Delete own project
router.put('/:id', protect, authorize('ngo'), updateProject);
router.delete('/:id', protect, authorize('ngo'), deleteProject);

// Admin Routes
router.get('/admin/pending', protect, authorize('admin'), getPendingProjects);
router.put('/:id/approve', protect, authorize('admin'), approveProject);
router.put('/:id/decline', protect, authorize('admin'), declineProject);

module.exports = router;
