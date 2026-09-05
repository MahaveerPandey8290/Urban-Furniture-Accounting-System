import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Search, X, RotateCcw } from "lucide-react";
import ViewToggle from "../../../components/common/ViewToggle";

/**
 * BudgetReportHeader - Top bar with title, back button, new button, search bar, and view toggle
 */
export function BudgetReportHeader({
  currentView,
  onViewChange,
  searchTerm,
  onSearchChange,
  onOpenCreate,
  onResetData
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/invoicing_user");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top row: Title, Subtitle, Back and Action buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e7e3da] pb-5">
        <div className="flex items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-xl border border-[#e7e3da] bg-white text-[#5c5245] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-2xs cursor-pointer mt-0.5 sm:mt-0"
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#211D19] tracking-tight">
                Budget Reports
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f4ede4] text-[#342921]">
                Financial Reports
              </span>
            </div>
            <p className="text-sm text-[#716B63] mt-0.5">
              Track allocated expenditure, actual performance realization, and variance analytics
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Reset Demo Data button */}
          {onResetData && (
            <button
              type="button"
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-2xs cursor-pointer"
              title="Reset sample data"
            >
              <RotateCcw size={14} />
              <span className="hidden lg:inline">Reset Demo</span>
            </button>
          )}

          {/* New Budget Button */}
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#342921] hover:bg-[#251d17] text-white text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus size={16} />
            <span>New Budget</span>
          </button>
        </div>
      </div>

      {/* Second row: Search & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#998d7f]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search budgets by title, analytic account, or manager..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#e7e3da] bg-white text-sm text-[#211D19] placeholder-[#998d7f] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#998d7f] hover:text-[#211D19]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Toggle (List vs Kanban) */}
        <div className="flex items-center justify-end">
          <ViewToggle currentView={currentView} onChange={onViewChange} />
        </div>
      </div>
    </div>
  );
}

export default BudgetReportHeader;
