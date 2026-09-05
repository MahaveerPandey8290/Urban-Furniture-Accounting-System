import { Router } from 'express';
import { ProductCategoryController } from './controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), ProductCategoryController.create);
router.get('/', ProductCategoryController.findAll);
router.get('/:id', ProductCategoryController.findOne);
router.patch('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), ProductCategoryController.update);
router.delete('/:id', requireRoles(['ADMIN']), ProductCategoryController.delete);

export default router;
