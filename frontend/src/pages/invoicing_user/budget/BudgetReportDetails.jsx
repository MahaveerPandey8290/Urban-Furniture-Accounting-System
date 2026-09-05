import React, { useState, useEffect } from "react";
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
  Receipt,
  FileEdit,
  Ban,
  Link2,
  Save,
  RotateCcw,
  Check,
} from "lucide-react";
import { formatINR, calculateAchievedPercent, calculateAmountToAchieve } from "./budgetData";
import { formatDate } from "../../../utils/formatters";
import BudgetChart from "./BudgetChart";
import { StatusBadge } from "./BudgetReportTable";

/**
 * BudgetReportDetails - Full detailed view for a single selected budget
 */
export function BudgetReportDetails({
  budget,
  allBudgets = [],
  onBack,
  onUpdateBudget,
  onSelectBudget,
}) {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Revised Budget Section state - open ONLY when user clicks Revised button
  const [showRevisionSection, setShowRevisionSection] = useState(false);
  const [revisionStatus, setRevisionStatus] = useState(() =>
    budget?.revisionStatus || (budget?.status === "Revised" ? "Revised" : "Draft")
  );
  const [revisedCommitted, setRevisedCommitted] = useState(() =>
    budget?.revisedCommittedAmount !== undefined
      ? String(budget.revisedCommittedAmount)
      : String(budget?.committedAmount || "")
  );
  const [revisedName, setRevisedName] = useState(() =>
    budget?.revisedName || (budget ? `${budget.name} (Revised)` : "")
  );
  const [revisionReason, setRevisionReason] = useState(() => budget?.revisionReason || "");
  const [revisionDate, setRevisionDate] = useState(() =>
    budget?.revisionDate || new Date().toISOString().split("T")[0]
  );

  // Sync state when incoming budget changes (always keep section closed until user clicks Revised)
  useEffect(() => {
    if (budget) {
      setShowRevisionSection(false);
      setRevisionStatus(budget.revisionStatus || (budget.status === "Revised" ? "Revised" : "Draft"));
      setRevisedCommitted(
        budget.revisedCommittedAmount !== undefined
          ? String(budget.revisedCommittedAmount)
          : String(budget.committedAmount || "")
      );
      setRevisedName(budget.revisedName || `${budget.name} (Revised)`);
      setRevisionReason(budget.revisionReason || "");
      setRevisionDate(budget.revisionDate || new Date().toISOString().split("T")[0]);
    }
  }, [budget?.id]);

  if (!budget) return null;

  const committed = Number(budget.committedAmount) || 0;
  const achieved = Number(budget.achievedAmount) || 0;
  const percent = calculateAchievedPercent(achieved, committed);
  const remaining = calculateAmountToAchieve(achieved, committed);
  const isOverBudget = achieved > committed && committed > 0;

  const transactions = budget.transactions || [];

  // Variance calculations for revision
  const originalCommittedAmount = Number(budget.originalCommittedAmount || budget.committedAmount) || 0;
  const originalBudgetName = budget.originalBudgetName || budget.name;
  const currentRevisedCommitted = parseFloat(revisedCommitted) || committed;
  const varianceAmount = currentRevisedCommitted - originalCommittedAmount;
  const variancePercent =
    originalCommittedAmount > 0
      ? Math.round((varianceAmount / originalCommittedAmount) * 1000) / 10
      : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleCancelBudget = () => {
    if (window.confirm(`Are you sure you want to cancel budget "${budget.name}"?`)) {
      const updated = {
        ...budget,
        status: "Cancelled",
        revisionStatus: "Cancelled",
      };
      onUpdateBudget && onUpdateBudget(updated);
    }
  };

  // Workflow status handler inside revised section
  const handleSetRevisionStatus = (newStatus) => {
    setRevisionStatus(newStatus);
    const newCommitted = parseFloat(revisedCommitted) || committed;
    const updated = {
      ...budget,
      status:
        newStatus === "Cancelled"
          ? "Cancelled"
          : newStatus === "Draft"
          ? "Draft"
          : newStatus === "Confirmed"
          ? "Confirmed"
          : "Revised",
      revisionStatus: newStatus,
      isRevised: true,
      originalCommittedAmount: budget.originalCommittedAmount || committed,
      originalBudgetName: budget.originalBudgetName || budget.name,
      originalBudgetId: budget.originalBudgetId || budget.id,
      revisedCommittedAmount: newCommitted,
      revisionReason,
      revisionDate,
    };
    onUpdateBudget && onUpdateBudget(updated);
  };

  // Save / Apply revision
  const handleSaveRevision = () => {
    const newCommitted = parseFloat(revisedCommitted) || committed;
    const updated = {
      ...budget,
      name: revisedName.trim() || budget.name,
      committedAmount: newCommitted,
      status:
        revisionStatus === "Cancelled"
          ? "Cancelled"
          : revisionStatus === "Draft"
          ? "Draft"
          : revisionStatus === "Confirmed"
          ? "Confirmed"
          : "Revised",
      revisionStatus,
      isRevised: true,
      originalCommittedAmount: budget.originalCommittedAmount || committed,
      originalBudgetName: budget.originalBudgetName || budget.name,
      originalBudgetId: budget.originalBudgetId || budget.id,
      revisedCommittedAmount: newCommitted,
      revisionReason,
      revisionDate,
      revisions: [
        ...(budget.revisions || []),
        {
          id: `rev-${Date.now()}`,
          date: revisionDate,
          status: revisionStatus,
          previousCommitted: committed,
          revisedCommitted: newCommitted,
          reason: revisionReason,
        },
      ],
    };
    onUpdateBudget && onUpdateBudget(updated);
  };

  // Navigate to original budget
  const handleNavigateToOriginalBudget = () => {
    if (budget.originalBudgetId && budget.originalBudgetId !== budget.id && onSelectBudget) {
      const original = allBudgets.find((b) => b.id === budget.originalBudgetId);
      if (original) {
        onSelectBudget(original);
        return;
      }
    }
    // If same budget or base budget, scroll smoothly to overview
    const el = document.getElementById("original-budget-overview");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 min-w-0" id="original-budget-overview">
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
              {budget.isRevised && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <FileEdit size={12} />
                  Revised Edition
                </span>
              )}
            </div>
            <p className="text-sm text-[#716B63] mt-0.5">
              Budget Performance & Variance Analysis Report
            </p>
          </div>
        </div>

        {/* Actions: Revised, Cancel, Print Report, Back */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Revised Button - styled same as New Budget button */}
          <button
            type="button"
            onClick={() => {
              setShowRevisionSection((prev) => {
                const next = !prev;
                if (next) {
                  setTimeout(() => {
                    const el = document.getElementById("revised-budget-section");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 60);
                }
                return next;
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#342921] hover:bg-[#251d17] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Open Revised Budget Section"
          >
            <FileEdit size={15} />
            <span>Revised</span>
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleCancelBudget}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-semibold transition shadow-2xs cursor-pointer"
            title="Cancel budget"
          >
            <Ban size={15} />
            <span>Cancel</span>
          </button>

          {/* Print Report */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#5c5245] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-2xs cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>

          {/* Back to All Budgets */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#5c5245] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to All Budgets</span>
          </button>
        </div>
      </div>

      {/* ================= REVISED BUDGET SECTION ================= */}
      {showRevisionSection && (
        <div
          id="revised-budget-section"
          className="bg-gradient-to-br from-[#faf7f2] via-white to-[#fbf9f5] border-2 border-[#342921]/30 rounded-2xl p-5 sm:p-6 shadow-md transition-all duration-300 animate-in fade-in"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#e7e3da]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#342921] border border-[#251d17] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <FileEdit size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-[#211D19]">
                    Revised Budget Section
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#342921] text-white">
                    {revisionStatus}
                  </span>
                </div>
                <p className="text-xs text-[#716B63] mt-0.5">
                  Propose, adjust commitments, and track revision workflow lifecycle.
                </p>
              </div>
            </div>

            {/* Workflow Action Buttons: Draft, Confirm, Revised, Cancel */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetRevisionStatus("Draft")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer ${
                  revisionStatus === "Draft"
                    ? "bg-[#251d17] text-white ring-2 ring-[#342921] ring-offset-2"
                    : "bg-[#342921] hover:bg-[#251d17] text-white"
                }`}
                title="Set status to Draft"
              >
                {revisionStatus === "Draft" && <Check size={14} className="text-amber-300" />}
                <span>Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetRevisionStatus("Confirmed")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer ${
                  revisionStatus === "Confirmed"
                    ? "bg-[#251d17] text-white ring-2 ring-[#342921] ring-offset-2"
                    : "bg-[#342921] hover:bg-[#251d17] text-white"
                }`}
                title="Set status to Confirmed"
              >
                {revisionStatus === "Confirmed" && <Check size={14} className="text-amber-300" />}
                <span>Confirm</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetRevisionStatus("Revised")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer ${
                  revisionStatus === "Revised"
                    ? "bg-[#251d17] text-white ring-2 ring-[#342921] ring-offset-2"
                    : "bg-[#342921] hover:bg-[#251d17] text-white"
                }`}
                title="Set status to Revised"
              >
                {revisionStatus === "Revised" && <Check size={14} className="text-amber-300" />}
                <span>Revised</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetRevisionStatus("Cancelled")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer ${
                  revisionStatus === "Cancelled"
                    ? "bg-[#251d17] text-white ring-2 ring-[#342921] ring-offset-2"
                    : "bg-[#342921] hover:bg-[#251d17] text-white"
                }`}
                title="Set status to Cancelled"
              >
                {revisionStatus === "Cancelled" && <Check size={14} className="text-amber-300" />}
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {/* Original Budget Link & Comparison */}
          <div className="bg-white border border-[#e7e3da] rounded-xl p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#716B63]">
                Original Budget:
              </span>
              <button
                type="button"
                onClick={handleNavigateToOriginalBudget}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#faf8f4] hover:bg-[#f1ece4] border border-[#dcd6ca] text-xs font-bold text-[#342921] hover:text-[#18130f] transition cursor-pointer shadow-2xs group"
                title="View original budget baseline"
              >
                <Link2 size={13} className="text-[#8f8274] group-hover:text-[#342921]" />
                <span className="underline decoration-dotted underline-offset-2">
                  {originalBudgetName}
                </span>
                <span className="text-[10px] text-[#716B63] font-normal">
                  (Baseline: {formatINR(originalCommittedAmount)})
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#716B63]">Committed Delta:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-md ${
                  varianceAmount > 0
                    ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                    : varianceAmount < 0
                    ? "text-rose-700 bg-rose-50 border border-rose-200"
                    : "text-[#716B63] bg-[#faf8f4] border border-[#e7e3da]"
                }`}
              >
                {varianceAmount > 0 ? "+" : ""}
                {formatINR(varianceAmount)} ({variancePercent > 0 ? "+" : ""}
                {variancePercent}%)
              </span>
            </div>
          </div>

          {/* Form Fields for Revision */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Revised Committed Amount */}
            <div>
              <label className="block text-xs font-semibold text-[#211D19] mb-1.5">
                Revised Committed Amount (₹) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={revisedCommitted}
                onChange={(e) => setRevisedCommitted(e.target.value)}
                placeholder="e.g. 250000"
                className="w-full h-10 px-3.5 rounded-xl border border-[#cfc6b6] bg-white text-sm font-bold text-[#211D19] outline-none focus:border-[#342921] transition"
              />
              <span className="text-[11px] text-[#716B63] mt-1 block">
                Original committed was {formatINR(originalCommittedAmount)}
              </span>
            </div>

            {/* Revised Version Name / Tag */}
            <div>
              <label className="block text-xs font-semibold text-[#211D19] mb-1.5">
                Revision Title
              </label>
              <input
                type="text"
                value={revisedName}
                onChange={(e) => setRevisedName(e.target.value)}
                placeholder="e.g. Q1 Scope Extension"
                className="w-full h-10 px-3.5 rounded-xl border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
              />
              <span className="text-[11px] text-[#716B63] mt-1 block">
                Custom reference for audit and reports
              </span>
            </div>

            {/* Effective Revision Date */}
            <div>
              <label className="block text-xs font-semibold text-[#211D19] mb-1.5">
                Effective Revision Date
              </label>
              <input
                type="date"
                value={revisionDate}
                onChange={(e) => setRevisionDate(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
              />
              <span className="text-[11px] text-[#716B63] mt-1 block">
                Date revision becomes active
              </span>
            </div>

            {/* Scope Justification / Notes */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#211D19] mb-1.5">
                Revision Justification & Variance Notes
              </label>
              <textarea
                rows={2}
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                placeholder="Describe reasons for budget revision (e.g. Scope extension, raw material price escalation, vendor contractual adjustments)..."
                className="w-full p-3 rounded-xl border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
              />
            </div>
          </div>

          {/* Section Footer: Apply / Save Buttons */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#e7e3da] flex-wrap gap-3">
            <div className="text-xs text-[#716B63]">
              Status will be saved as: <strong className="text-[#211D19]">{revisionStatus}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRevisionSection(false)}
                className="px-4 py-2 rounded-xl border border-[#342921] bg-white hover:bg-[#faf8f4] text-xs font-semibold text-[#342921] transition cursor-pointer shadow-2xs"
              >
                Close Section
              </button>
              <button
                type="button"
                onClick={handleSaveRevision}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#342921] hover:bg-[#251d17] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Save size={14} />
                <span>Save & Apply Revision</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
