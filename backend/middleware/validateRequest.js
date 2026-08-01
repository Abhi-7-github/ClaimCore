const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return next(
    new ApiError(400, 'Validation failed', {
      errors: result.array().map((entry) => ({
        field: entry.path,
        message: entry.msg,
      })),
    })
  );
};

module.exports = validateRequest;