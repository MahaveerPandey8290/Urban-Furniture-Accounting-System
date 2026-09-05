import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../core/errors.js';
import type { AuthContext } from '../types/index.js';

/**
 * JWT access-token verification middleware.
 *
 * Extracts and verifies the Bearer token from the Authorization header.
 * On success, attaches the decoded AuthContext to req.user and sets
 * req.companyId from the token payload.
 *
 * Does NOT check user status (ACTIVE/PENDING/etc.) — that is requireActive's job.
 * Does NOT check mustChangePassword — that is requirePasswordSet's job.
 * Separation of concerns: each middleware does exactly one thing.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or malformed Authorization header'));
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AuthContext;
    req.user = decoded;
    req.companyId = decoded.companyId;
    next();
  } catch {
    // Do NOT reveal whether the token is expired vs invalid —
    // both produce the same generic 401 to prevent information leakage.
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}
