import React from "react";
import {
  Calendar,
  Briefcase,
  User,
  ChevronRight,
  Plus,
  PieChart as PieChartIcon,
  AlertCircle
} from "lucide-react";
import { formatINR, calculateAchievedPercent, calculateAmountToAchieve } from "./budgetData";
import { formatDate } from "../../../utils/formatters";
import BudgetChart from "./BudgetChart";

/**
 * Status Badge Component with brand-aligned styling
 */
export function StatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Draft":
        return "bg-stone-100 text-stone-700 border-stone-200";
      case "Revised":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-[#faf8f4] text-[#716B63] border-[#e7e3da]";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      {status || "Draft"}
    </span>
  );
}

/**
 * BudgetReportTable - Full financial table view with clickable rows and interactive pie chart preview
 */
export function BudgetReportTable({
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
        <div className="w-14 h-14 rounded-2xl bg-[#faf8f4] border border-[#e7e3da] flex items-center justify-center text-[#342921] mx-auto mb-4">
          <PieChartIcon size={28} />
        </div>
        <h3 className="text-lg font-bold text-[#211D19]">
          No Budget Reports Available
        </h3>
        <p className="text-sm text-[#716B63] max-w-md mx-auto mt-1 mb-5">
          Get started by setting up your first project or monthly procurement budget.
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
        <h3 className="text-base font-bold text-[#211D19]">
          No budget reports found.
        </h3>
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
    <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-[11px] font-semibold text-[#716B63] uppercase tracking-wider">
              <th className="py-3.5 px-3.5 lg:px-4 font-semibold">Budget</th>
              <th className="py-3.5 px-3 lg:px-3.5 font-semibold">Period</th>
              <th className="py-3.5 px-3 lg:px-3.5 font-semibold">Status</th>
              <th className="py-3.5 px-3 lg:px-3.5 font-semibold text-right">Committed</th>
              <th className="py-3.5 px-3 lg:px-3.5 font-semibold text-right">Achieved</th>
              <th className="py-3.5 px-3 lg:px-3.5 font-semibold text-right">To Achieve</th>
              <th className="py-3.5 px-2 lg:px-3 font-semibold text-center w-28">Ratio</th>
              <th className="py-3.5 px-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece4] text-sm text-[#211D19]">
            {budgets.map((budget) => {
              const committed = Number(budget.committedAmount) || 0;
              const achieved = Number(budget.achievedAmount) || 0;
              const percent = calculateAchievedPercent(achieved, committed);
              const remaining = calculateAmountToAchieve(achieved, committed);

              return (
                <tr
                  key={budget.id}
                  onClick={() => onSelectBudget(budget)}
                  className="hover:bg-[#faf8f4]/80 transition cursor-pointer group"
                >
                  {/* Budget Column */}
                  <td className="py-3 px-3.5 lg:px-4">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#faf8f4] border border-[#e7e3da] flex items-center justify-center text-[#342921] shrink-0 mt-0.5 group-hover:bg-[#342921] group-hover:text-white transition">
                        <Briefcase size={14} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-[#211D19] group-hover:text-[#342921] block truncate max-w-[180px] sm:max-w-xs">
                          {budget.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#716B63] mt-0.5">
                          {budget.analyticAccount && (
                            <span className="truncate max-w-[120px]">
                              {budget.analyticAccount}
                            </span>
                          )}
                          {budget.responsiblePerson && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[100px]">
                                {budget.responsiblePerson}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Period (Combined Start & End Date) */}
                  <td className="py-3 px-3 lg:px-3.5 text-xs text-[#5c5245] whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-[#998d7f] shrink-0" />
                      <span>{formatDate(budget.startDate)} – {formatDate(budget.endDate)}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 lg:px-3.5 whitespace-nowrap">
                    <StatusBadge status={budget.status} />
                  </td>

                  {/* Committed Amount */}
                  <td className="py-3 px-3 lg:px-3.5 text-right font-semibold text-[#211D19] whitespace-nowrap">
                    {formatINR(committed)}
                  </td>

                  {/* Achieved Amount */}
                  <td className="py-3 px-3 lg:px-3.5 text-right font-semibold text-emerald-700 whitespace-nowrap">
                    {formatINR(achieved)}
                  </td>

                  {/* Amount To Achieve */}
                  <td className="py-3 px-3 lg:px-3.5 text-right font-semibold text-[#625547] whitespace-nowrap">
                    {formatINR(remaining)}
                  </td>

                  {/* Pie Chart / Analytics Ratio Preview */}
                  <td
                    className="py-3 px-2 lg:px-3 text-center whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBudget(budget);
                    }}
                  >
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#faf8f4] hover:bg-[#f1ece4] border border-[#e7e3da] transition cursor-pointer">
                      <BudgetChart
                        committedAmount={committed}
                        achievedAmount={achieved}
                        compact={true}
                      />
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-[#211D19] block leading-tight">
                          {percent}%
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-[#716B63] font-medium block">
                          Ratio
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Row Navigation Icon */}
                  <td className="py-3 px-2 text-right w-8">
                    <ChevronRight
                      size={16}
                      className="text-[#998d7f] group-hover:text-[#342921] group-hover:translate-x-0.5 transition"
                    />
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

export default BudgetReportTable;
