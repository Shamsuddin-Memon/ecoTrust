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

    // ─── AI VERIFICATION (REAL MODEL INTEGRATED) ──────────────────
    // Case 1: AI detects 0 trees → reject immediately
    if (aiResult.treeCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No trees detected in the uploaded image. Please upload a valid satellite or drone image of your plantation area.',
        aiTreeCount: 0,
      });
    }

    // Case 2: Save submission for admin review (even if counts differ, trust score handles it on review)
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
      await recalculateTrustScore(plantation.ngoId, {
        projectId: plantation.projectId,
        plantationId: plantation._id,
        reason: `Plantation approved (Reported: ${plantation.treeCount}, AI: ${plantation.aiTreeCount || 0})`,
      });
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

    // Recalculate trust score
    try {
      const { recalculateTrustScore } = require('../services/trustScoreService');
      await recalculateTrustScore(plantation.ngoId, {
        projectId: plantation.projectId,
        plantationId: plantation._id,
        reason: `Plantation rejected (Reported: ${plantation.treeCount}, AI: ${plantation.aiTreeCount || 0}). Reason: ${reason || 'Invalid data'}`,
      });
    } catch (err) {
      console.error('Trust score recalculation failed:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Plantation rejected',
      data: plantation,
    });
  } catch (error) {
    next(error);
  }
};

// ─── MONITORING: Upload Monitoring Data (supports AI Verification) ─────────────────
// @desc    Upload monitoring image to assess tree survival rate
// @route   POST /api/plantations/:id/monitoring
// @access  Private (NGO)
exports.uploadMonitoringData = async (req, res, next) => {
  try {
    const Monitoring = require('../models/Monitoring');
    const { analyzeImage } = require('../models/treeCounter');
    const NGO = require('../models/NGO');
    const Project = require('../models/Project');
    const { sendLowSurvivalAlertEmail } = require('../services/emailService');

    const plantationId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a monitoring image' });
    }

    const plantation = await Plantation.findById(plantationId);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    // Verify ownership
    if (plantation.ngoId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to add monitoring data' });
    }

    // Convert file path to relative URL
    const relativePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
    const imageUrl = `/uploads/${relativePath}`;

    // Run AI analysis
    const aiResult = await analyzeImage(req.file.path);

    const initialTreeCount = (plantation.aiTreeCount !== null && plantation.aiTreeCount !== undefined) 
      ? plantation.aiTreeCount 
      : plantation.treeCount;
    const currentTreeCount = aiResult.treeCount;

    // Calculate survival rate
    const survivalRate = initialTreeCount > 0 
      ? Math.round((currentTreeCount / initialTreeCount) * 10000) / 100
      : 0;

    let status = 'normal';
    if (survivalRate < 50) {
      status = 'critical';
    } else if (survivalRate < 70) {
      status = 'warning';
    }

    // Create monitoring report
    const monitoring = await Monitoring.create({
      projectId: plantation.projectId,
      plantationId: plantation._id,
      ngoId: req.user.id,
      imageUrl,
      aiTreeCount: currentTreeCount,
      initialTreeCount,
      survivalRate,
      status
    });

    // Recalculate trust score (low survival rates will now deduct 15 points)
    const { recalculateTrustScore } = require('../services/trustScoreService');
    await recalculateTrustScore(req.user.id, {
      projectId: plantation.projectId,
      plantationId: plantation._id,
      reason: `Monitoring uploaded: Tree Survival Rate is ${survivalRate}% (AI Count: ${currentTreeCount}, Initial AI Baseline: ${initialTreeCount})`
    });

    // Send Alert Email if survival rate < 70%
    if (survivalRate < 70) {
      const ngoProfile = await NGO.findOne({ createdBy: req.user.id });
      const ngoName = ngoProfile ? ngoProfile.name : 'NGO Partner';
      const project = await Project.findById(plantation.projectId);
      const projectTitle = project ? project.title : 'Plantation Project';

      await sendLowSurvivalAlertEmail(
        req.user.email,
        ngoName,
        projectTitle,
        survivalRate,
        currentTreeCount,
        initialTreeCount
      );
    }

    res.status(201).json({
      success: true,
      message: `Monitoring image uploaded successfully. Survival rate: ${survivalRate}%`,
      data: monitoring
    });
  } catch (error) {
    next(error);
  }
};

// ─── MONITORING: Get Monitoring Reports by Project ─────────────────
// @desc    Get all monitoring reports for a project
// @route   GET /api/plantations/project/:projectId/monitoring
// @access  Private
exports.getMonitoringReportsByProject = async (req, res, next) => {
  try {
    const Monitoring = require('../models/Monitoring');
    const { projectId } = req.params;
    const reports = await Monitoring.find({ projectId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// ─── MONITORING: Simulate 12 Hours Elapse (Now 10 Minutes) ─────────
// @desc    Backdate plantation createdAt by 11 minutes for testing purposes
// @route   PUT /api/plantations/:id/simulate-time
// @access  Private (NGO)
exports.simulatePlantationTime = async (req, res, next) => {
  try {
    const plantationId = req.params.id;
    const plantation = await Plantation.findById(plantationId);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    // Shift createdAt back by 11 minutes (exceeds 10m threshold)
    plantation.createdAt = new Date(Date.now() - (11 * 60 * 1000));
    plantation.reminderSent = false; // Reset reminder status so it can be sent again
    await plantation.save();

    // Also delete any existing monitoring reports for this plantation so they can re-verify and test
    const Monitoring = require('../models/Monitoring');
    await Monitoring.deleteMany({ plantationId: plantation._id });

    // Recalculate trust score to revert any low survival penalties during simulation reset
    try {
      const { recalculateTrustScore } = require('../services/trustScoreService');
      await recalculateTrustScore(plantation.ngoId, {
        projectId: plantation.projectId,
        plantationId: plantation._id,
        reason: `Simulation reset: Plantation monitoring cleared and time backdated`
      });
    } catch (err) {
      console.error('Trust score recalculation during simulation reset failed:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Simulation successful. Plantation createdAt shifted back by 11 minutes and monitoring reports cleared.',
      data: plantation
    });
  } catch (error) {
    next(error);
  }
};

// ─── MONITORING: Get NGO Monitoring Statuses ─────────────────────
// @desc    Get all plantations for the logged-in NGO along with their monitoring statuses
// @route   GET /api/plantations/my-monitoring-status
// @access  Private (NGO)
exports.getMyMonitoringStatus = async (req, res, next) => {
  try {
    const Monitoring = require('../models/Monitoring');
    const Project = require('../models/Project');

    // Find all approved plantations for this NGO
    const plantations = await Plantation.find({
      ngoId: req.user.id,
      verificationStatus: 'approved'
    }).populate('projectId', 'title category');

    const result = [];
    for (const p of plantations) {
      const monitoringReport = await Monitoring.findOne({ plantationId: p._id });
      
      const minutesElapsed = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60);
      const needsMonitoring = minutesElapsed >= 10 && !monitoringReport;

      result.push({
        _id: p._id,
        projectId: p.projectId?._id,
        projectTitle: p.projectId?.title || 'Unknown Project',
        gpsLocation: p.gpsLocation,
        treeCount: (p.aiTreeCount !== null && p.aiTreeCount !== undefined) ? p.aiTreeCount : p.treeCount,
        createdAt: p.createdAt,
        minutesElapsed: Math.round(minutesElapsed * 10) / 10,
        needsMonitoring,
        monitored: !!monitoringReport,
        monitoringReport: monitoringReport || null
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
