import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { requireActive } from '../../middleware/requireActive.js';
import { requirePasswordSet } from '../../middleware/requirePasswordSet.js';
import { validate } from '../../middleware/validate.js';
import { CreateUserDto, RejectUserDto, UserIdParamDto } from './users.dto.js';

const router = Router();

// All user management routes require ADMIN
router.use(requireAuth, requireActive, requirePasswordSet, requireRole('ADMIN'));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Admin creates a user (returns one-time temp password)
 *     tags: [Users]
 */
router.post('/', validate(CreateUserDto), UsersController.createUser);

/**
 * @swagger
 * /users/pending:
 *   get:
 *     summary: List users awaiting approval
 *     tags: [Users]
 */
router.get('/pending', UsersController.listPending);

/**
 * @swagger
 * /users/{id}/approve:
 *   patch:
 *     summary: Approve a pending user
 *     tags: [Users]
 */
router.patch(
  '/:id/approve',
  validate(UserIdParamDto, 'params'),
  UsersController.approveUser
);

/**
 * @swagger
 * /users/{id}/reject:
 *   patch:
 *     summary: Reject a pending user (requires reason)
 *     tags: [Users]
 */
router.patch(
  '/:id/reject',
  validate(UserIdParamDto, 'params'),
  validate(RejectUserDto),
  UsersController.rejectUser
);

/**
 * @swagger
 * /users/{id}/suspend:
 *   patch:
 *     summary: Suspend a user
 *     tags: [Users]
 */
router.patch(
  '/:id/suspend',
  validate(UserIdParamDto, 'params'),
  UsersController.suspendUser
);

/**
 * @swagger
 * /users/{id}/reactivate:
 *   patch:
 *     summary: Reactivate a suspended or rejected user
 *     tags: [Users]
 */
router.patch(
  '/:id/reactivate',
  validate(UserIdParamDto, 'params'),
  UsersController.reactivateUser
);

export default router;
