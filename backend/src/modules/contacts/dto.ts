import { z } from 'zod';
import { ContactType } from '@prisma/client';

export const createContactSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(ContactType),
  email: z.string().email().optional(),
  mobile: z.string().max(20).optional(),
  street: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  pincode: z.string().max(20).optional(),
}).strip();

export type CreateContactDTO = z.infer<typeof createContactSchema>;

export const updateContactSchema = createContactSchema.partial().extend({
  isArchived: z.boolean().optional(),
}).strip();

export type UpdateContactDTO = z.infer<typeof updateContactSchema>;

export const contactQuerySchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.nativeEnum(ContactType).optional(),
  search: z.string().optional(),
  isArchived: z.coerce.boolean().optional(),
}).strip();

export type QueryContactDTO = z.infer<typeof contactQuerySchema>;
