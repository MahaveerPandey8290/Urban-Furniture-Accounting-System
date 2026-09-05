import { useState } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  User,
  ShoppingBag,
  FileCheck,
  CheckCircle,
  Clock,
  Ban,
  ArrowUpDown,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import ViewToggle from "../../../components/common/ViewToggle";
import { formatCurrency, formatDate } from "../../../utils/formatters";

function PurchaseOrderList({
  purchaseOrders = [],
  currentView = "list",
  onViewChange,
  onNewPO,
  onSelectPO,
  onEditPO,
  onDeletePO,
  onBack,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | Draft | Confirmed | Cancelled

  // Filter purchase orders
  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesSearch =
      !searchTerm ||
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || po.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Select all / toggle single
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Status badge style helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} className="text-emerald-600" />
            Confirmed
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            Draft
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban size={12} className="text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
            {status || "Draft"}
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
              Purchase Orders
            </h1>
            <p className="text-sm text-[#716B63] mt-0.5">
              Manage procurement orders and convert to vendor bills
            </p>
          </div>
        </div>

        {/* Top Actions: New, ViewToggle */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <ViewToggle currentView={currentView} onChange={onViewChange} />

          <button
            type="button"
            onClick={onNewPO}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] shadow-sm transition cursor-pointer"
          >
            <Plus size={16} />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* ================= SEARCH & FILTER CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#998d7f]"
          />
          <input
            type="text"
            placeholder="Search by PO number, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e7e3da] bg-white text-sm text-[#211D19] placeholder-[#998d7f] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 focus:border-[#342921] transition shadow-2xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "Draft", "Confirmed", "Cancelled"].map((st) => (
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
              {st === "ALL" ? "All Orders" : st}
            </button>
          ))}
        </div>
      </div>

      {/* ================= CONTENT: LIST OR KANBAN ================= */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#faf8f4] text-[#8f8274] mx-auto flex items-center justify-center mb-3">
            <ShoppingBag size={22} />
          </div>
          <h3 className="text-base font-semibold text-[#211D19]">No purchase orders found</h3>
          <p className="text-sm text-[#716B63] mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== "ALL"
              ? "No records match your search criteria. Try resetting filters."
              : "Get started by creating your first purchase order."}
          </p>
          <button
            type="button"
            onClick={onNewPO}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] shadow-sm transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Purchase Order</span>
          </button>
        </div>
      ) : currentView === "list" ? (
        /* ================= LIST VIEW ================= */
        <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-[11px] font-semibold text-[#716B63] uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredOrders.length &&
                        filteredOrders.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-[#cfc6b6] text-[#342921] focus:ring-[#342921] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 font-semibold">PO Number</th>
                  <th className="py-3.5 px-4 font-semibold">Vendor</th>
                  <th className="py-3.5 px-4 font-semibold">PO Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Total</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Linked Bill</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4] text-sm text-[#211D19]">
                {filteredOrders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectPO(order)}
                      className={`hover:bg-[#faf8f4]/80 transition cursor-pointer group ${
                        isSelected ? "bg-[#f5f1ea]/60" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelect(order.id, e)}
                          className="rounded border-[#cfc6b6] text-[#342921] focus:ring-[#342921] cursor-pointer"
                        />
                      </td>

                      {/* PO Number */}
                      <td className="py-3.5 px-4 font-semibold text-[#342921] group-hover:underline flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-[#8f8274]" />
                        <span>{order.poNumber}</span>
                      </td>

                      {/* Vendor */}
                      <td className="py-3.5 px-4 text-[#211D19]">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-[#998d7f]" />
                          <span className="font-medium">{order.vendorName || "Unknown Vendor"}</span>
                        </div>
                      </td>

                      {/* PO Date */}
                      <td className="py-3.5 px-4 text-[#6e6357] text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#998d7f]" />
                          <span>{formatDate(order.poDate)}</span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-semibold text-[#211D19]">
                        {formatCurrency(order.total)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {renderStatusBadge(order.status)}
                      </td>

                      {/* Linked Bill */}
                      <td className="py-3.5 px-4 text-center text-xs">
                        {order.billNumber ? (
                          <span className="inline-flex items-center gap-1 text-[#3e5335] font-medium bg-[#eef4eb] px-2 py-0.5 rounded border border-[#d6e5d2]">
                            <FileCheck size={11} />
                            {order.billNumber}
                          </span>
                        ) : order.status === "Confirmed" ? (
                          <span className="text-xs text-amber-700 font-medium">
                            Ready to Bill
                          </span>
                        ) : (
                          <span className="text-xs text-[#998d7f]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => (onEditPO || onSelectPO)(order)}
                            className="p-1.5 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
                            title="Edit Purchase Order"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePO && onDeletePO(order.id)}
                            className="p-1.5 rounded-lg text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Purchase Order"
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

          {/* Table Footer Summary */}
          <div className="px-6 py-3.5 bg-[#faf8f4] border-t border-[#e7e3da] flex flex-col sm:flex-row items-center justify-between text-xs text-[#716B63] gap-2">
            <span>
              Showing <strong className="text-[#211D19]">{filteredOrders.length}</strong> of{" "}
              {purchaseOrders.length} orders
            </span>
            <span>
              Total Procurement:{" "}
              <strong className="text-[#211D19] font-semibold">
                {formatCurrency(
                  filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
                )}
              </strong>
            </span>
          </div>
        </div>
      ) : (
        /* ================= KANBAN VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectPO(order)}
              className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 hover:border-[#b8ad9e] transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: PO Number & Status & Actions */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#f0ece4]">
                  <span className="text-sm font-bold text-[#342921] group-hover:text-[#523e2b] transition flex items-center gap-1.5">
                    <ShoppingBag size={15} className="text-[#8f8274]" />
                    {order.poNumber}
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {renderStatusBadge(order.status)}
                    <button
                      type="button"
                      onClick={() => (onEditPO || onSelectPO)(order)}
                      className="p-1 rounded-md text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
                      title="Edit Purchase Order"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePO && onDeletePO(order.id)}
                      className="p-1 rounded-md text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Purchase Order"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Vendor Name */}
                <div className="mt-3.5">
                  <div className="text-xs text-[#998d7f] uppercase font-semibold tracking-wider">
                    Vendor
                  </div>
                  <div className="text-base font-semibold text-[#211D19] mt-0.5 flex items-center gap-1.5">
                    <User size={15} className="text-[#998d7f]" />
                    <span>{order.vendorName || "Unknown"}</span>
                  </div>
                </div>

                {/* Date & Items Count */}
                <div className="mt-3 flex items-center justify-between text-xs text-[#716B63]">
                  <div className="flex items-center gap-1">
                    <Calendar size={13} className="text-[#998d7f]" />
                    <span>{formatDate(order.poDate)}</span>
                  </div>
                  <span className="bg-[#faf8f4] px-2 py-0.5 rounded border border-[#e7e3da]">
                    {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {/* Card Bottom: Total Amount & Linked Bill */}
              <div className="mt-5 pt-3.5 border-t border-[#f0ece4] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#998d7f] block">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[#211D19]">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                {order.billNumber ? (
                  <span className="text-[11px] font-medium text-[#3e5335] bg-[#eef4eb] px-2 py-1 rounded border border-[#d6e5d2] flex items-center gap-1">
                    <FileCheck size={12} />
                    {order.billNumber}
                  </span>
                ) : (
                  <span className="text-xs text-[#6e6357] group-hover:text-[#211D19] transition flex items-center gap-1">
                    View
                    <ExternalLink size={12} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PurchaseOrderList;
