const Project = require('../models/Project');

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
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
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
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'declined' },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
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

    // Ensure the requester owns this project
    if (project.ngoId.toString() !== req.user.id.toString()) {
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

    // Ensure the requester owns this project
    if (project.ngoId.toString() !== req.user.id.toString()) {
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
