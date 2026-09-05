import type { Request, Response, NextFunction } from 'express';
import { CreateBudgetDto, BudgetIdParamDto, ReviseBudgetDto, ListBudgetsQueryDto } from './budgets.dto.js';
import { BudgetService } from './budgets.service.js';

export class BudgetController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateBudgetDto.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const budget = await BudgetService.createBudget(
        { ...dto, responsibleId: req.user!.contactId || 1 },
        companyId,
        req.user!.sub,
        req.requestId
      );
      res.status(201).json(budget);
    } catch (err) { next(err); }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = ListBudgetsQueryDto.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const budgets = await BudgetService.listBudgets(query, companyId);
      res.json(budgets);
    } catch (err) { next(err); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = BudgetIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const budget = await BudgetService.getBudget(id, companyId);
      res.json(budget);
    } catch (err) { next(err); }
  }

  static async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = BudgetIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const budget = await BudgetService.confirmBudget(id, companyId, req.user!.sub, req.requestId);
      res.json(budget);
    } catch (err) { next(err); }
  }

  static async revise(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = BudgetIdParamDto.parse(req.params);
      const dto = ReviseBudgetDto.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const budget = await BudgetService.reviseBudget(id, dto, companyId, req.user!.sub, req.requestId);
      res.json(budget);
    } catch (err) { next(err); }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = BudgetIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const budget = await BudgetService.cancelBudget(id, companyId, req.user!.sub, req.requestId);
      res.json(budget);
    } catch (err) { next(err); }
  }

  static async getPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = BudgetIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const performance = await BudgetService.getBudgetPerformance(id, companyId);
      res.json(performance);
    } catch (err) { next(err); }
  }
}
