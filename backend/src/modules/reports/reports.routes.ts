import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /reports/trial-balance:
 *   get:
 *     summary: Retrieve trial balance report
 *     tags: [Reports]
 */
router.get('/trial-balance', requireRoles(['ADMIN', 'ACCOUNTANT']), ReportsController.getTrialBalance);

/**
 * @swagger
 * /reports/profit-loss:
 *   get:
 *     summary: Retrieve Profit and Loss statement
 *     tags: [Reports]
 */
router.get('/profit-loss', requireRoles(['ADMIN', 'ACCOUNTANT']), ReportsController.getProfitLoss);

/**
 * @swagger
 * /reports/balance-sheet:
 *   get:
 *     summary: Retrieve Balance Sheet report
 *     tags: [Reports]
 */
router.get('/balance-sheet', requireRoles(['ADMIN', 'ACCOUNTANT']), ReportsController.getBalanceSheet);

/**
 * @swagger
 * /reports/general-ledger:
 *   get:
 *     summary: Retrieve General Ledger transaction register
 *     tags: [Reports]
 */
router.get('/general-ledger', requireRoles(['ADMIN', 'ACCOUNTANT']), ReportsController.getGeneralLedger);

export default router;
