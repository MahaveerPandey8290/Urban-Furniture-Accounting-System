import { BudgetRepository } from './budgets.repository.js';
import { BudgetService as CoreBudgetService } from '../../core/budget.service.js';
import { AuditService } from '../../core/audit.service.js';
import { NotFoundError, ConflictError } from '../../core/errors.js';
import prisma from '../../config/prisma.js';

export class BudgetService {
  static async createBudget(dto: any, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const budget = await BudgetRepository.create(companyId, dto, userId, tx);
      await AuditService.log({
        companyId,
        userId,
        entity: 'Budget',
        entityId: String(budget.id),
        action: 'CREATE',
        after: budget,
        requestId
      }, tx);
      return budget;
    });
  }

  static async listBudgets(query: any, companyId: number) {
    return BudgetRepository.findAll(companyId, query);
  }

  static async getBudget(id: number, companyId: number) {
    const budget = await BudgetRepository.findById(id, companyId);
    if (!budget) throw new NotFoundError('Budget not found');
    return budget;
  }

  static async confirmBudget(id: number, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const budget = await BudgetRepository.findById(id, companyId, tx);
      if (!budget) throw new NotFoundError('Budget not found');
      if (budget.status !== 'DRAFT') throw new ConflictError('Only DRAFT budgets can be confirmed');

      const updated = await BudgetRepository.updateStatus(id, companyId, 'CONFIRMED', tx);
      await AuditService.log({
        companyId,
        userId,
        entity: 'Budget',
        entityId: String(id),
        action: 'CONFIRM',
        before: { status: budget.status },
        after: { status: 'CONFIRMED' },
        requestId
      }, tx);
      return updated;
    });
  }

  static async reviseBudget(id: number, dto: any, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const budget = await BudgetRepository.findById(id, companyId, tx);
      if (!budget) throw new NotFoundError('Budget not found');
      if (budget.status !== 'CONFIRMED') throw new ConflictError('Only CONFIRMED budgets can be revised');

      const updated = await BudgetRepository.revise(id, companyId, dto.lines, userId, tx);
      await AuditService.log({
        companyId,
        userId,
        entity: 'Budget',
        entityId: String(id),
        action: 'REVISE',
        before: { status: budget.status },
        after: { status: 'REVISED' },
        requestId
      }, tx);
      return updated;
    });
  }

  static async cancelBudget(id: number, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const budget = await BudgetRepository.findById(id, companyId, tx);
      if (!budget) throw new NotFoundError('Budget not found');
      if (budget.status !== 'CONFIRMED') throw new ConflictError('Only CONFIRMED budgets can be cancelled');

      const updated = await BudgetRepository.updateStatus(id, companyId, 'CANCELLED', tx);
      await AuditService.log({
        companyId,
        userId,
        entity: 'Budget',
        entityId: String(id),
        action: 'CANCEL',
        before: { status: budget.status },
        after: { status: 'CANCELLED' },
        requestId
      }, tx);
      return updated;
    });
  }

  static async getBudgetPerformance(id: number, companyId: number) {
    return prisma.$transaction(async (tx) => {
      const budget = await BudgetRepository.findById(id, companyId, tx);
      if (!budget) throw new NotFoundError('Budget not found');
      
      const results = await CoreBudgetService.computeAchieved(id, tx);
      return { budget, performance: results };
    });
  }
}
