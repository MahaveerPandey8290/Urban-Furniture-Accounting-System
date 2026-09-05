import prisma from '../../config/prisma.js';
import type { PrismaTransactionClient } from '../../types/index.js';
import { DocumentStatus, PaymentStatus } from '@prisma/client';
import { Decimal } from 'decimal.js-light';
import { round2 } from '../../core/money.js';

export class InvoiceRepository {
  static async create(companyId: number, data: any, userId: number, client: PrismaTransactionClient = prisma) {
    const lines = data.lines.map((line: any, index: number) => {
      return {
        sequence: index,
        productId: line.productId || 1, // Fallback
        accountId: line.accountId,
        analyticAccountId: line.analyticAccountId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxId: line.taxId || 1, // Fallback
        // Real untaxedAmount, taxAmount, lineTotal will be computed in service but we need placeholders for create if logic is elsewhere, or compute here. Wait, repository doesn't have TaxService access unless we import it. Or we let Service pass the fully computed lines.
        untaxedAmount: '0',
        taxAmount: '0',
        lineTotal: '0',
      };
    });

    return client.invoice.create({
      data: {
        companyId,
        documentType: data.documentType,
        number: `INV-${Date.now()}`,
        partnerId: data.contactId,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate || data.invoiceDate,
        reference: data.reference,
        status: DocumentStatus.DRAFT,
        paymentStatus: PaymentStatus.NOT_PAID,
        untaxedTotal: '0',
        taxTotal: '0',
        grandTotal: '0',
        amountDue: '0',
        createdById: userId,
        lines: { create: lines }
      },
      include: { lines: true }
    });
  }

  static async findById(id: number, companyId: number, client: PrismaTransactionClient = prisma) {
    return client.invoice.findFirst({
      where: { id, companyId },
      include: { 
        lines: { include: { tax: true } }, 
        partner: true 
      }
    });
  }

  static async findAll(companyId: number, query: any, contactId?: number, client: PrismaTransactionClient = prisma) {
    const where: any = { companyId };
    if (query.documentType) where.documentType = query.documentType;
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (contactId) where.partnerId = contactId;
    else if (query.contactId) where.partnerId = query.contactId;

    const limit = query.limit || 20;
    
    return client.invoice.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { id: 'desc' }
    });
  }

  static async updateStatus(id: number, companyId: number, status: DocumentStatus, journalEntryId?: number, client: PrismaTransactionClient = prisma) {
    const data: any = { status };
    if (journalEntryId) data.journalEntryId = journalEntryId;
    return client.invoice.update({
      where: { id, companyId },
      data
    });
  }

  static async updatePaymentStatus(id: number, companyId: number, paidAmount: string, client: PrismaTransactionClient = prisma) {
    const invoice = await client.invoice.findFirstOrThrow({ where: { id, companyId } });
    const grandTotal = new Decimal(invoice.grandTotal.toString());
    const newPaid = new Decimal(paidAmount);
    const amountDue = round2(grandTotal.minus(newPaid));
    const paymentStatus = amountDue.lte(0) ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
    return client.invoice.update({
      where: { id },
      data: {
        amountDue: amountDue.toFixed(4),
        paymentStatus,
      },
    });
  }

  static async findByContact(contactId: number, companyId: number, client: PrismaTransactionClient = prisma) {
    return client.invoice.findMany({
      where: { partnerId: contactId, companyId }
    });
  }
}
