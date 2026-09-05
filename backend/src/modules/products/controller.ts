import type { Request, Response, NextFunction } from 'express';
import { ProductService } from './service.js';
import { createProductSchema, updateProductSchema, queryProductSchema } from './dto.js';
import prisma from '../../config/prisma.js';
import { ProductRepository } from './repository.js';

const repo = new ProductRepository(prisma);
const service = new ProductService(repo);

export class ProductController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProductSchema.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const product = await service.create(data, companyId);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryProductSchema.parse(req.query);
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
      const product = await service.findOne(id);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      const data = updateProductSchema.parse(req.body);
      const product = await service.update(id, data);
      res.json(product);
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
