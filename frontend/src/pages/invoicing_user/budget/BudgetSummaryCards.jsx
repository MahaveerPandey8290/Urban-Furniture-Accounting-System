import React from "react";
import { TrendingUp, Target, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { formatINR, calculateAchievedPercent } from "./budgetData";

/**
 * KPI Summary Cards showing cumulative financial performance metrics
 */
export function BudgetSummaryCards({ budgets = [] }) {
  const totalCommitted = budgets.reduce((acc, b) => acc + (Number(b.committedAmount) || 0), 0);
  const totalAchieved = budgets.reduce((acc, b) => acc + (Number(b.achievedAmount) || 0), 0);
  const totalToAchieve = Math.max(0, totalCommitted - totalAchieved);
  const overallPercent = calculateAchievedPercent(totalAchieved, totalCommitted);

  const confirmedCount = budgets.filter((b) => b.status === "Confirmed").length;
  const draftCount = budgets.filter((b) => b.status === "Draft").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Committed Amount */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 min-w-0 cursor-default">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider truncate">
            Total Committed
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#faf8f4] border border-[#e7e3da] flex items-center justify-center text-[#342921] shrink-0">
            <Target size={16} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-[#211D19] mt-2 tracking-tight truncate" title={formatINR(totalCommitted)}>
          {formatINR(totalCommitted)}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-[#716B63] mt-1 truncate">
          <span>Across {budgets.length} planned budget{budgets.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Total Achieved Amount */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 min-w-0 cursor-default">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider truncate">
            Total Achieved
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-2 tracking-tight truncate" title={formatINR(totalAchieved)}>
          {formatINR(totalAchieved)}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1 truncate">
          <TrendingUp size={13} className="shrink-0" />
          <span className="truncate">Realized via confirmed ledger bills</span>
        </div>
      </div>

      {/* Total Amount To Achieve */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 min-w-0 cursor-default">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase font-semibold text-[#625547] tracking-wider truncate">
            Amount To Achieve
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
            <Clock size={16} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-[#342921] mt-2 tracking-tight truncate" title={formatINR(totalToAchieve)}>
          {formatINR(totalToAchieve)}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-[#716B63] mt-1 truncate">
          <span>Remaining target to realize</span>
        </div>
      </div>

      {/* Overall Achieved Rate */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 min-w-0 cursor-default">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider truncate">
            Overall Achieved %
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f4ede4] text-[#342921] shrink-0">
            {confirmedCount} Confirmed
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-xl sm:text-2xl font-bold text-[#211D19] tracking-tight">{overallPercent}%</p>
          <span className="text-xs text-[#716B63]">completion</span>
        </div>

        {/* Dynamic progress bar */}
        <div className="w-full h-2 rounded-full bg-[#f4ede4] mt-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out ${
              overallPercent >= 100
                ? "bg-rose-500"
                : overallPercent >= 50
                ? "bg-emerald-600"
                : "bg-[#342921]"
            }`}
            style={{ width: `${Math.min(100, overallPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default BudgetSummaryCards;
