import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireActive } from '../../middleware/requireActive.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import {
  SignupDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './auth.dto.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Public signup (creates PENDING ACCOUNTANT user)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, loginId, email, password, confirmPassword]
 *             properties:
 *               name: { type: string }
 *               loginId: { type: string, minLength: 6, maxLength: 12 }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               confirmPassword: { type: string }
 *     responses:
 *       202:
 *         description: Signup submitted, awaiting admin approval
 */
router.post(
  '/signup',
  authLimiter,
  validate(SignupDto),
  AuthController.signup
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with loginId and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [loginId, password]
 *             properties:
 *               loginId: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Returns access token and refresh token
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not active
 */
router.post(
  '/login',
  authLimiter,
  validate(LoginDto),
  AuthController.login
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token and get new access token
 *     tags: [Auth]
 *     security: []
 */
router.post(
  '/refresh',
  validate(RefreshTokenDto),
  AuthController.refresh
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Revoke refresh token
 *     tags: [Auth]
 */
router.post(
  '/logout',
  validate(RefreshTokenDto),
  AuthController.logout
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     security: []
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(ForgotPasswordDto),
  AuthController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using one-time token
 *     tags: [Auth]
 *     security: []
 */
router.post(
  '/reset-password',
  validate(ResetPasswordDto),
  AuthController.resetPassword
);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password (authenticated, allowed even when mustChangePassword=true)
 *     tags: [Auth]
 */
router.post(
  '/change-password',
  requireAuth,
  requireActive,
  validate(ChangePasswordDto),
  AuthController.changePassword
);

export default router;
