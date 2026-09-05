import type { Request, Response, NextFunction } from 'express';
import { CreatePurchaseOrderDto, PurchaseOrderIdParamDto, ListPurchaseOrdersQueryDto } from './purchase-orders.dto.js';
import { PurchaseOrderService } from './purchase-orders.service.js';

export class PurchaseOrderController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreatePurchaseOrderDto.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const order = await PurchaseOrderService.createOrder(dto, companyId, req.user!.sub, req.requestId);
      res.status(201).json(order);
    } catch (err) { next(err); }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = ListPurchaseOrdersQueryDto.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const contactId = req.user!.role === 'CONTACT' ? (req.user!.contactId ?? undefined) : undefined;
      const orders = await PurchaseOrderService.listOrders(query, companyId, contactId);
      res.json(orders);
    } catch (err) { next(err); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = PurchaseOrderIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const contactId = req.user!.role === 'CONTACT' ? (req.user!.contactId ?? undefined) : undefined;
      const order = await PurchaseOrderService.getOrder(id, companyId, contactId);
      res.json(order);
    } catch (err) { next(err); }
  }

  static async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = PurchaseOrderIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const order = await PurchaseOrderService.confirmOrder(id, companyId, req.user!.sub, req.requestId);
      res.json(order);
    } catch (err) { next(err); }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = PurchaseOrderIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const order = await PurchaseOrderService.cancelOrder(id, companyId, req.user!.sub, req.requestId);
      res.json(order);
    } catch (err) { next(err); }
  }
}
