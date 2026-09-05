/**
 * Global test setup for Vitest.
 *
 * For integration tests: ensure TEST_DATABASE_URL is set.
 * For unit tests: no DB required.
 *
 * Integration tests use the real local PostgreSQL database.
 * They truncate tables between tests (not drop/recreate — much faster).
 */

import { beforeAll, afterAll } from 'vitest';

// Silence pino in test runs (already set level: 'silent' when NODE_ENV=test)
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] =
  process.env['TEST_DATABASE_URL'] ??
  process.env['DATABASE_URL'] ??
  'postgresql://postgres:password@localhost:5432/urbanfurniture_test';

// JWT secrets for tests
process.env['JWT_ACCESS_SECRET'] = 'test-access-secret-minimum-32-chars-long!!';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-minimum-32-chars-long!';

beforeAll(async () => {
  // Any global test setup can go here
});

afterAll(async () => {
  // Clean up any global resources
});
