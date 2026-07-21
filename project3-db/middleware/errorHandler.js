/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[DATABASE/API ERROR]:', err);

  // Prisma Error Code: Unique constraint failed
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Resource conflict: A record with this unique field already exists.',
      fields: err.meta ? err.meta.target : null
    });
  }

  // Prisma Error Code: Record to update/delete not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: err.meta && err.meta.cause ? err.meta.cause : 'Requested record was not found.'
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
};

module.exports = errorHandler;
