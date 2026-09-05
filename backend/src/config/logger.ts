import pino from 'pino';
import { env } from './env.js';

/**
 * Pino logger with sensitive-field redaction.
 *
 * Redacted paths cover passwords, tokens, and authorization headers so they
 * can NEVER appear in log output regardless of where they originate.
 * The censor value '[REDACTED]' is chosen to be obvious in log review.
 *
 * In development, pino-pretty provides human-readable colored output.
 * In production, structured JSON is emitted for log aggregators.
 */
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'password',
      'passwordHash',
      'newPassword',
      'confirmPassword',
      'token',
      'tokenHash',
      'authorization',
      '*.password',
      '*.passwordHash',
      '*.newPassword',
      '*.token',
      '*.tokenHash',
      '*.authorization',
      'req.headers.authorization',
      'req.body.password',
      'req.body.newPassword',
      'req.body.confirmPassword',
      'req.body.token',
    ],
    censor: '[REDACTED]',
  },
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

export default logger;
