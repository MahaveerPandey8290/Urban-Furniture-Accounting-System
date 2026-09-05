import { AccountRepository } from './repository.js';
import { CreateAccountDto, UpdateAccountDto, QueryAccountDto } from './dto.js';
import { NotFoundError, ConflictError } from '../../core/errors.js';
import { BadRequestError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

export class AccountService {
  private repository: AccountRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new AccountRepository(prisma);
  }

  async create(data: CreateAccountDto & { companyId: number }) {
    const existing = await this.repository.findByCode(data.companyId, data.code);
    if (existing) {
      throw new ConflictError('Account with this code already exists for this company');
    }
    return this.repository.create({
      companyId: data.companyId,
      code: data.code,
      name: data.name,
      type: data.type,
      group: data.group ?? 'BALANCE_SHEET',
      parentId: data.parentId,
    });
  }

  async findById(id: number) {
    const account = await this.repository.findById(id);
    if (!account) {
      throw new NotFoundError('Account not found');
    }
    return account;
  }

  async update(id: number, data: UpdateAccountDto) {
    const account = await this.findById(id);

    if (data.isArchived === true && !account.isArchived) {
      const hasItems = await this.repository.hasJournalItems(id);
      if (hasItems) {
        throw new BadRequestError('Cannot archive account with existing journal items');
      }
    }

    if (data.code && data.code !== account.code) {
      const existing = await this.repository.findByCode(account.companyId, data.code);
      if (existing) {
        throw new ConflictError('Account with this code already exists for this company');
      }
    }

    return this.repository.update(id, data);
  }

  async findMany(query: QueryAccountDto, companyId: number) {
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
    const hasItems = await this.repository.hasJournalItems(id);
    if (hasItems) {
      throw new BadRequestError('Cannot delete account with existing journal items');
    }
    await this.repository.delete(id);
  }
}
