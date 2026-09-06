import { Router } from 'express';
import { PaymentController } from './payments.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';
import { requireIdempotencyKey } from '../../middleware/idempotency.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), PaymentController.create);
router.get('/', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), PaymentController.list);
router.get('/:id', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), PaymentController.get);
router.patch('/:id/confirm', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), requireIdempotencyKey, PaymentController.confirm);
router.patch('/:id/cancel', requireRoles(['ADMIN', 'ACCOUNTANT']), PaymentController.cancel);

export default router;
