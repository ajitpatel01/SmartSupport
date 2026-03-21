import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches decoded payload { userId, orgId, role } to req.user.
 */
export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed authorization header');
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      orgId: decoded.orgId,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }
};
