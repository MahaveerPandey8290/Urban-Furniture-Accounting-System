import { useRef } from "react";
import { Printer, X, CheckCircle, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/formatters";

function PrintableInvoiceModal({ invoice, payments = [], onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const total = Number(invoice.total) || 0;
  const paid = Number(invoice.paidAmount) || 0;
  const outstanding = Math.max(0, total - paid);

  const getStatusBadge = () => {
    switch (invoice.status) {
      case "Paid":
        return {
          bg: "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]",
          icon: <CheckCircle size={13} className="mr-1 inline" />,
          label: "PAID",
        };
      case "Partial":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <Clock size={13} className="mr-1 inline" />,
          label: "PARTIAL PAYMENT",
        };
      default:
        return {
          bg: "bg-[#fbf0ee] text-[#8e392e] border-[#f0d4d0]",
          icon: <AlertCircle size={13} className="mr-1 inline" />,
          label: "NOT PAID",
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl border border-[#e7e3da] max-w-2xl w-full shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:max-w-none print:m-0">

        {/* Action Header - hidden in print */}
        <div className="p-4 border-b border-[#f0ece4] flex items-center justify-between bg-[#faf8f4] print:hidden gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#dcd6ca] bg-white text-[#342921] hover:text-[#18130f] hover:bg-[#faf8f4] text-xs font-semibold transition cursor-pointer shadow-2xs group"
              title="Go back to Invoice"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <span className="text-xs font-semibold text-[#716B63] uppercase tracking-wider hidden sm:inline">
              Invoice Print Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-[#342921] text-white text-sm font-semibold hover:bg-[#251d17] transition cursor-pointer shadow-xs"
            >
              <Printer size={16} />
              <span>Print Document</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#f0ece4] transition cursor-pointer"
              title="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div ref={printRef} className="p-8 sm:p-10 space-y-6 text-[#211D19]">

          {/* Company Brand & Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#e7e3da] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#3a2f26] text-amber-100 flex items-center justify-center text-base font-serif">
                  ♧
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-widest text-[#211D19]">
                    URBAN FURNITURE
                  </h1>
                  <p className="text-[10px] font-semibold tracking-widest text-[#716B63]">
                    ACCOUNTING SYSTEM
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-[#716B63] space-y-0.5">
                <p>Industrial Design & Quality Wooden Furnishings</p>
                <p>GSTIN: 27AABCU1234F1Z5</p>
                <p>support@urbanfurniture.com • +91 98765 43210</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#716B63]">
                TAX INVOICE
              </div>
              <div className="text-2xl font-bold text-[#211D19]">
                {invoice.invoiceNo}
              </div>
              <div className="inline-block mt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
                  {badge.icon}
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-[#faf8f4] p-5 rounded-xl border border-[#ece7dd]">
            <div>
              <span className="text-[#716B63] block text-xs">Billed To (Customer):</span>
              <span className="font-semibold text-sm text-[#211D19] block mt-1">
                {invoice.customerName || "Customer"}
              </span>
              <span className="text-[#716B63] text-xs">Contact Master Verified</span>
            </div>

            <div>
              <span className="text-[#716B63] block text-xs">Invoice Reference:</span>
              <span className="font-semibold text-sm text-[#211D19] block mt-1">
                {invoice.invoiceRef || "-"}
              </span>
              {invoice.soNumber && (
                <span className="text-[#716B63] text-xs block mt-0.5">
                  From SO: <strong className="text-[#211D19]">{invoice.soNumber}</strong>
                </span>
              )}
            </div>

            <div>
              <span className="text-[#716B63] block text-xs">Dates:</span>
              <span className="text-[#211D19] block mt-1">
                Invoice: <strong>{formatDate(invoice.invoiceDate)}</strong>
              </span>
              <span className="text-[#211D19] block">
                Due Date: <strong>{formatDate(invoice.dueDate)}</strong>
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b-2 border-[#342921] text-xs uppercase tracking-wider font-semibold text-[#211D19]">
                  <th className="py-3 px-3 w-12">Sr.</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Budget Analytics</th>
                  <th className="py-3 px-3 text-right">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {(invoice.items || []).map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-3 text-[#716B63]">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-[#211D19]">
                      {item.productName || "Product"}
                    </td>
                    <td className="py-3 px-3 text-[#716B63]">
                      {item.budgetName || "Project 1"}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[#211D19]">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-[#211D19]">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#211D19]">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Balance Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-[#e7e3da] gap-4">
            <div className="text-sm text-[#716B63] max-w-xs space-y-1">
              <p className="font-semibold text-[#211D19]">Accounting Note:</p>
              <p>Debit: Debtors A/c • Credit: Sales Income A/c</p>
              <p>Journal: Sales Journal (Balanced)</p>
            </div>

            <div className="w-full sm:w-72 bg-[#faf8f4] p-5 rounded-xl border border-[#ece7dd] text-sm space-y-2.5">
              <div className="flex justify-between text-[#716B63]">
                <span>Grand Total:</span>
                <span className="font-semibold text-[#211D19]">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-[#716B63]">
                <span>Total Paid:</span>
                <span className="font-semibold text-[#3e5335]">{formatCurrency(paid)}</span>
              </div>
              <div className="border-t border-[#e7e3da] pt-2.5 flex justify-between font-bold text-base text-[#211D19]">
                <span>Outstanding Due:</span>
                <span className={outstanding > 0 ? "text-[#8e392e]" : "text-[#3e5335]"}>
                  {formatCurrency(outstanding)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Receipts History if available */}
          {payments.length > 0 && (
            <div className="pt-4 border-t border-[#e7e3da]">
              <h4 className="text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-2">
                Recorded Payments
              </h4>
              <div className="space-y-1.5 text-sm">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center py-2 px-3.5 rounded-lg bg-[#faf8f4] border border-[#f0ece4]"
                  >
                    <div>
                      <span className="font-medium text-[#211D19]">
                        Via {p.paymentVia || "Cash"}
                      </span>
                      <span className="text-[#716B63] ml-2 text-xs">
                        ({formatDate(p.date)})
                      </span>
                    </div>
                    <span className="font-semibold text-[#3e5335]">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature / Footer */}
          <div className="pt-10 flex justify-between items-end text-sm text-[#716B63]">
            <div>
              <p>Thank you for choosing Urban Furniture.</p>
              <p className="text-xs mt-0.5">Computer-generated invoice. No signature required.</p>
            </div>
            <div className="text-center border-t border-[#716B63] pt-1.5 w-44">
              <span>Authorized Signatory</span>
            </div>
          </div>

        </div>

        {/* Modal Footer with Back & Print button - hidden in print */}
        <div className="p-4 border-t border-[#f0ece4] bg-[#faf8f4] flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#dcd6ca] bg-white text-[#342921] hover:text-[#18130f] hover:bg-[#f5f1ea] text-xs font-semibold transition cursor-pointer shadow-2xs group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Invoice</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-[#342921] hover:bg-[#251d17] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Printer size={15} />
            <span>Print Document</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default PrintableInvoiceModal;
