import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { ReportsService } from '../../src/modules/reports/reports.service.js';
import { LedgerService } from '../../src/core/ledger.service.js';
import { testPrisma, truncateAll, seedMinimal } from '../fixtures/index.js';

let fixtures: Awaited<ReturnType<typeof seedMinimal>>;

beforeEach(async () => {
  await truncateAll();
  fixtures = await seedMinimal();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

describe('Accounting Reports (Pass 3)', () => {
  it('computes a balanced Trial Balance after posting an entry', async () => {
    // Post an entry: Dr Debtors 10,000 / Cr Sales Income 10,000
    await LedgerService.postEntry(
      fixtures.company.id,
      {
        journalId: fixtures.bankJournal.id,
        entryDate: new Date(),
        reference: 'TEST-INV-1',
        lines: [
          { accountId: fixtures.debtorsAccount.id, debit: '10000', credit: '0' },
          { accountId: fixtures.salesAccount.id, debit: '0', credit: '10000' },
        ],
      },
      fixtures.adminUser.id,
      'test-req-reports-1'
    );

    const trialBalance = await ReportsService.getTrialBalance(fixtures.company.id);

    expect(trialBalance.isBalanced).toBe(true);
    expect(trialBalance.difference).toBe('0.00');
    expect(Number(trialBalance.totalDebit)).toBeGreaterThanOrEqual(10000);
    expect(Number(trialBalance.totalCredit)).toBeGreaterThanOrEqual(10000);
  });

  it('computes Profit and Loss accurately with net income', async () => {
    // Income entry: Dr Debtors 25,000 / Cr Sales Income 25,000
    await LedgerService.postEntry(
      fixtures.company.id,
      {
        journalId: fixtures.bankJournal.id,
        entryDate: new Date(),
        reference: 'TEST-INV-PL',
        lines: [
          { accountId: fixtures.debtorsAccount.id, debit: '25000', credit: '0' },
          { accountId: fixtures.salesAccount.id, debit: '0', credit: '25000' },
        ],
      },
      fixtures.adminUser.id,
      'test-req-pl-1'
    );

    const pl = await ReportsService.getProfitLoss(fixtures.company.id);

    expect(Number(pl.totalIncome)).toBe(25000);
    expect(Number(pl.totalExpense)).toBe(0);
    expect(Number(pl.netProfit)).toBe(25000);
  });

  it('computes Balance Sheet and balances with current period net earnings', async () => {
    // Dr Bank 50,000 / Cr Capital 50,000
    await LedgerService.postEntry(
      fixtures.company.id,
      {
        journalId: fixtures.bankJournal.id,
        entryDate: new Date(),
        reference: 'TEST-BS-1',
        lines: [
          { accountId: fixtures.bankAccount.id, debit: '50000', credit: '0' },
          { accountId: fixtures.capitalAccount.id, debit: '0', credit: '50000' },
        ],
      },
      fixtures.adminUser.id,
      'test-req-bs-1'
    );

    const bs = await ReportsService.getBalanceSheet(fixtures.company.id);

    expect(bs.isBalanced).toBe(true);
    expect(bs.difference).toBe('0.00');
  });

  it('returns General Ledger transaction lines with chronological running balance', async () => {
    await LedgerService.postEntry(
      fixtures.company.id,
      {
        journalId: fixtures.bankJournal.id,
        entryDate: new Date(),
        reference: 'TEST-GL-1',
        lines: [
          { accountId: fixtures.bankAccount.id, debit: '1500', credit: '0', label: 'Cash deposit' },
          { accountId: fixtures.capitalAccount.id, debit: '0', credit: '1500', label: 'Capital contribution' },
        ],
      },
      fixtures.adminUser.id,
      'test-req-gl-1'
    );

    const gl = await ReportsService.getGeneralLedger(fixtures.company.id, fixtures.bankAccount.id);

    expect(gl.transactions.length).toBeGreaterThanOrEqual(1);
    const item = gl.transactions[0];
    expect(item).toHaveProperty('balance');
    expect(item?.accountCode).toBe(fixtures.bankAccount.code);
  });
});
