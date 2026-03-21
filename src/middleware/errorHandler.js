import logger from '../config/logger.js';

/**
 * Central error-handling middleware.
 * Maps errors to a consistent { success, code, message } response shape.
 */
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    logger.error('Unhandled error:', err);
  }

  res.status(statusCode).json({
    success: false,
    code: statusCode,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler for unmatched routes.
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    code: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
