import { Router } from 'express';
import { BudgetController } from './budgets.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles(['ADMIN', 'ACCOUNTANT']), BudgetController.create);
router.get('/', requireRoles(['ADMIN', 'ACCOUNTANT']), BudgetController.list);
router.get('/:id', requireRoles(['ADMIN', 'ACCOUNTANT']), BudgetController.get);
router.get('/:id/performance', requireRoles(['ADMIN', 'ACCOUNTANT']), BudgetController.getPerformance);
router.patch('/:id/confirm', requireRoles(['ADMIN']), BudgetController.confirm);
router.patch('/:id/revise', requireRoles(['ADMIN']), BudgetController.revise);
router.patch('/:id/cancel', requireRoles(['ADMIN']), BudgetController.cancel);

export default router;
