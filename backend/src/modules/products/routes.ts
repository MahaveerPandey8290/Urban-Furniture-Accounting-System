import { Router } from 'express';
import { ProductController } from './controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), ProductController.create);
router.get('/', ProductController.findAll);
router.get('/:id', ProductController.findOne);
router.patch('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), ProductController.update);
router.put('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), ProductController.update);
router.delete('/:id', requireRoles(['ADMIN']), ProductController.delete);

export default router;
