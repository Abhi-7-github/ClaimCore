const ApiError = require('../utils/apiError');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You are not allowed to access this resource'));
    }

    return next();
  };
};

module.exports = roleMiddleware;