const asyncHandler = require('../utils/asyncHandler');
const claimService = require('../services/claimService');
const { successResponse } = require('../utils/apiResponse');

const submitClaim = asyncHandler(async (req, res) => {
  const claim = await claimService.createClaim({
    user: req.user,
    payload: req.body,
    file: req.file,
  });

  return successResponse(res, 201, 'Claim submitted successfully', claim);
});

const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await claimService.getMyClaims(req.user.userId);
  return successResponse(res, 200, 'Claims fetched successfully', claims);
});

const getClaims = asyncHandler(async (req, res) => {
  const result = await claimService.getClaims(req.query);
  return successResponse(res, 200, 'Claims fetched successfully', result);
});

const getClaimById = asyncHandler(async (req, res) => {
  const claim = await claimService.getClaimById(req.params.id);
  return successResponse(res, 200, 'Claim details fetched successfully', claim);
});

const updateClaim = asyncHandler(async (req, res) => {
  const claim = await claimService.updateClaim(req.params.id, req.body, req.user);
  return successResponse(res, 200, 'Claim updated successfully', claim);
});

module.exports = {
  submitClaim,
  getMyClaims,
  getClaims,
  getClaimById,
  updateClaim,
};