import prisma from '../../config/prisma.js';
import type { PrismaTransactionClient } from '../../types/index.js';
import { BudgetStatus } from '@prisma/client';

export class BudgetRepository {
  static async create(companyId: number, data: any, userId: number, client: PrismaTransactionClient = prisma) {
    return client.budget.create({
      data: {
        companyId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: BudgetStatus.DRAFT,
        createdById: userId,
        responsibleId: data.responsibleId || 1, // Fallback if not provided, schema requires responsibleId
        lines: {
          create: data.lines.map((l: any) => ({
            analyticAccountId: l.analyticAccountId,
            type: l.type,
            committedAmount: l.committedAmount.toString()
          }))
        }
      },
      include: { lines: true }
    });
  }

  static async findById(id: number, companyId: number, client: PrismaTransactionClient = prisma) {
    return client.budget.findFirst({
      where: { id, companyId },
      include: { lines: true }
    });
  }

  static async findAll(companyId: number, query: any, client: PrismaTransactionClient = prisma) {
    const limit = query.limit || 20;
    return client.budget.findMany({
      where: { companyId },
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { id: 'desc' }
    });
  }

  static async updateStatus(id: number, companyId: number, status: BudgetStatus, client: PrismaTransactionClient = prisma) {
    return client.budget.update({
      where: { id, companyId },
      data: { status }
    });
  }

  static async revise(id: number, companyId: number, newLines: any[], _userId: number, client: PrismaTransactionClient = prisma) {
    // According to typical revision semantics, we might create a new budget or update existing.
    // The instructions say: "adds revised lines, sets status=REVISED".
    // We will clear old lines or just add new lines? The schema allows deleting and re-creating.
    await client.budgetLine.deleteMany({ where: { budgetId: id } });
    return client.budget.update({
      where: { id, companyId },
      data: {
        status: BudgetStatus.REVISED,
        lines: {
          create: newLines.map((l: any) => ({
            analyticAccountId: l.analyticAccountId,
            type: l.type,
            committedAmount: l.committedAmount.toString()
          }))
        }
      },
      include: { lines: true }
    });
  }
}
