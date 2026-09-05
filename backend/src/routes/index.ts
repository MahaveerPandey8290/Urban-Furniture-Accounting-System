import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { prisma } from '../config/prisma.js';
import logger from '../config/logger.js';

// Module routes — imported as they are built in later passes
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/users.routes.js';
import purchaseOrderRoutes from '../modules/purchase-orders/purchase-orders.routes.js';
import salesOrderRoutes from '../modules/sales-orders/sales-orders.routes.js';
import invoiceRoutes from '../modules/invoices/invoices.routes.js';
import paymentRoutes from '../modules/payments/payments.routes.js';
import journalEntryRoutes from '../modules/journal-entries/journal-entries.routes.js';
import budgetRoutes from '../modules/budgets/budgets.routes.js';
import contactsRouter from '../modules/contacts/routes.js';
import productCategoriesRouter from '../modules/product-categories/routes.js';
import productsRouter from '../modules/products/routes.js';
import accountsRouter from '../modules/accounts/routes.js';
import taxesRouter from '../modules/taxes/routes.js';
import journalsRouter from '../modules/journals/routes.js';
import analyticAccountsRouter from '../modules/analytic-accounts/routes.js';
import reportsRouter from '../modules/reports/reports.routes.js';

const router = Router();

// ─── Health ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic liveness check
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is running
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    version: process.env['npm_package_version'] ?? '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check — verifies database connectivity
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Database is unavailable
 */
router.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', db: 'connected' });
  } catch (err) {
    logger.error({ err }, 'Database readiness check failed');
    res.status(503).json({ status: 'not_ready', db: 'disconnected' });
  }
});

// ─── Swagger ──────────────────────────────────────────────────────────────────

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Urban Furniture Accounting System API',
      version: '1.0.0',
      description:
        'Production-grade double-entry accounting system. ' +
        'All monetary values are returned as strings to preserve decimal precision.',
    },
    servers: [{ url: '/api', description: 'Main API' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token from POST /auth/login. Valid for 15 minutes.',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/routes/*.ts'],
});

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
router.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// ─── Module routes ────────────────────────────────────────────────────────────

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/journal-entries', journalEntryRoutes);
router.use('/budgets', budgetRoutes);
router.use('/contacts', contactsRouter);
router.use('/product-categories', productCategoriesRouter);
router.use('/products', productsRouter);
router.use('/accounts', accountsRouter);
router.use('/taxes', taxesRouter);
router.use('/journals', journalsRouter);
router.use('/analytic-accounts', analyticAccountsRouter);
router.use('/reports', reportsRouter);

export default router;
