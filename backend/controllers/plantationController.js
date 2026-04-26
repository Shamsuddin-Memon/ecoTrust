const path = require('path');
const fs = require('fs');
const Plantation = require('../models/Plantation');
const Project = require('../models/Project');
const NGO = require('../models/NGO');

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

    // Create the Plantation record
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
      treeCount: parseInt(treeCount, 10),
    });

    res.status(201).json({
      success: true,
      message: `Plantation data uploaded successfully with ${imageUrls.length} image(s)`,
      data: plantation,
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
