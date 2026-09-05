import { PaymentRepository } from './payments.repository.js';
import { LedgerService } from '../../core/ledger.service.js';
import { AuditService } from '../../core/audit.service.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../core/errors.js';
import prisma from '../../config/prisma.js';
import type { PostEntryInput } from '../../types/index.js';
import { Decimal } from 'decimal.js-light';
import { round2 } from '../../core/money.js';

export class PaymentService {
  static async createPayment(dto: any, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await PaymentRepository.create(companyId, dto, userId, tx);
      await AuditService.log({
        companyId,
        userId,
        entity: 'Payment',
        entityId: String(payment.id),
        action: 'CREATE',
        after: payment,
        requestId
      }, tx);
      return { payment, invoiceIds: dto.invoiceIds };
    });
  }

  static async listPayments(query: any, companyId: number, contactId?: number) {
    return PaymentRepository.findAll(companyId, { ...query, ...(contactId ? { contactId } : {}) });
  }

  static async getPayment(id: number, companyId: number, contactId?: number) {
    const payment = await PaymentRepository.findById(id, companyId);
    if (!payment) throw new NotFoundError('Payment not found');
    if (contactId && payment.partnerId !== contactId) throw new ForbiddenError('Access denied');
    return payment;
  }

  static async confirmPayment(id: number, companyId: number, userId: number, requestId: string, invoiceIds?: number[]) {
    return prisma.$transaction(async (tx) => {
      const payment = await PaymentRepository.findById(id, companyId, tx);
      if (!payment) throw new NotFoundError('Payment not found');
      if (payment.status !== 'DRAFT') throw new ConflictError('Only DRAFT payments can be confirmed');

      const isReceive = payment.paymentType === 'RECEIVE';
      const amountStr = payment.amount.toString();

      const lines = [];
      const bankAccountId = payment.journal.defaultAccountId || 1;
      const contactAccountId = isReceive ? (payment.partner.receivableAccountId || 1) : (payment.partner.payableAccountId || 1);

      lines.push({
        accountId: bankAccountId,
        debit: isReceive ? amountStr : '0',
        credit: isReceive ? '0' : amountStr,
      });

      lines.push({
        accountId: contactAccountId,
        partnerId: payment.partnerId,
        debit: isReceive ? '0' : amountStr,
        credit: isReceive ? amountStr : '0',
      });

      const entryInput: PostEntryInput = {
        journalId: payment.journalId,
        entryDate: payment.paymentDate,
        reference: payment.number,
        narration: payment.note || `Payment ${payment.number}`,
        partnerId: payment.partnerId,
        sourceType: 'PAYMENT',
        sourceId: payment.id,
        lines
      };

      const entry = await LedgerService.postEntry(companyId, entryInput, userId, requestId, tx);

      const updated = await PaymentRepository.updateStatus(id, companyId, 'CONFIRMED', entry.id, tx);

      if (invoiceIds && invoiceIds.length > 0) {
        let remaining = new Decimal(amountStr);
        for (const invId of invoiceIds) {
          if (remaining.lte(0)) break;
          const inv = await tx.invoice.findFirst({ where: { id: invId, companyId } });
          if (!inv) continue;

          const due = new Decimal(inv.amountDue.toString());
          const toPay = remaining.lt(due) ? remaining : due;

          if (toPay.gt(0)) {
            const newDue = due.minus(toPay);
            const paidViaCash = payment.paymentMethod === 'CASH' ? new Decimal(inv.paidViaCash.toString()).plus(toPay) : new Decimal(inv.paidViaCash.toString());
            const paidViaBank = payment.paymentMethod === 'BANK' ? new Decimal(inv.paidViaBank.toString()).plus(toPay) : new Decimal(inv.paidViaBank.toString());
            const newPaymentStatus = newDue.lte(0) ? 'PAID' : 'PARTIAL';

            await tx.invoice.update({
              where: { id: invId },
              data: {
                amountDue: round2(newDue).toString(),
                paidViaCash: round2(paidViaCash).toString(),
                paidViaBank: round2(paidViaBank).toString(),
                paymentStatus: newPaymentStatus
              }
            });
            remaining = remaining.minus(toPay);
          }
        }
      }

      await AuditService.log({
        companyId,
        userId,
        entity: 'Payment',
        entityId: String(id),
        action: 'CONFIRM',
        before: { status: payment.status },
        after: { status: 'CONFIRMED', journalEntryId: entry.id },
        requestId
      }, tx);

      return updated;
    });
  }

  static async cancelPayment(id: number, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await PaymentRepository.findById(id, companyId, tx);
      if (!payment) throw new NotFoundError('Payment not found');
      if (payment.status !== 'DRAFT') throw new ConflictError('Only DRAFT payments can be cancelled');

      const updated = await PaymentRepository.updateStatus(id, companyId, 'CANCELLED', undefined, tx);
      
      await AuditService.log({
        companyId,
        userId,
        entity: 'Payment',
        entityId: String(id),
        action: 'CANCEL',
        before: { status: payment.status },
        after: { status: 'CANCELLED' },
        requestId
      }, tx);

      return updated;
    });
  }
}
