import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const windowMs = 15 * 60 * 1000;
const isDev = env.NODE_ENV === 'development';

/**
 * Global cap per IP. The dashboard issues many parallel/refetched requests; 100/15m is easy to hit in dev.
 */
export const globalLimiter = rateLimit({
  windowMs,
  max: isDev ? 2000 : 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

/**
 * Applied to POST /api/tickets (triggers AI triage). Previously 10/org/15m — too strict for normal use and demos.
 */
export const aiRouteLimiter = rateLimit({
  windowMs,
  max: isDev ? 500 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.orgId || req.ip,
  message: { success: false, message: 'Ticket creation rate limit exceeded — try again in a few minutes' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, try again later' },
});
