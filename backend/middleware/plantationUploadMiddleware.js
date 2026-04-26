const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Dynamic storage for plantation images.
 * Saves to: uploads/projects/{ngo-name}/{project-name}/
 * Populated from req.uploadFolder which is set by the controller
 * before calling multer, OR resolved from the request body.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // req.uploadFolder is set by the route handler before this middleware runs
    const folder = req.uploadFolder || path.join(__dirname, '..', 'uploads', 'projects');
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `img-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = /image\/(jpeg|jpg|png)/.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG images are allowed'), false);
  }
};

const plantationUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 10,                  // Max 10 images
  },
});

module.exports = plantationUpload;
