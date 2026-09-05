import { PrismaClient, Account, Prisma } from '@prisma/client';

export class AccountRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.AccountUncheckedCreateInput): Promise<Account> {
    return this.prisma.account.create({ data });
  }

  async findById(id: number): Promise<Account | null> {
    return this.prisma.account.findUnique({ where: { id } });
  }

  async findByCode(companyId: number, code: string): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { companyId_code: { companyId, code } },
    });
  }

  async update(id: number, data: Prisma.AccountUpdateInput): Promise<Account> {
    return this.prisma.account.update({ where: { id }, data });
  }

  async findMany(params: {
    where?: Prisma.AccountWhereInput;
    cursor?: Prisma.AccountWhereUniqueInput;
    take?: number;
    orderBy?: Prisma.AccountOrderByWithRelationInput;
  }): Promise<Account[]> {
    return this.prisma.account.findMany(params);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.account.delete({ where: { id } });
  }

  async hasJournalItems(id: number): Promise<boolean> {
    const count = await this.prisma.journalItem.count({
      where: { accountId: id },
    });
    return count > 0;
  }
}
