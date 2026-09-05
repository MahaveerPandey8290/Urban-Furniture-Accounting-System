import type { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import type { CreateUserDto, RejectUserDto } from './users.dto.js';

export class UsersController {
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await UsersService.createUser(
        req.body as CreateUserDto,
        req.user!.sub,
        req.companyId,
        req.requestId
      );
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  static async listPending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UsersService.listPending(req.companyId);
      res.json({ data: users });
    } catch (err) { next(err); }
  }

  static async approveUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetId = Number(req.params['id']);
      const result = await UsersService.approveUser(
        targetId, req.user!.sub, req.companyId, req.requestId
      );
      res.json(result);
    } catch (err) { next(err); }
  }

  static async rejectUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetId = Number(req.params['id']);
      await UsersService.rejectUser(
        targetId, req.user!.sub, req.companyId, req.body as RejectUserDto, req.requestId
      );
      res.json({ message: 'User rejected.' });
    } catch (err) { next(err); }
  }

  static async suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetId = Number(req.params['id']);
      await UsersService.suspendUser(targetId, req.user!.sub, req.companyId, req.requestId);
      res.json({ message: 'User suspended.' });
    } catch (err) { next(err); }
  }

  static async reactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetId = Number(req.params['id']);
      await UsersService.reactivateUser(targetId, req.user!.sub, req.companyId, req.requestId);
      res.json({ message: 'User reactivated.' });
    } catch (err) { next(err); }
  }
}
