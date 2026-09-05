import { z } from 'zod';

export const CreateInvoiceDto = z.object({
  documentType: z.enum(['CUSTOMER_INVOICE', 'VENDOR_BILL']),
  contactId: z.number().int().positive(),
  journalId: z.number().int().positive(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
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
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceDto>;

export const InvoiceIdParamDto = z.object({ id: z.coerce.number().int().positive() });
export type InvoiceIdParamDto = z.infer<typeof InvoiceIdParamDto>;

export const ListInvoicesQueryDto = z.object({
  cursor: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  documentType: z.enum(['CUSTOMER_INVOICE', 'VENDOR_BILL']).optional(),
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['NOT_PAID', 'PARTIAL', 'PAID']).optional(),
  contactId: z.coerce.number().int().optional(),
});
export type ListInvoicesQueryDto = z.infer<typeof ListInvoicesQueryDto>;
