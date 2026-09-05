import { z } from 'zod';

export const CreateBudgetDto = z.object({
  name: z.string().min(1).max(200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  lines: z.array(z.object({
    analyticAccountId: z.number().int().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    committedAmount: z.number().positive(),
  })).min(1),
}).strip();
export type CreateBudgetDto = z.infer<typeof CreateBudgetDto>;

export const BudgetIdParamDto = z.object({ id: z.coerce.number().int().positive() });
export type BudgetIdParamDto = z.infer<typeof BudgetIdParamDto>;

export const ReviseBudgetDto = z.object({
  lines: z.array(z.object({
    analyticAccountId: z.number().int().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    committedAmount: z.number().positive(),
  })).min(1),
}).strip();
export type ReviseBudgetDto = z.infer<typeof ReviseBudgetDto>;

export const ListBudgetsQueryDto = z.object({
  cursor: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
