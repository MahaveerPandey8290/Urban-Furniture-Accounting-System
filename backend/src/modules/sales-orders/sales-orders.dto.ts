import { z } from 'zod';

export const CreateSalesOrderDto = z.object({
  contactId: z.number().int().positive(),
  orderDate: z.coerce.date(),
  expectedDate: z.coerce.date().optional(),
  reference: z.string().max(100).optional(),
  narration: z.string().max(2000).optional(),
  lines: z.array(z.object({
    productId: z.number().int().positive().optional(),
    description: z.string().max(500),
    quantity: z.string().regex(/^\d+(\.\d+)?$/).default('1'),
    unitPrice: z.string().regex(/^\d+(\.\d+)?$/),
    taxId: z.number().int().positive().optional(),
    accountId: z.number().int().positive(),
    analyticAccountId: z.number().int().positive().optional(),
  })).min(1),
}).strip();
export type CreateSalesOrderDto = z.infer<typeof CreateSalesOrderDto>;

export const SalesOrderIdParamDto = z.object({ id: z.coerce.number().int().positive() });
export type SalesOrderIdParamDto = z.infer<typeof SalesOrderIdParamDto>;

export const ListSalesOrdersQueryDto = z.object({
  cursor: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']).optional(),
  contactId: z.coerce.number().int().optional(),
});
export type ListSalesOrdersQueryDto = z.infer<typeof ListSalesOrdersQueryDto>;
