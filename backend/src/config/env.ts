import 'dotenv/config';
import { z } from 'zod';
/**
 * Zod-validated environment configuration.
 *
 * This module MUST be imported before any other module that needs env vars.
 * It validates all required env vars at startup and calls process.exit(1)
 * immediately if any are missing or malformed — "fail fast" principle.
 *
 * In production, SEED_ADMIN_LOGIN_ID and SEED_ADMIN_PASSWORD are required
 * because without them, no admin can log in to approve other users.
 * Refusing to boot is safer than running an inaccessible instance.
 */

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('/api'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  TEST_DATABASE_URL: z.string().optional(),

  // JWT — minimum 32 chars enforced to prevent weak secrets
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),

  // Seed
  SEED_ADMIN_LOGIN_ID: z.string().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional(),
  SEED_COMPANY_NAME: z.string().default('Urban Furniture Pvt Ltd'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // File uploads
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(2),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),

  // Email / app
  APP_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Use console.error here only — logger is not yet available
  console.error('[Configuration Error] Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

const data = parsed.data;

// Production guard: must have seed admin credentials so the system is not
// permanently inaccessible after a fresh deploy.
if (data.NODE_ENV === 'production') {
  if (!data.SEED_ADMIN_LOGIN_ID || !data.SEED_ADMIN_PASSWORD) {
    console.error(
      '[Configuration Error] SEED_ADMIN_LOGIN_ID and SEED_ADMIN_PASSWORD are required in production. ' +
      'Without them, no admin user can be created and the system cannot be accessed.'
    );
    process.exit(1);
  }
}

export const env = data;
export type Env = typeof data;
