import { z } from 'zod';
import { loginIdSchema } from '../auth/auth.dto.js';

/**
 * userType maps to role + optional contact creation:
 *   ADMINISTRATOR → role ADMIN,      no contact
 *   ACCOUNTANT    → role ACCOUNTANT, no contact
 *   CUSTOMER      → role CONTACT,    creates Contact(type: CUSTOMER)
 *   VENDOR        → role CONTACT,    creates Contact(type: VENDOR)
 */
export const UserTypeEnum = z.enum(['ADMINISTRATOR', 'ACCOUNTANT', 'CUSTOMER', 'VENDOR']);
export type UserTypeEnum = z.infer<typeof UserTypeEnum>;

export const CreateUserDto = z.object({
  name: z.string().min(1).max(100),
  loginId: loginIdSchema,
  email: z.string().email().toLowerCase(),
  userType: UserTypeEnum,
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const ApproveUserDto = z.object({});
export type ApproveUserDto = z.infer<typeof ApproveUserDto>;

export const RejectUserDto = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(500),
});
export type RejectUserDto = z.infer<typeof RejectUserDto>;

export const UserIdParamDto = z.object({
  id: z.coerce.number().int().positive(),
});
export type UserIdParamDto = z.infer<typeof UserIdParamDto>;
