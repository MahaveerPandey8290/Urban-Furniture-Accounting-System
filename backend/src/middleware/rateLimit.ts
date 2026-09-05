import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Rate limiting configurations.
 *
 * globalLimiter: 100 requests per 15-minute window for all routes.
 * authLimiter:   5 requests per 15-minute window for sensitive auth endpoints
 *                (login, signup, forgot-password) to prevent brute-force and
 *                enumeration attacks.
 *
 * These limits are intentionally conservative. Legitimate users rarely hit
 * auth endpoints more than a few times per session.
 */

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
  },
  skip: (req) => req.path === '/health' || req.path === '/health/ready',
});

export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many attempts. Please wait 15 minutes before trying again.',
  },
});
