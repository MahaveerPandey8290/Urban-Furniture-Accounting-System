import { z } from 'zod';

export const CreateJournalEntryDto = z.object({
  journalId: z.number().int().positive(),
  entryDate: z.coerce.date(),
  reference: z.string().max(100).optional(),
  narration: z.string().max(2000).optional(),
  lines: z.array(z.object({
    accountId: z.number().int().positive(),
    debit: z.string().regex(/^\d+(\.\d+)?$/).default('0'),
    credit: z.string().regex(/^\d+(\.\d+)?$/).default('0'),
    label: z.string().max(200).optional(),
    analyticAccountId: z.number().int().positive().optional(),
  })).min(2),
}).strip();
export type CreateJournalEntryDto = z.infer<typeof CreateJournalEntryDto>;

export const EntryIdParamDto = z.object({ id: z.coerce.number().int().positive() });
export type EntryIdParamDto = z.infer<typeof EntryIdParamDto>;

export const ReversalDto = z.object({
  reversalDate: z.coerce.date(),
}).strip();
export type ReversalDto = z.infer<typeof ReversalDto>;
