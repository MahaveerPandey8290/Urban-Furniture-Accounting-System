import prisma from '../../config/prisma.js';
import type { PrismaTransactionClient } from '../../types/index.js';
import { DocumentStatus } from '@prisma/client';

export class PaymentRepository {
  static async create(companyId: number, data: any, userId: number, client: PrismaTransactionClient = prisma) {
    return client.payment.create({
      data: {
        companyId,
        number: `PAY-${Date.now()}`,
        paymentType: data.type,
        partnerId: data.contactId,
        invoiceId: data.invoiceIds?.[0] || 1, // Fallback, schema requires invoiceId
        paymentDate: data.paymentDate,
        amount: data.amount,
        paymentMethod: data.method,
        journalId: data.journalId,
        note: data.narration,
        status: DocumentStatus.DRAFT,
        createdById: userId,
      }
    });
  }

  static async findById(id: number, companyId: number, client: PrismaTransactionClient = prisma) {
    return client.payment.findFirst({
      where: { id, companyId },
      include: { partner: true, journal: true }
    });
  }

  static async findAll(companyId: number, query: any, client: PrismaTransactionClient = prisma) {
    const where: any = { companyId };
    if (query?.contactId) where.partnerId = query.contactId;
    if (query?.status) where.status = query.status;
    
    return client.payment.findMany({
      where,
      orderBy: { id: 'desc' }
    });
  }

  static async updateStatus(id: number, companyId: number, status: DocumentStatus, journalEntryId?: number, client: PrismaTransactionClient = prisma) {
    const data: any = { status };
    if (journalEntryId) data.journalEntryId = journalEntryId;
    return client.payment.update({
      where: { id, companyId },
      data
    });
  }
}
