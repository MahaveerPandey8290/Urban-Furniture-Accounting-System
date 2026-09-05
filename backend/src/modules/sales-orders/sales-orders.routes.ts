import { Router } from 'express';
import { SalesOrderController } from './sales-orders.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), SalesOrderController.create);
router.get('/', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), SalesOrderController.list);
router.get('/:id', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), SalesOrderController.get);
router.patch('/:id/confirm', requireRoles(['ADMIN', 'ACCOUNTANT']), SalesOrderController.confirm);
router.patch('/:id/cancel', requireRoles(['ADMIN', 'ACCOUNTANT']), SalesOrderController.cancel);

export default router;
