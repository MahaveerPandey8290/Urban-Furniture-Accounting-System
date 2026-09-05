import { PrismaClient, AnalyticAccount, Prisma } from '@prisma/client';

export class AnalyticAccountRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.AnalyticAccountUncheckedCreateInput): Promise<AnalyticAccount> {
    return this.prisma.analyticAccount.create({ data });
  }

  async findById(id: number): Promise<AnalyticAccount | null> {
    return this.prisma.analyticAccount.findUnique({ where: { id } });
  }

  async findByName(companyId: number, name: string): Promise<AnalyticAccount | null> {
    return this.prisma.analyticAccount.findUnique({
      where: { companyId_name: { companyId, name } },
    });
  }

  async update(id: number, data: Prisma.AnalyticAccountUpdateInput): Promise<AnalyticAccount> {
    return this.prisma.analyticAccount.update({ where: { id }, data });
  }

  async findMany(params: {
    where?: Prisma.AnalyticAccountWhereInput;
    cursor?: Prisma.AnalyticAccountWhereUniqueInput;
    take?: number;
    orderBy?: Prisma.AnalyticAccountOrderByWithRelationInput;
  }): Promise<AnalyticAccount[]> {
    return this.prisma.analyticAccount.findMany(params);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.analyticAccount.delete({ where: { id } });
  }
}
