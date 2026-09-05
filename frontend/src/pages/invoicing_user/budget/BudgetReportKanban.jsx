import React from "react";
import { Calendar, User, Briefcase, ChevronRight, Plus, AlertCircle } from "lucide-react";
import { formatINR, calculateAchievedPercent, calculateAmountToAchieve } from "./budgetData";
import { formatDate } from "../../../utils/formatters";
import BudgetChart from "./BudgetChart";
import { StatusBadge } from "./BudgetReportTable";

const COLUMNS = [
  { id: "Confirmed", title: "Confirmed", dotColor: "bg-emerald-500" },
  { id: "Draft", title: "Draft", dotColor: "bg-stone-400" },
  { id: "Revised", title: "Revised", dotColor: "bg-amber-500" },
  { id: "Cancelled", title: "Cancelled", dotColor: "bg-rose-500" },
];

/**
 * BudgetReportKanban - Kanban board grouping budgets by financial status
 */
export function BudgetReportKanban({
  budgets = [],
  totalBudgetsCount = 0,
  onSelectBudget,
  onOpenCreate,
  onClearFilters
}) {
  // Empty State 1: When no budgets exist at all
  if (totalBudgetsCount === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-2xs">
        <h3 className="text-lg font-bold text-[#211D19]">No Budget Reports Available</h3>
        <p className="text-sm text-[#716B63] max-w-md mx-auto mt-1 mb-5">
          Get started by creating your first budget report.
        </p>
        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#342921] hover:bg-[#241e18] text-white text-sm font-semibold transition shadow-xs cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Budget</span>
        </button>
      </div>
    );
  }

  // Empty State 2: When search/filters yield zero results
  if (budgets.length === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mx-auto mb-3">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-[#211D19]">No budget reports found.</h3>
        <p className="text-xs text-[#716B63] mt-1 mb-4">
          Try adjusting your search criteria, selected date range, or status filters.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-xs font-semibold text-[#342921] hover:bg-white transition cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
      {COLUMNS.map((col) => {
        const columnBudgets = budgets.filter((b) => (b.status || "Draft") === col.id);

        return (
          <div
            key={col.id}
            className="bg-[#faf8f4]/60 border border-[#e7e3da] rounded-2xl p-3.5 flex flex-col min-h-[450px] min-w-0"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e7e3da] gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.dotColor}`} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#211D19] truncate">
                  {col.title}
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-[#e7e3da] text-[#716B63] shrink-0">
                {columnBudgets.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1">
              {columnBudgets.length === 0 ? (
                <div className="h-32 rounded-xl border border-dashed border-[#e7e3da] flex items-center justify-center text-xs text-[#998d7f]">
                  No {col.title.toLowerCase()} budgets
                </div>
              ) : (
                columnBudgets.map((budget) => {
                  const committed = Number(budget.committedAmount) || 0;
                  const achieved = Number(budget.achievedAmount) || 0;
                  const percent = calculateAchievedPercent(achieved, committed);
                  const remaining = calculateAmountToAchieve(achieved, committed);

                  return (
                    <div
                      key={budget.id}
                      onClick={() => onSelectBudget(budget)}
                      className="bg-white border border-[#e7e3da] hover:border-[#342921]/40 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer group min-w-0"
                    >
                      {/* Card Header: Title & Status */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-[#faf8f4] border border-[#e7e3da] flex items-center justify-center text-[#342921] shrink-0 group-hover:bg-[#342921] group-hover:text-white transition">
                            <Briefcase size={13} />
                          </div>
                          <h4 className="text-sm font-bold text-[#211D19] group-hover:text-[#342921] truncate">
                            {budget.name}
                          </h4>
                        </div>
                        <StatusBadge status={budget.status} />
                      </div>

                      {/* Analytic Account & Person */}
                      <div className="space-y-1 mb-3 text-xs text-[#716B63]">
                        {budget.analyticAccount && (
                          <div className="text-[11px] font-medium text-[#4a3b2f] bg-[#f5f1ea] px-2 py-0.5 rounded inline-block truncate max-w-full">
                            {budget.analyticAccount}
                          </div>
                        )}
                        {budget.responsiblePerson && (
                          <div className="flex items-center gap-1 text-[11px] text-[#716B63] pt-0.5 truncate">
                            <User size={12} className="text-[#998d7f] shrink-0" />
                            <span className="truncate">{budget.responsiblePerson}</span>
                          </div>
                        )}
                      </div>

                      {/* Mini Donut Chart & Percent Row */}
                      <div className="flex items-center justify-between bg-[#faf8f4] p-2.5 rounded-xl border border-[#e7e3da] mb-3 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <BudgetChart
                            committedAmount={committed}
                            achievedAmount={achieved}
                            compact={true}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-[#211D19] block truncate">
                              {percent}% Realized
                            </span>
                            <span className="text-[10px] text-[#716B63] block truncate">
                              {formatINR(achieved)} of {formatINR(committed)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Key Figures */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#f0ece4]">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-semibold text-[#716B63] block truncate">
                            Committed
                          </span>
                          <span className="font-bold text-[#211D19] block truncate" title={formatINR(committed)}>
                            {formatINR(committed)}
                          </span>
                        </div>
                        <div className="text-right min-w-0">
                          <span className="text-[10px] uppercase font-semibold text-[#716B63] block truncate">
                            To Achieve
                          </span>
                          <span className="font-bold text-[#625547] block truncate" title={formatINR(remaining)}>
                            {formatINR(remaining)}
                          </span>
                        </div>
                      </div>

                      {/* Footer: Date Range */}
                      <div className="flex items-center justify-between text-[11px] text-[#998d7f] mt-3 pt-2 border-t border-[#f0ece4] gap-2">
                        <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                          <Calendar size={11} className="shrink-0" />
                          <span className="truncate">{formatDate(budget.startDate)} – {formatDate(budget.endDate)}</span>
                        </div>
                        <ChevronRight size={13} className="text-[#998d7f] shrink-0 group-hover:text-[#342921] group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BudgetReportKanban;
