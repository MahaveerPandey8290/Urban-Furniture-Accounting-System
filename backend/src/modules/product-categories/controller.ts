import type { Request, Response, NextFunction } from 'express';
import { ProductCategoryService } from './service.js';
import { createProductCategorySchema, updateProductCategorySchema, queryProductCategorySchema } from './dto.js';
import prisma from '../../config/prisma.js';
import { ProductCategoryRepository } from './repository.js';

const repo = new ProductCategoryRepository(prisma);
const service = new ProductCategoryService(repo);

export class ProductCategoryController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProductCategorySchema.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const category = await service.create(data, companyId);
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryProductCategorySchema.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const result = await service.findAll(query, companyId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      const category = await service.findOne(id);
      res.json(category);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      const data = updateProductCategorySchema.parse(req.body);
      const category = await service.update(id, data);
      res.json(category);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      await service.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
