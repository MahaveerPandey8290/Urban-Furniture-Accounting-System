import { z } from 'zod';

export const createProductCategorySchema = z.object({
  name: z.string().min(1).max(100),
}).strip();

export type CreateProductCategoryDTO = z.infer<typeof createProductCategorySchema>;

export const updateProductCategorySchema = createProductCategorySchema.partial().extend({
  isArchived: z.boolean().optional(),
}).strip();

export type UpdateProductCategoryDTO = z.infer<typeof updateProductCategorySchema>;

export const queryProductCategorySchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  isArchived: z.coerce.boolean().optional(),
}).strip();

export type QueryProductCategoryDTO = z.infer<typeof queryProductCategorySchema>;
