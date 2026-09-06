import { Router } from 'express';
import { AccountController } from './controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), AccountController.create);
router.get('/', AccountController.findMany);
router.get('/:id', AccountController.findById);
router.patch('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), AccountController.update);
router.put('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), AccountController.update);
router.delete('/:id', requireRoles(['ADMIN']), AccountController.delete);

export default router;
