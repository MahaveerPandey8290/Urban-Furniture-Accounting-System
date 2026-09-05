import { z } from 'zod';

export const CreatePaymentDto = z.object({
  type: z.enum(['SEND', 'RECEIVE']),
  method: z.enum(['CASH', 'BANK']),
  contactId: z.number().int().positive(),
  journalId: z.number().int().positive(),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  paymentDate: z.coerce.date(),
  reference: z.string().max(100).optional(),
  narration: z.string().max(2000).optional(),
  invoiceIds: z.array(z.number().int().positive()).optional(),
}).strip();
export type CreatePaymentDto = z.infer<typeof CreatePaymentDto>;

export const PaymentIdParamDto = z.object({ id: z.coerce.number().int().positive() });
export type PaymentIdParamDto = z.infer<typeof PaymentIdParamDto>;
