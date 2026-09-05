import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { ForbiddenError, UnauthorizedError } from '../core/errors.js';

/**
 * User status guard middleware.
 *
 * Hits the database to get the current user status — we do NOT trust the JWT
 * for this because a token issued before a suspension would otherwise still
 * grant access for up to 15 minutes.
 *
 * Must be used AFTER requireAuth (which sets req.user).
 *
 * Messages are EXACTLY as specified in the product spec to match wireframe copy.
 */
export async function requireActive(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { status: true },
    });

    if (!user) {
      next(new UnauthorizedError('User account not found'));
      return;
    }

    switch (user.status) {
      case 'ACTIVE':
        next();
        return;
      case 'PENDING':
        next(new ForbiddenError('Your account is awaiting administrator approval.'));
        return;
      case 'REJECTED':
        next(new ForbiddenError('Your account request was not approved.'));
        return;
      case 'SUSPENDED':
        next(
          new ForbiddenError(
            'Your account has been suspended. Contact your administrator.'
          )
        );
        return;
      default:
        next(new ForbiddenError('Account access denied'));
    }
  } catch (err) {
    next(err);
  }
}
