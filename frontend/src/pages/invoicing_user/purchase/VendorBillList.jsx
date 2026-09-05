import { useState } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  Ban,
  DollarSign,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Pencil,
  Trash2,
} from "lucide-react";
import ViewToggle from "../../../components/common/ViewToggle";
import { formatCurrency, formatDate } from "../../../utils/formatters";

function VendorBillList({
  bills = [],
  currentView = "list",
  onViewChange,
  onNewBill,
  onSelectBill,
  onEditBill,
  onDeleteBill,
  onBack,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | Draft | Confirmed | Paid | Partial | Not Paid | Cancelled

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.billRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      b.status?.toLowerCase() === statusFilter.toLowerCase() ||
      b.paymentStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Render status badge
  const renderStatusBadge = (bill) => {
    const status = bill.paymentStatus || bill.status || "Draft";

    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={11} className="text-emerald-600" />
            Paid
          </span>
        );
      case "Partial":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard size={11} className="text-blue-600" />
            Partial
          </span>
        );
      case "Not Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={11} className="text-amber-600" />
            Not Paid
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <Clock size={11} className="text-stone-500" />
            Draft
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle size={11} className="text-purple-600" />
            Confirmed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban size={11} className="text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e7e3da] pb-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-lg border border-[#e7e3da] bg-white text-[#6e6357] hover:text-[#24201a] hover:bg-[#faf8f4] transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#211D19] tracking-tight">
              Vendor Bills
            </h1>
            <p className="text-sm text-[#716B63] mt-0.5">
              Manage incoming vendor invoices, payment status, and ledger postings
            </p>
          </div>
        </div>

        {/* Top Actions: ViewToggle, New */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <ViewToggle currentView={currentView} onChange={onViewChange} />

          <button
            type="button"
            onClick={onNewBill}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] shadow-sm transition cursor-pointer"
          >
            <Plus size={16} />
            <span>New Bill</span>
          </button>
        </div>
      </div>

      {/* ================= SEARCH & STATUS FILTERS ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#998d7f]"
          />
          <input
            type="text"
            placeholder="Search by bill number, vendor, PO reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e7e3da] bg-white text-sm text-[#211D19] placeholder-[#998d7f] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 focus:border-[#342921] transition shadow-2xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "Not Paid", "Partial", "Paid", "Draft", "Cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[#342921] text-white font-semibold shadow-xs"
                  : "bg-white border border-[#e7e3da] text-[#6e6357] hover:text-[#211D19] hover:bg-[#faf8f4]"
              }`}
            >
              {st === "ALL" ? "All Bills" : st}
            </button>
          ))}
        </div>
      </div>

      {/* ================= CONTENT: LIST OR KANBAN ================= */}
      {filteredBills.length === 0 ? (
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#faf8f4] text-[#8f8274] mx-auto flex items-center justify-center mb-3">
            <FileText size={22} />
          </div>
          <h3 className="text-base font-semibold text-[#211D19]">No vendor bills found</h3>
          <p className="text-sm text-[#716B63] mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== "ALL"
              ? "No bills match the search filter. Try resetting filters."
              : "Create a vendor bill directly or convert from a confirmed purchase order."}
          </p>
          <button
            type="button"
            onClick={onNewBill}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] shadow-sm transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Vendor Bill</span>
          </button>
        </div>
      ) : currentView === "list" ? (
        /* ================= LIST VIEW ================= */
        <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-[11px] font-semibold text-[#716B63] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Bill Number</th>
                  <th className="py-3.5 px-4 font-semibold">Vendor</th>
                  <th className="py-3.5 px-4 font-semibold">Bill Date</th>
                  <th className="py-3.5 px-4 font-semibold">Due Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Total</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Paid</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount Due</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4] text-sm text-[#211D19]">
                {filteredBills.map((bill) => {
                  const isPaid = Number(bill.amountDue) === 0 && Number(bill.paidAmount) > 0;
                  const hasDue = Number(bill.amountDue) > 0;

                  return (
                    <tr
                      key={bill.id}
                      onClick={() => onSelectBill(bill)}
                      className="hover:bg-[#faf8f4]/80 transition cursor-pointer group"
                    >
                      {/* Bill Number */}
                      <td className="py-3.5 px-4 font-semibold text-[#342921] group-hover:underline">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-[#8f8274]" />
                          <span>{bill.billNumber}</span>
                          {bill.poNumber && (
                            <span className="text-[10px] text-[#6e6357] bg-[#f0ece4] px-1.5 py-0.5 rounded">
                              PO: {bill.poNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="py-3.5 px-4 font-medium text-[#211D19]">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-[#998d7f]" />
                          <span>{bill.vendorName || "Unknown Vendor"}</span>
                        </div>
                      </td>

                      {/* Bill Date */}
                      <td className="py-3.5 px-4 text-xs text-[#6e6357]">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-[#998d7f]" />
                          <span>{formatDate(bill.billDate)}</span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-xs text-[#6e6357]">
                        {formatDate(bill.dueDate)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-semibold text-[#211D19]">
                        {formatCurrency(bill.total)}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 text-right text-emerald-700 font-medium">
                        {formatCurrency(bill.paidAmount || 0)}
                      </td>

                      {/* Amount Due */}
                      <td
                        className={`py-3.5 px-4 text-right font-semibold ${
                          hasDue ? "text-amber-800" : "text-[#716B63]"
                        }`}
                      >
                        {formatCurrency(bill.amountDue !== undefined ? bill.amountDue : bill.total)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {renderStatusBadge(bill)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => (onEditBill || onSelectBill)(bill)}
                            className="p-1.5 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
                            title="Edit Vendor Bill"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteBill && onDeleteBill(bill.id)}
                            className="p-1.5 rounded-lg text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Vendor Bill"
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

          {/* Footer Summary */}
          <div className="px-6 py-3.5 bg-[#faf8f4] border-t border-[#e7e3da] flex flex-col sm:flex-row items-center justify-between text-xs text-[#716B63] gap-2">
            <span>
              Showing <strong className="text-[#211D19]">{filteredBills.length}</strong> of{" "}
              {bills.length} bills
            </span>
            <div className="flex items-center gap-4">
              <span>
                Total Bills:{" "}
                <strong className="text-[#211D19]">
                  {formatCurrency(
                    filteredBills.reduce((s, b) => s + (Number(b.total) || 0), 0)
                  )}
                </strong>
              </span>
              <span>
                Outstanding Due:{" "}
                <strong className="text-amber-800 font-bold">
                  {formatCurrency(
                    filteredBills.reduce(
                      (s, b) =>
                        s +
                        (b.amountDue !== undefined
                          ? Number(b.amountDue)
                          : Number(b.total)),
                      0
                    )
                  )}
                </strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= KANBAN VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBills.map((bill) => (
            <div
              key={bill.id}
              onClick={() => onSelectBill(bill)}
              className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-[#b8ad9e] transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Top: Bill Number & Status & Actions */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#f0ece4]">
                  <span className="text-sm font-bold text-[#342921] group-hover:text-[#523e2b] transition flex items-center gap-1.5">
                    <FileText size={15} className="text-[#8f8274]" />
                    {bill.billNumber}
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {renderStatusBadge(bill)}
                    <button
                      type="button"
                      onClick={() => (onEditBill || onSelectBill)(bill)}
                      className="p-1 rounded-md text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
                      title="Edit Vendor Bill"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBill && onDeleteBill(bill.id)}
                      className="p-1 rounded-md text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Vendor Bill"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Vendor & PO Ref */}
                <div className="mt-3.5">
                  <div className="text-[10px] text-[#998d7f] uppercase font-semibold tracking-wider">
                    Vendor
                  </div>
                  <div className="text-base font-semibold text-[#211D19] mt-0.5 flex items-center gap-1.5">
                    <User size={14} className="text-[#998d7f]" />
                    <span>{bill.vendorName || "Unknown"}</span>
                  </div>

                  {bill.poNumber && (
                    <span className="inline-block mt-1 text-[10px] font-medium text-[#6e6357] bg-[#faf8f4] px-2 py-0.5 rounded border border-[#e7e3da]">
                      PO Ref: {bill.poNumber}
                    </span>
                  )}
                </div>

                {/* Dates */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#716B63] bg-[#faf8f4] p-2.5 rounded-xl border border-[#ebe6dc]">
                  <div>
                    <span className="text-[10px] text-[#998d7f] block uppercase font-medium">
                      Bill Date
                    </span>
                    <span>{formatDate(bill.billDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#998d7f] block uppercase font-medium">
                      Due Date
                    </span>
                    <span className="font-medium text-[#211D19]">
                      {formatDate(bill.dueDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom: Amounts Summary */}
              <div className="mt-5 pt-3.5 border-t border-[#f0ece4] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#998d7f] block">
                    Total / Due
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-[#211D19]">
                      {formatCurrency(bill.total)}
                    </span>
                    {Number(bill.amountDue) > 0 && (
                      <span className="text-xs text-amber-800 font-semibold">
                        (Due: {formatCurrency(bill.amountDue)})
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs text-[#6e6357] group-hover:text-[#211D19] transition flex items-center gap-1">
                  View
                  <ExternalLink size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VendorBillList;
