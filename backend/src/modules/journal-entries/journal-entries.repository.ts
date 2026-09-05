import prisma from '../../config/prisma.js';
import type { PrismaTransactionClient } from '../../types/index.js';

export class JournalEntryRepository {
  static async findById(id: number, companyId: number, client: PrismaTransactionClient = prisma) {
    return client.journalEntry.findFirst({
      where: { id, companyId },
      include: { items: true }
    });
  }

  static async findAll(companyId: number, query: any, client: PrismaTransactionClient = prisma) {
    const limit = query.limit ? Number(query.limit) : 20;
    return client.journalEntry.findMany({
      where: { companyId },
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: Number(query.cursor) }, skip: 1 } : {}),
      orderBy: { id: 'desc' }
    });
  }

  static async findByIdForContact(id: number, contactId: number, companyId: number, client: PrismaTransactionClient = prisma) {
    return client.journalEntry.findFirst({
      where: { id, companyId, partnerId: contactId },
      include: { items: true }
    });
  }
}
