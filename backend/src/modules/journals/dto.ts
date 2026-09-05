import { z } from 'zod';
import { JournalType } from '@prisma/client';

export const createJournalSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  type: z.nativeEnum(JournalType),
  defaultAccountId: z.number().int().positive().optional(),
  sequencePrefix: z.string().min(1).max(10),
}).strip();

export type CreateJournalDto = z.infer<typeof createJournalSchema>;

export const updateJournalSchema = createJournalSchema.partial().extend({
  isArchived: z.boolean().optional(),
}).strip();

export type UpdateJournalDto = z.infer<typeof updateJournalSchema>;

export const queryJournalSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  type: z.nativeEnum(JournalType).optional(),
  isArchived: z.coerce.boolean().optional(),
}).strip();

export type QueryJournalDto = z.infer<typeof queryJournalSchema>;
