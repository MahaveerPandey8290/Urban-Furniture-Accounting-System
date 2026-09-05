import React, { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Wallet,
  TrendingUp,
  FileText,
  ChevronRight,
} from "lucide-react";
import BalanceSheet from "../invoicing_user/BalanceSheet";
import ProfitAndLoss from "../invoicing_user/ProfitAndLoss";
import { BudgetReport } from "../invoicing_user/BudgetReport";

export default function Reports() {
  const [activeReport, setActiveReport] = useState(null);

  if (activeReport === "balance") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveReport(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-sm font-semibold text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to All Reports</span>
          </button>
        </div>
        <BalanceSheet />
      </div>
    );
  }

  if (activeReport === "profit") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveReport(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-sm font-semibold text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to All Reports</span>
          </button>
        </div>
        <ProfitAndLoss />
      </div>
    );
  }

  if (activeReport === "budget") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveReport(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-sm font-semibold text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to All Reports</span>
          </button>
        </div>
        <BudgetReport />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#716B63] mb-1">
          <span>Finance</span>
          <span>/</span>
          <span className="text-[#211D19] font-semibold">Reports</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
          Financial & Accounting Reports
        </h1>
        <p className="mt-1 text-sm text-[#716B63]">
          Real-time balance sheet statement, profit & loss income statement, and analytical budget variance reports.
        </p>
      </div>

      {/* 3 Main Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Balance Sheet */}
        <button
          type="button"
          onClick={() => setActiveReport("balance")}
          className="group text-left rounded-2xl border border-[#e7e3da] bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#342921]/40 transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#faf8f4] border border-[#e7e3da] text-[#342921] group-hover:bg-[#342921] group-hover:text-white transition">
                <Wallet size={22} />
              </div>
              <ChevronRight
                size={18}
                className="text-[#9b9087] group-hover:translate-x-1 transition-transform"
              />
            </div>
            <h2 className="mt-5 text-xl font-bold text-[#211D19]">
              Balance Sheet
            </h2>
            <p className="mt-2 text-sm text-[#716B63] leading-relaxed">
              Track business assets, liabilities, and owners equity calculated from posted journal transactions.
            </p>
          </div>
          <div className="mt-6 border-t border-[#f4f1ea] pt-3 text-xs font-semibold text-[#342921] flex items-center justify-between">
            <span>View Statement</span>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">Real-time</span>
          </div>
        </button>

        {/* 2. Profit & Loss */}
        <button
          type="button"
          onClick={() => setActiveReport("profit")}
          className="group text-left rounded-2xl border border-[#e7e3da] bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#342921]/40 transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#faf8f4] border border-[#e7e3da] text-[#342921] group-hover:bg-[#342921] group-hover:text-white transition">
                <TrendingUp size={22} />
              </div>
              <ChevronRight
                size={18}
                className="text-[#9b9087] group-hover:translate-x-1 transition-transform"
              />
            </div>
            <h2 className="mt-5 text-xl font-bold text-[#211D19]">
              Profit & Loss
            </h2>
            <p className="mt-2 text-sm text-[#716B63] leading-relaxed">
              Comprehensive income statement comparing total operating revenue against cost of goods and business expenditures.
            </p>
          </div>
          <div className="mt-6 border-t border-[#f4f1ea] pt-3 text-xs font-semibold text-[#342921] flex items-center justify-between">
            <span>View Statement</span>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">Real-time</span>
          </div>
        </button>

        {/* 3. Budget Reports */}
        <button
          type="button"
          onClick={() => setActiveReport("budget")}
          className="group text-left rounded-2xl border border-[#e7e3da] bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#342921]/40 transition cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#faf8f4] border border-[#e7e3da] text-[#342921] group-hover:bg-[#342921] group-hover:text-white transition">
                <BarChart3 size={22} />
              </div>
              <ChevronRight
                size={18}
                className="text-[#9b9087] group-hover:translate-x-1 transition-transform"
              />
            </div>
            <h2 className="mt-5 text-xl font-bold text-[#211D19]">
              Budget Reports
            </h2>
            <p className="mt-2 text-sm text-[#716B63] leading-relaxed">
              Analyse committed budgets against actual expenditures and sales revenue per analytical category with revision tracking.
            </p>
          </div>
          <div className="mt-6 border-t border-[#f4f1ea] pt-3 text-xs font-semibold text-[#342921] flex items-center justify-between">
            <span>View Variance Analysis</span>
            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">Revised Budgets</span>
          </div>
        </button>
      </div>

      {/* Overview Notice */}
      <div className="rounded-2xl border border-[#e7e3da] bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#faf8f4] text-[#342921]">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#211D19]">
              Live Ledger Integration
            </h3>
            <p className="text-xs text-[#716B63] mt-0.5">
              All financial reporting metrics are derived directly from posted journal items, validated customer invoices, and confirmed vendor bills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}