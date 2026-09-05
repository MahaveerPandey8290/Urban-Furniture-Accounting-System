import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Singleton PrismaClient.
 *
 * In development, the global object is used to prevent multiple instances
 * being created on hot-reload (tsx watch creates new module instances but
 * reuses the same global). In production, a single instance per process.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
