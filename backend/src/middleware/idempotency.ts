import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../core/errors.js';
import logger from '../config/logger.js';

/**
 * Idempotency key cache entry.
 */
interface CachedResponse {
  status: number;
  body: unknown;
  createdAt: number;
}

/**
 * In-memory idempotency store.
 *
 * Uses a Map with TTL cleanup. For a single-process deployment this is
 * sufficient. For multi-process/multi-node deployments, replace with Redis.
 *
 * TTL: 24 hours. Keys older than this are evicted lazily on the next write.
 */
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const store = new Map<string, CachedResponse>();

function evictExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.createdAt > TTL_MS) {
      store.delete(key);
    }
  }
}

/**
 * Idempotency middleware (optional check).
 *
 * When an Idempotency-Key header is present:
 * - If the key was seen before within TTL: return the cached response immediately.
 * - If new: proceed with the request, capture the response, and cache it.
 *
 * Only applies to POST requests (state-changing operations).
 * GET/PATCH requests are inherently idempotent or handled at the service layer.
 */
export function idempotency(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'POST') {
    next();
    return;
  }

  const key = req.headers['idempotency-key'] as string | undefined;
  if (!key) {
    next();
    return;
  }

  const cached = store.get(key);
  if (cached) {
    // Return the original response — do NOT re-execute the request
    logger.info({ idempotencyKey: key }, 'Idempotency cache hit — returning cached response');
    res.status(cached.status).json(cached.body);
    return;
  }

  // Intercept res.json to capture the response for caching
  const originalJson = res.json.bind(res);
  res.json = (body: unknown): Response => {
    if (res.statusCode < 500) {
      // Only cache successful or client-error responses
      // Never cache 5xx — the operation may not have completed
      evictExpired();
      store.set(key, { status: res.statusCode, body, createdAt: Date.now() });
    }
    return originalJson(body);
  };

  next();
}

/**
 * Strict idempotency middleware.
 *
 * Use this variant on the Payment confirm endpoint where the Idempotency-Key
 * is REQUIRED (per spec: "require an Idempotency-Key header").
 * Missing key → 400.
 */
export function requireIdempotencyKey(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const key = req.headers['idempotency-key'] as string | undefined;
  if (!key || key.trim() === '') {
    next(
      new ValidationError(
        'Idempotency-Key header is required for this operation',
        { header: ['Idempotency-Key is required'] }
      )
    );
    return;
  }
  next();
}
