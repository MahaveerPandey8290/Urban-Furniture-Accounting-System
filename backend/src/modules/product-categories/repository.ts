import { PrismaClient, Prisma, ProductCategory } from '@prisma/client';

export class ProductCategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.ProductCategoryUncheckedCreateInput): Promise<ProductCategory> {
    return this.prisma.productCategory.create({ data });
  }

  async findMany(args: Prisma.ProductCategoryFindManyArgs): Promise<ProductCategory[]> {
    return this.prisma.productCategory.findMany(args);
  }

  async findUnique(id: number): Promise<ProductCategory | null> {
    return this.prisma.productCategory.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.ProductCategoryUpdateInput): Promise<ProductCategory> {
    return this.prisma.productCategory.update({ where: { id }, data });
  }

  async delete(id: number): Promise<ProductCategory> {
    return this.prisma.productCategory.delete({ where: { id } });
  }
}
