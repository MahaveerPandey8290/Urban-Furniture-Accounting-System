import { PrismaClient, Journal, Prisma } from '@prisma/client';

export class JournalRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.JournalUncheckedCreateInput): Promise<Journal> {
    return this.prisma.journal.create({ data });
  }

  async findById(id: number): Promise<Journal | null> {
    return this.prisma.journal.findUnique({ where: { id } });
  }

  async findByCode(companyId: number, code: string): Promise<Journal | null> {
    return this.prisma.journal.findFirst({
      where: { companyId, code },
    });
  }

  async update(id: number, data: Prisma.JournalUpdateInput): Promise<Journal> {
    return this.prisma.journal.update({ where: { id }, data });
  }

  async findMany(params: {
    where?: Prisma.JournalWhereInput;
    cursor?: Prisma.JournalWhereUniqueInput;
    take?: number;
    orderBy?: Prisma.JournalOrderByWithRelationInput;
  }): Promise<Journal[]> {
    return this.prisma.journal.findMany(params);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.journal.delete({ where: { id } });
  }

  async hasEntries(id: number): Promise<boolean> {
    const count = await this.prisma.journalEntry.count({
      where: { journalId: id },
    });
    return count > 0;
  }
}
