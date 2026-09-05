import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import logger from './config/logger.js';
import { requestContext } from './middleware/requestContext.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

/**
 * Express application factory.
 *
 * Returns a configured Express app without calling .listen() — this keeps it
 * testable (Supertest can start it on a random port without side effects).
 *
 * Middleware order matters:
 *  1. Security headers (helmet) — must be first
 *  2. CORS — before any routing
 *  3. Body parsing — before routes that read req.body
 *  4. Request context (correlation ID) — before logging
 *  5. HTTP logging (pino-http) — after context so requestId is in logs
 *  6. Global rate limit — before routes but after body parsing
 *  7. Routes
 *  8. Error handler — MUST be last (Express identifies it by 4 args)
 */
export function createApp(): express.Application {
  const app = express();

  // ─── Security headers ──────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // needed for swagger-ui
          scriptSrc: ["'self'", "'unsafe-inline'"], // needed for swagger-ui
          imgSrc: ["'self'", 'data:'],
        },
      },
    })
  );

  // ─── CORS — explicit allowlist, never origin: true ─────────────────────────
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser requests (e.g., server-to-server, curl) and allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin "${origin}" is not in the allowlist`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'x-request-id'],
      exposedHeaders: ['x-request-id'],
    })
  );

  // ─── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Request context (correlation ID) ─────────────────────────────────────
  app.use(requestContext);

  // ─── HTTP request logging ──────────────────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(
      pinoHttp({
        logger,
        customProps: (req) => ({ requestId: (req as express.Request).requestId }),
        redact: ['req.headers.authorization'],
      })
    );
  }

  // ─── Global rate limit ─────────────────────────────────────────────────────
  app.use(globalLimiter);

  // ─── Routes ───────────────────────────────────────────────────────────────
  app.use(env.API_PREFIX, routes);

  // ─── Global error handler (must be last) ──────────────────────────────────
  app.use(errorHandler);

  return app;
}

export default createApp;
