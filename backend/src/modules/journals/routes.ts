import { Router } from 'express';
import { JournalController } from './controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalController.create);
router.get('/', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalController.findMany);
router.get('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalController.findById);
router.patch('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalController.update);
router.put('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalController.update);
router.delete('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalController.delete);

export default router;
