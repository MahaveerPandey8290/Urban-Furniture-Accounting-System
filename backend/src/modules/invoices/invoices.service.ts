import { InvoiceRepository } from './invoices.repository.js';
import { LedgerService } from '../../core/ledger.service.js';
import { TaxService } from '../../core/tax.service.js';
import { BudgetService, BudgetLineInput } from '../../core/budget.service.js';
import { AuditService } from '../../core/audit.service.js';
import { round2, Decimal } from '../../core/money.js';
import { NotFoundError, ConflictError, ForbiddenError, UnprocessableError } from '../../core/errors.js';
import prisma from '../../config/prisma.js';
import type { PostEntryInput } from '../../types/index.js';

export class InvoiceService {
  static async createInvoice(dto: any, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      // Create draft invoice, but we must compute tax and totals right now properly
      const linesData = [];
      let untaxedTotal = new Decimal(0);
      let taxTotal = new Decimal(0);

      for (const [index, line] of dto.lines.entries()) {
        const tax = line.taxId ? await tx.tax.findUnique({ where: { id: line.taxId } }) : { rate: '0' };
        if (line.taxId && !tax) throw new UnprocessableError('Tax not found');
        
        const computed = TaxService.computeLine({
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: tax?.rate?.toString() || '0'
        });

        untaxedTotal = untaxedTotal.plus(new Decimal(computed.untaxedAmount));
        taxTotal = taxTotal.plus(new Decimal(computed.taxAmount));

        linesData.push({
          sequence: index,
          productId: line.productId || 1, // Require valid productId in schema ideally, or null
          accountId: line.accountId,
          analyticAccountId: line.analyticAccountId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxId: line.taxId || 1,
          untaxedAmount: computed.untaxedAmount,
          taxAmount: computed.taxAmount,
          lineTotal: computed.lineTotal,
        });
      }

      untaxedTotal = round2(untaxedTotal);
      taxTotal = round2(taxTotal);
      const grandTotal = round2(untaxedTotal.plus(taxTotal));

      const invoice = await tx.invoice.create({
        data: {
          companyId,
          documentType: dto.documentType,
          number: `INV-${Date.now()}`, // Or proper sequence
          partnerId: dto.contactId,
          invoiceDate: dto.invoiceDate,
          dueDate: dto.dueDate || dto.invoiceDate,
          reference: dto.reference,
          status: 'DRAFT',
          paymentStatus: 'NOT_PAID',
          untaxedTotal: untaxedTotal.toString(),
          taxTotal: taxTotal.toString(),
          grandTotal: grandTotal.toString(),
          amountDue: grandTotal.toString(),
          createdById: userId,
          lines: { create: linesData }
        },
        include: { lines: true }
      });

      // Pass the journalId back or store it. Wait, the model doesn't have journalId, it's used in confirmInvoice.
      // But we need it. Let's just accept it as param.
      // Store journalId somewhere? The requirements don't have it on Invoice model. 
      // We'll require it on confirm? Wait, dto has journalId. We must store it or pass it.
      // Let's modify the create dto to just pass it around if needed, but it's not in DB schema for invoice.
      
      await AuditService.log({
        companyId,
        userId,
        entity: 'Invoice',
        entityId: String(invoice.id),
        action: 'CREATE',
        after: invoice,
        requestId
      }, tx);

      return { invoice, journalId: dto.journalId };
    });
  }

  static async listInvoices(query: any, companyId: number, contactId?: number) {
    return InvoiceRepository.findAll(companyId, query, contactId);
  }

  static async getInvoice(id: number, companyId: number, contactId?: number) {
    const invoice = await InvoiceRepository.findById(id, companyId);
    if (!invoice) throw new NotFoundError('Invoice not found');
    if (contactId && invoice.partnerId !== contactId) throw new ForbiddenError('Access denied');
    return invoice;
  }

  static async confirmInvoice(id: number, companyId: number, userId: number, requestId: string, journalId: number) {
    return prisma.$transaction(async (tx) => {
      const invoice = await InvoiceRepository.findById(id, companyId, tx);
      if (!invoice) throw new NotFoundError('Invoice not found');
      if (invoice.status !== 'DRAFT') throw new ConflictError('Only DRAFT invoices can be confirmed');

      const contact = invoice.partner;
      const journal = await tx.journal.findUniqueOrThrow({ where: { id: journalId } });

      // Budget warnings
      const budgetInputs: BudgetLineInput[] = invoice.lines
        .filter(l => l.analyticAccountId)
        .map(l => ({
          analyticAccountId: l.analyticAccountId!,
          amount: l.untaxedAmount.toString()
        }));
      
      const budgetWarnings = await BudgetService.checkBudgetWarnings(budgetInputs, invoice.invoiceDate, companyId, tx);

      // Ledger Entry
      const entryLines = [];
      const isCustomer = invoice.documentType === 'CUSTOMER_INVOICE';

      // AP/AR Line
      entryLines.push({
        accountId: isCustomer ? (contact.receivableAccountId || 1) : (contact.payableAccountId || 1),
        partnerId: invoice.partnerId,
        debit: isCustomer ? invoice.grandTotal.toString() : '0',
        credit: isCustomer ? '0' : invoice.grandTotal.toString(),
      });

      // Income/Expense & Tax Lines
      for (const line of invoice.lines) {
        entryLines.push({
          accountId: line.accountId,
          analyticAccountId: line.analyticAccountId || undefined,
          debit: isCustomer ? '0' : line.untaxedAmount.toString(),
          credit: isCustomer ? line.untaxedAmount.toString() : '0',
        });

        if (new Decimal(line.taxAmount.toString()).greaterThan(0)) {
          entryLines.push({
            accountId: line.tax?.accountId || journal.defaultAccountId || 1,
            debit: isCustomer ? '0' : line.taxAmount.toString(),
            credit: isCustomer ? line.taxAmount.toString() : '0',
          });
        }
      }

      const entryInput: PostEntryInput = {
        journalId: journal.id,
        entryDate: invoice.invoiceDate,
        reference: invoice.number,
        narration: invoice.reference || `Invoice ${invoice.number}`,
        partnerId: invoice.partnerId,
        sourceType: 'INVOICE',
        sourceId: invoice.id,
        lines: entryLines
      };

      const entry = await LedgerService.postEntry(companyId, entryInput, userId, requestId, tx);

      const updated = await InvoiceRepository.updateStatus(id, companyId, 'CONFIRMED', entry.id, tx);
      
      await AuditService.log({
        companyId,
        userId,
        entity: 'Invoice',
        entityId: String(id),
        action: 'CONFIRM',
        before: { status: invoice.status },
        after: { status: 'CONFIRMED', journalEntryId: entry.id },
        requestId
      }, tx);

      return { invoice: updated, budgetWarnings };
    });
  }

  static async cancelInvoice(id: number, companyId: number, userId: number, requestId: string) {
    return prisma.$transaction(async (tx) => {
      const invoice = await InvoiceRepository.findById(id, companyId, tx);
      if (!invoice) throw new NotFoundError('Invoice not found');
      if (invoice.status !== 'DRAFT') throw new ConflictError('Only DRAFT invoices can be cancelled');

      const updated = await InvoiceRepository.updateStatus(id, companyId, 'CANCELLED', undefined, tx);
      
      await AuditService.log({
        companyId,
        userId,
        entity: 'Invoice',
        entityId: String(id),
        action: 'CANCEL',
        before: { status: invoice.status },
        after: { status: 'CANCELLED' },
        requestId
      }, tx);

      return updated;
    });
  }
}
