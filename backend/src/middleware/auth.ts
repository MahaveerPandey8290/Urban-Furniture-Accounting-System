import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { requireRole } from './requireRole.js';

export { requireAuth } from './requireAuth.js';
export { requireRole } from './requireRole.js';
export { requireActive } from './requireActive.js';
export { requirePasswordSet } from './requirePasswordSet.js';

export function requireRoles(roles: Role[]) {
  return requireRole(...roles);
}

export function authorize(...roles: Role[]) {
  return requireRole(...roles);
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Aliased directly to requireAuth
  import('./requireAuth.js').then(({ requireAuth }) => {
    requireAuth(req, res, next);
  }).catch(next);
};
