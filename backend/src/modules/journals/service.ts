import { JournalRepository } from './repository.js';
import { CreateJournalDto, UpdateJournalDto, QueryJournalDto } from './dto.js';
import { NotFoundError, ConflictError } from '../../core/errors.js';
import { BadRequestError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

export class JournalService {
  private repository: JournalRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new JournalRepository(prisma);
  }

  async create(data: CreateJournalDto & { companyId: number }) {
    const existing = await this.repository.findByCode(data.companyId, data.code);
    if (existing) {
      throw new ConflictError('Journal with this code already exists for this company');
    }
    return this.repository.create({
      companyId: data.companyId,
      name: data.name,
      code: data.code,
      type: data.type,
      defaultAccountId: data.defaultAccountId,
      sequencePrefix: data.sequencePrefix,
      isArchived: false,
    });
  }

  async findById(id: number) {
    const journal = await this.repository.findById(id);
    if (!journal) {
      throw new NotFoundError('Journal not found');
    }
    return journal;
  }

  async update(id: number, data: UpdateJournalDto) {
    const journal = await this.findById(id);

    if (data.isArchived === true && !journal.isArchived) {
      const hasEntries = await this.repository.hasEntries(id);
      if (hasEntries) {
        throw new BadRequestError('Cannot archive journal with existing entries');
      }
    }

    if (data.code && data.code !== journal.code) {
      const existing = await this.repository.findByCode(journal.companyId, data.code);
      if (existing) {
        throw new ConflictError('Journal with this code already exists for this company');
      }
    }

    return this.repository.update(id, data);
  }

  async findMany(query: QueryJournalDto, companyId: number) {
    const where: any = { companyId };
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.type) where.type = query.type;
    if (query.isArchived !== undefined) where.isArchived = query.isArchived;

    const limit = query.limit || 50;
    const items = await this.repository.findMany({
      where,
      take: limit + 1,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: { code: 'asc' },
    });

    let nextCursor: number | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return { items, nextCursor };
  }

  async delete(id: number) {
    const hasEntries = await this.repository.hasEntries(id);
    if (hasEntries) {
      throw new BadRequestError('Cannot delete journal with existing entries');
    }
    await this.repository.delete(id);
  }
}
