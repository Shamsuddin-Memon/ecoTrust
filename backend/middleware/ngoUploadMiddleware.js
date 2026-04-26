const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the ngo-docs uploads directory exists
const ngoUploadDir = path.join(__dirname, '..', 'uploads', 'ngo-docs');
if (!fs.existsSync(ngoUploadDir)) {
  fs.mkdirSync(ngoUploadDir, { recursive: true });
}

// Multer Storage — name file after NGO name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ngoUploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize NGO name: lowercase, spaces → dashes, remove special chars
    const rawName = req.body.name || 'ngo-document';
    const sanitized = rawName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${sanitized}${ext}`);
  },
});

// Allow PDFs, Word docs, and common image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];
  const validMime = allowedMimes.includes(file.mimetype);

  if (extname && validMime) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG'), false);
  }
};

const ngoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
});

module.exports = ngoUpload;
