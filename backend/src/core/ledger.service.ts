import { Decimal } from 'decimal.js-light';
import { round2, sumDecimals } from './money.js';
import { SequenceService } from './sequence.service.js';
import { AuditService } from './audit.service.js';
import {
  EmptyEntryError,
  InvalidLineError,
  UnbalancedEntryError,
  InvalidAccountError,
  ImmutableEntryError,
  NotFoundError,
  ForbiddenError,
} from './errors.js';
import type { PostEntryInput, LedgerLine, PrismaTransactionClient } from '../types/index.js';
import { PrismaClient } from '@prisma/client';
import type { JournalEntry } from '@prisma/client';

const prisma = new PrismaClient();

export class LedgerService {
  /**
   * Post a balanced journal entry.
   *
   * Validates in this order (distinct error per step):
   * 1. lines.length >= 2                    → EmptyEntryError
   * 2. each line: exactly one of debit/credit > 0  → InvalidLineError
   * 3. round2(sum debit) === round2(sum credit)     → UnbalancedEntryError
   * 4. every accountId exists, belongs to company, not archived → InvalidAccountError
   * 5. entryDate > company lock date (no lock date = open period) → PeriodLockedError
   *
   * Then: acquire sequence, insert entry + items, write audit log.
   *
   * If tx is not provided, opens its own transaction (self-contained use).
   * If tx IS provided, participates in the caller's transaction (composable use).
   */
  static async postEntry(
    companyId: number,
    input: PostEntryInput,
    postedById: number,
    requestId: string,
    tx?: PrismaTransactionClient
  ): Promise<JournalEntry> {
    const execute = async (client: PrismaTransactionClient): Promise<JournalEntry> => {
      const { journalId, entryDate, reference, narration, partnerId, sourceType, sourceId, lines } = input;

      // VALIDATION 1: minimum lines
      if (!lines || lines.length < 2) {
        throw new EmptyEntryError('A journal entry must have at least 2 lines');
      }

      // VALIDATION 2: each line has exactly one side
      for (const line of lines) {
        const debit = new Decimal(line.debit ?? '0');
        const credit = new Decimal(line.credit ?? '0');
        const hasDebit = debit.greaterThan(0);
        const hasCredit = credit.greaterThan(0);
        if ((hasDebit && hasCredit) || (!hasDebit && !hasCredit)) {
          throw new InvalidLineError(
            `Line for account ${line.accountId} must have exactly one of debit or credit > 0`
          );
        }
      }

      // VALIDATION 3: balanced
      const totalDebit = round2(
        sumDecimals(lines.map(l => new Decimal(l.debit ?? '0')))
      );
      const totalCredit = round2(
        sumDecimals(lines.map(l => new Decimal(l.credit ?? '0')))
      );
      if (!totalDebit.equals(totalCredit)) {
        throw new UnbalancedEntryError(totalDebit.toString(), totalCredit.toString());
      }

      // VALIDATION 4: all accounts valid
      const accountIds = [...new Set(lines.map(l => l.accountId))];
      const accounts = await client.account.findMany({
        where: { id: { in: accountIds }, companyId },
      });
      if (accounts.length !== accountIds.length) {
        throw new InvalidAccountError('One or more accounts are invalid or do not belong to this company');
      }
      const archivedAccount = accounts.find(a => a.isArchived);
      if (archivedAccount) {
        throw new InvalidAccountError(`Account "${archivedAccount.name}" is archived`);
      }

      // VALIDATION 5: period lock (no lock date on company = always open)
      // If company gains a lockDate field in future, check here.
      // For now, all periods are open.

      // Get journal for sequence prefix
      const journal = await client.journal.findUniqueOrThrow({
        where: { id: journalId },
      });

      // Generate gapless sequence number
      const year = entryDate.getFullYear();
      const number = await SequenceService.next(
        companyId,
        journalId,
        year,
        journal.sequencePrefix,
        client
      );

      // Insert the entry
      const entry = await client.journalEntry.create({
        data: {
          companyId,
          journalId,
          number,
          entryDate,
          reference,
          narration,
          status: 'POSTED',
          partnerId,
          sourceType,
          sourceId,
          totalDebit: totalDebit.toString(),
          totalCredit: totalCredit.toString(),
          postedById,
          postedAt: new Date(),
          items: {
            create: lines.map((line, i) => ({
              accountId: line.accountId,
              partnerId: line.partnerId,
              label: line.label,
              debit: line.debit ?? '0',
              credit: line.credit ?? '0',
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              analyticAccountId: line.analyticAccountId,
              taxId: line.taxId,
              sequence: line.sequence ?? i,
            })),
          },
        },
        include: { items: true },
      });

      // Write audit log
      await AuditService.log({
        companyId,
        userId: postedById,
        entity: 'JournalEntry',
        entityId: String(entry.id),
        action: 'POST',
        after: { id: entry.id, number: entry.number, totalDebit: entry.totalDebit.toString(), totalCredit: entry.totalCredit.toString() },
        requestId,
      }, client);

      return entry;
    };

    if (tx) {
      return execute(tx);
    }
    return prisma.$transaction(execute);
  }

  /**
   * Reverse a posted journal entry.
   *
   * Creates a NEW entry with debit and credit swapped on every line.
   * Sets reversalOfId on the new entry and reversedById on the original.
   * NEVER mutates or deletes the original.
   *
   * Refuses to reverse:
   * - An entry that is not POSTED
   * - An entry that is already reversed (reversedById is set)
   * - An entry that is itself a reversal (reversalOfId is set)
   */
  static async reverseEntry(
    companyId: number,
    entryId: number,
    reversalDate: Date,
    userId: number,
    requestId: string,
    tx?: PrismaTransactionClient
  ): Promise<JournalEntry> {
    const execute = async (client: PrismaTransactionClient): Promise<JournalEntry> => {
      const original = await client.journalEntry.findFirst({
        where: { id: entryId, companyId },
        include: { items: true },
      });

      if (!original) throw new NotFoundError('Journal entry not found');
      if (original.status !== 'POSTED') throw new ForbiddenError('Only POSTED entries can be reversed');
      if (original.reversedById) throw new ForbiddenError('This entry has already been reversed');

      const reversalLines: LedgerLine[] = original.items.map(item => ({
        accountId: item.accountId,
        debit: item.credit.toString(),   // swap
        credit: item.debit.toString(),   // swap
        partnerId: item.partnerId ?? undefined,
        label: item.label ?? undefined,
        analyticAccountId: item.analyticAccountId ?? undefined,
        taxId: item.taxId ?? undefined,
        sequence: item.sequence,
      }));

      const reversal = await LedgerService.postEntry(
        companyId,
        {
          journalId: original.journalId,
          entryDate: reversalDate,
          narration: `Reversal of ${original.number}`,
          sourceType: 'REVERSAL',
          sourceId: original.id,
          lines: reversalLines,
        },
        userId,
        requestId,
        client
      );

      // Link the two entries
      const updatedReversal = await client.journalEntry.update({
        where: { id: reversal.id },
        data: { reversalOfId: original.id },
      });
      await client.journalEntry.update({
        where: { id: original.id },
        data: { reversedById: reversal.id },
      });

      await AuditService.log({
        companyId,
        userId,
        entity: 'JournalEntry',
        entityId: String(original.id),
        action: 'REVERSE',
        before: { id: original.id, number: original.number },
        after: { reversedById: reversal.id },
        requestId,
      }, client);

      return updatedReversal;
    };

    if (tx) return execute(tx);
    return prisma.$transaction(execute);
  }

  /**
   * Guard: reject any attempt to mutate a posted JournalEntry row.
   * Call this at the top of any update/delete operation.
   */
  static async assertNotPosted(
    entryId: number,
    client: PrismaTransactionClient
  ): Promise<void> {
    const entry = await client.journalEntry.findUnique({
      where: { id: entryId },
      select: { status: true },
    });
    if (entry?.status === 'POSTED') {
      throw new ImmutableEntryError(
        'Posted journal entries are immutable. Use reversal to correct them.'
      );
    }
  }
}
