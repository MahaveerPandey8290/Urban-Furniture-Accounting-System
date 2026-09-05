import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  Building,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Tag,
  Receipt
} from "lucide-react";
import { formatINR, calculateAchievedPercent, calculateAmountToAchieve } from "./budgetData";
import { formatDate } from "../../../utils/formatters";
import BudgetChart from "./BudgetChart";
import { StatusBadge } from "./BudgetReportTable";

/**
 * BudgetReportDetails - Full detailed view for a single selected budget
 */
export function BudgetReportDetails({ budget, onBack, onUpdateStatus }) {
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!budget) return null;

  const committed = Number(budget.committedAmount) || 0;
  const achieved = Number(budget.achievedAmount) || 0;
  const percent = calculateAchievedPercent(achieved, committed);
  const remaining = calculateAmountToAchieve(achieved, committed);
  const isOverBudget = achieved > committed && committed > 0;

  const transactions = budget.transactions || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 min-w-0">
      {/* Top Navigation & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e3da] pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-[#e7e3da] bg-white text-[#5c5245] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-2xs cursor-pointer"
            title="Return to budget list"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#211D19] tracking-tight">
                {budget.name}
              </h1>
              <StatusBadge status={budget.status} />
            </div>
            <p className="text-sm text-[#716B63] mt-0.5">
              Budget Performance & Variance Analysis Report
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#5c5245] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-2xs cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#342921] hover:bg-[#251d17] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to All Budgets</span>
          </button>
        </div>
      </div>

      {/* Meta Information Bar */}
      <div className="bg-[#faf8f4] border border-[#e7e3da] rounded-2xl p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Timeline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#e7e3da] flex items-center justify-center text-[#342921] shrink-0">
              <Calendar size={16} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#716B63] block">
                Period Duration
              </span>
              <span className="font-bold text-[#211D19] mt-0.5 block">
                {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
              </span>
            </div>
          </div>

          {/* Responsible Person */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#e7e3da] flex items-center justify-center text-[#342921] shrink-0">
              <User size={16} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#716B63] block">
                Responsible Person
              </span>
              <span className="font-bold text-[#211D19] mt-0.5 block">
                {budget.responsiblePerson || "Finance Controller"}
              </span>
            </div>
          </div>

          {/* Analytic Account */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#e7e3da] flex items-center justify-center text-[#342921] shrink-0">
              <Briefcase size={16} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#716B63] block">
                Analytic Account
              </span>
              <span className="font-bold text-[#211D19] mt-0.5 block">
                {budget.analyticAccount || "General Operations"}
              </span>
            </div>
          </div>

          {/* Department */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#e7e3da] flex items-center justify-center text-[#342921] shrink-0">
              <Building size={16} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#716B63] block">
                Cost Center / Dept
              </span>
              <span className="font-bold text-[#211D19] mt-0.5 block">
                {budget.department || "Bangalore Central"}
              </span>
            </div>
          </div>
        </div>

        {budget.notes && (
          <div className="mt-4 pt-3 border-t border-[#e7e3da] text-xs text-[#716B63] flex items-start gap-2">
            <FileText size={14} className="text-[#998d7f] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[#342921] font-semibold">Notes:</strong> {budget.notes}
            </span>
          </div>
        )}
      </div>

      {/* 4 Financial Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Committed Amount */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs min-w-0">
          <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider block truncate">
            Committed Amount
          </span>
          <p className="text-xl sm:text-2xl font-bold text-[#211D19] mt-2 truncate" title={formatINR(committed)}>
            {formatINR(committed)}
          </p>
          <span className="text-[11px] text-[#998d7f] mt-1 block truncate">
            Approved financial commitment
          </span>
        </div>

        {/* Achieved Amount */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs min-w-0">
          <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider block truncate">
            Achieved Amount
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-2 truncate" title={formatINR(achieved)}>
            {formatINR(achieved)}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1 truncate">
            <TrendingUp size={12} className="shrink-0" />
            <span className="truncate">Realized via confirmed ledger bills</span>
          </span>
        </div>

        {/* Achieved % */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs min-w-0">
          <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider block truncate">
            Achieved %
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-xl sm:text-2xl font-bold text-[#211D19]">{percent}%</p>
            <span className="text-xs text-[#716B63]">of committed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#faf8f4] border border-[#e7e3da] mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget
                  ? "bg-rose-500"
                  : percent >= 75
                  ? "bg-emerald-600"
                  : "bg-[#342921]"
              }`}
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
        </div>

        {/* Amount To Achieve */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs min-w-0">
          <span className="text-xs uppercase font-semibold text-[#625547] tracking-wider block truncate">
            Amount To Achieve
          </span>
          <p className="text-xl sm:text-2xl font-bold text-[#342921] mt-2 truncate" title={formatINR(remaining)}>
            {formatINR(remaining)}
          </p>
          <span className="text-[11px] text-[#716B63] mt-1 block truncate">
            Remaining balance to realize
          </span>
        </div>
      </div>

      {/* Analytics Breakdown & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Donut / Pie Chart */}
        <div className="lg:col-span-5 min-w-0 bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-[#e7e3da]">
            <div>
              <h3 className="text-sm font-bold text-[#211D19] uppercase tracking-wider">
                Financial Variance Chart
              </h3>
              <p className="text-xs text-[#716B63]">
                Visual breakdown of Achieved vs Amount To Achieve
              </p>
            </div>
          </div>

          <BudgetChart
            committedAmount={committed}
            achievedAmount={achieved}
            size={220}
            strokeWidth={26}
            showLegend={true}
            showCenterLabel={true}
            interactive={true}
            className="my-2"
          />

          {/* Quick Summary Note */}
          <div className="w-full mt-4 p-3 bg-[#faf8f4] border border-[#e7e3da] rounded-xl text-xs text-[#716B63]">
            <p className="leading-relaxed">
              <strong className="text-[#342921]">Formula:</strong>{" "}
              Achieved % = ({formatINR(achieved)} / {formatINR(committed)}) × 100 ={" "}
              <span className="font-bold text-[#211D19]">{percent}%</span>.
              Remaining target to achieve is{" "}
              <span className="font-bold text-[#342921]">{formatINR(remaining)}</span>.
            </p>
          </div>
        </div>

        {/* Right Column: Ledger Itemization / Contribution Transactions */}
        <div className="lg:col-span-7 min-w-0 bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e7e3da] gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#211D19] uppercase tracking-wider truncate">
                Realized Transactions ({transactions.length})
              </h3>
              <p className="text-xs text-[#716B63] truncate">
                Vendor bills, expenses, and POs contributing to achieved amount
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#faf8f4] border border-[#e7e3da] text-[#342921] shrink-0">
              Sum: {formatINR(achieved)}
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <Receipt size={32} className="text-[#998d7f] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-[#211D19]">
                No ledger transactions recorded yet
              </p>
              <p className="text-xs text-[#716B63] mt-1">
                When bills or purchase orders are confirmed against this budget, they will reflect here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e7e3da] text-[11px] font-semibold text-[#716B63] uppercase tracking-wider">
                    <th className="pb-2.5 font-semibold">Date</th>
                    <th className="pb-2.5 font-semibold">Reference</th>
                    <th className="pb-2.5 font-semibold">Description</th>
                    <th className="pb-2.5 font-semibold">Vendor / Partner</th>
                    <th className="pb-2.5 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece4] text-[#211D19]">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#faf8f4]/60 transition">
                      <td className="py-3 font-medium text-[#716B63] whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 font-semibold text-[#342921] whitespace-nowrap">
                        {tx.ref}
                      </td>
                      <td className="py-3 max-w-[180px] truncate text-[#211D19]">
                        {tx.description}
                      </td>
                      <td className="py-3 text-[#716B63] whitespace-nowrap">
                        {tx.vendor}
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                        {formatINR(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BudgetReportDetails;
