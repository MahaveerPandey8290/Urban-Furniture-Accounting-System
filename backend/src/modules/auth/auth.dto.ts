import { z } from 'zod';

/**
 * Password policy (from spec):
 *  - minimum 8 characters
 *  - at least one lowercase letter
 *  - at least one uppercase letter
 *  - at least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(
    /[^a-zA-Z0-9]/,
    'Password must contain at least one special character'
  );

/**
 * loginId policy:
 *  - 6-12 characters
 *  - alphanumeric + underscore only
 */
export const loginIdSchema = z
  .string()
  .min(6, 'Login ID must be at least 6 characters')
  .max(12, 'Login ID must be at most 12 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Login ID may only contain letters, numbers, and underscores'
  );

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export const SignupDto = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    loginId: loginIdSchema,
    email: z.string().email('Invalid email address').toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string(),
    // role is intentionally NOT accepted — any role key sent is stripped silently
  })
  .strip() // strips unknown keys including any `role` sent by client
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type SignupDto = z.infer<typeof SignupDto>;

export const LoginDto = z.object({
  loginId: z.string().min(1, 'Login ID is required'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginDto = z.infer<typeof LoginDto>;

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;

export const ForgotPasswordDto = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>;

export const ResetPasswordDto = z
  .object({
    token: z.string().min(1, 'Token is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>;

export const ChangePasswordDto = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordDto = z.infer<typeof ChangePasswordDto>;
