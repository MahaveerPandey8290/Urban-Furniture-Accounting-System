import { useState, useEffect } from "react";
import { Plus, Check, ArrowLeft, BookOpen, AlertCircle } from "lucide-react";

const JOURNAL_TYPE_OPTIONS = [
  { value: "SALES", label: "Sales" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "BANK", label: "Bank" },
  { value: "CASH", label: "Cash" },
];

function JournalForm({
  initialData,
  accounts = [],
  onSave,
  onNew,
  onBack,
}) {
  const [journalName, setJournalName] = useState("");
  const [journalType, setJournalType] = useState("");
  const [defaultAccountId, setDefaultAccountId] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setJournalName(initialData.journalName || "");
      setJournalType(initialData.type || "");
      setDefaultAccountId(initialData.defaultAccountId || "");
    } else {
      setJournalName("");
      setJournalType("");
      setDefaultAccountId("");
    }
    setErrors({});
  }, [initialData]);

  // Filter accounts: show active accounts, or the current account if editing an older record
  const availableAccounts = accounts.filter(
    (acc) => acc.status !== "ARCHIVED" || acc.id === defaultAccountId
  );

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!journalName.trim()) {
      newErrors.journalName = "Journal Name is required";
    }

    if (!journalType) {
      newErrors.journalType = "Journal Type is required (Sales, Purchase, Bank, or Cash)";
    }

    if (!defaultAccountId) {
      newErrors.defaultAccountId = "Default Account is required from Chart of Accounts";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Resolve default account name
    const selectedAcc = accounts.find((a) => a.id === defaultAccountId);
    const defaultAccountName = selectedAcc
      ? selectedAcc.accountName
      : initialData?.defaultAccountName || "";

    onSave({
      id: initialData?.id || null,
      journalName: journalName.trim(),
      type: journalType,
      defaultAccountId,
      defaultAccountName,
    });
  };

  return (
    <div className="w-full space-y-6">

      {/* ================= TOP ACTION BAR ================= */}
      {/* LEFT: [ Confirm ] [ New ] | RIGHT: [ Back ] */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
          >
            <Check size={15} />
            <span>Confirm</span>
          </button>

          <button
            type="button"
            onClick={onNew}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm font-medium text-[#24201a] hover:bg-[#f3efe7] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>New</span>
          </button>
        </div>

        {/* Right Actions: Back */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#6e6357] hover:text-[#24201a] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
            title="Return to Journals List"
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN FORM CARD ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 sm:p-8 shadow-xs max-w-3xl">
        <div className="pb-4 mb-6 border-b border-[#f0ece4]">
          <h2 className="text-2xl font-semibold text-[#211D19]">
            {initialData ? `Edit Journal: ${initialData.journalName}` : "New Journal"}
          </h2>
          <p className="text-sm text-[#716B63] mt-1">
            Configure accounting journal master for grouping and organizing financial transactions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. Journal Name */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Journal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={journalName}
              onChange={(e) => {
                setJournalName(e.target.value);
                if (errors.journalName) setErrors((prev) => ({ ...prev, journalName: null }));
              }}
              placeholder="e.g. Sales, Purchase, Bank, Cash"
              className={`w-full h-10 px-3.5 rounded-xl border ${
                errors.journalName ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition`}
            />
            {errors.journalName && (
              <p className="text-xs text-red-600 mt-1">{errors.journalName}</p>
            )}
          </div>

          {/* 2. Journal Type */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Journal Type <span className="text-red-500">*</span>
            </label>
            <select
              value={journalType}
              onChange={(e) => {
                setJournalType(e.target.value);
                if (errors.journalType) setErrors((prev) => ({ ...prev, journalType: null }));
              }}
              className={`w-full h-10 px-3.5 rounded-xl border ${
                errors.journalType ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition cursor-pointer`}
            >
              <option value="" disabled>
                Select Journal Type...
              </option>
              {JOURNAL_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.journalType && (
              <p className="text-xs text-red-600 mt-1">{errors.journalType}</p>
            )}
            <p className="text-xs text-[#716B63] mt-1.5">
              Determines the kind of financial activity handled by this journal (Sales, Purchase, Bank, or Cash).
            </p>
          </div>

          {/* 3. Default Account (From Chart of Accounts) */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Default Account <span className="text-red-500">*</span>
            </label>
            <select
              value={defaultAccountId}
              onChange={(e) => {
                setDefaultAccountId(e.target.value);
                if (errors.defaultAccountId) setErrors((prev) => ({ ...prev, defaultAccountId: null }));
              }}
              className={`w-full h-10 px-3.5 rounded-xl border ${
                errors.defaultAccountId ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition cursor-pointer`}
            >
              <option value="" disabled>
                Select Default Account from Chart of Accounts...
              </option>
              {availableAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} ({acc.displayType || acc.type})
                </option>
              ))}
            </select>
            {errors.defaultAccountId && (
              <p className="text-xs text-red-600 mt-1">{errors.defaultAccountId}</p>
            )}
            <p className="text-xs text-[#716B63] mt-1.5 flex items-center gap-1">
              <BookOpen size={14} className="text-[#8e8174]" />
              <span>Loaded from Chart of Accounts (Many-to-one relationship).</span>
            </p>
          </div>

        </form>
      </div>

    </div>
  );
}

export default JournalForm;
