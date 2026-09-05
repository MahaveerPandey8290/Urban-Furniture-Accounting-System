import type { Request, Response, NextFunction } from 'express';
import { CreateJournalEntryDto, EntryIdParamDto, ReversalDto } from './journal-entries.dto.js';
import { JournalEntryService } from './journal-entries.service.js';

export class JournalEntryController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateJournalEntryDto.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const entry = await JournalEntryService.createEntry(dto, companyId, req.user!.sub, req.requestId);
      res.status(201).json(entry);
    } catch (err) { next(err); }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.companyId ?? req.user!.companyId;
      const entries = await JournalEntryService.listEntries(req.query, companyId);
      res.json(entries);
    } catch (err) { next(err); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = EntryIdParamDto.parse(req.params);
      const companyId = req.companyId ?? req.user!.companyId;
      const entry = await JournalEntryService.getEntry(id, companyId);
      res.json(entry);
    } catch (err) { next(err); }
  }

  static async reverse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = EntryIdParamDto.parse(req.params);
      const dto = ReversalDto.parse(req.body);
      const companyId = req.companyId ?? req.user!.companyId;
      const entry = await JournalEntryService.reverseEntry(id, dto.reversalDate, companyId, req.user!.sub, req.requestId);
      res.json(entry);
    } catch (err) { next(err); }
  }
}
