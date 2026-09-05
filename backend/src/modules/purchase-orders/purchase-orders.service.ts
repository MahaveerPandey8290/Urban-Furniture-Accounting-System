import { PurchaseOrderRepository } from './purchase-orders.repository.js';
import { AuditService } from '../../core/audit.service.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../core/errors.js';
import prisma from '../../config/prisma.js';

export class PurchaseOrderService {
  static async createOrder(dto: any, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await PurchaseOrderRepository.create(companyId, dto, userId, tx);
      await AuditService.log({
        companyId,
        userId,
        entity: 'PurchaseOrder',
        entityId: String(order.id),
        action: 'CREATE',
        after: order,
        requestId
      }, tx);
      return order;
    });
  }

  static async listOrders(query: any, companyId: number, contactId?: number) {
    const effectiveQuery = { ...query };
    if (contactId) effectiveQuery.contactId = contactId;
    return PurchaseOrderRepository.findAll(companyId, effectiveQuery);
  }

  static async getOrder(id: number, companyId: number, contactId?: number) {
    const order = await PurchaseOrderRepository.findById(id, companyId);
    if (!order) throw new NotFoundError('PurchaseOrder not found');
    if (contactId && order.vendorId !== contactId) throw new ForbiddenError('Access denied');
    return order;
  }

  static async confirmOrder(id: number, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await PurchaseOrderRepository.findById(id, companyId, tx);
      if (!order) throw new NotFoundError('PurchaseOrder not found');
      if (order.status !== 'DRAFT') throw new ConflictError('Only DRAFT orders can be confirmed');

      const updated = await PurchaseOrderRepository.updateStatus(id, companyId, 'CONFIRMED', tx);
      await AuditService.log({
        companyId,
        userId,
        entity: 'PurchaseOrder',
        entityId: String(id),
        action: 'CONFIRM',
        before: { status: order.status },
        after: { status: 'CONFIRMED' },
        requestId
      }, tx);
      return updated;
    });
  }

  static async cancelOrder(id: number, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await PurchaseOrderRepository.findById(id, companyId, tx);
      if (!order) throw new NotFoundError('PurchaseOrder not found');
      if (order.status !== 'DRAFT') throw new ConflictError('Only DRAFT orders can be cancelled');

      const updated = await PurchaseOrderRepository.updateStatus(id, companyId, 'CANCELLED', tx);
      await AuditService.log({
        companyId,
        userId,
        entity: 'PurchaseOrder',
        entityId: String(id),
        action: 'CANCEL',
        before: { status: order.status },
        after: { status: 'CANCELLED' },
        requestId
      }, tx);
      return updated;
    });
  }
}
