const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token },
  });
});

// @desc    Authenticate user & return token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password since the schema excludes it by default
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
});

// @desc    Log out current user
// @route   POST /api/auth/logout
// @access  Private
// Note: since auth uses stateless JWTs (no server-side session store),
// logout is handled by the client discarding the token. This endpoint
// exists for API completeness and for symmetry with the auth lifecycle.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get currently authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
});

module.exports = { register, login, logout, getMe };
