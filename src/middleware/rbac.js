import { ApiError } from '../utils/ApiError.js';

const ROLE_HIERARCHY = { user: 0, moderator: 1, admin: 2 };

/**
 * Factory that returns middleware requiring the caller to have
 * one of the specified roles.
 *
 * @param {...string} roles - Allowed roles (e.g. 'moderator', 'admin')
 */
export const requireRole = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized. Required: ${roles.join(', ')}`,
      );
    }

    next();
  };
};

/**
 * Requires the caller's role to be at least the given minimum level
 * in the hierarchy user < moderator < admin.
 */
export const requireMinRole = (minRole) => {
  return (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized();

    const userLevel = ROLE_HIERARCHY[req.user.role] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? Infinity;

    if (userLevel < requiredLevel) {
      throw ApiError.forbidden(
        `Minimum role '${minRole}' required. Current: '${req.user.role}'`,
      );
    }

    next();
  };
};
