const { validationResult } = require('express-validator');
const NGO = require('../models/NGO');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ────────────────────────────────────────────────────────
// @desc    Register a new NGO (Donor -> Pending NGO)
// @route   POST /api/ngos/register
// @access  Private (Donor only)
// ────────────────────────────────────────────────────────
exports.registerNGO = async (req, res, next) => {
  try {
    const { name, location, contact, mission } = req.body;

    // Ensure a document file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your NGO verification document (PDF, DOC, or image).',
      });
    }

    // Build a relative path that can be served via /uploads/ngo-docs/filename
    const documentPath = `/uploads/ngo-docs/${req.file.filename}`;

    // Check if user already has an NGO request
    const existingNGO = await NGO.findOne({ createdBy: req.user.id });
    if (existingNGO) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an NGO registration request.',
      });
    }

    const ngo = await NGO.create({
      name,
      location,
      contact,
      mission,
      documents: documentPath,
      createdBy: req.user.id,
      status: 'pending',
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      user: admin._id,
      title: 'New NGO Application',
      message: `User ${req.user.name} has submitted an NGO registration for "${ngo.name}".`,
      type: 'info',
    }));
    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: 'NGO registration submitted successfully and is pending approval.',
      data: ngo,
    });
  } catch (error) {
    next(error);
  }
};


// ────────────────────────────────────────────────────────
// @desc    Get all pending NGOs
// @route   GET /api/ngos/admin/pending
// @access  Private (Admin only)
// ────────────────────────────────────────────────────────
exports.getPendingNGOs = async (req, res, next) => {
  try {
    const ngos = await NGO.find({ status: 'pending' }).populate('createdBy', 'name email');
    res.status(200).json({
      success: true,
      count: ngos.length,
      data: ngos,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Approve NGO
// @route   PUT /api/ngos/admin/:id/approve
// @access  Private (Admin only)
// ────────────────────────────────────────────────────────
exports.approveNGO = async (req, res, next) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    if (ngo.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'NGO is not pending' });
    }

    ngo.status = 'approved';
    await ngo.save();

    // Change user role from donor to ngo
    const user = await User.findById(ngo.createdBy);
    if (user) {
      user.role = 'ngo';
      await user.save();

      // Notify User
      await Notification.create({
        user: user._id,
        title: 'NGO Approved! 🎉',
        message: `Congratulations! Your registration for "${ngo.name}" has been approved. Please re-login to access NGO features.`,
        type: 'success',
      });
    }

    res.status(200).json({
      success: true,
      message: 'NGO approved successfully',
      data: ngo,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Decline NGO
// @route   PUT /api/ngos/admin/:id/decline
// @access  Private (Admin only)
// ────────────────────────────────────────────────────────
exports.declineNGO = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const ngo = await NGO.findById(req.params.id);
    
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    if (ngo.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'NGO is not pending' });
    }

    ngo.status = 'declined';
    await ngo.save();

    // Notify User
    await Notification.create({
      user: ngo.createdBy,
      title: 'NGO Application Declined',
      message: `Your registration for "${ngo.name}" was declined. ${reason ? 'Reason: ' + reason : ''}`,
      type: 'error',
    });

    res.status(200).json({
      success: true,
      message: 'NGO declined successfully',
      data: ngo,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get current user's NGO status
// @route   GET /api/ngos/me
// @access  Private
// ────────────────────────────────────────────────────────
exports.getMyNGOStatus = async (req, res, next) => {
  try {
    const existingNGO = await NGO.findOne({ createdBy: req.user.id });
    res.status(200).json({
      success: true,
      data: existingNGO,
    });
  } catch (error) {
    next(error);
  }
};
