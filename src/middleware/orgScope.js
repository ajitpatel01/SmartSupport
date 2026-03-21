import { ApiError } from '../utils/ApiError.js';

/**
 * Ensures the authenticated user can only access resources within their org.
 * Attaches req.orgContext for downstream services to use in queries.
 */
export const requireSameOrg = (req, _res, next) => {
  if (!req.user?.orgId) {
    throw ApiError.unauthorized('Organization context missing');
  }

  req.orgContext = req.user.orgId;

  if (req.params.orgId && req.params.orgId !== req.user.orgId) {
    throw ApiError.forbidden('Cross-organization access denied');
  }

  next();
};
