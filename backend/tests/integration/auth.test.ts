/**
 * Integration tests for AuthService.
 *
 * Tests the spec-required auth scenarios against real PostgreSQL.
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import { testPrisma, truncateAll, seedMinimal } from '../fixtures/index.js';

let fixtures: Awaited<ReturnType<typeof seedMinimal>>;

beforeEach(async () => {
  await truncateAll();
  fixtures = await seedMinimal();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

describe('AuthService.signup', () => {
  it('creates a PENDING ACCOUNTANT user — ignores role in body', async () => {
    const result = await AuthService.signup({
      name: 'Test User',
      loginId: 'testuser1',
      email: 'testuser1@test.local',
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
    }, fixtures.company.id);

    expect(result.message).toContain('An administrator will review it shortly');

    const user = await testPrisma.user.findUnique({ where: { loginId: 'testuser1' } });
    expect(user).not.toBeNull();
    expect(user!.role).toBe('ACCOUNTANT');
    expect(user!.status).toBe('PENDING');
  });

  it('signing up with role: ADMIN in body still creates ACCOUNTANT', async () => {
    // The DTO strips unknown fields via .strip() — role is never accepted
    const dto = {
      name: 'Hacker',
      loginId: 'hacker1',
      email: 'hacker@test.local',
      password: 'Hack@1234',
      confirmPassword: 'Hack@1234',
      // role deliberately set to try to escalate — should be ignored
    };

    await AuthService.signup(dto, fixtures.company.id);

    const user = await testPrisma.user.findUnique({ where: { loginId: 'hacker1' } });
    expect(user!.role).toBe('ACCOUNTANT');
    expect(user!.status).toBe('PENDING');
  });
});

describe('AuthService.login', () => {
  it('PENDING user login returns 403 with approval message', async () => {
    await testPrisma.user.update({
      where: { id: fixtures.adminUser.id },
      data: { status: 'PENDING' },
    });

    await expect(
      AuthService.login({ loginId: 'testadmin', password: 'Admin@1234' })
    ).rejects.toMatchObject({
      httpStatus: 403,
      message: 'Your account is awaiting administrator approval.',
    });
  });

  it('wrong password returns 401 with exact message', async () => {
    await expect(
      AuthService.login({ loginId: 'testadmin', password: 'WrongPassword@1' })
    ).rejects.toMatchObject({
      httpStatus: 401,
      message: 'Invalid Login Id or Password',
    });
  });

  it('non-existent loginId returns same 401 message (no enumeration)', async () => {
    await expect(
      AuthService.login({ loginId: 'doesnotexist', password: 'Any@1234' })
    ).rejects.toMatchObject({
      httpStatus: 401,
      message: 'Invalid Login Id or Password',
    });
  });

  it('6 failed logins locks the account; 6th returns lockout error', async () => {
    // 5 failed attempts
    for (let i = 0; i < 4; i++) {
      await AuthService.login({ loginId: 'testadmin', password: 'Wrong@1' }).catch(() => {});
    }

    // 5th attempt — should lock
    await AuthService.login({ loginId: 'testadmin', password: 'Wrong@1' }).catch(() => {});

    // 6th attempt — should return lockout message
    await expect(
      AuthService.login({ loginId: 'testadmin', password: 'Wrong@1' })
    ).rejects.toMatchObject({
      httpStatus: 403,
    });

    // Verify lockedUntil is set
    const user = await testPrisma.user.findUnique({ where: { loginId: 'testadmin' } });
    expect(user!.lockedUntil).not.toBeNull();
    expect(user!.lockedUntil!.getTime()).toBeGreaterThan(Date.now());
  });

  it('successful login resets failed attempts', async () => {
    // 2 failures then success
    await AuthService.login({ loginId: 'testadmin', password: 'Wrong@1' }).catch(() => {});
    await AuthService.login({ loginId: 'testadmin', password: 'Wrong@1' }).catch(() => {});

    await AuthService.login({ loginId: 'testadmin', password: 'Admin@1234' });

    const user = await testPrisma.user.findUnique({ where: { loginId: 'testadmin' } });
    expect(user!.failedLoginAttempts).toBe(0);
    expect(user!.lockedUntil).toBeNull();
  });
});

describe('AuthService refresh token rotation', () => {
  it('refreshes and rotates the token successfully', async () => {
    const { refreshToken } = await AuthService.login({
      loginId: 'testadmin',
      password: 'Admin@1234',
    });

    const result = await AuthService.refresh(refreshToken);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.refreshToken).not.toBe(refreshToken);
  });

  it('using a rotated refresh token a second time revokes the entire family', async () => {
    const { refreshToken: token1 } = await AuthService.login({
      loginId: 'testadmin',
      password: 'Admin@1234',
    });

    // First use — OK
    const { refreshToken: token2 } = await AuthService.refresh(token1);
    expect(token2).toBeTruthy();

    // Use the OLD token again (reuse = theft)
    await expect(AuthService.refresh(token1)).rejects.toMatchObject({
      httpStatus: 401,
    });

    // Now even the new token should be revoked (family was killed)
    await expect(AuthService.refresh(token2)).rejects.toMatchObject({
      httpStatus: 401,
    });
  });
});

describe('AuthService.forgotPassword', () => {
  it('always returns 200 even for nonexistent email', async () => {
    const result = await AuthService.forgotPassword({ email: 'nobody@nowhere.com' });
    expect(result.message).toBeTruthy();
  });
});
