const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Run after an array of express-validator check(...) chains in a route.
// Collects all validation failures into a single, meaningful error response.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const messages = errors.array().map((e) => e.msg);
  const error = new ApiError(400, 'Validation failed');
  error.errors = messages;
  next(error);
};

module.exports = validate;
