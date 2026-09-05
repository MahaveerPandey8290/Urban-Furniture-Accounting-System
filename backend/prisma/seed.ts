/**
 * Idempotent seed script.
 * Safe to run multiple times — uses upsert/findFirst to avoid duplicates.
 *
 * Run: npm run seed
 *
 * Creates:
 *  - 1 Company
 *  - 1 Admin user (from env vars)
 *  - 1 Accountant user (demo)
 *  - 8 Accounts (Chart of Accounts)
 *  - 4 Journals
 *  - 1 Tax (No Tax, 0%)
 *  - 2 Contacts with portal users (Vendor + Customer)
 *  - 4 Products
 *  - 2 Analytic Accounts
 *  - 1 Confirmed Budget
 *  - 1 Opening journal entry (Dr Bank 500000, Cr Capital 500000)
 */

import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$%';
  let pw = 'Aa1@';
  for (let i = 0; i < 8; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Company ────────────────────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: process.env['SEED_COMPANY_NAME'] ?? 'Urban Furniture Pvt Ltd',
      legalName: process.env['SEED_COMPANY_NAME'] ?? 'Urban Furniture Pvt Ltd',
      currency: 'INR',
      fiscalYearStartMonth: 4,
    },
  });
  console.log(`✅ Company: ${company.name}`);

  // ─── Accounts (Chart of Accounts) ───────────────────────────────────────────
  const accountDefs = [
    { code: '1001', name: 'Bank A/c',              type: 'BANK' as const,         group: 'BALANCE_SHEET' as const },
    { code: '1002', name: 'Cash A/c',              type: 'CASH' as const,         group: 'BALANCE_SHEET' as const },
    { code: '1100', name: 'Debtors A/c',           type: 'ASSET' as const,        group: 'BALANCE_SHEET' as const },
    { code: '2100', name: 'Creditors A/c',         type: 'LIABILITY' as const,    group: 'BALANCE_SHEET' as const },
    { code: '4001', name: 'Sales Income A/c',      type: 'INCOME' as const,       group: 'PROFIT_AND_LOSS' as const },
    { code: '5001', name: 'Purchase Expense A/c',  type: 'EXPENSE' as const,      group: 'PROFIT_AND_LOSS' as const },
    { code: '5002', name: 'Other Expense A/c',     type: 'OTHER_EXPENSE' as const, group: 'PROFIT_AND_LOSS' as const },
    { code: '3001', name: 'Capital A/c',           type: 'CAPITAL' as const,      group: 'BALANCE_SHEET' as const },
  ];

  const accounts: Record<string, number> = {};
  for (const acc of accountDefs) {
    const record = await prisma.account.upsert({
      where: { companyId_code: { companyId: company.id, code: acc.code } },
      update: {},
      create: { companyId: company.id, ...acc, isArchived: false },
    });
    accounts[acc.name] = record.id;
    console.log(`  ✅ Account: ${acc.name}`);
  }

  // ─── Tax ────────────────────────────────────────────────────────────────────
  const noTax = await prisma.tax.upsert({
    where: { id: 1 },
    update: {},
    create: { companyId: company.id, name: 'No Tax', rate: 0, scope: 'BOTH', isArchived: false },
  });
  console.log(`✅ Tax: ${noTax.name}`);

  // ─── Journals ───────────────────────────────────────────────────────────────
  const journalDefs = [
    { name: 'Sales Journal',    code: 'SALES', type: 'SALES' as const,    prefix: 'INV',  accountKey: 'Sales Income A/c' },
    { name: 'Purchase Journal', code: 'PURCH', type: 'PURCHASE' as const, prefix: 'BILL', accountKey: 'Purchase Expense A/c' },
    { name: 'Bank Journal',     code: 'BANK',  type: 'BANK' as const,     prefix: 'BNK',  accountKey: 'Bank A/c' },
    { name: 'Cash Journal',     code: 'CASH',  type: 'CASH' as const,     prefix: 'CSH',  accountKey: 'Cash A/c' },
  ];

  const journals: Record<string, number> = {};
  for (const j of journalDefs) {
    const record = await prisma.journal.upsert({
      where: { id: journalDefs.indexOf(j) + 1 },
      update: {},
      create: {
        companyId: company.id,
        name: j.name,
        code: j.code,
        type: j.type,
        defaultAccountId: accounts[j.accountKey],
        sequencePrefix: j.prefix,
        isArchived: false,
      },
    });
    journals[j.name] = record.id;
    console.log(`  ✅ Journal: ${j.name}`);
  }

  // ─── Admin user ─────────────────────────────────────────────────────────────
  const adminLoginId = process.env['SEED_ADMIN_LOGIN_ID'] ?? 'admin001';
  const adminPassword = process.env['SEED_ADMIN_PASSWORD'] ?? 'Admin@1234';
  const adminHash = await argon2.hash(adminPassword, ARGON2_OPTIONS);

  const admin = await prisma.user.upsert({
    where: { loginId: adminLoginId },
    update: {},
    create: {
      companyId: company.id,
      name: 'System Admin',
      loginId: adminLoginId,
      email: 'admin@urbanfurniture.local',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });
  console.log(`✅ Admin user: ${admin.loginId}`);

  // ─── Demo Accountant ─────────────────────────────────────────────────────────
  const acctHash = await argon2.hash('Acct@1234', ARGON2_OPTIONS);
  await prisma.user.upsert({
    where: { loginId: 'acct001' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Demo Accountant',
      loginId: 'acct001',
      email: 'accountant@urbanfurniture.local',
      passwordHash: acctHash,
      role: 'ACCOUNTANT',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });
  console.log('✅ Demo Accountant: acct001 / Acct@1234');

  // ─── Contacts with portal users ──────────────────────────────────────────────
  const vendorContact = await prisma.contact.upsert({
    where: { companyId_email: { companyId: company.id, email: 'rahul@vendor.local' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Rahul Sharma',
      type: 'VENDOR',
      email: 'rahul@vendor.local',
      mobile: '9876543210',
      payableAccountId: accounts['Creditors A/c'],
    },
  });
  const vendorPortalPass = generateTempPassword();
  const vendorPortalHash = await argon2.hash(vendorPortalPass, ARGON2_OPTIONS);
  await prisma.user.upsert({
    where: { loginId: 'rahul_v' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Rahul Sharma',
      loginId: 'rahul_v',
      email: 'rahuluser@vendor.local',
      passwordHash: vendorPortalHash,
      role: 'CONTACT',
      status: 'ACTIVE',
      mustChangePassword: true,
      contactId: vendorContact.id,
    },
  });
  console.log(`✅ Vendor Contact: Rahul Sharma (portal: rahul_v / ${vendorPortalPass})`);

  const customerContact = await prisma.contact.upsert({
    where: { companyId_email: { companyId: company.id, email: 'nimesh@customer.local' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Nimesh Pathak',
      type: 'CUSTOMER',
      email: 'nimesh@customer.local',
      mobile: '9876543211',
      receivableAccountId: accounts['Debtors A/c'],
    },
  });
  const custPortalPass = generateTempPassword();
  const custPortalHash = await argon2.hash(custPortalPass, ARGON2_OPTIONS);
  await prisma.user.upsert({
    where: { loginId: 'nimesh_c' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Nimesh Pathak',
      loginId: 'nimesh_c',
      email: 'nimeshuser@customer.local',
      passwordHash: custPortalHash,
      role: 'CONTACT',
      status: 'ACTIVE',
      mustChangePassword: true,
      contactId: customerContact.id,
    },
  });
  console.log(`✅ Customer Contact: Nimesh Pathak (portal: nimesh_c / ${custPortalPass})`);

  // ─── Product Category ────────────────────────────────────────────────────────
  const furnitureCategory = await prisma.productCategory.upsert({
    where: { id: 1 },
    update: {},
    create: { companyId: company.id, name: 'Furniture', isArchived: false },
  });

  // ─── Products ────────────────────────────────────────────────────────────────
  const productDefs = [
    { name: 'Office Chair',  salesPrice: 5000, cost: 3000 },
    { name: 'Wooden Table',  salesPrice: 12000, cost: 8000 },
    { name: 'Sofa',          salesPrice: 25000, cost: 18000 },
    { name: 'Dining Table',  salesPrice: 15000, cost: 10000 },
  ];

  for (const p of productDefs) {
    await prisma.product.upsert({
      where: { id: productDefs.indexOf(p) + 1 },
      update: {},
      create: {
        companyId: company.id,
        name: p.name,
        type: 'GOODS',
        categoryId: furnitureCategory.id,
        salesPrice: p.salesPrice,
        cost: p.cost,
        salesAccountId: accounts['Sales Income A/c'],
        purchaseAccountId: accounts['Purchase Expense A/c'],
        salesTaxId: noTax.id,
        purchaseTaxId: noTax.id,
        isArchived: false,
      },
    });
    console.log(`  ✅ Product: ${p.name}`);
  }

  // ─── Analytic Accounts ───────────────────────────────────────────────────────
  const analyticProject = await prisma.analyticAccount.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Project 1' } },
    update: {},
    create: { companyId: company.id, name: 'Project 1', type: 'INCOME', isArchived: false },
  });
  const analyticFurniture = await prisma.analyticAccount.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Furniture' } },
    update: {},
    create: { companyId: company.id, name: 'Furniture', type: 'EXPENSE', isArchived: false },
  });
  console.log('✅ Analytic Accounts: Project 1, Furniture');

  // ─── Budget ──────────────────────────────────────────────────────────────────
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const existingBudget = await prisma.budget.findFirst({
    where: { companyId: company.id, name: 'Monthly Furniture Budget' },
  });

  if (!existingBudget) {
    const budget = await prisma.budget.create({
      data: {
        companyId: company.id,
        name: 'Monthly Furniture Budget',
        startDate,
        endDate,
        responsibleId: customerContact.id,
        status: 'CONFIRMED',
        createdById: admin.id,
        lines: {
          create: [
            { analyticAccountId: analyticFurniture.id, type: 'EXPENSE', committedAmount: 200000 },
          ],
        },
      },
    });
    console.log(`✅ Budget: ${budget.name} (₹200,000)`);
  } else {
    console.log('✅ Budget already exists, skipping');
  }

  // ─── Opening journal entry ────────────────────────────────────────────────────
  // Dr Bank 500000, Cr Capital 500000
  const existingEntry = await prisma.journalEntry.findFirst({
    where: { companyId: company.id, narration: 'Opening Balance' },
  });

  if (!existingEntry) {
    const bankJournal = await prisma.journal.findFirst({
      where: { companyId: company.id, code: 'BANK' },
    });

    if (bankJournal) {
      // Acquire sequence via advisory lock pattern (simplified for seed)
      await prisma.$transaction(async (tx) => {
        const lockKey = `${company.id}:${bankJournal.id}:${now.getFullYear()}`;
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

        const seq = await tx.documentSequence.upsert({
          where: {
            companyId_journalId_year: {
              companyId: company.id,
              journalId: bankJournal.id,
              year: now.getFullYear(),
            },
          },
          create: { companyId: company.id, journalId: bankJournal.id, year: now.getFullYear(), nextNumber: 2 },
          update: { nextNumber: { increment: 1 } },
        });

        const number = `BNK/${now.getFullYear()}/${String(seq.nextNumber - 1).padStart(4, '0')}`;

        await tx.journalEntry.create({
          data: {
            companyId: company.id,
            journalId: bankJournal.id,
            number,
            entryDate: new Date(),
            narration: 'Opening Balance',
            status: 'POSTED',
            totalDebit: 500000,
            totalCredit: 500000,
            postedById: admin.id,
            postedAt: new Date(),
            items: {
              create: [
                { accountId: accounts['Bank A/c']!,    debit: 500000, credit: 0, label: 'Opening Bank Balance', sequence: 0 },
                { accountId: accounts['Capital A/c']!, debit: 0, credit: 500000, label: 'Opening Capital',       sequence: 1 },
              ],
            },
          },
        });
      });
      console.log('✅ Opening entry: Dr Bank ₹5,00,000 / Cr Capital ₹5,00,000');
    }
  } else {
    console.log('✅ Opening entry already exists, skipping');
  }

  console.log('\n🎉 Seed complete!\n');
  console.log('─── Seeded Credentials ───────────────────────────────────────');
  console.log(`Admin:      loginId=${adminLoginId}  password=${adminPassword}`);
  console.log('Accountant: loginId=acct001          password=Acct@1234');
  console.log('─────────────────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
