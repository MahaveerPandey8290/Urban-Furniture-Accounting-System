import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Save,
  Send,
  X,
  FileText,
  Calendar,
  BookOpen,
  User,
} from "lucide-react";

function JournalEntryForm({
  initialData,
  journals = [],
  accounts = [],
  contacts = [],
  onSave,
  onBack,
}) {
  const isPosted = initialData?.status === "Posted";

  // Form states
  const [accountingDate, setAccountingDate] = useState(() => {
    if (initialData?.accountingDate) return initialData.accountingDate;
    return new Date().toISOString().split("T")[0];
  });

  const [journalId, setJournalId] = useState(() => {
    return initialData?.journalId || (journals.length > 0 ? journals[0].id : "");
  });

  const [number, setNumber] = useState(() => {
    if (initialData?.number) return initialData.number;
    return "MISC/2026/" + String(Date.now()).slice(-3);
  });

  // Items table state
  const [items, setItems] = useState(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((it, idx) => ({
        id: it.id || "item-" + idx,
        accountId: it.accountId || "",
        partnerId: it.partnerId || "",
        debit: Number(it.debit) || 0,
        credit: Number(it.credit) || 0,
      }));
    }
    // Default 2 lines for double-entry
    return [
      { id: "line-1", accountId: "", partnerId: "", debit: 0, credit: 0 },
      { id: "line-2", accountId: "", partnerId: "", debit: 0, credit: 0 },
    ];
  });

  const [errors, setErrors] = useState({});
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Mark form dirty on changes
  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  // Compute live totals
  const { totalDebit, totalCredit, difference, isBalanced } = useMemo(() => {
    const debitSum = items.reduce((acc, it) => acc + (Number(it.debit) || 0), 0);
    const creditSum = items.reduce((acc, it) => acc + (Number(it.credit) || 0), 0);
    const diff = Math.abs(debitSum - creditSum);
    return {
      totalDebit: debitSum,
      totalCredit: creditSum,
      difference: diff,
      isBalanced: diff === 0 && debitSum > 0,
    };
  }, [items]);

  // Handle Journal Item line update
  const handleItemChange = (index, field, value) => {
    if (isPosted) return;
    markDirty();

    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === "debit") {
        const val = Math.max(0, Number(value) || 0);
        target.debit = val;
        // Strict single-sided rule: an item cannot have both debit and credit
        if (val > 0) {
          target.credit = 0;
        }
      } else if (field === "credit") {
        const val = Math.max(0, Number(value) || 0);
        target.credit = val;
        // Strict single-sided rule
        if (val > 0) {
          target.debit = 0;
        }
      } else {
        target[field] = value;
      }

      updated[index] = target;
      return updated;
    });

    if (errors[`item_${index}_${field}`] || errors.general) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`item_${index}_${field}`];
        delete copy.general;
        return copy;
      });
    }
  };

  // Add line to Journal Items
  const handleAddLine = () => {
    if (isPosted) return;
    markDirty();
    setItems((prev) => [
      ...prev,
      {
        id: "line-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        accountId: "",
        partnerId: "",
        debit: 0,
        credit: 0,
      },
    ]);
  };

  // Remove line from Journal Items
  const handleRemoveLine = (index) => {
    if (isPosted) return;
    if (items.length <= 2) {
      alert("A journal entry requires at least 2 lines for double-entry accounting.");
      return;
    }
    markDirty();
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = (isPosting = false) => {
    const newErrors = {};

    if (!accountingDate) {
      newErrors.accountingDate = "Accounting Date is required";
    }

    if (!journalId) {
      newErrors.journalId = "Journal selection is required";
    }

    if (items.length < 2) {
      newErrors.general = "At least two journal lines are required";
    }

    items.forEach((it, idx) => {
      if (!it.accountId) {
        newErrors[`item_${idx}_account`] = "Account is required";
      }
      if (isPosting && it.debit === 0 && it.credit === 0) {
        newErrors[`item_${idx}_amount`] = "Enter debit or credit amount";
      }
      if (it.debit > 0 && it.credit > 0) {
        newErrors[`item_${idx}_amount`] = "Cannot have both debit and credit on the same line";
      }
    });

    if (isPosting) {
      if (totalDebit === 0 && totalCredit === 0) {
        newErrors.balance = "Please enter transaction amounts before posting.";
      } else if (!isBalanced) {
        newErrors.balance = `Debit and Credit totals must be equal before posting. Difference: Rs. ${difference.toLocaleString()}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler (Draft or Post)
  const handleSaveAction = (targetStatus) => {
    const isPosting = targetStatus === "Posted";
    if (!validateForm(isPosting)) {
      return;
    }

    const selectedJournal = journals.find((j) => j.id === journalId);
    const journalName = selectedJournal ? selectedJournal.journalName : "General";

    // Primary partner for list view
    const primaryPartnerItem = items.find((it) => it.partnerId);
    const primaryPartner = primaryPartnerItem
      ? contacts.find((c) => c.id === primaryPartnerItem.partnerId)
      : null;

    const resolvedItems = items.map((it) => {
      const acc = accounts.find((a) => a.id === it.accountId);
      const part = contacts.find((c) => c.id === it.partnerId);
      return {
        ...it,
        accountName: acc ? acc.accountName : "",
        partnerName: part ? part.name : "",
      };
    });

    const entryData = {
      id: initialData?.id || null,
      number: number.trim() || ("MISC/2026/" + String(Date.now()).slice(-3)),
      accountingDate,
      journalId,
      journalName,
      partnerId: primaryPartner ? primaryPartner.id : "",
      partnerName: primaryPartner ? primaryPartner.name : "",
      total: totalDebit || totalCredit || 0,
      status: targetStatus,
      items: resolvedItems,
    };

    setIsDirty(false);
    onSave(entryData);
  };

  // Handle Cancel click
  const handleCancelClick = () => {
    if (isDirty && !isPosted) {
      setShowDiscardModal(true);
    } else {
      onBack();
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* ================= TOP ACTION BAR ================= */}
      {/* LEFT: [ Post ] [ Save as Draft ] | RIGHT: [ Cancel ] [ Back ] */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isPosted && (
            <>
              <button
                type="button"
                onClick={() => handleSaveAction("Posted")}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer shadow-xs ${
                  isBalanced
                    ? "bg-[#342921] text-white hover:bg-[#231b15]"
                    : "bg-[#54463b] text-white/90 hover:bg-[#342921]"
                }`}
                title={isBalanced ? "Post entry to ledger" : "Balance debit and credit to post"}
              >
                <Send size={15} />
                <span>Post</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveAction("Draft")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#cfc6b6] bg-[#faf8f4] text-sm font-medium text-[#342921] hover:bg-[#f3efe7] transition cursor-pointer shadow-xs"
                title="Save progress as draft"
              >
                <Save size={15} />
                <span>Save as Draft</span>
              </button>
            </>
          )}

          {isPosted && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#eef3e8] border border-[#d3dfca] text-sm font-medium text-[#3e5335]">
              <CheckCircle size={16} />
              <span>Posted to Ledger (Finalized)</span>
            </div>
          )}
        </div>

        {/* Right Actions: Cancel & Back */}
        <div className="flex items-center gap-2.5">
          {!isPosted && (
            <button
              type="button"
              onClick={handleCancelClick}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#8e392e] hover:bg-red-50/50 hover:border-red-200 transition cursor-pointer shadow-xs"
              title="Cancel editing"
            >
              <X size={15} />
              <span>Cancel</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCancelClick}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#6e6357] hover:text-[#24201a] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
            title="Return to Journal Entries List"
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN FORM CARD ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 sm:p-8 shadow-xs">

        {/* Form Title & Status Pill */}
        <div className="pb-5 mb-6 border-b border-[#f0ece4] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-[#211D19] tracking-tight">
              {isPosted
                ? `Journal Entry: ${number}`
                : initialData
                ? `Edit Journal Entry: ${number}`
                : "New Journal Entry"}
            </h2>
            <p className="text-sm text-[#716B63] mt-1">
              Record financial double-entry transaction to general ledger accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-medium border ${
                isPosted
                  ? "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]"
                  : "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]"
              }`}
            >
              {isPosted ? "Posted" : "Draft"}
            </span>
          </div>
        </div>

        {/* Header Fields: Accounting Date & Journal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-8">

          {/* 1. Accounting Date */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Accounting Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                disabled={isPosted}
                value={accountingDate}
                onChange={(e) => {
                  setAccountingDate(e.target.value);
                  markDirty();
                  if (errors.accountingDate) {
                    setErrors((prev) => ({ ...prev, accountingDate: null }));
                  }
                }}
                className={`w-full h-10 px-3.5 rounded-xl border ${
                  errors.accountingDate
                    ? "border-red-400 focus:border-red-500"
                    : "border-[#cfc6b6] focus:border-[#342921]"
                } bg-white text-sm text-[#211D19] outline-none transition disabled:bg-[#faf8f4] disabled:text-[#716B63]`}
              />
            </div>
            {errors.accountingDate && (
              <p className="text-xs text-red-600 mt-1">{errors.accountingDate}</p>
            )}
          </div>

          {/* 2. Journal */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Journal <span className="text-red-500">*</span>
            </label>
            <select
              disabled={isPosted}
              value={journalId}
              onChange={(e) => {
                setJournalId(e.target.value);
                markDirty();
                if (errors.journalId) {
                  setErrors((prev) => ({ ...prev, journalId: null }));
                }
              }}
              className={`w-full h-10 px-3.5 rounded-xl border ${
                errors.journalId
                  ? "border-red-400 focus:border-red-500"
                  : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition cursor-pointer disabled:bg-[#faf8f4] disabled:text-[#716B63]`}
            >
              <option value="" disabled>
                Select Journal...
              </option>
              {journals.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.journalName} ({j.type})
                </option>
              ))}
            </select>
            {errors.journalId && (
              <p className="text-xs text-red-600 mt-1">{errors.journalId}</p>
            )}
          </div>

          {/* 3. Number / Reference */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Number / Reference
            </label>
            <input
              type="text"
              disabled={isPosted}
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                markDirty();
              }}
              placeholder="e.g. Bill/2026/001, Inv/2026/001"
              className="w-full h-10 px-3.5 rounded-xl border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition disabled:bg-[#faf8f4] disabled:text-[#716B63]"
            />
          </div>

        </div>

        {/* ================= JOURNAL ITEMS TABLE ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#716B63] uppercase tracking-wider">
              Journal Items
            </h3>
            <span className="text-xs text-[#716B63]">
              Double-entry principle: Total Debit must equal Total Credit.
            </span>
          </div>

          {/* Items Table with horizontal scrolling on smaller devices */}
          <div className="border border-[#e7e3da] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-xs text-[#716B63] font-semibold uppercase tracking-wider select-none">
                    <th className="py-3 px-4 w-[35%]">ACCOUNT *</th>
                    <th className="py-3 px-4 w-[25%]">PARTNER</th>
                    <th className="py-3 px-4 w-[18%] text-right">DEBIT (Rs.)</th>
                    <th className="py-3 px-4 w-[18%] text-right">CREDIT (Rs.)</th>
                    {!isPosted && <th className="py-3 px-3 w-[4%] text-center"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f2eb]">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#faf8f4]/60 transition">

                      {/* 1. Account Selection (Chart of Accounts) */}
                      <td className="py-2.5 px-4 align-top">
                        <select
                          disabled={isPosted}
                          value={item.accountId}
                          onChange={(e) => handleItemChange(index, "accountId", e.target.value)}
                          className={`w-full h-10 px-3 rounded-lg border ${
                            errors[`item_${index}_account`]
                              ? "border-red-400 focus:border-red-500 bg-red-50/20"
                              : "border-[#cfc6b6] focus:border-[#342921] bg-white"
                          } text-sm text-[#211D19] outline-none transition cursor-pointer disabled:bg-transparent disabled:border-none disabled:p-0 disabled:font-medium`}
                        >
                          <option value="">Select Account...</option>
                          {accounts
                            .filter((a) => a.status !== "ARCHIVED" || a.id === item.accountId)
                            .map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {acc.accountName} ({acc.displayType || acc.type})
                              </option>
                            ))}
                        </select>
                        {errors[`item_${index}_account`] && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors[`item_${index}_account`]}
                          </p>
                        )}
                      </td>

                      {/* 2. Partner Selection (Contact Master) */}
                      <td className="py-2.5 px-4 align-top">
                        <select
                          disabled={isPosted}
                          value={item.partnerId}
                          onChange={(e) => handleItemChange(index, "partnerId", e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition cursor-pointer disabled:bg-transparent disabled:border-none disabled:p-0 disabled:font-medium"
                        >
                          <option value="">Select Partner (Optional)...</option>
                          {contacts.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} {c.type ? `(${c.type})` : ""}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 3. Debit */}
                      <td className="py-2.5 px-4 align-top text-right">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            disabled={isPosted}
                            value={item.debit === 0 ? "" : item.debit}
                            onChange={(e) => handleItemChange(index, "debit", e.target.value)}
                            placeholder="0.00"
                            className="w-full h-10 px-3 text-right rounded-lg border border-[#cfc6b6] bg-white text-sm font-semibold text-[#211D19] outline-none focus:border-[#342921] transition disabled:bg-transparent disabled:border-none disabled:p-0"
                          />
                        </div>
                      </td>

                      {/* 4. Credit */}
                      <td className="py-2.5 px-4 align-top text-right">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            disabled={isPosted}
                            value={item.credit === 0 ? "" : item.credit}
                            onChange={(e) => handleItemChange(index, "credit", e.target.value)}
                            placeholder="0.00"
                            className="w-full h-10 px-3 text-right rounded-lg border border-[#cfc6b6] bg-white text-sm font-semibold text-[#211D19] outline-none focus:border-[#342921] transition disabled:bg-transparent disabled:border-none disabled:p-0"
                          />
                        </div>
                      </td>

                      {/* Delete Line Action */}
                      {!isPosted && (
                        <td className="py-2.5 px-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(index)}
                            disabled={items.length <= 2}
                            className={`p-2 rounded-lg text-[#a89f91] transition ${
                              items.length <= 2
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            }`}
                            title={items.length <= 2 ? "Minimum 2 lines required" : "Delete line"}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Line Button */}
            {!isPosted && (
              <div className="p-3.5 bg-[#faf8f4]/80 border-t border-[#e7e3da] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#cfc6b6] text-sm font-medium text-[#342921] hover:bg-[#f5f2eb] hover:border-[#342921] transition cursor-pointer shadow-2xs"
                >
                  <Plus size={15} />
                  <span>Add a Line</span>
                </button>
                <span className="text-xs text-[#716B63]">
                  {items.length} accounting lines entered
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ================= TOTALS & VALIDATION WARNING ================= */}
        <div className="mt-6 pt-5 border-t border-[#f0ece4] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">

          {/* Left: Validation Banner / Status Message */}
          <div className="flex-1">
            {!isBalanced ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertTriangle size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-950">
                    Debit and Credit totals must be equal before posting.
                  </p>
                  <p className="text-xs text-amber-800">
                    {totalDebit === 0 && totalCredit === 0
                      ? "Enter corresponding debit and credit transaction values."
                      : `Difference to balance: Rs. ${difference.toLocaleString()}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-sm flex items-center gap-2.5">
                <CheckCircle size={18} className="text-emerald-700 flex-shrink-0" />
                <span>
                  <strong>Balanced:</strong> Total Debit equals Total Credit (Rs.{" "}
                  {totalDebit.toLocaleString()}). Ready to post.
                </span>
              </div>
            )}
          </div>

          {/* Right: Totals Breakdown Card */}
          <div className="bg-[#faf8f4] border border-[#e7e3da] rounded-xl p-4 min-w-[280px] space-y-2">
            <div className="flex items-center justify-between text-sm text-[#716B63]">
              <span>Total Debit:</span>
              <span className="font-semibold text-[#211D19]">
                Rs. {totalDebit.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-[#716B63]">
              <span>Total Credit:</span>
              <span className="font-semibold text-[#211D19]">
                Rs. {totalCredit.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-[#e7e3da] my-1.5" />
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className={difference > 0 ? "text-amber-800" : "text-[#211D19]"}>
                Difference:
              </span>
              <span
                className={`text-base ${
                  difference > 0 ? "text-amber-800 font-bold" : "text-emerald-700 font-bold"
                }`}
              >
                Rs. {difference.toLocaleString()}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ================= CONFIRMATION MODAL FOR CANCEL / DISCARD ================= */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#e7e3da] max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#211D19]">Discard this journal entry?</h4>
              <p className="text-sm text-[#716B63] mt-1">
                You have unsaved changes. Discarding will lose any values entered.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#4a3b2f] hover:bg-[#faf8f4] transition cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  setIsDirty(false);
                  onBack();
                }}
                className="px-4 py-2 rounded-lg bg-[#8e392e] text-white text-sm font-medium hover:bg-[#732920] transition cursor-pointer shadow-xs"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default JournalEntryForm;
