import { FileText, Plus, CheckCircle, Clock, AlertCircle, ArrowRight, Ban, Link2 } from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/formatters";

function CustomerInvoiceList({
  invoices,
  onSelectInvoice,
  onNewInvoice,
  isBills = false,
}) {
  const getPaymentBadge = (status) => {
    switch (status) {
      case "Paid":
        return {
          style: "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]",
          icon: <CheckCircle size={11} className="mr-1 inline" />,
          label: "Paid",
        };
      case "Partial":
        return {
          style: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <Clock size={11} className="mr-1 inline" />,
          label: "Partial",
        };
      default:
        return {
          style: "bg-[#fbf0ee] text-[#8e392e] border-[#f0d4d0]",
          icon: <AlertCircle size={11} className="mr-1 inline" />,
          label: "Not Paid",
        };
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#f5f2eb] text-[#716B63] mx-auto flex items-center justify-center mb-3">
          <FileText size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#211D19]">
          {isBills ? "No customer bills found" : "No customer invoices found"}
        </h3>
        <p className="text-sm text-[#716B63] mt-2 max-w-sm mx-auto">
          {isBills
            ? "Bills are generated from confirmed Sales Orders or can be created directly."
            : "Invoices are generated from confirmed Sales Orders or can be created directly."}
        </p>
        <button
          type="button"
          onClick={onNewInvoice}
          className="mt-5 inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>{isBills ? "New Customer Bill" : "New Customer Invoice"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e7e3da] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-xs text-[#716B63] font-semibold uppercase tracking-wider select-none">
              <th className="py-3.5 px-4">{isBills ? "Customer Bill No." : "Customer Invoice No."}</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">{isBills ? "Bill Date" : "Invoice Date"}</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4 text-right">Total</th>
              <th className="py-3.5 px-4 text-right">Amount Paid</th>
              <th className="py-3.5 px-4 text-right">Amount Due</th>
              <th className="py-3.5 px-4 text-center">Payment Status</th>
              <th className="py-3.5 px-4 text-center">Sales Order Reference</th>
              <th className="py-3.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f2eb]">
            {invoices.map((inv) => {
              const paymentBadge = getPaymentBadge(inv.status);
              const total = Number(inv.total) || 0;
              const paid = Number(inv.paidAmount) || 0;
              const outstanding = Math.max(0, total - paid);

              return (
                <tr
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv)}
                  className="hover:bg-[#faf8f4] transition cursor-pointer group"
                >
                  {/* 1. Customer Invoice No. */}
                  <td className="py-3.5 px-4 text-sm font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#543b2b] opacity-40 group-hover:opacity-100 transition" />
                      <span>{inv.invoiceNo}</span>
                    </div>
                  </td>

                  {/* 2. Customer */}
                  <td className="py-3.5 px-4 text-sm text-[#211D19] font-medium">
                    {inv.customerName || "-"}
                  </td>

                  {/* 3. Invoice Date */}
                  <td className="py-3.5 px-4 text-sm text-[#716B63] whitespace-nowrap">
                    {formatDate(inv.invoiceDate)}
                  </td>

                  {/* 4. Due Date */}
                  <td className="py-3.5 px-4 text-sm text-[#716B63] whitespace-nowrap">
                    {formatDate(inv.dueDate)}
                  </td>

                  {/* 5. Total */}
                  <td className="py-3.5 px-4 text-right text-sm font-semibold text-[#211D19] whitespace-nowrap">
                    {formatCurrency(total)}
                  </td>

                  {/* 6. Amount Paid */}
                  <td className="py-3.5 px-4 text-right text-sm font-semibold text-emerald-700 whitespace-nowrap">
                    {formatCurrency(paid)}
                  </td>

                  {/* 7. Amount Due */}
                  <td className="py-3.5 px-4 text-right text-sm font-bold text-[#342921] whitespace-nowrap">
                    {formatCurrency(outstanding)}
                  </td>

                  {/* 8. Payment Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${paymentBadge.style}`}
                    >
                      {paymentBadge.icon}
                      <span>{paymentBadge.label}</span>
                    </span>
                  </td>

                  {/* 9. Sales Order Reference */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {inv.soNumber ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#faf8f4] text-[#342921] border border-[#e7e3da]">
                        <Link2 size={11} className="text-[#716B63]" />
                        <span>{inv.soNumber}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[#a89f91]">—</span>
                    )}
                  </td>

                  {/* 10. Actions */}
                  <td className="py-3.5 px-3 text-right text-[#a89f91] group-hover:text-[#342921] transition">
                    <ArrowRight size={16} className="inline ml-auto" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerInvoiceList;
