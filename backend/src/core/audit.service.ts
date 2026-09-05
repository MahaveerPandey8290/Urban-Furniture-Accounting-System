import type { PrismaTransactionClient } from '../types/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REDACTED_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'tokenHash',
  'authorization',
  'newPassword',
  'confirmPassword',
];

export interface AuditLogInput {
  entity: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
  userId?: number;
  companyId: number;
  ipAddress?: string;
  requestId?: string;
}

export class AuditService {
  /**
   * Redact sensitive fields from the payload.
   */
  private static redact(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.redact(item));
    }

    const redacted = { ...data } as Record<string, unknown>;
    for (const key of Object.keys(redacted)) {
      if (REDACTED_FIELDS.includes(key)) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this.redact(redacted[key]);
      }
    }

    return redacted;
  }

  /**
   * Log an audit event.
   */
  static async log(
    input: AuditLogInput,
    client: PrismaTransactionClient | PrismaClient = prisma
  ): Promise<void> {
    const {
      entity,
      entityId,
      action,
      before,
      after,
      userId,
      companyId,
      ipAddress,
      requestId,
    } = input;

    await client.auditLog.create({
      data: {
        entity,
        entityId,
        action,
        before: before ? (this.redact(before) as any) : undefined,
        after: after ? (this.redact(after) as any) : undefined,
        userId,
        companyId,
        ipAddress,
        requestId,
      },
    });
  }
}
