import { useState, useEffect } from "react";
import { Plus, Check, ArrowLeft, Home, Archive, RotateCcw } from "lucide-react";

// Mapping from option value to accounting Type and Display Label
const TYPE_OPTIONS = [
  { label: "Asset", type: "ASSET", displayType: "Assets" },
  { label: "Liability", type: "LIABILITY", displayType: "Liabilities" },
  { label: "Bank", type: "ASSET", displayType: "Assets" },
  { label: "Capital", type: "CAPITAL", displayType: "Capital" },
  { label: "Cash", type: "ASSET", displayType: "Assets" },
  { label: "Income", type: "INCOME", displayType: "Income" },
  { label: "Expenses", type: "EXPENSE", displayType: "Expenses" },
  { label: "Other Expenses", type: "EXPENSE", displayType: "Expense" },
];

function AccountForm({
  initialData,
  onSave,
  onNew,
  onBack,
  onHome,
  onToggleArchive,
}) {
  const [accountName, setAccountName] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setAccountName(initialData.accountName || "");
      // Find matching option or construct it
      const match =
        TYPE_OPTIONS.find(
          (opt) =>
            opt.label.toLowerCase() === initialData.classification?.toLowerCase()
        ) ||
        TYPE_OPTIONS.find(
          (opt) =>
            opt.label.toLowerCase() === initialData.displayType?.toLowerCase()
        ) ||
        TYPE_OPTIONS.find(
          (opt) =>
            opt.type === initialData.type &&
            (opt.displayType === initialData.displayType || opt.label === initialData.displayType)
        ) ||
        TYPE_OPTIONS.find((opt) => opt.type === initialData.type);

      if (match) {
        setSelectedOption(`${match.type}__${match.label}`);
      } else {
        setSelectedOption("ASSET__Asset");
      }
    } else {
      setAccountName("");
      setSelectedOption("");
    }
    setErrors({});
  }, [initialData]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!accountName.trim()) {
      newErrors.accountName = "Account Name is required";
    }

    if (!selectedOption) {
      newErrors.type = "Account Type is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const [type, label] = selectedOption.split("__");
    const matchedOption = TYPE_OPTIONS.find(
      (opt) => opt.type === type && opt.label === label
    );

    onSave({
      id: initialData?.id || null,
      accountName: accountName.trim(),
      type: matchedOption ? matchedOption.type : type,
      displayType: matchedOption ? matchedOption.displayType : label,
      classification: matchedOption ? matchedOption.label : label,
      status: initialData?.status || "ACTIVE",
    });
  };

  return (
    <div className="w-full space-y-6">

      {/* ================= TOP ACTION BAR ================= */}
      {/* LEFT: [ New ] [ Confirm ] [ Archive ] | RIGHT: [ Home ] [ Back ] */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNew}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm font-medium text-[#211D19] hover:bg-[#f3efe7] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            <span>New</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
          >
            <Check size={16} />
            <span>Confirm</span>
          </button>

          {/* Archive / Restore button when editing an existing account */}
          {initialData && (
            <button
              type="button"
              onClick={() => onToggleArchive(initialData.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#f3efe7] transition cursor-pointer shadow-xs"
            >
              {initialData.status === "ARCHIVED" ? (
                <>
                  <RotateCcw size={16} />
                  <span>Restore Account</span>
                </>
              ) : (
                <>
                  <Archive size={16} />
                  <span>Archive</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onHome}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
            title="Go to Home Dashboard"
          >
            <Home size={16} />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
            title="Return to List View"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN ACCOUNT FORM ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 sm:p-8 shadow-xs max-w-3xl">
        <div className="pb-5 mb-6 border-b border-[#f0ece4]">
          <h2 className="text-2xl font-semibold text-[#211D19]">
            {initialData ? `Edit: ${initialData.accountName}` : "New Account Details"}
          </h2>
          <p className="text-sm text-[#716B63] mt-1">
            Configure ledger account classification for financial journal entries
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. Account Name */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Account Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => {
                setAccountName(e.target.value);
                if (errors.accountName) setErrors((prev) => ({ ...prev, accountName: null }));
              }}
              placeholder="e.g. Bank A/c, Debtors A/c, Sales Income A/c"
              className={`w-full h-10 px-3.5 rounded-lg border ${
                errors.accountName ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition`}
            />
            {errors.accountName && (
              <p className="text-xs text-red-600 mt-1">{errors.accountName}</p>
            )}
          </div>

          {/* 2. Type / Category (Flat list: Asset, Liability, Bank, Capital, Cash, Income, Expenses, Other Expenses) */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Type / Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedOption}
              onChange={(e) => {
                setSelectedOption(e.target.value);
                if (errors.type) setErrors((prev) => ({ ...prev, type: null }));
              }}
              className={`w-full h-10 px-3.5 rounded-lg border ${
                errors.type ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition cursor-pointer`}
            >
              <option value="" disabled>
                Select Account Classification
              </option>
              {TYPE_OPTIONS.map((opt) => (
                <option key={`${opt.type}__${opt.label}`} value={`${opt.type}__${opt.label}`}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-xs text-red-600 mt-1">{errors.type}</p>
            )}

            <p className="text-xs text-[#716B63] mt-2">
              Select the account category for financial ledger transactions and reporting.
            </p>
          </div>

          {/* Status Indicator */}
          {initialData && (
            <div className="pt-4 border-t border-[#f5f2eb] flex items-center justify-between text-sm text-[#716B63]">
              <span>Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  initialData.status === "ARCHIVED"
                    ? "bg-[#faf0e6] text-[#7a4e2d] border border-[#e8d7c5]"
                    : "bg-[#eef3e8] text-[#3e5335] border border-[#d3dfca]"
                }`}
              >
                {initialData.status === "ARCHIVED" ? "Archived" : "Active"}
              </span>
            </div>
          )}

        </form>
      </div>

    </div>
  );
}

export default AccountForm;
