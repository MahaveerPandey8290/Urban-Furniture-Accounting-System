import { JournalEntryRepository } from './journal-entries.repository.js';
import { LedgerService } from '../../core/ledger.service.js';
import { NotFoundError } from '../../core/errors.js';
import type { PostEntryInput } from '../../types/index.js';

export class JournalEntryService {
  static async createEntry(dto: any, companyId: number, userId: number, requestId: string) {
    const input: PostEntryInput = {
      journalId: dto.journalId,
      entryDate: dto.entryDate,
      reference: dto.reference,
      narration: dto.narration,
      sourceType: 'MANUAL',
      lines: dto.lines.map((l: any) => ({
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit,
        label: l.label,
        analyticAccountId: l.analyticAccountId,
      }))
    };

    return LedgerService.postEntry(companyId, input, userId, requestId);
  }

  static async listEntries(query: any, companyId: number) {
    return JournalEntryRepository.findAll(companyId, query);
  }

  static async getEntry(id: number, companyId: number) {
    const entry = await JournalEntryRepository.findById(id, companyId);
    if (!entry) throw new NotFoundError('Journal entry not found');
    return entry;
  }

  static async reverseEntry(id: number, reversalDate: Date, companyId: number, userId: number, requestId: string) {
    return LedgerService.reverseEntry(companyId, id, reversalDate, userId, requestId);
  }
}
