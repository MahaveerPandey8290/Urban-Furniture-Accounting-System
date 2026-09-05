import { Router } from 'express';
import { PurchaseOrderController } from './purchase-orders.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), PurchaseOrderController.create);
router.get('/', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), PurchaseOrderController.list);
router.get('/:id', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), PurchaseOrderController.get);
router.patch('/:id/confirm', requireRoles(['ADMIN', 'ACCOUNTANT']), PurchaseOrderController.confirm);
router.patch('/:id/cancel', requireRoles(['ADMIN', 'ACCOUNTANT']), PurchaseOrderController.cancel);

export default router;
