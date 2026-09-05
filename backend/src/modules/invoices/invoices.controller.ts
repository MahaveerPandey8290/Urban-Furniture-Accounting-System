import type { Request, Response, NextFunction } from 'express';
import { CreateInvoiceDto, InvoiceIdParamDto, ListInvoicesQueryDto } from './invoices.dto.js';
import { InvoiceService } from './invoices.service.js';

export class InvoiceController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateInvoiceDto.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const result = await InvoiceService.createInvoice(dto, companyId, req.user!.sub, req.requestId);
      res.status(201).json(result.invoice);
    } catch (err) { next(err); }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = ListInvoicesQueryDto.parse(req.query);
      const companyId = req.companyId ?? req.user!.companyId;
      const contactId = req.user!.role === 'CONTACT' ? (req.user!.contactId ?? undefined) : undefined;
      const invoices = await InvoiceService.listInvoices(query, companyId, contactId);
      res.json(invoices);
    } catch (err) { next(err); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = InvoiceIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const contactId = req.user!.role === 'CONTACT' ? (req.user!.contactId ?? undefined) : undefined;
      const invoice = await InvoiceService.getInvoice(id, companyId, contactId);
      res.json(invoice);
    } catch (err) { next(err); }
  }

  static async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = InvoiceIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const journalId = Number(req.body.journalId || 1); 
      const result = await InvoiceService.confirmInvoice(id, companyId, req.user!.sub, req.requestId, journalId);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = InvoiceIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const invoice = await InvoiceService.cancelInvoice(id, companyId, req.user!.sub, req.requestId);
      res.json(invoice);
    } catch (err) { next(err); }
  }
}
