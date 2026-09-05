import { ProductRepository } from './repository.js';
import { CreateProductDTO, UpdateProductDTO, QueryProductDTO } from './dto.js';
import { NotFoundError } from '../../core/errors.js';
import { Decimal } from '../../core/money.js';

export class ProductService {
  constructor(private repo: ProductRepository) {}

  async create(data: CreateProductDTO, companyId: number) {
    return this.repo.create({
      ...data,
      companyId,
      salesPrice: new Decimal(data.salesPrice ?? 0).toFixed(4),
      cost: new Decimal(data.cost ?? 0).toFixed(4),
      isArchived: false,
    });
  }

  async findAll(query: QueryProductDTO, companyId: number) {
    const { cursor, limit = 50, search, categoryId, type, isArchived } = query;
    const where: any = { companyId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (categoryId) where.categoryId = categoryId;
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

    const items = await this.repo.findMany(args);
    let nextCursor: number | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem ? nextItem.id : null;
    }
    return { items, nextCursor };
  }

  async findOne(id: number) {
    const product = await this.repo.findUnique(id);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  }

  async update(id: number, data: UpdateProductDTO) {
    await this.findOne(id);
    const updateData: any = { ...data };
    if (data.salesPrice !== undefined) {
      updateData.salesPrice = new Decimal(data.salesPrice).toFixed(4);
    }
    if (data.cost !== undefined) {
      updateData.cost = new Decimal(data.cost).toFixed(4);
    }
    return this.repo.update(id, updateData);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
