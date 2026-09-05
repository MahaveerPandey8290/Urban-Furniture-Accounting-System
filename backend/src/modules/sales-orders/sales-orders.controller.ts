import type { Request, Response, NextFunction } from 'express';
import { CreateSalesOrderDto, SalesOrderIdParamDto, ListSalesOrdersQueryDto } from './sales-orders.dto.js';
import { SalesOrderService } from './sales-orders.service.js';

export class SalesOrderController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateSalesOrderDto.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const order = await SalesOrderService.createOrder(dto, companyId, req.user!.sub, req.requestId);
      res.status(201).json(order);
    } catch (err) { next(err); }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = ListSalesOrdersQueryDto.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const contactId = req.user!.role === 'CONTACT' ? (req.user!.contactId ?? undefined) : undefined;
      const orders = await SalesOrderService.listOrders(query, companyId, contactId);
      res.json(orders);
    } catch (err) { next(err); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = SalesOrderIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const contactId = req.user!.role === 'CONTACT' ? (req.user!.contactId ?? undefined) : undefined;
      const order = await SalesOrderService.getOrder(id, companyId, contactId);
      res.json(order);
    } catch (err) { next(err); }
  }

  static async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = SalesOrderIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const order = await SalesOrderService.confirmOrder(id, companyId, req.user!.sub, req.requestId);
      res.json(order);
    } catch (err) { next(err); }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = SalesOrderIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const order = await SalesOrderService.cancelOrder(id, companyId, req.user!.sub, req.requestId);
      res.json(order);
    } catch (err) { next(err); }
  }
}
