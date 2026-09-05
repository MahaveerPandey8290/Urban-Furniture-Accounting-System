import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Request correlation ID middleware.
 *
 * Every request gets a unique ID so log lines can be correlated across the
 * full request/response cycle and across services.
 *
 * Strategy:
 *  1. Read x-request-id header if set by an upstream proxy/load-balancer.
 *  2. If absent, generate a UUID v4.
 *  3. Attach to req.requestId (available to all downstream middleware).
 *  4. Set on the response header so clients can correlate.
 *  5. Create a pino child logger with requestId bound — attach as req.log
 *     so route handlers can use it for structured logging.
 */
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId =
    (req.headers['x-request-id'] as string | undefined) ?? uuidv4();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  // Child logger binds requestId to every subsequent log call in this request
  req.log = logger.child({ requestId });

  next();
}
