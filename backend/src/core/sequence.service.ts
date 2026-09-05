import type { PrismaTransactionClient } from '../types/index.js';
import { AppError } from './errors.js';

export class SequenceService {
  /**
   * Generate the next gapless document number for a journal+year combination.
   *
   * Uses pg_advisory_xact_lock keyed on hash of (companyId:journalId:year).
   * The advisory lock is session-level within the transaction and releases
   * automatically when the transaction commits or rolls back.
   * This is preferred over SELECT FOR UPDATE because:
   * 1. It does not bloat the DocumentSequence row with lock contention
   * 2. It does not create deadlock risks from row-level locking
   * 3. It serialises ONLY the sequence increment, not the whole row
   *
   * MUST be called inside an active transaction. Throws if tx is not provided.
   * This constraint is intentional: the caller must guarantee atomicity
   * between sequence acquisition and the document insert.
   */
  static async next(
    companyId: number,
    journalId: number,
    year: number,
    prefix: string,
    tx: PrismaTransactionClient
  ): Promise<string> {
    if (!tx) {
      throw new AppError(
        'SequenceService.next must be called inside a transaction',
        500,
        'SEQUENCE_NO_TRANSACTION'
      );
    }

    // Acquire advisory lock - automatically released at transaction end
    // Lock key combines companyId, journalId, year to avoid cross-journal contention
    const lockKey = `${companyId}:${journalId}:${year}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

    // Upsert the sequence row and increment atomically
    const result = await tx.documentSequence.upsert({
      where: { companyId_journalId_year: { companyId, journalId, year } },
      create: { companyId, journalId, year, nextNumber: 2 },
      update: { nextNumber: { increment: 1 } },
    });

    const issued = result.nextNumber - 1;
    const paddedNumber = String(issued).padStart(4, '0');
    return `${prefix}/${year}/${paddedNumber}`;
  }
}
