import { ReportsRepository } from './reports.repository.js';
import { round2, Decimal } from '../../core/money.js';

export class ReportsService {
  /**
   * Trial balance report:
   * Summarizes all debits and credits per account, asserts whether total debit equals total credit.
   */
  static async getTrialBalance(companyId: number, startDate?: Date, endDate?: Date) {
    const rawRows = await ReportsRepository.getTrialBalance(companyId, startDate, endDate);

    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    const accounts = rawRows.map((row) => {
      const debit = round2(new Decimal(row.totalDebit.toString()));
      const credit = round2(new Decimal(row.totalCredit.toString()));
      const netBalance = round2(debit.minus(credit));

      totalDebit = totalDebit.plus(debit);
      totalCredit = totalCredit.plus(credit);

      return {
        accountId: row.accountId,
        code: row.accountCode,
        name: row.accountName,
        type: row.accountType,
        group: row.accountGroup,
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        netBalance: netBalance.toFixed(2),
      };
    });

    const isBalanced = totalDebit.equals(totalCredit);
    const difference = round2(totalDebit.minus(totalCredit)).toFixed(2);

    return {
      accounts,
      totalDebit: totalDebit.toFixed(2),
      totalCredit: totalCredit.toFixed(2),
      isBalanced,
      difference,
    };
  }

  /**
   * Profit & Loss report:
   * Compares Income vs Expenses to produce Net Profit / Loss.
   */
  static async getProfitLoss(companyId: number, startDate?: Date, endDate?: Date) {
    const rawRows = await ReportsRepository.getProfitLoss(companyId, startDate, endDate);

    let totalIncome = new Decimal(0);
    let totalExpense = new Decimal(0);

    const incomeAccounts: any[] = [];
    const expenseAccounts: any[] = [];

    for (const row of rawRows) {
      const debit = round2(new Decimal(row.totalDebit.toString()));
      const credit = round2(new Decimal(row.totalCredit.toString()));

      if (row.accountType === 'INCOME') {
        // Income is normally credit
        const net = round2(credit.minus(debit));
        totalIncome = totalIncome.plus(net);
        incomeAccounts.push({
          accountId: row.accountId,
          code: row.accountCode,
          name: row.accountName,
          amount: net.toFixed(2),
        });
      } else {
        // Expense is normally debit
        const net = round2(debit.minus(credit));
        totalExpense = totalExpense.plus(net);
        expenseAccounts.push({
          accountId: row.accountId,
          code: row.accountCode,
          name: row.accountName,
          amount: net.toFixed(2),
        });
      }
    }

    const netProfit = round2(totalIncome.minus(totalExpense));

    return {
      incomeAccounts,
      totalIncome: totalIncome.toFixed(2),
      expenseAccounts,
      totalExpense: totalExpense.toFixed(2),
      netProfit: netProfit.toFixed(2),
    };
  }

  /**
   * Balance Sheet report:
   * Assets = Liabilities + Equity + Net Income (Current Year Earnings)
   */
  static async getBalanceSheet(companyId: number, asOfDate?: Date) {
    const rawRows = await ReportsRepository.getBalanceSheet(companyId, asOfDate);

    // Calculate current net income for balancing
    const pl = await this.getProfitLoss(companyId, undefined, asOfDate);
    const netIncomeCurrentPeriod = new Decimal(pl.netProfit);

    let totalAssets = new Decimal(0);
    let totalLiabilities = new Decimal(0);
    let totalEquity = new Decimal(0);

    const assets: any[] = [];
    const liabilities: any[] = [];
    const equity: any[] = [];

    for (const row of rawRows) {
      const debit = round2(new Decimal(row.totalDebit.toString()));
      const credit = round2(new Decimal(row.totalCredit.toString()));

      switch (row.accountType) {
        case 'ASSET':
        case 'BANK':
        case 'CASH': {
          const net = round2(debit.minus(credit));
          totalAssets = totalAssets.plus(net);
          assets.push({
            accountId: row.accountId,
            code: row.accountCode,
            name: row.accountName,
            amount: net.toFixed(2),
          });
          break;
        }
        case 'LIABILITY': {
          const net = round2(credit.minus(debit));
          totalLiabilities = totalLiabilities.plus(net);
          liabilities.push({
            accountId: row.accountId,
            code: row.accountCode,
            name: row.accountName,
            amount: net.toFixed(2),
          });
          break;
        }
        case 'CAPITAL': {
          const net = round2(credit.minus(debit));
          totalEquity = totalEquity.plus(net);
          equity.push({
            accountId: row.accountId,
            code: row.accountCode,
            name: row.accountName,
            amount: net.toFixed(2),
          });
          break;
        }
      }
    }

    // Include Net Income row in Equity / Liabilities side to balance
    equity.push({
      accountId: null,
      code: 'NET_INCOME',
      name: 'Current Period Earnings (Net Income)',
      amount: netIncomeCurrentPeriod.toFixed(2),
    });

    const totalEquityAndLiabilities = round2(totalLiabilities.plus(totalEquity).plus(netIncomeCurrentPeriod));
    const isBalanced = totalAssets.equals(totalEquityAndLiabilities);
    const difference = round2(totalAssets.minus(totalEquityAndLiabilities)).toFixed(2);

    return {
      assets,
      totalAssets: totalAssets.toFixed(2),
      liabilities,
      totalLiabilities: totalLiabilities.toFixed(2),
      equity,
      totalEquity: totalEquity.plus(netIncomeCurrentPeriod).toFixed(2),
      totalEquityAndLiabilities: totalEquityAndLiabilities.toFixed(2),
      isBalanced,
      difference,
    };
  }

  /**
   * General Ledger report:
   * Returns individual journal item details with running balance.
   */
  static async getGeneralLedger(companyId: number, accountId?: number, startDate?: Date, endDate?: Date) {
    const rawRows = await ReportsRepository.getGeneralLedger(companyId, accountId, startDate, endDate);

    let runningBalance = new Decimal(0);
    const transactions = rawRows.map((row) => {
      const debit = round2(new Decimal(row.debit.toString()));
      const credit = round2(new Decimal(row.credit.toString()));
      runningBalance = round2(runningBalance.plus(debit).minus(credit));

      return {
        itemId: row.itemId,
        entryId: row.entryId,
        entryNumber: row.entryNumber,
        entryDate: row.entryDate,
        reference: row.reference,
        accountId: row.accountId,
        accountCode: row.accountCode,
        accountName: row.accountName,
        partnerName: row.partnerName,
        label: row.label,
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        balance: runningBalance.toFixed(2),
      };
    });

    return { transactions };
  }
}
