import type { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service.js';
import { DateRangeQueryDto, GeneralLedgerQueryDto } from './reports.dto.js';

export class ReportsController {
  static async getTrialBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const query = DateRangeQueryDto.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const report = await ReportsService.getTrialBalance(companyId, query.startDate, query.endDate);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }

  static async getProfitLoss(req: Request, res: Response, next: NextFunction) {
    try {
      const query = DateRangeQueryDto.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const report = await ReportsService.getProfitLoss(companyId, query.startDate, query.endDate);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }

  static async getBalanceSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const query = DateRangeQueryDto.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const report = await ReportsService.getBalanceSheet(companyId, query.endDate);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }

  static async getGeneralLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GeneralLedgerQueryDto.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const report = await ReportsService.getGeneralLedger(companyId, query.accountId, query.startDate, query.endDate);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }
}
