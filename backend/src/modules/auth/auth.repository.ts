import prisma from '../../config/prisma.js';
import type { PrismaTransactionClient } from '../../types/index.js';
import type { User, RefreshToken, PasswordResetToken, PasswordHistory } from '@prisma/client';

/**
 * Auth repository — all Prisma access for the auth module.
 * No business logic here; that lives in auth.service.ts.
 */
export class AuthRepository {
  // ─── User ──────────────────────────────────────────────────────────────────

  static async findByLoginId(
    loginId: string,
    tx?: PrismaTransactionClient
  ): Promise<User | null> {
    return (tx ?? prisma).user.findUnique({ where: { loginId } });
  }

  static async findByEmail(
    email: string,
    tx?: PrismaTransactionClient
  ): Promise<User | null> {
    return (tx ?? prisma).user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
  }

  static async findById(
    id: number,
    tx?: PrismaTransactionClient
  ): Promise<User | null> {
    return (tx ?? prisma).user.findUnique({ where: { id } });
  }

  static async createUser(
    data: {
      companyId: number;
      name: string;
      loginId: string;
      email: string;
      passwordHash: string;
      role: User['role'];
      status: User['status'];
      mustChangePassword: boolean;
      contactId?: number;
    },
    tx?: PrismaTransactionClient
  ): Promise<User> {
    return (tx ?? prisma).user.create({ data });
  }

  static async updateUser(
    id: number,
    data: Partial<Pick<
      User,
      | 'passwordHash'
      | 'status'
      | 'mustChangePassword'
      | 'failedLoginAttempts'
      | 'lockedUntil'
      | 'lastLoginAt'
      | 'approvedById'
      | 'approvedAt'
      | 'rejectionReason'
      | 'contactId'
    >>,
    tx?: PrismaTransactionClient
  ): Promise<User> {
    return (tx ?? prisma).user.update({ where: { id }, data });
  }

  static async incrementFailedAttempts(
    id: number,
    tx?: PrismaTransactionClient
  ): Promise<User> {
    return (tx ?? prisma).user.update({
      where: { id },
      data: { failedLoginAttempts: { increment: 1 } },
    });
  }

  static async lockUser(
    id: number,
    until: Date,
    tx?: PrismaTransactionClient
  ): Promise<User> {
    return (tx ?? prisma).user.update({
      where: { id },
      data: { lockedUntil: until, failedLoginAttempts: 5 },
    });
  }

  static async resetLoginAttempts(
    id: number,
    tx?: PrismaTransactionClient
  ): Promise<User> {
    return (tx ?? prisma).user.update({
      where: { id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  }

  static async listPending(companyId: number): Promise<User[]> {
    return prisma.user.findMany({
      where: { companyId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Password history ──────────────────────────────────────────────────────

  static async getPasswordHistory(
    userId: number,
    limit: number,
    tx?: PrismaTransactionClient
  ): Promise<PasswordHistory[]> {
    return (tx ?? prisma).passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async addPasswordHistory(
    userId: number,
    passwordHash: string,
    tx?: PrismaTransactionClient
  ): Promise<void> {
    await (tx ?? prisma).passwordHistory.create({
      data: { userId, passwordHash },
    });
    // Keep only the last 5 password hashes per user
    const old = await (tx ?? prisma).passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: 5,
      select: { id: true },
    });
    if (old.length > 0) {
      await (tx ?? prisma).passwordHistory.deleteMany({
        where: { id: { in: old.map((h) => h.id) } },
      });
    }
  }

  // ─── Refresh tokens ────────────────────────────────────────────────────────

  static async createRefreshToken(
    data: {
      userId: number;
      tokenHash: string;
      familyId: string;
      expiresAt: Date;
    },
    tx?: PrismaTransactionClient
  ): Promise<RefreshToken> {
    return (tx ?? prisma).refreshToken.create({ data });
  }

  static async findRefreshToken(
    tokenHash: string,
    tx?: PrismaTransactionClient
  ): Promise<RefreshToken | null> {
    return (tx ?? prisma).refreshToken.findUnique({ where: { tokenHash } });
  }

  static async revokeRefreshToken(
    id: number,
    replacedById?: number,
    tx?: PrismaTransactionClient
  ): Promise<void> {
    await (tx ?? prisma).refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), replacedById },
    });
  }

  static async revokeTokenFamily(
    familyId: string,
    tx?: PrismaTransactionClient
  ): Promise<void> {
    await (tx ?? prisma).refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static async revokeAllUserTokens(
    userId: number,
    tx?: PrismaTransactionClient
  ): Promise<void> {
    await (tx ?? prisma).refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ─── Password reset tokens ─────────────────────────────────────────────────

  static async createResetToken(
    data: { userId: number; tokenHash: string; expiresAt: Date },
    tx?: PrismaTransactionClient
  ): Promise<PasswordResetToken> {
    // Invalidate any prior unused tokens for this user
    await (tx ?? prisma).passwordResetToken.updateMany({
      where: { userId: data.userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return (tx ?? prisma).passwordResetToken.create({ data });
  }

  static async findResetToken(
    tokenHash: string,
    tx?: PrismaTransactionClient
  ): Promise<PasswordResetToken | null> {
    return (tx ?? prisma).passwordResetToken.findUnique({ where: { tokenHash } });
  }

  static async consumeResetToken(
    id: number,
    tx?: PrismaTransactionClient
  ): Promise<void> {
    await (tx ?? prisma).passwordResetToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }
}
