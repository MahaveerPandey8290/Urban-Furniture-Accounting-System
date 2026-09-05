import { Router } from 'express';
import { ContactController } from './controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), ContactController.create);
router.get('/', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), ContactController.findAll);
router.get('/:id', requireRoles(['ADMIN', 'ACCOUNTANT', 'CONTACT']), ContactController.findOne);
router.patch('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), ContactController.update);
router.delete('/:id', requireRoles(['ADMIN']), ContactController.delete);

export default router;
