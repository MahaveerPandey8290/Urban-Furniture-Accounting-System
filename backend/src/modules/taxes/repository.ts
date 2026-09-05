import { PrismaClient, Tax, Prisma } from '@prisma/client';

export class TaxRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.TaxUncheckedCreateInput): Promise<Tax> {
    return this.prisma.tax.create({ data });
  }

  async findById(id: number): Promise<Tax | null> {
    return this.prisma.tax.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.TaxUpdateInput): Promise<Tax> {
    return this.prisma.tax.update({ where: { id }, data });
  }

  async findMany(params: {
    where?: Prisma.TaxWhereInput;
    cursor?: Prisma.TaxWhereUniqueInput;
    take?: number;
    orderBy?: Prisma.TaxOrderByWithRelationInput;
  }): Promise<Tax[]> {
    return this.prisma.tax.findMany(params);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.tax.delete({ where: { id } });
  }

  async isInUse(id: number): Promise<boolean> {
    const count = await this.prisma.invoiceLine.count({
      where: { taxId: id },
    });
    return count > 0;
  }
}
