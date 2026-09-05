import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../core/errors.js';
import logger from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Global error handler.
 *
 * Maps application errors to consistent JSON responses.
 *
 * Rules:
 * - AppError subclasses: use their httpStatus and code directly.
 * - Prisma P2002 (unique constraint): 409 Conflict.
 * - Prisma P2025 (record not found): 404 Not Found.
 * - In development: include stack trace in response.
 * - In production: generic "An unexpected error occurred" for non-AppErrors.
 *   Never expose SQL, Prisma internals, or file paths.
 * - All 5xx errors are logged with full context.
 * - x-request-id is always set on the response.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Always ensure correlation ID is on response
  if (!res.headersSent) {
    res.setHeader('x-request-id', req.requestId ?? 'unknown');
  }

  // ─── AppError (our typed domain errors) ──────────────────────────────────
  if (err instanceof AppError) {
    if (err.httpStatus >= 500) {
      logger.error(
        { err, requestId: req.requestId, method: req.method, path: req.path },
        'Internal application error'
      );
    }
    res.status(err.httpStatus).json({
      code: err.code,
      message: err.message,
      ...(err.details !== undefined && { details: err.details }),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // ─── Prisma errors ────────────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      const fields = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
      res.status(409).json({
        code: 'CONFLICT',
        message: `A record with this ${fields} already exists`,
      });
      return;
    }
    if (err.code === 'P2025') {
      // Record not found (findUniqueOrThrow etc.)
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'The requested record was not found',
      });
      return;
    }
    // Other Prisma errors are unexpected — log but don't expose internals
    logger.error(
      { err, requestId: req.requestId, code: err.code },
      'Prisma client error'
    );
    res.status(500).json({
      code: 'DATABASE_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : `Database error: ${err.message}`,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    logger.error({ err, requestId: req.requestId }, 'Prisma validation error');
    res.status(400).json({
      code: 'DATABASE_VALIDATION_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'Invalid request data'
          : err.message,
    });
    return;
  }

  // ─── Unknown errors ───────────────────────────────────────────────────────
  logger.error(
    { err, requestId: req.requestId, method: req.method, path: req.path },
    'Unhandled error'
  );

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message:
      env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : (err instanceof Error ? err.message : String(err)),
    ...(env.NODE_ENV === 'development' &&
      err instanceof Error && { stack: err.stack }),
  });
}
