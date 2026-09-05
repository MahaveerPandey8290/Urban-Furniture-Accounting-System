import { Router } from 'express';
import { InvoiceController } from './invoices.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), InvoiceController.create);
router.get('/', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), InvoiceController.list);
router.get('/:id', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), InvoiceController.get);
router.patch('/:id/confirm', requireRoles(['ADMIN', 'ACCOUNTANT']), InvoiceController.confirm);
router.patch('/:id/cancel', requireRoles(['ADMIN', 'ACCOUNTANT']), InvoiceController.cancel);

export default router;
