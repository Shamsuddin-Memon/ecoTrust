const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { getProjectApprovalTemplate, getProjectDeclineTemplate } = require('../utils/emailTemplates');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (NGO)
exports.createProject = async (req, res, next) => {
  try {
    const { title, description, category, targetFunding } = req.body;

    const project = await Project.create({
      title,
      description,
      category,
      targetFunding: Number(targetFunding) || 0,
      ngoId: req.user.id,
      status: 'pending' // Default status
    });

    res.status(201).json({
      success: true,
      message: 'Project submitted successfully and is pending approval',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for logged in NGO
// @route   GET /api/projects/my-projects
// @access  Private (NGO)
exports.getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ ngoId: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending projects (Admin)
// @route   GET /api/projects/admin/pending
// @access  Private (Admin)
exports.getPendingProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ status: 'pending' })
      .populate('ngoId', 'name email')
      .sort('-createdAt');

    const NGO = require('../models/NGO');
    const Plantation = require('../models/Plantation'); // Import model safely
    
    const projectsWithNGO = await Promise.all(projects.map(async (p) => {
      const projObj = p.toObject();
      if (projObj.ngoId && projObj.ngoId._id) {
        const ngoProfile = await NGO.findOne({ createdBy: projObj.ngoId._id });
        projObj.ngoCompanyName = ngoProfile ? ngoProfile.name : projObj.ngoId.name;
        projObj.trustScore = ngoProfile ? (ngoProfile.trustScore || 0) : 0;
        projObj.totalVerifiedTrees = ngoProfile ? (ngoProfile.totalVerifiedTrees || 0) : 0;
      }

      // Automatically pair the first field data submission to the project request
      const fieldData = await Plantation.findOne({ projectId: projObj._id }).sort('createdAt');
      if (fieldData) {
        projObj.fieldData = fieldData;
      }

      return projObj;
    }));

    res.status(200).json({
      success: true,
      count: projectsWithNGO.length,
      data: projectsWithNGO,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active/approved projects (Global)
// @route   GET /api/projects/global
// @access  Private (Any roles)
exports.getGlobalProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ status: 'approved' })
      .populate('ngoId', 'name email')
      .sort('-createdAt');

    const NGO = require('../models/NGO');
    const Plantation = require('../models/Plantation');
    
    const globalProjects = await Promise.all(projects.map(async (p) => {
      const projObj = p.toObject();
      if (projObj.ngoId && projObj.ngoId._id) {
        const ngoProfile = await NGO.findOne({ createdBy: projObj.ngoId._id });
        projObj.ngoCompanyName = ngoProfile ? ngoProfile.name : projObj.ngoId.name;
        projObj.trustScore = ngoProfile ? (ngoProfile.trustScore || 0) : 0;
        projObj.totalVerifiedTrees = ngoProfile ? (ngoProfile.totalVerifiedTrees || 0) : 0;
      }

      // Attach the field data image for the global feed
      const fieldData = await Plantation.findOne({ projectId: projObj._id }).sort('createdAt');
      if (fieldData) {
        projObj.fieldData = fieldData;
      }

      return projObj;
    }));

    res.status(200).json({
      success: true,
      count: globalProjects.length,
      data: globalProjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve Project
// @route   PUT /api/projects/:id/approve
// @access  Private (Admin)
exports.approveProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.status = 'approved';
    await project.save();

    // Fetch NGO name
    const NGO = require('../models/NGO');
    const ngoProfile = await NGO.findOne({ createdBy: project.ngoId });
    const ngoName = ngoProfile ? ngoProfile.name : 'Your NGO';

    const user = await User.findById(project.ngoId);
    if (user) {
      // Notify User
      await Notification.create({
        user: user._id,
        title: 'Project Approved! 🌿',
        message: `Congratulations! Your project proposal "${project.title}" has been approved and is now live.`,
        type: 'success',
      });

      // Send Email
      const emailOptions = getProjectApprovalTemplate(project.title, ngoName, user.name);
      await sendEmail({
        email: user.email,
        ...emailOptions,
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Decline Project
// @route   PUT /api/projects/:id/decline
// @access  Private (Admin)
exports.declineProject = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.status = 'declined';
    await project.save();

    // Fetch NGO name
    const NGO = require('../models/NGO');
    const ngoProfile = await NGO.findOne({ createdBy: project.ngoId });
    const ngoName = ngoProfile ? ngoProfile.name : 'Your NGO';

    const user = await User.findById(project.ngoId);
    if (user) {
      // Notify User
      await Notification.create({
        user: user._id,
        title: 'Project Declined',
        message: `Your project proposal "${project.title}" was declined. ${reason ? 'Reason: ' + reason : ''}`,
        type: 'error',
      });

      // Send Email
      const emailOptions = getProjectDeclineTemplate(project.title, ngoName, user.name, reason);
      await sendEmail({
        email: user.email,
        ...emailOptions,
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Update Project (NGO owner only)
// @route   PUT /api/projects/:id
// @access  Private (NGO)
exports.updateProject = async (req, res, next) => {
  try {
    const { title, description, category, targetFunding } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Ensure the requester owns this project or is admin
    if (project.ngoId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this project' });
    }

    // Apply updates
    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (targetFunding !== undefined) project.targetFunding = Number(targetFunding);

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Project (NGO owner only)
// @route   DELETE /api/projects/:id
// @access  Private (NGO)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Ensure the requester owns this project or is admin
    if (project.ngoId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects (Admin)
// @route   GET /api/projects/admin/all
// @access  Private (Admin)
exports.getAllProjectsAdmin = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('ngoId', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved projects for a specific NGO
// @route   GET /api/projects/ngo/:userId
// @access  Private (Any authenticated user)
exports.getNGOProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ ngoId: req.params.userId, status: 'approved' })
      .populate('ngoId', 'name email')
      .sort('-createdAt');

    const NGO = require('../models/NGO');
    const Plantation = require('../models/Plantation');
    
    const ngoProjects = await Promise.all(projects.map(async (p) => {
      const projObj = p.toObject();
      if (projObj.ngoId && projObj.ngoId._id) {
        const ngoProfile = await NGO.findOne({ createdBy: projObj.ngoId._id });
        projObj.ngoCompanyName = ngoProfile ? ngoProfile.name : projObj.ngoId.name;
        projObj.trustScore = ngoProfile ? (ngoProfile.trustScore || 0) : 0;
        projObj.totalVerifiedTrees = ngoProfile ? (ngoProfile.totalVerifiedTrees || 0) : 0;
      }

      // Attach the field data image for the feed
      const fieldData = await Plantation.findOne({ projectId: projObj._id }).sort('createdAt');
      if (fieldData) {
        projObj.fieldData = fieldData;
      }

      return projObj;
    }));

    res.status(200).json({
      success: true,
      count: ngoProjects.length,
      data: ngoProjects,
    });
  } catch (error) {
    next(error);
  }
};

