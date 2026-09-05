import { AnalyticAccountRepository } from './repository.js';
import { CreateAnalyticAccountDto, UpdateAnalyticAccountDto, QueryAnalyticAccountDto } from './dto.js';
import { NotFoundError, ConflictError } from '../../core/errors.js';
import { PrismaClient } from '@prisma/client';

export class AnalyticAccountService {
  private repository: AnalyticAccountRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new AnalyticAccountRepository(prisma);
  }

  async create(data: CreateAnalyticAccountDto & { companyId: number }) {
    const existing = await this.repository.findByName(data.companyId, data.name);
    if (existing) {
      throw new ConflictError('Analytic account with this name already exists for this company');
    }
    return this.repository.create({
      companyId: data.companyId,
      name: data.name,
      type: data.type,
      isArchived: false,
    });
  }

  async findById(id: number) {
    const account = await this.repository.findById(id);
    if (!account) {
      throw new NotFoundError('Analytic account not found');
    }
    return account;
  }

  async update(id: number, data: UpdateAnalyticAccountDto) {
    const account = await this.findById(id);

    if (data.name && data.name !== account.name) {
      const existing = await this.repository.findByName(account.companyId, data.name);
      if (existing) {
        throw new ConflictError('Analytic account with this name already exists for this company');
      }
    }

    return this.repository.update(id, data);
  }

  async findMany(query: QueryAnalyticAccountDto, companyId: number) {
    const where: any = { companyId };
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.type) where.type = query.type;
    if (query.isArchived !== undefined) where.isArchived = query.isArchived;

    const limit = query.limit || 50;
    const items = await this.repository.findMany({
      where,
      take: limit + 1,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: { name: 'asc' },
    });

    let nextCursor: number | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return { items, nextCursor };
  }

  async delete(id: number) {
    await this.repository.delete(id);
  }
}
