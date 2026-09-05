import { z } from 'zod';
import { AccountType, AccountGroup } from '@prisma/client';

export const createAccountSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  type: z.nativeEnum(AccountType),
  group: z.nativeEnum(AccountGroup).optional().default('BALANCE_SHEET'),
  parentId: z.number().int().positive().optional(),
}).strip();

export type CreateAccountDto = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema.partial().extend({
  isArchived: z.boolean().optional(),
}).strip();

export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;

export const queryAccountSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  type: z.nativeEnum(AccountType).optional(),
  isArchived: z.coerce.boolean().optional(),
}).strip();

export type QueryAccountDto = z.infer<typeof queryAccountSchema>;
