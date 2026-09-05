import { Decimal, round2 } from './money.js';
import type { PrismaTransactionClient, BudgetWarning } from '../types/index.js';

export interface BudgetLineInput {
  analyticAccountId: number;
  amount: string; // The amount being spent/earned
}

export class BudgetService {
  /**
   * Check budget warnings for a list of document lines.
   */
  static async checkBudgetWarnings(
    lines: BudgetLineInput[],
    documentDate: Date,
    companyId: number,
    client: PrismaTransactionClient
  ): Promise<BudgetWarning[]> {
    const warnings: BudgetWarning[] = [];
    
    // Process unique analytic accounts
    const analyticAccountIds = [...new Set(lines.map(l => l.analyticAccountId))];
    
    for (const analyticAccountId of analyticAccountIds) {
      // Total amount attempted in this transaction for this analytic account
      const attemptedAmountDec = lines
        .filter(l => l.analyticAccountId === analyticAccountId)
        .reduce((sum, line) => sum.plus(new Decimal(line.amount)), new Decimal(0));
      
      if (attemptedAmountDec.equals(0)) continue;

      // Find active budget containing this date
      const budgetLines = await client.budgetLine.findMany({
        where: {
          analyticAccountId,
          budget: {
            companyId,
            status: { in: ['CONFIRMED', 'REVISED'] },
            startDate: { lte: documentDate },
            endDate: { gte: documentDate },
          }
        },
        include: {
          budget: true,
          analyticAccount: true,
        }
      });

      for (const bl of budgetLines) {
        const achievedData = await this.computeAchieved(bl.budgetId, client);
        const achievedLine = achievedData.find(a => a.budgetLineId === bl.id);
        
        if (!achievedLine) continue;

        const committed = new Decimal(bl.committedAmount.toString());
        const achieved = new Decimal(achievedLine.achieved);
        const projected = achieved.plus(attemptedAmountDec);
        
        if (projected.greaterThan(committed)) {
          const excess = projected.minus(committed);
          warnings.push({
            analyticAccountName: bl.analyticAccount.name,
            committed: committed.toString(),
            achieved: achieved.toString(),
            attempted: attemptedAmountDec.toString(),
            excess: excess.toString(),
            message: "Exceeds Approved Budget. The entered amount is higher than the remaining budget amount for this budget line. Consider adjusting the value or revise the budget."
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Compute already achieved amount for all lines in a budget.
   */
  static async computeAchieved(
    budgetId: number,
    client: PrismaTransactionClient
  ): Promise<{ budgetLineId: number, analyticAccountId: number, committed: string, achieved: string, achievedPercent: string, amountToAchieve: string }[]> {
    const budget = await client.budget.findUnique({
      where: { id: budgetId },
      include: { lines: true }
    });

    if (!budget) return [];
    if (budget.status !== 'CONFIRMED' && budget.status !== 'REVISED') return [];

    const results = [];

    for (const line of budget.lines) {
      let achievedAmount = new Decimal(0);
      const { analyticAccountId, type, committedAmount } = line;

      if (type === 'INCOME') {
        const result = await client.$queryRaw<[{ sum: number | null }]>`
          SELECT SUM("lineTotal") as sum
          FROM "InvoiceLine" il
          JOIN "Invoice" i ON i.id = il."invoiceId"
          WHERE i."documentType" = 'CUSTOMER_INVOICE'
            AND i.status = 'CONFIRMED'
            AND i."companyId" = ${budget.companyId}
            AND i."invoiceDate" >= ${budget.startDate}
            AND i."invoiceDate" <= ${budget.endDate}
            AND il."analyticAccountId" = ${analyticAccountId}
        `;
        if (result[0]?.sum) achievedAmount = new Decimal(result[0].sum);
      } else if (type === 'EXPENSE') {
        const result = await client.$queryRaw<[{ sum: number | null }]>`
          SELECT SUM("lineTotal") as sum
          FROM "InvoiceLine" il
          JOIN "Invoice" i ON i.id = il."invoiceId"
          WHERE i."documentType" = 'VENDOR_BILL'
            AND i.status = 'CONFIRMED'
            AND i."companyId" = ${budget.companyId}
            AND i."invoiceDate" >= ${budget.startDate}
            AND i."invoiceDate" <= ${budget.endDate}
            AND il."analyticAccountId" = ${analyticAccountId}
        `;
        if (result[0]?.sum) achievedAmount = new Decimal(result[0].sum);
      }

      const committedDec = new Decimal(committedAmount.toString());
      const achievedPercent = committedDec.greaterThan(0)
        ? round2(achievedAmount.dividedBy(committedDec).times(100))
        : new Decimal(0);
      const amountToAchieve = committedDec.minus(achievedAmount);

      results.push({
        budgetLineId: line.id,
        analyticAccountId,
        committed: committedDec.toString(),
        achieved: achievedAmount.toString(),
        achievedPercent: achievedPercent.toString(),
        amountToAchieve: amountToAchieve.toString()
      });
    }

    return results;
  }
}
