import { TaxRepository } from './repository.js';
import { CreateTaxDto, UpdateTaxDto, QueryTaxDto } from './dto.js';
import { NotFoundError } from '../../core/errors.js';
import { BadRequestError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '../../core/money.js';

export class TaxService {
  private repository: TaxRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new TaxRepository(prisma);
  }

  async create(data: CreateTaxDto & { companyId: number }) {
    const rateDecimal = new Decimal(data.rate).toFixed(4);
    return this.repository.create({
      companyId: data.companyId,
      name: data.name,
      rate: rateDecimal,
      scope: data.scope ?? 'BOTH',
      accountId: data.accountId,
      isArchived: false,
    });
  }

  async findById(id: number) {
    const tax = await this.repository.findById(id);
    if (!tax) {
      throw new NotFoundError('Tax not found');
    }
    return tax;
  }

  async update(id: number, data: UpdateTaxDto) {
    const tax = await this.findById(id);

    if (data.isArchived === true && !tax.isArchived) {
      const inUse = await this.repository.isInUse(id);
      if (inUse) {
        throw new BadRequestError('Cannot archive tax that is currently in use in invoices');
      }
    }

    const updateData: any = { ...data };
    if (data.rate !== undefined) {
      updateData.rate = new Decimal(data.rate).toFixed(4);
    }

    return this.repository.update(id, updateData);
  }

  async findMany(query: QueryTaxDto, companyId: number) {
    const where: any = { companyId };
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.scope) where.scope = query.scope;
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
    const inUse = await this.repository.isInUse(id);
    if (inUse) {
      throw new BadRequestError('Cannot delete tax that is currently in use');
    }
    await this.repository.delete(id);
  }
}
