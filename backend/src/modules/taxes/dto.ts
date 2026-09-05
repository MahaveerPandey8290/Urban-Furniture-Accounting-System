import { z } from 'zod';

export const createTaxSchema = z.object({
  name: z.string().min(1).max(100),
  rate: z.number().min(0).max(100),
  scope: z.enum(['SALES', 'PURCHASE', 'BOTH']).default('BOTH'),
  accountId: z.number().int().positive().optional(),
}).strip();

export type CreateTaxDto = z.infer<typeof createTaxSchema>;

export const updateTaxSchema = createTaxSchema.partial().extend({
  isArchived: z.boolean().optional(),
}).strip();

export type UpdateTaxDto = z.infer<typeof updateTaxSchema>;

export const queryTaxSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  scope: z.enum(['SALES', 'PURCHASE', 'BOTH']).optional(),
  isArchived: z.coerce.boolean().optional(),
}).strip();

export type QueryTaxDto = z.infer<typeof queryTaxSchema>;
