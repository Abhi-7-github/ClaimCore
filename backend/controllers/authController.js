const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const { successResponse } = require('../utils/apiResponse');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return successResponse(res, 201, 'User registered successfully', result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return successResponse(res, 200, 'Login successful', result);
});

const profile = asyncHandler(async (req, res) => {
  const result = await authService.getProfile(req.user.userId);
  return successResponse(res, 200, 'Profile fetched successfully', result);
});

module.exports = {
  register,
  login,
  profile,
};