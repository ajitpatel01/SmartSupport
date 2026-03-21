/**
 * Wraps an async route handler so thrown errors are forwarded to Express error middleware.
 */
export const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
