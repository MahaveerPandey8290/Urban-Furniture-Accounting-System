import React from "react";
import { Filter, Calendar, X, Tag } from "lucide-react";

/**
 * BudgetReportFilters - Comprehensive filtering by status, date range, and budget name
 */
export function BudgetReportFilters({
  statusFilter,
  onStatusChange,
  startDateFilter,
  onStartDateChange,
  endDateFilter,
  onEndDateChange,
  selectedCategory,
  onCategoryChange,
  categories = [],
  onClearFilters,
  hasActiveFilters
}) {
  const statuses = [
    { value: "ALL", label: "All Statuses" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Draft", label: "Draft" },
    { value: "Revised", label: "Revised" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  return (
    <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 shadow-2xs min-w-0">
      {/* Filter Header with Active Indicator & Reset Button */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#211D19]">
          <Filter size={14} className="text-[#716B63]" />
          <span>Filter Reports</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              Active Filters
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-lg transition cursor-pointer"
          >
            <X size={13} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* 4-column responsive input grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Status Filter */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-[#716B63] uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-[#211D19] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category / Analytic Account Filter */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-[#716B63] uppercase tracking-wider mb-1">
            Analytic Account
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-[#211D19] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition cursor-pointer"
          >
            <option value="ALL">All Analytic Accounts</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-[#716B63] uppercase tracking-wider mb-1">
            From Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-[#211D19] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="min-w-0">
          <label className="block text-[11px] font-semibold text-[#716B63] uppercase tracking-wider mb-1">
            To Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-[#211D19] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetReportFilters;
