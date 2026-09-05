import { z } from 'zod';
import { AnalyticType } from '@prisma/client';

export const createAnalyticAccountSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(AnalyticType),
}).strip();

export type CreateAnalyticAccountDto = z.infer<typeof createAnalyticAccountSchema>;

export const updateAnalyticAccountSchema = createAnalyticAccountSchema.partial().extend({
  isArchived: z.boolean().optional(),
}).strip();

export type UpdateAnalyticAccountDto = z.infer<typeof updateAnalyticAccountSchema>;

export const queryAnalyticAccountSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  type: z.nativeEnum(AnalyticType).optional(),
  isArchived: z.coerce.boolean().optional(),
}).strip();

export type QueryAnalyticAccountDto = z.infer<typeof queryAnalyticAccountSchema>;
