const express = require('express');
const { body, param, query } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { claimDocumentUpload, requireClaimDocument } = require('../middleware/uploadMiddleware');
const claimController = require('../controllers/claimController');

const router = express.Router();

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

router.post(
  '/',
  authMiddleware,
  roleMiddleware('patient'),
  claimDocumentUpload,
  requireClaimDocument,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('claimAmount')
      .isFloat({ min: 0.01 })
      .withMessage('claimAmount must be greater than 0'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  validateRequest,
  claimController.submitClaim
);

router.get(
  '/my',
  authMiddleware,
  roleMiddleware('patient'),
  claimController.getMyClaims
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware('insurer'),
  claimQueryValidators,
  validateRequest,
  claimController.getClaims
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('insurer'),
  [param('id').isMongoId().withMessage('Valid claim id is required')],
  validateRequest,
  claimController.getClaimById
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('patient', 'insurer'),
  [
    param('id').isMongoId().withMessage('Valid claim id is required'),
    body('name').optional().trim().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('claimAmount').optional().isFloat({ min: 0.01 }).withMessage('claimAmount must be greater than 0'),
    body('description').optional().trim().notEmpty().withMessage('Description is required'),
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
  ],
  validateRequest,
  claimController.updateClaim
);

module.exports = router;