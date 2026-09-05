import { ShoppingCart, Plus, CheckCircle, FileText, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/formatters";

function SalesOrderList({
  orders,
  onSelectOrder,
  onNewOrder,
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
      default:
        return {
          style: "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]",
          icon: <FileText size={11} className="mr-1 inline" />,
          label: "Draft",
        };
    }
  };



  if (orders.length === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#f5f2eb] text-[#716B63] mx-auto flex items-center justify-center mb-3">
          <ShoppingCart size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#211D19]">No sales orders found</h3>
        <p className="text-sm text-[#716B63] mt-2 max-w-sm mx-auto">
          No customer sales orders created yet. Create a sales order to begin the sales workflow.
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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-xs text-[#716B63] font-semibold uppercase tracking-wider select-none">
              <th className="py-3.5 px-6">SO NO.</th>
              <th className="py-3.5 px-6">CUSTOMER</th>
              <th className="py-3.5 px-6">DATE</th>
              <th className="py-3.5 px-6 text-right">TOTAL</th>
              <th className="py-3.5 px-6 text-center">STATUS</th>
              <th className="py-3.5 px-6 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f2eb]">
            {orders.map((so) => {
              const statusBadge = getStatusBadge(so.status);
              return (
                <tr
                  key={so.id}
                  onClick={() => onSelectOrder(so)}
                  className="hover:bg-[#faf8f4] transition cursor-pointer group"
                >
                  {/* 1. SO No. */}
                  <td className="py-3.5 px-6 text-sm font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#543b2b] opacity-40 group-hover:opacity-100 transition" />
                      <span>{so.soNumber}</span>
                    </div>
                  </td>

                  {/* 2. Customer */}
                  <td className="py-3.5 px-6 text-sm text-[#211D19] font-medium">
                    {so.customerName || "-"}
                  </td>

                  {/* 3. Date */}
                  <td className="py-3.5 px-6 text-sm text-[#716B63] whitespace-nowrap">
                    {formatDate(so.soDate)}
                  </td>

                  {/* 4. Total */}
                  <td className="py-3.5 px-6 text-right text-sm font-semibold text-[#211D19] whitespace-nowrap">
                    {formatCurrency(so.total)}
                  </td>

                  {/* 5. Status */}
                  <td className="py-3.5 px-6 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.style}`}
                    >
                      {statusBadge.icon}
                      <span>{statusBadge.label}</span>
                    </span>
                  </td>

                  {/* 6. Action Arrow */}
                  <td className="py-3.5 px-6 text-right text-[#a89f91] group-hover:text-[#342921] transition">
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

export default SalesOrderList;
