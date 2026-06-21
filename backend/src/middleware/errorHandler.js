const ApiError = require('../utils/ApiError');

// Catches requests to undefined routes
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found - ${req.originalUrl}`));
};

// Centralized error handler. Normalizes Mongoose validation/cast errors,
// duplicate key errors, and our own ApiError instances into a consistent
// { success: false, message, errors? } JSON shape.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors && Array.isArray(err.errors) ? err.errors : undefined;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
  }

  // Mongoose duplicate key error (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} is already in use` : 'Duplicate value';
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

module.exports = { notFound, errorHandler };
