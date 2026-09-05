import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { ForbiddenError } from '../core/errors.js';

/**
 * Role-based access control middleware.
 *
 * Usage: requireRole('ADMIN') or requireRole('ADMIN', 'ACCOUNTANT')
 *
 * Must be used AFTER requireAuth (which sets req.user).
 * Returns 403 (not 401) on role mismatch — the user is authenticated but
 * lacks the necessary permissions. This distinction matters for clients.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      next(new ForbiddenError('You do not have permission to perform this action'));
      return;
    }
    next();
  };
}
