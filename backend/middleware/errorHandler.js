const mongoose = require('mongoose');
const multer = require('multer');
const ApiError = require('../utils/apiError');
const { logError } = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded file is too large'
        : error.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: Object.values(error.errors).map((entry) => entry.message),
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
  }

  if (error && error.code === 11000) {
    const duplicateField = Object.keys(error.keyValue || {})[0] || 'value';

    return res.status(400).json({
      success: false,
      message: `${duplicateField} already exists`,
    });
  }

  if (error && error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (error && error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  logError('Unhandled error', error);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

module.exports = errorHandler;