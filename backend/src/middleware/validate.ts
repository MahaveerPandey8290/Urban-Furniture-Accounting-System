import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../core/errors.js';

/**
 * Zod validation middleware factory.
 *
 * Creates an Express middleware that validates the specified part of the
 * request (body, params, or query) against a Zod schema.
 *
 * On success: replaces req[target] with the parsed (and possibly transformed)
 * data so downstream handlers get clean, typed values.
 *
 * On failure: calls next() with a ValidationError carrying the field-level
 * errors so the global error handler can format them consistently.
 *
 * A route without a schema is a defect — this middleware should be on every
 * route that accepts external input.
 */
export function validate<T extends ZodSchema>(
  schema: T,
  target: 'body' | 'params' | 'query' = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const zodError = result.error as ZodError;
      const fieldErrors = zodError.flatten().fieldErrors;
      next(
        new ValidationError(
          `Validation failed on ${target}`,
          fieldErrors
        )
      );
      return;
    }
    // Replace with parsed data — Zod may strip unknown keys (stripUnknown)
    // and apply transforms/defaults. This is intentional field whitelisting.
    (req as Record<string, unknown>)[target] = result.data;
    next();
  };
}
