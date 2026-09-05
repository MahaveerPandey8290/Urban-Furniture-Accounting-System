import { PrismaClient, Prisma, Product } from '@prisma/client';

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async findMany(args: Prisma.ProductFindManyArgs): Promise<Product[]> {
    return this.prisma.product.findMany(args);
  }

  async findUnique(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Product> {
    return this.prisma.product.delete({ where: { id } });
  }
}
