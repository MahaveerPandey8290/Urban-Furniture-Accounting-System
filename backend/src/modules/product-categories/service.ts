import { ProductCategoryRepository } from './repository.js';
import { CreateProductCategoryDTO, UpdateProductCategoryDTO, QueryProductCategoryDTO } from './dto.js';
import { NotFoundError } from '../../core/errors.js';

export class ProductCategoryService {
  constructor(private repo: ProductCategoryRepository) {}

  async create(data: CreateProductCategoryDTO, companyId: number) {
    return this.repo.create({ ...data, companyId, isArchived: false });
  }

  async findAll(query: QueryProductCategoryDTO, companyId: number) {
    const { cursor, limit = 50, search, isArchived } = query;
    const where: any = { companyId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (isArchived !== undefined) {
      where.isArchived = isArchived;
    }

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
    const category = await this.repo.findUnique(id);
    if (!category) throw new NotFoundError('Product category not found');
    return category;
  }

  async update(id: number, data: UpdateProductCategoryDTO) {
    await this.findOne(id);
    return this.repo.update(id, data);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
