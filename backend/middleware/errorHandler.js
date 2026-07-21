/**
 * Global Centralized Error Handler Middleware
 * DecodeLabs Backend API
 */

/**
 * Express error-handling middleware that intercepts thrown errors,
 * logs trace diagnostics, and responds with a uniform JSON payload.
 */
const errorHandler = (err, req, res, next) => {
  // Log the complete error stack trace to standard error console
  console.error(`[REST API Error System] - Error captured:`, err.stack || err.message || err);

  // Extract status code (defaults to 500 Internal Server Error)
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Internal Server Error';

  // Format standard API error structure
  const errorResponse = {
    success: false,
    error: {
      status: statusCode,
      message: errorMessage
    }
  };

  // Append stack trace if running under node environment DEVELOPMENT
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
