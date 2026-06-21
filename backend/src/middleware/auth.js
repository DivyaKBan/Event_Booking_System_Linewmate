const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// Protects routes by requiring a valid Bearer JWT. On success, attaches
// the authenticated user document (without password) to req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. Please log in to continue.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Session expired or invalid token. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'The user belonging to this token no longer exists.');
  }

  req.user = user;
  next();
});

module.exports = { protect };
