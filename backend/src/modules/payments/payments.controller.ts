import type { Request, Response, NextFunction } from 'express';
import { CreatePaymentDto, PaymentIdParamDto } from './payments.dto.js';
import { PaymentService } from './payments.service.js';

export class PaymentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreatePaymentDto.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      if (req.user!.role === 'CONTACT' && req.user!.contactId && dto.contactId !== req.user!.contactId) {
        dto.contactId = req.user!.contactId;
      }
      const result = await PaymentService.createPayment(dto, companyId, req.user!.sub, req.requestId);
      res.status(201).json(result);
    } catch (err) { next(err); }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId ?? req.user!.companyId;
      const contactId = req.user!.role === 'CONTACT' ? (req.user!.contactId ?? undefined) : undefined;
      const payments = await PaymentService.listPayments(req.query, companyId, contactId);
      res.json(payments);
    } catch (err) { next(err); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = PaymentIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const contactId = req.user!.role === 'CONTACT' ? (req.user!.contactId ?? undefined) : undefined;
      const payment = await PaymentService.getPayment(id, companyId, contactId);
      res.json(payment);
    } catch (err) { next(err); }
  }

  static async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = PaymentIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const invoiceIds = req.body.invoiceIds || [];
      const contactId = req.user!.role === 'CONTACT' ? (req.user!.contactId ?? undefined) : undefined;
      if (contactId) {
        // verify payment belongs to contact
        await PaymentService.getPayment(id, companyId, contactId);
      }
      const payment = await PaymentService.confirmPayment(id, companyId, req.user!.sub, req.requestId, invoiceIds);
      res.json(payment);
    } catch (err) { next(err); }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = PaymentIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const payment = await PaymentService.cancelPayment(id, companyId, req.user!.sub, req.requestId);
      res.json(payment);
    } catch (err) { next(err); }
  }
}
