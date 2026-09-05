import { Router } from 'express';
import { TaxController } from './controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), TaxController.create);
router.get('/', TaxController.findMany);
router.get('/:id', TaxController.findById);
router.patch('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), TaxController.update);
router.delete('/:id', requireRoles(['ADMIN']), TaxController.delete);

export default router;
