import prisma from '../../config/prisma.js';
import type { PrismaTransactionClient } from '../../types/index.js';
import { DocumentStatus } from '@prisma/client';
import { Decimal, round2, sumDecimals } from '../../core/money.js';

export class PurchaseOrderRepository {
  static async create(companyId: number, data: any, userId: number, client: PrismaTransactionClient = prisma) {
    const lines = data.lines.map((line: any, index: number) => {
      const qty = new Decimal(line.quantity || '1');
      const price = new Decimal(line.unitPrice);
      const lineTotal = round2(qty.times(price));
      
      return {
        sequence: index,
        productId: line.productId || 1, // Fallback if needed, though schema requires it
        analyticAccountId: line.analyticAccountId,
        quantity: qty.toString(),
        unitPrice: price.toString(),
        taxId: line.taxId,
        lineTotal: lineTotal.toString(),
      };
    });

    const untaxedTotal = round2(sumDecimals(lines.map((l: { lineTotal: string }) => new Decimal(l.lineTotal))));
    const taxTotal = new Decimal(0); // In real app, calculate tax properly if needed before save, but here we save as provided or 0
    const grandTotal = round2(untaxedTotal.plus(taxTotal));

    return client.purchaseOrder.create({
      data: {
        companyId,
        number: `PO-${Date.now()}`, // Simple numbering
        vendorId: data.contactId,
        orderDate: data.orderDate,
        status: DocumentStatus.DRAFT,
        untaxedTotal: untaxedTotal.toString(),
        taxTotal: taxTotal.toString(),
        grandTotal: grandTotal.toString(),
        createdById: userId,
        lines: {
          create: lines
        }
      },
      include: { lines: true }
    });
  }

  static async findById(id: number, companyId: number, client: PrismaTransactionClient = prisma) {
    return client.purchaseOrder.findFirst({
      where: { id, companyId },
      include: { lines: true }
    });
  }

  static async findAll(companyId: number, query: any, client: PrismaTransactionClient = prisma) {
    const where: any = { companyId };
    if (query.status) where.status = query.status;
    if (query.contactId) where.vendorId = query.contactId;

    const limit = query.limit || 20;
    
    return client.purchaseOrder.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { id: 'desc' }
    });
  }

  static async updateStatus(id: number, companyId: number, status: DocumentStatus, client: PrismaTransactionClient = prisma) {
    return client.purchaseOrder.update({
      where: { id, companyId },
      data: { status }
    });
  }

  static async findByContact(contactId: number, companyId: number, client: PrismaTransactionClient = prisma) {
    return client.purchaseOrder.findMany({
      where: { vendorId: contactId, companyId }
    });
  }
}
