import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import logger from './config/logger.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    ` Server started on port ${env.PORT}`
  );
});

/**
 * Graceful shutdown handler.
 *
 * On SIGTERM/SIGINT:
 *  1. Stop accepting new connections (server.close)
 *  2. Wait for in-flight requests to finish
 *  3. Disconnect Prisma (closes the DB connection pool)
 *  4. Exit cleanly
 *
 * Force-exit after 10s to handle stuck connections (e.g., keep-alive clients).
 */
async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Graceful shutdown initiated');

  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed. Server shut down cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  });

  // Force exit if shutdown takes more than 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  process.exit(1);
});

export default server;
