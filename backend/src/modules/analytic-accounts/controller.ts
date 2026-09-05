import type { Request, Response, NextFunction } from 'express';
import { AnalyticAccountService } from './service.js';
import { createAnalyticAccountSchema, updateAnalyticAccountSchema, queryAnalyticAccountSchema } from './dto.js';
import prisma from '../../config/prisma.js';

const service = new AnalyticAccountService(prisma);

export class AnalyticAccountController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createAnalyticAccountSchema.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const result = await service.create({ ...data, companyId });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      const result = await service.findById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      const data = updateAnalyticAccountSchema.parse(req.body);
      const result = await service.update(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findMany(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryAnalyticAccountSchema.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const result = await service.findMany(query, companyId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      await service.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
