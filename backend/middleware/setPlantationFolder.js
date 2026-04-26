const Project = require('../models/Project');
const NGO = require('../models/NGO');
const path = require('path');
const fs = require('fs');

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

const setUploadFolder = async (req, res, next) => {
  try {
    const projectId = req.body.projectId || req.headers['x-project-id'];
    
    if (!projectId) {
       req.uploadFolder = path.join(__dirname, '..', 'uploads', 'projects', 'misc');
       return next();
    }

    const project = await Project.findById(projectId);
    if (!project) {
        req.uploadFolder = path.join(__dirname, '..', 'uploads', 'projects', 'misc');
        return next();
    }

    const ngo = await NGO.findOne({ createdBy: project.ngoId });
    const ngoName = sanitize(ngo ? ngo.name : 'unknown-ngo');
    const projectName = sanitize(project.title);

    req.uploadFolder = path.join(__dirname, '..', 'uploads', 'projects', ngoName, projectName);
    next();
  } catch (error) {
    req.uploadFolder = path.join(__dirname, '..', 'uploads', 'projects', 'misc');
    next();
  }
};

module.exports = setUploadFolder;
