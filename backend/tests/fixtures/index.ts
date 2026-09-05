/**
 * Integration test fixtures.
 *
 * Shared helpers for creating test data and cleaning up between tests.
 * Uses a real local PostgreSQL test database (TEST_DATABASE_URL).
 *
 * NEVER use these fixtures against the production database.
 */

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env['DATABASE_URL'],
    },
  },
});

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

/**
 * Truncate all business tables between tests.
 * Order matters — FK constraints require deleting children before parents.
 */
export async function truncateAll(): Promise<void> {
  await testPrisma.$executeRaw`
    TRUNCATE TABLE
      "AuditLog",
      "BudgetLine",
      "Budget",
      "InvoiceLine",
      "Payment",
      "Invoice",
      "SalesOrderLine",
      "SalesOrder",
      "PurchaseOrderLine",
      "PurchaseOrder",
      "JournalItem",
      "JournalEntry",
      "DocumentSequence",
      "Journal",
      "Tax",
      "Product",
      "ProductCategory",
      "AnalyticAccount",
      "PasswordHistory",
      "PasswordResetToken",
      "RefreshToken",
      "Account",
      "Contact",
      "User",
      "Company"
    RESTART IDENTITY CASCADE
  `;
}

/**
 * Seed minimal test data: 1 company + 4 accounts + 1 journal + 1 admin user.
 * Returns the IDs for use in tests.
 */
export async function seedMinimal() {
  const company = await testPrisma.company.create({
    data: { name: 'Test Co', currency: 'INR', fiscalYearStartMonth: 4 },
  });

  const bankAccount = await testPrisma.account.create({
    data: { companyId: company.id, code: '1001', name: 'Bank A/c', type: 'BANK', group: 'BALANCE_SHEET' },
  });
  const capitalAccount = await testPrisma.account.create({
    data: { companyId: company.id, code: '3001', name: 'Capital A/c', type: 'CAPITAL', group: 'BALANCE_SHEET' },
  });
  const salesAccount = await testPrisma.account.create({
    data: { companyId: company.id, code: '4001', name: 'Sales Income A/c', type: 'INCOME', group: 'PROFIT_AND_LOSS' },
  });
  const debtorsAccount = await testPrisma.account.create({
    data: { companyId: company.id, code: '1100', name: 'Debtors A/c', type: 'ASSET', group: 'BALANCE_SHEET' },
  });

  const bankJournal = await testPrisma.journal.create({
    data: {
      companyId: company.id,
      name: 'Bank Journal',
      code: 'BANK',
      type: 'BANK',
      defaultAccountId: bankAccount.id,
      sequencePrefix: 'BNK',
    },
  });

  const adminHash = await argon2.hash('Admin@1234', ARGON2_OPTIONS);
  const adminUser = await testPrisma.user.create({
    data: {
      companyId: company.id,
      name: 'Test Admin',
      loginId: 'testadmin',
      email: 'admin@test.local',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });

  return {
    company,
    bankAccount,
    capitalAccount,
    salesAccount,
    debtorsAccount,
    bankJournal,
    adminUser,
  };
}
