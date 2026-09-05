import type { Request, Response, NextFunction } from 'express';
import { ContactService } from './service.js';
import { createContactSchema, updateContactSchema, contactQuerySchema } from './dto.js';
import prisma from '../../config/prisma.js';
import { ContactRepository } from './repository.js';

const repo = new ContactRepository(prisma);
const service = new ContactService(repo, prisma);

export class ContactController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createContactSchema.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const contact = await service.create(data, companyId);
      res.status(201).json(contact);
    } catch (err) {
      next(err);
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = contactQuerySchema.parse(req.query);
      const result = await service.findAll(query, req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      const contact = await service.findOne(id, req.user);
      res.json(contact);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      const data = updateContactSchema.parse(req.body);
      const contact = await service.update(id, data, req.user);
      res.json(contact);
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
