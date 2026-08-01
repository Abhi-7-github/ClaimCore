const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/apiError');

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new ApiError(400, 'Unsupported document format'));
  }

  cb(null, true);
};

const claimDocumentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024),
  },
}).single('document');

const requireClaimDocument = (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Claim document is required'));
  }

  next();
};

module.exports = {
  claimDocumentUpload,
  requireClaimDocument,
};