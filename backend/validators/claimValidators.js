const { body, param, query } = require('express-validator');

const createClaimValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('claimAmount')
    .isFloat({ min: 0.01 })
    .withMessage('claimAmount must be greater than 0'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

const claimQueryValidators = [
  query('status')
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected'])
    .withMessage('Status must be Pending, Approved, or Rejected'),
  query('minAmount').optional().isFloat({ min: 0 }).withMessage('minAmount must be a positive number'),
  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('maxAmount must be a positive number'),
  query('date').optional().isISO8601().withMessage('date must be a valid ISO date'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('search must not be empty'),
  query('patientName').optional().trim().isLength({ min: 1 }).withMessage('patientName must not be empty'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be at least 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];

const claimIdValidator = [param('id').isMongoId().withMessage('Valid claim id is required')];

const updateClaimValidators = [
  ...claimIdValidator,
  body('status')
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected'])
    .withMessage('Status must be Pending, Approved, or Rejected'),
  body('approvedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('approvedAmount must be a positive number'),
  body('insurerComments')
    .optional()
    .isString()
    .withMessage('insurerComments must be a string'),
];

module.exports = {
  createClaimValidators,
  claimQueryValidators,
  claimIdValidator,
  updateClaimValidators,
};