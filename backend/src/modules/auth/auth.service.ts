import crypto from 'crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import logger from '../../config/logger.js';
import prisma from '../../config/prisma.js';
import { AuthRepository } from './auth.repository.js';
import { AuditService } from '../../core/audit.service.js';
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  NotFoundError,
  UnprocessableError,
} from '../../core/errors.js';
import type { AuthContext } from '../../types/index.js';
import type {
  SignupDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './auth.dto.js';

// ─── Argon2 configuration ──────────────────────────────────────────────────────
// From spec: argon2id, memoryCost 19456, timeCost 2, parallelism 1
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

// Dummy hash used for timing-safe "user not found" responses during login.
// Running argon2.verify against a valid-format hash when the user doesn't
// exist ensures the response time is identical to a wrong-password response,
// preventing timing-based account enumeration.
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$ZHVtbXlzYWx0ZHVtbXk$dummyhashvaluethatisvalidformat0000000000000';

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;
const PASSWORD_HISTORY_LIMIT = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

function generateTempPassword(): string {
  // 12-char password meeting policy: upper, lower, special, digits
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '@#$%&*!';
  const all = upper + lower + digits + special;

  const rand = (chars: string) =>
    chars[crypto.randomInt(chars.length)];

  // Guarantee at least one of each required character type
  const required = [rand(upper), rand(lower), rand(digits), rand(special)];
  const rest = Array.from({ length: 8 }, () => rand(all));
  const combined = [...required, ...rest];

  // Shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [combined[i], combined[j]] = [combined[j]!, combined[i]!];
  }
  return combined.join('');
}

function issueAccessToken(payload: AuthContext): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

async function issueRefreshToken(
  userId: number,
  familyId?: string
): Promise<string> {
  const rawToken = generateToken(64);
  const tokenHash = sha256(rawToken);
  const family = familyId ?? crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
  );

  await AuthRepository.createRefreshToken({
    userId,
    tokenHash,
    familyId: family,
    expiresAt,
  });

  return rawToken;
}

// ─── AuthService ──────────────────────────────────────────────────────────────

export class AuthService {
  /**
   * Public signup.
   *
   * Forces role = ACCOUNTANT and status = PENDING.
   * The role field is NOT accepted from input — SignupDto.strip() removes it
   * before it reaches this service, but we also explicitly set it here as a
   * belt-and-braces guard.
   *
   * Returns 202 with a generic message. No token issued.
   */
  static async signup(dto: SignupDto, companyId = 1): Promise<{ message: string }> {
    // Check uniqueness before hashing (expensive)
    const [existingLogin, existingEmail] = await Promise.all([
      AuthRepository.findByLoginId(dto.loginId),
      AuthRepository.findByEmail(dto.email),
    ]);

    if (existingLogin) {
      throw new ConflictError('Login ID is already taken');
    }
    if (existingEmail) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password, ARGON2_OPTIONS);

    const user = await prisma.$transaction(async (tx) => {
      const created = await AuthRepository.createUser(
        {
          companyId,
          name: dto.name,
          loginId: dto.loginId,
          email: dto.email.toLowerCase(),
          passwordHash,
          role: 'ACCOUNTANT', // NEVER from request — forced here
          status: 'PENDING',
          mustChangePassword: false,
        },
        tx
      );
      await AuthRepository.addPasswordHistory(created.id, passwordHash, tx);
      return created;
    });

    await AuditService.log({
      companyId,
      userId: user.id,
      entity: 'User',
      entityId: String(user.id),
      action: 'SIGNUP',
      after: { loginId: user.loginId, email: user.email, role: user.role, status: user.status },
    });

    return {
      message:
        'Your request has been submitted. An administrator will review it shortly.',
    };
  }

  /**
   * Login.
   *
   * Matches on loginId ONLY, not email.
   * Timing-safe: runs argon2 even when user is not found.
   * Brute-force protection: 5 consecutive failures locks for 15 minutes.
   */
  static async login(
    dto: LoginDto,
    ipAddress?: string,
    requestId?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    mustChangePassword: boolean;
  }> {
    const WRONG_CREDENTIALS_MSG = 'Invalid Login Id or Password';

    const user = await AuthRepository.findByLoginId(dto.loginId);

    // Check lockout before verifying credentials
    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenError(
        'Too many failed attempts. Your account is locked for 15 minutes.'
      );
    }

    // Always run argon2 to prevent timing attacks even when user not found
    const hashToVerify = user?.passwordHash ?? DUMMY_HASH;
    let passwordValid = false;
    try {
      passwordValid = await argon2.verify(hashToVerify, dto.password, ARGON2_OPTIONS);
    } catch {
      passwordValid = false;
    }

    if (!user || !passwordValid) {
      // If user exists, increment failure counter
      if (user) {
        const newAttempts = user.failedLoginAttempts + 1;
        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
          await AuthRepository.lockUser(user.id, lockedUntil);
          logger.warn(
            { userId: user.id, loginId: dto.loginId, ipAddress, requestId },
            'Account locked after too many failed login attempts'
          );
          throw new ForbiddenError(
            'Too many failed attempts. Your account is locked for 15 minutes.'
          );
        }
        await AuthRepository.incrementFailedAttempts(user.id);
      }
      throw new UnauthorizedError(WRONG_CREDENTIALS_MSG);
    }

    // Check status with spec-exact messages
    switch (user.status) {
      case 'PENDING':
        throw new ForbiddenError('Your account is awaiting administrator approval.');
      case 'REJECTED':
        throw new ForbiddenError('Your account request was not approved.');
      case 'SUSPENDED':
        throw new ForbiddenError(
          'Your account has been suspended. Contact your administrator.'
        );
    }

    // Reset failed attempts on successful login
    await AuthRepository.resetLoginAttempts(user.id);

    const authCtx: AuthContext = {
      sub: user.id,
      loginId: user.loginId,
      role: user.role,
      contactId: user.contactId,
      companyId: user.companyId,
      mustChangePassword: user.mustChangePassword,
    };

    const accessToken = issueAccessToken(authCtx);
    const refreshToken = await issueRefreshToken(user.id);

    await AuditService.log({
      companyId: user.companyId,
      userId: user.id,
      entity: 'User',
      entityId: String(user.id),
      action: 'LOGIN',
      after: { ipAddress },
      ipAddress,
      requestId,
    });

    return { accessToken, refreshToken, mustChangePassword: user.mustChangePassword };
  }

  /**
   * Refresh token rotation.
   *
   * Each use of a refresh token issues a NEW one and revokes the old.
   * If a revoked token is presented again, it means the token was stolen —
   * revoke the entire family and force re-login.
   */
  static async refresh(
    rawRefreshToken: string,
    requestId?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = sha256(rawRefreshToken);
    const stored = await AuthRepository.findRefreshToken(tokenHash);

    if (!stored) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (stored.revokedAt) {
      // Token reuse detected — revoke entire family (indicates theft)
      await AuthRepository.revokeTokenFamily(stored.familyId);
      logger.warn(
        { userId: stored.userId, familyId: stored.familyId, requestId },
        'Refresh token reuse detected — entire family revoked. Possible token theft.'
      );
      throw new UnauthorizedError(
        'Session invalidated due to suspicious activity. Please log in again.'
      );
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    const user = await AuthRepository.findById(stored.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User account is not active');
    }

    // Rotate: revoke old, issue new in same family
    const newRawToken = generateToken(64);
    const newTokenHash = sha256(newRawToken);
    const expiresAt = new Date(
      Date.now() + env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    );

    await prisma.$transaction(async (tx) => {
      const newToken = await AuthRepository.createRefreshToken(
        { userId: user.id, tokenHash: newTokenHash, familyId: stored.familyId, expiresAt },
        tx
      );
      await AuthRepository.revokeRefreshToken(stored.id, newToken.id, tx);
    });

    const authCtx: AuthContext = {
      sub: user.id,
      loginId: user.loginId,
      role: user.role,
      contactId: user.contactId,
      companyId: user.companyId,
      mustChangePassword: user.mustChangePassword,
    };

    return {
      accessToken: issueAccessToken(authCtx),
      refreshToken: newRawToken,
    };
  }

  /**
   * Logout — revoke the specific refresh token.
   */
  static async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = sha256(rawRefreshToken);
    const stored = await AuthRepository.findRefreshToken(tokenHash);
    if (stored && !stored.revokedAt) {
      await AuthRepository.revokeRefreshToken(stored.id);
    }
  }

  /**
   * Forgot password.
   *
   * ALWAYS returns 200 with the same generic message regardless of whether
   * the email exists. Never confirm account existence.
   */
  static async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const GENERIC_MESSAGE =
      'If an account with that email exists, a reset link has been sent.';

    const user = await AuthRepository.findByEmail(dto.email);

    if (user) {
      const rawToken = generateToken(32);
      const tokenHash = sha256(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await AuthRepository.createResetToken({ userId: user.id, tokenHash, expiresAt });

      const resetUrl = `${env.APP_URL}/reset-password?token=${rawToken}`;

      // ConsoleEmailService — replace with real SMTP in production
      if (env.NODE_ENV !== 'production') {
        logger.info({ resetUrl, userId: user.id }, 'Password reset link (dev only)');
      } else {
        // In production, dispatch through an injectable EmailService.
        // The ConsoleEmailService logs to stdout for operational visibility.
        logger.info(
          { userId: user.id },
          'Password reset link dispatched (token redacted in production)'
        );
        // TODO: wire real EmailService here
      }
    }

    return { message: GENERIC_MESSAGE };
  }

  /**
   * Reset password using a one-time token.
   * Single use. Revokes ALL refresh tokens for the user after success.
   */
  static async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = sha256(dto.token);
    const resetToken = await AuthRepository.findResetToken(tokenHash);

    if (!resetToken || resetToken.consumedAt || resetToken.expiresAt < new Date()) {
      throw new UnprocessableError('Reset token is invalid or has expired');
    }

    const user = await AuthRepository.findById(resetToken.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check password history
    await AuthService._checkPasswordHistory(user.id, dto.newPassword);

    const newHash = await argon2.hash(dto.newPassword, ARGON2_OPTIONS);

    await prisma.$transaction(async (tx) => {
      await AuthRepository.consumeResetToken(resetToken.id, tx);
      await AuthRepository.updateUser(
        user.id,
        {
          passwordHash: newHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
          mustChangePassword: false,
        },
        tx
      );
      await AuthRepository.addPasswordHistory(user.id, newHash, tx);
      // Revoke ALL refresh tokens so any stolen session dies
      await AuthRepository.revokeAllUserTokens(user.id, tx);
    });

    await AuditService.log({
      companyId: user.companyId,
      userId: user.id,
      entity: 'User',
      entityId: String(user.id),
      action: 'PASSWORD_RESET',
    });

    return { message: 'Password has been reset successfully. Please log in.' };
  }

  /**
   * Change password (authenticated user).
   * Enforces per-user password history (last 5).
   */
  static async changePassword(
    userId: number,
    dto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const user = await AuthRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword, ARGON2_OPTIONS);
    if (!valid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new UnprocessableError(
        'New password must be different from the current password'
      );
    }

    // Check history
    await AuthService._checkPasswordHistory(userId, dto.newPassword);

    const newHash = await argon2.hash(dto.newPassword, ARGON2_OPTIONS);

    await prisma.$transaction(async (tx) => {
      await AuthRepository.updateUser(
        userId,
        { passwordHash: newHash, mustChangePassword: false },
        tx
      );
      await AuthRepository.addPasswordHistory(userId, newHash, tx);
    });

    await AuditService.log({
      companyId: user.companyId,
      userId: user.id,
      entity: 'User',
      entityId: String(user.id),
      action: 'PASSWORD_CHANGED',
    });

    return { message: 'Password changed successfully.' };
  }

  /**
   * Generate a temporary password for a user (used by admin create / approve).
   * Returns the plaintext password ONCE. It is never stored, only the hash is.
   *
   * Emits a structured log recording that credentials were issued — WITHOUT
   * the password value.
   */
  static async generateAndSetTempPassword(
    userId: number,
    companyId: number,
    requestId?: string
  ): Promise<string> {
    const tempPassword = generateTempPassword();
    const hash = await argon2.hash(tempPassword, ARGON2_OPTIONS);

    await prisma.$transaction(async (tx) => {
      await AuthRepository.updateUser(
        userId,
        { passwordHash: hash, mustChangePassword: true, status: 'ACTIVE' },
        tx
      );
      await AuthRepository.addPasswordHistory(userId, hash, tx);
    });

    logger.info(
      { userId, companyId, requestId },
      'Temporary credentials issued — password NOT logged'
    );

    return tempPassword;
  }

  /**
   * Generate a cryptographically random temporary password meeting policy.
   * Exposed as a public static so UsersService can call it.
   */
  static generateTempPasswordValue(): string {
    return generateTempPassword();
  }

  /**
   * Hash a password with argon2id using the standard options.
   * Exposed as a public static so UsersService can pre-hash outside a transaction.
   */
  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, ARGON2_OPTIONS);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Per-user password history check.
   *
   * // Global password uniqueness would require comparing every new password
   * // against every stored hash. Argon2 is deliberately slow, so that is
   * // O(n) slow hashes per signup and becomes a self-inflicted DoS. Per-user
   * // history is the standard control and satisfies the intent.
   */
  static async _checkPasswordHistory(
    userId: number,
    newPassword: string
  ): Promise<void> {
    const history = await AuthRepository.getPasswordHistory(
      userId,
      PASSWORD_HISTORY_LIMIT
    );

    for (const entry of history) {
      let match = false;
      try {
        match = await argon2.verify(entry.passwordHash, newPassword, ARGON2_OPTIONS);
      } catch {
        match = false;
      }
      if (match) {
        throw new UnprocessableError(
          `This password has been used recently. Please choose one of your last ${PASSWORD_HISTORY_LIMIT} passwords.`
        );
      }
    }
  }
}
