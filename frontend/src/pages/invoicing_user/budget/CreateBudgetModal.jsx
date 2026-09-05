import React, { useState } from "react";
import { X, Plus, Calendar, Briefcase, User, Building, FileText, CheckCircle2 } from "lucide-react";
import { formatINR, calculateAchievedPercent, calculateAmountToAchieve } from "./budgetData";

/**
 * CreateBudgetModal - Modal to create a new budget report and save into localStorage
 */
export function CreateBudgetModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    committedAmount: "",
    achievedAmount: "0",
    status: "Draft",
    analyticAccount: "Showroom Operations",
    responsiblePerson: "Rajesh Sharma",
    department: "Retail & Showroom",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const committedNum = Number(formData.committedAmount) || 0;
  const achievedNum = Number(formData.achievedAmount) || 0;
  const previewPercent = calculateAchievedPercent(achievedNum, committedNum);
  const previewRemaining = calculateAmountToAchieve(achievedNum, committedNum);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Budget name is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "End date cannot be earlier than start date";
    }
    if (!formData.committedAmount || Number(formData.committedAmount) <= 0) {
      newErrors.committedAmount = "Please enter a valid committed budget amount";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newBudget = {
      id: `bgt-${Date.now()}`,
      name: formData.name.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      committedAmount: Number(formData.committedAmount),
      achievedAmount: Number(formData.achievedAmount) || 0,
      status: formData.status,
      analyticAccount: formData.analyticAccount.trim() || "General Operations",
      responsiblePerson: formData.responsiblePerson.trim() || "Finance Officer",
      department: formData.department.trim() || "General",
      notes: formData.notes.trim(),
      transactions: formData.achievedAmount > 0 ? [
        {
          id: `tx-${Date.now()}`,
          date: formData.startDate,
          ref: "INIT-ALLOC-01",
          description: "Initial realization entry",
          vendor: "Internal Transfer / Ledger",
          amount: Number(formData.achievedAmount),
          type: "Allocation",
          status: "Paid"
        }
      ] : []
    };

    onSave(newBudget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white border border-[#e7e3da] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e7e3da] bg-[#faf8f4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#342921] text-white flex items-center justify-center">
              <Plus size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#211D19]">
                Create Budget Report
              </h2>
              <p className="text-xs text-[#716B63]">
                Configure committed targets, period dates, and analytic allocation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#eae5dd] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Budget Name */}
          <div>
            <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
              Budget Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. April 2026 Showroom Operations"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition ${
                errors.name ? "border-rose-500" : "border-[#e7e3da]"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Date Range: Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
                Start Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition ${
                  errors.startDate ? "border-rose-500" : "border-[#e7e3da]"
                }`}
              />
              {errors.startDate && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
                End Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition ${
                  errors.endDate ? "border-rose-500" : "border-[#e7e3da]"
                }`}
              />
              {errors.endDate && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Financial Amounts: Committed & Achieved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
                Committed Amount (₹) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1000"
                value={formData.committedAmount}
                onChange={(e) => handleChange("committedAmount", e.target.value)}
                placeholder="e.g. 200000"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition ${
                  errors.committedAmount ? "border-rose-500" : "border-[#e7e3da]"
                }`}
              />
              {errors.committedAmount && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.committedAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
                Achieved Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.achievedAmount}
                onChange={(e) => handleChange("achievedAmount", e.target.value)}
                placeholder="e.g. 10000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition"
              />
            </div>
          </div>

          {/* Live Metric Preview Card */}
          {committedNum > 0 && (
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div>
                <span className="font-semibold block">Calculated Performance:</span>
                <span>
                  Achieved: {previewPercent}% ({formatINR(achievedNum)})
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold block">Amount To Achieve:</span>
                <span className="font-bold text-emerald-800">{formatINR(previewRemaining)}</span>
              </div>
            </div>
          )}

          {/* Status & Analytic Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Revised">Revised</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
                Analytic Account
              </label>
              <input
                type="text"
                value={formData.analyticAccount}
                onChange={(e) => handleChange("analyticAccount", e.target.value)}
                placeholder="e.g. Showroom Operations"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition"
              />
            </div>
          </div>

          {/* Responsible Person & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
                Responsible Person
              </label>
              <input
                type="text"
                value={formData.responsiblePerson}
                onChange={(e) => handleChange("responsiblePerson", e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                placeholder="e.g. Retail & Showroom"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#211D19] uppercase tracking-wider mb-1.5">
              Notes & Description
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Operational description or allocation objectives..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#e7e3da] text-sm text-[#211D19] bg-[#faf8f4] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#342921]/20 focus:border-[#342921] transition resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e7e3da]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] border border-[#e7e3da] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#342921] hover:bg-[#251d17] rounded-xl shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Save Budget</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBudgetModal;
