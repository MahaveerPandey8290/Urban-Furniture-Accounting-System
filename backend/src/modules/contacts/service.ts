import { ContactRepository } from './repository.js';
import { CreateContactDTO, UpdateContactDTO, QueryContactDTO } from './dto.js';
import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../core/errors.js';

export class ContactService {
  constructor(private repo: ContactRepository, private prisma: PrismaClient) {}

  async create(data: CreateContactDTO, companyId: number) {
    let receivableAccountId: number | undefined = undefined;
    let payableAccountId: number | undefined = undefined;

    const receivableAccount = await this.prisma.account.findFirst({
      where: { companyId, type: 'ASSET', isArchived: false },
    });
    if (receivableAccount) receivableAccountId = receivableAccount.id;

    const payableAccount = await this.prisma.account.findFirst({
      where: { companyId, type: 'LIABILITY', isArchived: false },
    });
    if (payableAccount) payableAccountId = payableAccount.id;

    return this.repo.create({
      ...data,
      companyId,
      receivableAccountId,
      payableAccountId,
    });
  }

  async findAll(query: QueryContactDTO, user: any) {
    const { cursor, limit = 20, search, type, isArchived } = query;
    const where: any = { companyId: user.companyId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (isArchived !== undefined) where.isArchived = isArchived;

    const args: any = {
      where,
      take: limit + 1,
      orderBy: { id: 'asc' },
    };
    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const items = await this.repo.findMany(args, user);
    let nextCursor: number | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem ? nextItem.id : null;
    }
    return { items, nextCursor };
  }

  async findOne(id: number, user: any) {
    const contact = await this.repo.findUnique(id, user);
    if (!contact) throw new NotFoundError('Contact not found');
    return contact;
  }

  async update(id: number, data: UpdateContactDTO, user: any) {
    const contact = await this.repo.findUnique(id, user);
    if (!contact) throw new NotFoundError('Contact not found');
    return this.repo.update(id, data);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
