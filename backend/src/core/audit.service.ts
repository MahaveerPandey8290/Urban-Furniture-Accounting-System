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
   * Redact sensitive fields and ensure the payload is clean, serializable JSON.
   * Handles Prisma.Decimal, Date, BigInt, and other non-standard objects.
   */
  private static redact(data: unknown): unknown {
    if (data === undefined || data === null) {
      return null;
    }

    // First JSON stringify with replacer to convert Decimal, BigInt, Date etc.
    try {
      const serialized = JSON.stringify(data, (key, value) => {
        if (REDACTED_FIELDS.includes(key)) {
          return '[REDACTED]';
        }
        if (typeof value === 'bigint') {
          return value.toString();
        }
        // Prisma Decimal or decimal.js object has toString()
        if (value && typeof value === 'object' && typeof value.toFixed === 'function') {
          return value.toString();
        }
        return value;
      });

      return JSON.parse(serialized);
    } catch {
      return String(data);
    }
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
        before: before !== undefined ? (this.redact(before) as any) : undefined,
        after: after !== undefined ? (this.redact(after) as any) : undefined,
        userId,
        companyId,
        ipAddress,
        requestId,
      },
    });
  }
}
