import { ShoppingCart, Plus, CheckCircle, FileText, ArrowRight, Ban, Clock, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/formatters";

function SalesOrderList({
  orders,
  onSelectOrder,
  onNewOrder,
  onEditOrder,
  onDeleteOrder,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Invoiced":
        return {
          style: "bg-[#eaf5f0] text-[#2c634c] border-[#cde7dc]",
          icon: <CheckCircle size={11} className="mr-1 inline" />,
          label: "Invoiced",
        };
      case "Confirmed":
        return {
          style: "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]",
          icon: <CheckCircle size={11} className="mr-1 inline" />,
          label: "Confirmed",
        };
      case "Cancelled":
        return {
          style: "bg-rose-50 text-rose-800 border-rose-200",
          icon: <Ban size={11} className="mr-1 inline" />,
          label: "Cancelled",
        };
      default:
        return {
          style: "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]",
          icon: <FileText size={11} className="mr-1 inline" />,
          label: "Draft",
        };
    }
  };

  const getInvoiceStatusBadge = (so) => {
    if (so.invoiceId || so.status === "Invoiced") {
      return {
        style: "bg-emerald-50 text-emerald-800 border-emerald-200",
        icon: <CheckCircle size={11} className="mr-1 inline" />,
        label: "Invoiced",
      };
    }
    if (so.status === "Confirmed") {
      return {
        style: "bg-blue-50 text-blue-800 border-blue-200",
        icon: <Clock size={11} className="mr-1 inline" />,
        label: "To Invoice",
      };
    }
    if (so.status === "Cancelled") {
      return {
        style: "bg-gray-50 text-gray-500 border-gray-200",
        icon: <Ban size={11} className="mr-1 inline" />,
        label: "Cancelled",
      };
    }
    return {
      style: "bg-neutral-50 text-neutral-600 border-neutral-200",
      icon: <FileText size={11} className="mr-1 inline" />,
      label: "Nothing to Invoice",
    };
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#f5f2eb] text-[#716B63] mx-auto flex items-center justify-center mb-3">
          <ShoppingCart size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#211D19]">No sales orders found</h3>
        <p className="text-sm text-[#716B63] mt-2 max-w-sm mx-auto">
          No customer sales orders found. Create a sales order to begin the sales workflow.
        </p>
        <button
          type="button"
          onClick={onNewOrder}
          className="mt-5 inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>New Sales Order</span>
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
              <th className="py-3.5 px-4 sm:px-6">SO No.</th>
              <th className="py-3.5 px-4 sm:px-6">Customer Name</th>
              <th className="py-3.5 px-4 sm:px-6">SO Date</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Total Amount</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Invoice Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f2eb]">
            {orders.map((so) => {
              const statusBadge = getStatusBadge(so.status);
              const invBadge = getInvoiceStatusBadge(so);
              return (
                <tr
                  key={so.id}
                  onClick={() => onSelectOrder(so)}
                  className="hover:bg-[#faf8f4] transition cursor-pointer group"
                >
                  {/* 1. SO No. */}
                  <td className="py-3.5 px-4 sm:px-6 text-sm font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#543b2b] opacity-40 group-hover:opacity-100 transition" />
                      <span>{so.soNumber}</span>
                    </div>
                  </td>

                  {/* 2. Customer Name */}
                  <td className="py-3.5 px-4 sm:px-6 text-sm text-[#211D19] font-medium">
                    {so.customerName || "-"}
                  </td>

                  {/* 3. SO Date */}
                  <td className="py-3.5 px-4 sm:px-6 text-sm text-[#716B63] whitespace-nowrap">
                    {formatDate(so.soDate)}
                  </td>

                  {/* 4. Total Amount */}
                  <td className="py-3.5 px-4 sm:px-6 text-right text-sm font-semibold text-[#211D19] whitespace-nowrap">
                    {formatCurrency(so.total)}
                  </td>

                  {/* 5. Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.style}`}
                    >
                      {statusBadge.icon}
                      <span>{statusBadge.label}</span>
                    </span>
                  </td>

                  {/* 6. Invoice Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${invBadge.style}`}
                    >
                      {invBadge.icon}
                      <span>{invBadge.label}</span>
                    </span>
                  </td>

                  {/* 7. Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => (onEditOrder || onSelectOrder)(so)}
                        className="p-1.5 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
                        title="Edit Sales Order"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteOrder && onDeleteOrder(so.id)}
                        className="p-1.5 rounded-lg text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Sales Order"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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

export default SalesOrderList;
