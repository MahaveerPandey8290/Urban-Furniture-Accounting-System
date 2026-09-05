import type { Request, Response, NextFunction } from 'express';
import { AccountService } from './service.js';
import { createAccountSchema, updateAccountSchema, queryAccountSchema } from './dto.js';
import prisma from '../../config/prisma.js';

const service = new AccountService(prisma);

export class AccountController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createAccountSchema.parse(req.body);
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
      const data = updateAccountSchema.parse(req.body);
      const result = await service.update(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findMany(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryAccountSchema.parse(req.query);
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
