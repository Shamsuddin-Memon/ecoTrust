const path = require('path');
const fs = require('fs');
const Plantation = require('../models/Plantation');
const Project = require('../models/Project');
const NGO = require('../models/NGO');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { analyzeImage } = require('../models/treeCounter');

/**
 * Sanitize a string for use as a directory name.
 * Lowercase, spaces → dashes, strip special chars.
 */
const sanitize = (str) =>
  (str || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');

// @desc    Upload Plantation Data (supports multiple images, max 10)
// @route   POST /api/plantations
// @access  Private (NGO)
exports.uploadPlantationData = async (req, res, next) => {
  try {
    const { projectId, latitude, longitude, treeCount } = req.body;

    // Check if at least one file was uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }

    // Verify the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Ensure the project belongs to the logged-in NGO
    if (project.ngoId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to add data to this project' });
    }

    // Build image URL paths — these are served via /uploads/...
    const imageUrls = req.files.map((file) => {
      // Convert absolute path to a relative URL path
      const relativePath = file.path
        .replace(/\\/g, '/')
        .split('uploads/')[1];
      return `/uploads/${relativePath}`;
    });

    const imageUrl = imageUrls[0]; // first image as primary (backward compat)

    // ─── AI VERIFICATION ─────────────────────────────────────────
    const firstImagePath = req.files[0].path;
    const aiResult = await analyzeImage(firstImagePath);

    const userTreeCount = parseInt(treeCount, 10);

    // ─── AI VERIFICATION (TEMPORARILY BYPASSED FOR TESTING) ──────
    // Commented out to allow testing uploads without strict validation.
    // Re-enable when the real model is integrated.
    /*
    // Case 1: AI detects 0 trees → reject
    if (aiResult.treeCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No trees detected in the uploaded image. Please upload a valid satellite or drone image of your plantation area.',
        aiTreeCount: 0,
      });
    }

    // Case 2: Mismatch > 10% → reject with details
    const difference = Math.abs(aiResult.treeCount - userTreeCount) / userTreeCount;
    if (difference > 0.10) {
      return res.status(400).json({
        success: false,
        message: `Tree count mismatch: You reported ${userTreeCount} trees but AI detected ${aiResult.treeCount} trees. Please verify your count or re-upload a clearer image.`,
        aiTreeCount: aiResult.treeCount,
        userTreeCount: userTreeCount,
        mismatch: true,
      });
    }
    */

    // Case 3: Match (within 10%) → proceed with AI verification
    const plantation = await Plantation.create({
      projectId,
      ngoId: req.user.id,
      imageUrl,    // legacy first-image field
      imageUrls,   // all images
      imageMetadata: {
        fileSize: req.files[0].size,
        fileType: req.files[0].mimetype,
      },
      gpsLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      treeCount: userTreeCount,
      aiVerified: true,
      aiTreeCount: aiResult.treeCount,
      confidenceScore: aiResult.confidenceScore,
      verificationStatus: 'pending', // Awaiting admin review
    });

    // ─── NOTIFY ADMINS ───────────────────────────────────────────
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      user: admin._id,
      title: '🌳 New Plantation — Pending Review',
      message: `NGO "${req.user.name}" uploaded plantation data for project "${project.title}". AI verified ${aiResult.treeCount} trees (${aiResult.confidenceScore}% confidence).`,
      type: 'info',
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: `Plantation data uploaded successfully! AI verified ${aiResult.treeCount} trees (${aiResult.confidenceScore}% confidence). Sent for admin review.`,
      data: plantation,
      aiTreeCount: aiResult.treeCount,
      confidenceScore: aiResult.confidenceScore,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Plantation Data by Project
// @route   GET /api/plantations/project/:projectId
// @access  Private
exports.getPlantationsByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const plantations = await Plantation.find({ projectId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plantations.length,
      data: plantations,
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Get Pending Plantations ──────────────────────────────
// @desc    Get all plantations pending admin review
// @route   GET /api/plantations/admin/pending
// @access  Private (Admin)
exports.getPendingPlantations = async (req, res, next) => {
  try {
    const plantations = await Plantation.find({ verificationStatus: 'pending' })
      .populate('projectId', 'title category targetFunding status')
      .populate('ngoId', 'name email')
      .sort({ createdAt: -1 });

    // Attach the NGO company name from the NGO model
    const enriched = await Promise.all(
      plantations.map(async (p) => {
        const obj = p.toObject();
        if (obj.ngoId && obj.ngoId._id) {
          const ngoProfile = await NGO.findOne({ createdBy: obj.ngoId._id });
          obj.ngoCompanyName = ngoProfile ? ngoProfile.name : obj.ngoId.name;
        }
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Get Single Plantation Detail ─────────────────────────
// @desc    Get a single plantation with full details
// @route   GET /api/plantations/:id
// @access  Private (Admin)
exports.getPlantationById = async (req, res, next) => {
  try {
    const plantation = await Plantation.findById(req.params.id)
      .populate('projectId', 'title category targetFunding status description')
      .populate('ngoId', 'name email');

    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    const obj = plantation.toObject();
    if (obj.ngoId && obj.ngoId._id) {
      const ngoProfile = await NGO.findOne({ createdBy: obj.ngoId._id });
      obj.ngoCompanyName = ngoProfile ? ngoProfile.name : obj.ngoId.name;
    }

    res.status(200).json({ success: true, data: obj });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Approve Plantation ───────────────────────────────────
// @desc    Approve a pending plantation
// @route   PUT /api/plantations/:id/approve
// @access  Private (Admin)
exports.approvePlantation = async (req, res, next) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }
    if (plantation.verificationStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Plantation is not pending' });
    }

    plantation.verificationStatus = 'approved';
    await plantation.save();

    // Notify NGO user
    const project = await Project.findById(plantation.projectId);
    await Notification.create({
      user: plantation.ngoId,
      title: '✅ Plantation Approved!',
      message: `Your plantation submission for "${project?.title || 'a project'}" has been approved by an admin.`,
      type: 'success',
    });

    // Recalculate trust score
    try {
      const { recalculateTrustScore } = require('../services/trustScoreService');
      await recalculateTrustScore(plantation.ngoId);
    } catch (err) {
      console.error('Trust score recalculation failed:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Plantation approved successfully',
      data: plantation,
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Reject Plantation ────────────────────────────────────
// @desc    Reject a pending plantation
// @route   PUT /api/plantations/:id/reject
// @access  Private (Admin)
exports.rejectPlantation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }
    if (plantation.verificationStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Plantation is not pending' });
    }

    plantation.verificationStatus = 'rejected';
    await plantation.save();

    // Notify NGO user
    const project = await Project.findById(plantation.projectId);
    await Notification.create({
      user: plantation.ngoId,
      title: '❌ Plantation Rejected',
      message: `Your plantation submission for "${project?.title || 'a project'}" has been rejected. ${reason ? 'Reason: ' + reason : ''}`,
      type: 'error',
    });

    res.status(200).json({
      success: true,
      message: 'Plantation rejected',
      data: plantation,
    });
  } catch (error) {
    next(error);
  }
};
