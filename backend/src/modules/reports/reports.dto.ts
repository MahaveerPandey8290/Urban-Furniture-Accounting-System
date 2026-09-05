import { z } from 'zod';

export const DateRangeQueryDto = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).strip();

export type DateRangeQueryDto = z.infer<typeof DateRangeQueryDto>;

export const GeneralLedgerQueryDto = z.object({
  accountId: z.coerce.number().int().positive().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).strip();

export type GeneralLedgerQueryDto = z.infer<typeof GeneralLedgerQueryDto>;
