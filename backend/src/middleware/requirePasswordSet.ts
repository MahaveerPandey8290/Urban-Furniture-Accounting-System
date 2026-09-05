import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../core/errors.js';

const CHANGE_PASSWORD_PATH = '/api/auth/change-password';

/**
 * Password change enforcement middleware.
 *
 * When mustChangePassword is true on a user (set after admin creates a user,
 * approves a signup, or resets a password), ALL routes are blocked except
 * POST /api/auth/change-password.
 *
 * This forces newly created users and password-reset users to choose their own
 * password before accessing any business data.
 *
 * The mustChangePassword flag is read from the JWT payload (set at login time).
 * This is acceptable because:
 *  1. The access token is short-lived (15 min).
 *  2. After changing the password, a new token is issued with the flag cleared.
 *  3. If an admin re-enables the flag, the user's next token rotation will
 *     enforce it.
 *
 * Must be used AFTER requireAuth and requireActive.
 */
export function requirePasswordSet(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next();
    return;
  }

  // Allow the change-password route through unconditionally
  if (req.path === CHANGE_PASSWORD_PATH || req.path.endsWith('/change-password')) {
    next();
    return;
  }

  if (req.user.mustChangePassword) {
    next(
      new ForbiddenError(
        'You must change your password before accessing this resource.'
      )
    );
    return;
  }

  next();
}
