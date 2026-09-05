import { Router } from 'express';
import { JournalEntryController } from './journal-entries.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalEntryController.create);
router.get('/', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalEntryController.list);
router.get('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalEntryController.get);
router.post('/:id/reverse', requireRoles(['ADMIN', 'ACCOUNTANT']), JournalEntryController.reverse);

export default router;
