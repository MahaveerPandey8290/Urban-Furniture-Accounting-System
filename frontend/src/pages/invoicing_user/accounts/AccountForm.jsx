import { useState, useEffect } from "react";
import { Plus, Check, ArrowLeft, Home, Archive, RotateCcw } from "lucide-react";

export const ACCOUNT_CATEGORIES = [
  {
    heading: "Balance Sheet",
    group: "BALANCE_SHEET",
    options: [
      { label: "Asset", type: "ASSET", group: "BALANCE_SHEET", displayType: "Asset" },
      { label: "Liability", type: "LIABILITY", group: "BALANCE_SHEET", displayType: "Liability" },
      { label: "Bank", type: "BANK", group: "BALANCE_SHEET", displayType: "Bank" },
      { label: "Capital", type: "CAPITAL", group: "BALANCE_SHEET", displayType: "Capital" },
      { label: "Cash", type: "CASH", group: "BALANCE_SHEET", displayType: "Cash" },
    ],
  },
  {
    heading: "Profit and Loss",
    group: "PROFIT_AND_LOSS",
    options: [
      { label: "Income", type: "INCOME", group: "PROFIT_AND_LOSS", displayType: "Income" },
      { label: "Expenses", type: "EXPENSE", group: "PROFIT_AND_LOSS", displayType: "Expense" },
      { label: "Other Expenses", type: "OTHER_EXPENSE", group: "PROFIT_AND_LOSS", displayType: "Other Expense" },
    ],
  },
];

const ALL_TYPE_OPTIONS = ACCOUNT_CATEGORIES.flatMap((c) => c.options);

function AccountForm({
  initialData,
  onSave,
  onNew,
  onBack,
  onHome,
  onToggleArchive,
}) {
  const [accountName, setAccountName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setAccountName(initialData.accountName || "");
      // Match by exact type or label
      const match =
        ALL_TYPE_OPTIONS.find((opt) => opt.type === initialData.type) ||
        ALL_TYPE_OPTIONS.find(
          (opt) => opt.label.toLowerCase() === (initialData.classification || "").toLowerCase()
        ) ||
        ALL_TYPE_OPTIONS.find(
          (opt) => opt.label.toLowerCase() === (initialData.displayType || "").toLowerCase()
        );

      setSelectedType(match ? match.type : initialData.type || "ASSET");
    } else {
      setAccountName("");
      setSelectedType("");
    }
    setErrors({});
  }, [initialData]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!accountName.trim()) {
      newErrors.accountName = "Account Name is required";
    }

    if (!selectedType) {
      newErrors.type = "Account Type is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedOption = ALL_TYPE_OPTIONS.find((opt) => opt.type === selectedType);

    onSave({
      id: initialData?.id || null,
      accountName: accountName.trim(),
      type: selectedType,
      group: matchedOption?.group || (["INCOME", "EXPENSE", "OTHER_EXPENSE"].includes(selectedType) ? "PROFIT_AND_LOSS" : "BALANCE_SHEET"),
      displayType: matchedOption ? matchedOption.displayType : selectedType,
      classification: matchedOption ? matchedOption.label : selectedType,
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

          {/* 2. Type / Category (Grouped by Balance Sheet & Profit and Loss) */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Type / Category <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                if (errors.type) setErrors((prev) => ({ ...prev, type: null }));
              }}
              className={`w-full h-10 px-3.5 rounded-lg border ${
                errors.type ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition cursor-pointer`}
            >
              <option value="" disabled>
                Select Account Type
              </option>
              {ACCOUNT_CATEGORIES.map((cat) => (
                <optgroup key={cat.heading} label={cat.heading} className="font-semibold text-[#8a5d3b]">
                  {cat.options.map((opt) => (
                    <option key={opt.type} value={opt.type} className="text-[#211D19] font-normal">
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.type && (
              <p className="text-xs text-red-600 mt-1">{errors.type}</p>
            )}

            <p className="text-xs text-[#716B63] mt-2">
              Each account is assigned an Account Type, which determines how the account is treated and where it appears in financial reports.
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
