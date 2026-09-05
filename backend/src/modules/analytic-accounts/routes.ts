import { Router } from 'express';
import { AnalyticAccountController } from './controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), AnalyticAccountController.create);
router.get('/', requireRoles(['ADMIN', 'ACCOUNTANT']), AnalyticAccountController.findMany);
router.get('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), AnalyticAccountController.findById);
router.patch('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), AnalyticAccountController.update);
router.delete('/:id', requireRoles(['ADMIN']), AnalyticAccountController.delete);

export default router;
