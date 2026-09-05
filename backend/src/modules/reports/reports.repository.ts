import prisma from '../../config/prisma.js';
import { Prisma } from '@prisma/client';

export class ReportsRepository {
  /**
   * Trial Balance query:
   * Aggregates sum of debit and credit grouped by account from posted journal entries only.
   */
  static async getTrialBalance(companyId: number, startDate?: Date, endDate?: Date) {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`je."companyId" = ${companyId}`,
      Prisma.sql`je.status = 'POSTED'`,
    ];

    if (startDate) {
      conditions.push(Prisma.sql`je."entryDate" >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(Prisma.sql`je."entryDate" <= ${endDate}`);
    }

    const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

    return prisma.$queryRaw<
      Array<{
        accountId: number;
        accountCode: string;
        accountName: string;
        accountType: string;
        accountGroup: string;
        totalDebit: string | number;
        totalCredit: string | number;
      }>
    >`
      SELECT 
        a.id AS "accountId",
        a.code AS "accountCode",
        a.name AS "accountName",
        a.type AS "accountType",
        a."group" AS "accountGroup",
        COALESCE(SUM(ji.debit), 0) AS "totalDebit",
        COALESCE(SUM(ji.credit), 0) AS "totalCredit"
      FROM "Account" a
      LEFT JOIN "JournalItem" ji ON ji."accountId" = a.id
      LEFT JOIN "JournalEntry" je ON je.id = ji."entryId"
      ${whereClause}
      GROUP BY a.id, a.code, a.name, a.type, a."group"
      ORDER BY a.code ASC
    `;
  }

  /**
   * Profit & Loss query:
   * Selects posted journal items for INCOME, EXPENSE, and OTHER_EXPENSE accounts.
   */
  static async getProfitLoss(companyId: number, startDate?: Date, endDate?: Date) {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`je."companyId" = ${companyId}`,
      Prisma.sql`je.status = 'POSTED'`,
      Prisma.sql`a."group" = 'PROFIT_AND_LOSS'`,
    ];

    if (startDate) {
      conditions.push(Prisma.sql`je."entryDate" >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(Prisma.sql`je."entryDate" <= ${endDate}`);
    }

    const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

    return prisma.$queryRaw<
      Array<{
        accountId: number;
        accountCode: string;
        accountName: string;
        accountType: string;
        totalDebit: string | number;
        totalCredit: string | number;
      }>
    >`
      SELECT 
        a.id AS "accountId",
        a.code AS "accountCode",
        a.name AS "accountName",
        a.type AS "accountType",
        COALESCE(SUM(ji.debit), 0) AS "totalDebit",
        COALESCE(SUM(ji.credit), 0) AS "totalCredit"
      FROM "Account" a
      LEFT JOIN "JournalItem" ji ON ji."accountId" = a.id
      LEFT JOIN "JournalEntry" je ON je.id = ji."entryId"
      ${whereClause}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code ASC
    `;
  }

  /**
   * Balance Sheet query:
   * Selects posted journal items for BALANCE_SHEET group accounts.
   */
  static async getBalanceSheet(companyId: number, asOfDate?: Date) {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`je."companyId" = ${companyId}`,
      Prisma.sql`je.status = 'POSTED'`,
      Prisma.sql`a."group" = 'BALANCE_SHEET'`,
    ];

    if (asOfDate) {
      conditions.push(Prisma.sql`je."entryDate" <= ${asOfDate}`);
    }

    const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

    return prisma.$queryRaw<
      Array<{
        accountId: number;
        accountCode: string;
        accountName: string;
        accountType: string;
        totalDebit: string | number;
        totalCredit: string | number;
      }>
    >`
      SELECT 
        a.id AS "accountId",
        a.code AS "accountCode",
        a.name AS "accountName",
        a.type AS "accountType",
        COALESCE(SUM(ji.debit), 0) AS "totalDebit",
        COALESCE(SUM(ji.credit), 0) AS "totalCredit"
      FROM "Account" a
      LEFT JOIN "JournalItem" ji ON ji."accountId" = a.id
      LEFT JOIN "JournalEntry" je ON je.id = ji."entryId"
      ${whereClause}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code ASC
    `;
  }

  /**
   * General Ledger query:
   * Granular transaction lines from posted journal items.
   */
  static async getGeneralLedger(companyId: number, accountId?: number, startDate?: Date, endDate?: Date) {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`je."companyId" = ${companyId}`,
      Prisma.sql`je.status = 'POSTED'`,
    ];

    if (accountId) {
      conditions.push(Prisma.sql`ji."accountId" = ${accountId}`);
    }
    if (startDate) {
      conditions.push(Prisma.sql`je."entryDate" >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(Prisma.sql`je."entryDate" <= ${endDate}`);
    }

    const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

    return prisma.$queryRaw<
      Array<{
        itemId: number;
        entryId: number;
        entryNumber: string;
        entryDate: Date;
        reference: string | null;
        accountId: number;
        accountCode: string;
        accountName: string;
        partnerName: string | null;
        label: string | null;
        debit: string | number;
        credit: string | number;
      }>
    >`
      SELECT 
        ji.id AS "itemId",
        je.id AS "entryId",
        je.number AS "entryNumber",
        je."entryDate" AS "entryDate",
        je.reference AS "reference",
        a.id AS "accountId",
        a.code AS "accountCode",
        a.name AS "accountName",
        c.name AS "partnerName",
        ji.label AS "label",
        ji.debit AS "debit",
        ji.credit AS "credit"
      FROM "JournalItem" ji
      JOIN "JournalEntry" je ON je.id = ji."entryId"
      JOIN "Account" a ON a.id = ji."accountId"
      LEFT JOIN "Contact" c ON c.id = ji."partnerId"
      ${whereClause}
      ORDER BY je."entryDate" ASC, je.id ASC, ji.sequence ASC
    `;
  }
}
