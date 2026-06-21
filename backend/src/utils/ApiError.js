// A lightweight custom error class that carries an HTTP status code.
// Controllers throw `new ApiError(400, 'message')` and the centralized
// error handler middleware turns it into a consistent JSON response.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
