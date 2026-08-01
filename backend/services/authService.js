const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const buildToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async ({ name, email, password, role = 'patient' }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, 'Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  const token = buildToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = buildToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return {
    user: sanitizeUser(user),
  };
};

module.exports = {
  register,
  login,
  getProfile,
};