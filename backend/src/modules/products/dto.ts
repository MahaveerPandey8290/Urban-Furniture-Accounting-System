import { z } from 'zod';
import { ProductType } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(ProductType).default('GOODS'),
  categoryId: z.number().int().positive().optional(),
  salesPrice: z.number().nonnegative().optional().default(0),
  cost: z.number().nonnegative().optional().default(0),
  salesAccountId: z.number().int().positive().optional(),
  purchaseAccountId: z.number().int().positive().optional(),
  salesTaxId: z.number().int().positive().optional(),
  purchaseTaxId: z.number().int().positive().optional(),
}).strip();

export type CreateProductDTO = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().extend({
  isArchived: z.boolean().optional(),
}).strip();

export type UpdateProductDTO = z.infer<typeof updateProductSchema>;

export const queryProductSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  type: z.nativeEnum(ProductType).optional(),
  isArchived: z.coerce.boolean().optional(),
}).strip();

export type QueryProductDTO = z.infer<typeof queryProductSchema>;
