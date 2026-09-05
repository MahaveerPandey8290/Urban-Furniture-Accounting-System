import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ArrowLeft,
  Home,
  Archive,
  Filter,
  ChevronDown,
  X,
  RotateCcw,
} from "lucide-react";
import Toast, { useToast } from "../../../components/common/Toast";
import AccountList from "./AccountList";
import AccountForm from "./AccountForm";

export const STORAGE_KEY = "urban_furniture_chart_of_accounts";

export const PRECONFIGURED_ACCOUNTS = [
  {
    id: "coa-1",
    accountName: "Bank A/c",
    type: "ASSET",
    displayType: "Assets",
    classification: "Bank",
    status: "ACTIVE",
  },
  {
    id: "coa-2",
    accountName: "Purchases Expense A/c",
    type: "EXPENSE",
    displayType: "Expenses",
    classification: "Expenses",
    status: "ACTIVE",
  },
  {
    id: "coa-3",
    accountName: "Debtors A/c",
    type: "ASSET",
    displayType: "Assets",
    classification: "Asset",
    status: "ACTIVE",
  },
  {
    id: "coa-4",
    accountName: "Creditors A/c",
    type: "LIABILITY",
    displayType: "Liabilities",
    classification: "Liability",
    status: "ACTIVE",
  },
  {
    id: "coa-5",
    accountName: "Sales Income A/c",
    type: "INCOME",
    displayType: "Income",
    classification: "Income",
    status: "ACTIVE",
  },
  {
    id: "coa-6",
    accountName: "Cash A/c",
    type: "ASSET",
    displayType: "Assets",
    classification: "Cash",
    status: "ACTIVE",
  },
  {
    id: "coa-7",
    accountName: "Other Expense A/c",
    type: "EXPENSE",
    displayType: "Expense",
    classification: "Other Expenses",
    status: "ACTIVE",
  },
  {
    id: "coa-8",
    accountName: "Capital A/c",
    type: "CAPITAL",
    displayType: "Capital",
    classification: "Capital",
    status: "ACTIVE",
  },
];

export const getChartOfAccounts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((a) => {
          if (a.classification) return a;
          let classification = a.displayType || a.type;
          if (a.accountName?.toLowerCase().includes("bank")) classification = "Bank";
          else if (a.accountName?.toLowerCase().includes("cash")) classification = "Cash";
          return { ...a, classification };
        });
      }
    }
  } catch (e) {
    console.error("Failed to load chart of accounts from storage:", e);
  }
  return PRECONFIGURED_ACCOUNTS;
};

function ChartOfAccountsMaster() {
  const navigate = useNavigate();

  // Load accounts from localStorage or initialize with preconfigured accounts
  const [accounts, setAccounts] = useState(() => getChartOfAccounts());

  // Views: 'list' (default) | 'form'
  const [currentView, setCurrentView] = useState("list");

  // Archived view toggle: false = Active accounts, true = Archived accounts
  const [isArchivedView, setIsArchivedView] = useState(false);

  // Selected account for editing in form view (null for new)
  const [editingAccount, setEditingAccount] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state for Account Category / Type: 'ALL' | 'ASSET' | 'LIABILITY' | 'BANK' | 'CAPITAL' | 'CASH' | 'INCOME' | 'EXPENSE'
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const { toastMessage, showToast } = useToast();

  // Persist accounts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error("Failed to save chart of accounts to storage:", e);
    }
  }, [accounts]);

  // Switch to Form for a new account
  const handleNewAccount = () => {
    setEditingAccount(null);
    setCurrentView("form");
  };

  // Switch to Form for an existing account
  const handleSelectAccount = (account) => {
    setEditingAccount(account);
    setCurrentView("form");
  };

  // Home button handler
  const handleHome = () => {
    navigate("/invoicing_user");
  };

  // Back button handler
  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView("list");
      setEditingAccount(null);
    } else {
      navigate("/invoicing_user");
    }
  };

  // Save account (from Confirm button)
  const handleSaveAccount = (accountData) => {
    if (accountData.id) {
      // Update existing
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountData.id ? { ...accountData } : a))
      );
      showToast("Account updated successfully");
    } else {
      // Create new
      const newAcc = {
        ...accountData,
        id: "coa-" + Date.now(),
      };
      setAccounts((prev) => [...prev, newAcc]);
      showToast("Account created successfully");
    }

    setCurrentView("list");
    setEditingAccount(null);
  };

  // Toggle Archive status for an account
  const handleToggleArchive = (id) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newStatus = a.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
          showToast(
            newStatus === "ARCHIVED"
              ? `Account "${a.accountName}" archived`
              : `Account "${a.accountName}" restored`
          );
          return { ...a, status: newStatus };
        }
        return a;
      })
    );

    if (currentView === "form") {
      setCurrentView("list");
      setEditingAccount(null);
    }
  };

  // Filter accounts by active/archived state, search query, and category/type filter
  const filteredAccounts = useMemo(() => {
    const targetStatus = isArchivedView ? "ARCHIVED" : "ACTIVE";
    let list = accounts.filter((a) => a.status === targetStatus);

    // Filter by Account Category / Type
    if (selectedTypeFilter !== "ALL") {
      list = list.filter((a) => {
        if (selectedTypeFilter === "BANK") {
          return (
            a.classification?.toUpperCase() === "BANK" ||
            a.accountName?.toLowerCase().includes("bank") ||
            a.displayType?.toUpperCase() === "BANK"
          );
        }
        if (selectedTypeFilter === "CASH") {
          return (
            a.classification?.toUpperCase() === "CASH" ||
            a.accountName?.toLowerCase().includes("cash") ||
            a.displayType?.toUpperCase() === "CASH"
          );
        }
        return (
          a.type === selectedTypeFilter ||
          a.displayType?.toUpperCase() === selectedTypeFilter.toUpperCase() ||
          a.classification?.toUpperCase() === selectedTypeFilter.toUpperCase()
        );
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((a) => {
        const nameMatch = a.accountName?.toLowerCase().includes(query);
        const typeMatch =
          a.type?.toLowerCase().includes(query) ||
          a.displayType?.toLowerCase().includes(query) ||
          a.classification?.toLowerCase().includes(query);
        return nameMatch || typeMatch;
      });
    }

    return list;
  }, [accounts, isArchivedView, selectedTypeFilter, searchQuery]);

  // Counts
  const activeCount = accounts.filter((a) => a.status === "ACTIVE").length;
  const archivedCount = accounts.filter((a) => a.status === "ARCHIVED").length;

  return (
    <div className="w-full space-y-6">

      {/* Header breadcrumb & title */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-2 text-sm text-[#716B63] mb-1">
          <span>Account</span>
          <span>/</span>
          <span className="text-[#211D19] font-medium">Chart of Accounts</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
          {currentView === "form"
            ? editingAccount
              ? `Chart of Accounts: ${editingAccount.accountName}`
              : "New Account"
            : "Chart of Accounts"}
        </h1>
      </div>

      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* ================= VIEW 1: LIST VIEW ================= */}
      {currentView === "list" && (
        <>
          {/* Top Action Bar */}
          {/* LEFT: [ New ] [ Archived ] [ Search + Account Category Filter ] | RIGHT: [ Home ] [ Back ] */}
          <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Left Actions */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <button
                type="button"
                onClick={handleNewAccount}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
              >
                <Plus size={16} />
                <span>New</span>
              </button>

              {/* Archived Toggle */}
              <button
                type="button"
                onClick={() => setIsArchivedView(!isArchivedView)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer border ${
                  isArchivedView
                    ? "bg-[#342921] text-white border-[#342921] shadow-xs"
                    : "border-[#e7e3da] bg-[#faf8f4] text-[#4a3b2f] hover:bg-[#f3efe7] hover:border-[#cfc6b6]"
                }`}
              >
                <Archive size={16} />
                <span>
                  {isArchivedView ? "Show Active Accounts" : `Archived (${archivedCount})`}
                </span>
              </button>

              {/* Integrated Search Bar with Account Category Filter */}
              <div className="flex items-center gap-2 flex-1 max-w-lg min-w-[260px]">
                <div className="relative flex items-center flex-1 h-10 rounded-lg border border-[#cfc6b6] bg-white focus-within:border-[#342921] focus-within:ring-1 focus-within:ring-[#342921]/15 transition">
                  {/* Search Icon */}
                  <Search
                    size={16}
                    className="ml-3 text-[#716B63] flex-shrink-0"
                  />

                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search accounts..."
                    className="w-full h-full px-2.5 bg-transparent text-sm text-[#211D19] outline-none placeholder:text-[#a89f91]"
                  />

                  {/* Clear Search Input Button */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 mr-1 text-[#a89f91] hover:text-[#211D19] text-sm cursor-pointer rounded"
                      title="Clear search text"
                    >
                      <X size={15} />
                    </button>
                  )}

                  {/* Vertical Separator */}
                  <div className="h-4 w-[1px] bg-[#e7e3da] flex-shrink-0" />

                  {/* Account Category Filter Dropdown (flat list with Bank, Cash, and no balance sheet/profit & loss optgroups) */}
                  <div className="relative flex items-center flex-shrink-0">
                    <Filter size={14} className="absolute left-2.5 text-[#716B63] pointer-events-none" />
                    <select
                      value={selectedTypeFilter}
                      onChange={(e) => setSelectedTypeFilter(e.target.value)}
                      aria-label="Filter by account category"
                      className="h-10 pl-7 pr-7 bg-transparent text-sm font-medium text-[#4a3b2f] outline-none cursor-pointer border-none appearance-none hover:text-[#211D19]"
                      title="Filter by Account Category"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="ASSET">Asset</option>
                      <option value="LIABILITY">Liability</option>
                      <option value="BANK">Bank</option>
                      <option value="CAPITAL">Capital</option>
                      <option value="CASH">Cash</option>
                      <option value="INCOME">Income</option>
                      <option value="EXPENSE">Expense</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 text-[#716B63] pointer-events-none" />
                  </div>
                </div>

                {/* Reset Button (visible when filter or search active) */}
                {(searchQuery.trim() || selectedTypeFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTypeFilter("ALL");
                    }}
                    className="h-10 px-3 rounded-lg border border-[#e7e3da] bg-[#faf8f4] hover:bg-[#f3efe7] text-xs font-medium text-[#716B63] hover:text-[#211D19] transition cursor-pointer flex items-center gap-1 flex-shrink-0"
                    title="Reset search and filters"
                  >
                    <RotateCcw size={13} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Actions: Home & Back */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <button
                type="button"
                onClick={handleHome}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
                title="Go to Home Dashboard"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Home</span>
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
                title="Return to Dashboard"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

          </div>

          {/* Active Filter Chips */}
          {(selectedTypeFilter !== "ALL" || searchQuery.trim()) && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#7a7065] px-1">
              <span>Active filters:</span>
              {selectedTypeFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f4efe8] border border-[#e2dacd] text-[#342921] font-medium text-[11px]">
                  <span>Category: {selectedTypeFilter.charAt(0) + selectedTypeFilter.slice(1).toLowerCase()}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTypeFilter("ALL")}
                    className="hover:text-red-700 cursor-pointer ml-0.5"
                    title="Remove category filter"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f4efe8] border border-[#e2dacd] text-[#342921] font-medium text-[11px]">
                  <span>Query: "{searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:text-red-700 cursor-pointer ml-0.5"
                    title="Remove query filter"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTypeFilter("ALL");
                }}
                className="text-[11px] text-[#7a7065] hover:text-[#24201a] underline cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Archived Banner indicator */}
          {isArchivedView && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Archive size={15} className="text-amber-800 flex-shrink-0" />
                <span>
                  Viewing <strong>Archived Accounts</strong> ({archivedCount} records). These accounts are hidden from active transaction selection.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsArchivedView(false)}
                className="text-xs font-semibold text-amber-900 hover:underline cursor-pointer flex-shrink-0"
              >
                Switch to Active Accounts ({activeCount}) →
              </button>
            </div>
          )}

          {/* Table List */}
          <AccountList
            accounts={filteredAccounts}
            isArchivedView={isArchivedView}
            hasActiveFilter={Boolean(searchQuery.trim() || selectedTypeFilter !== "ALL")}
            onClearFilters={() => {
              setSearchQuery("");
              setSelectedTypeFilter("ALL");
            }}
            onSelectAccount={handleSelectAccount}
            onToggleArchive={handleToggleArchive}
            onNewAccount={handleNewAccount}
          />
        </>
      )}

      {/* ================= VIEW 2: FORM VIEW ================= */}
      {currentView === "form" && (
        <AccountForm
          initialData={editingAccount}
          onSave={handleSaveAccount}
          onNew={handleNewAccount}
          onBack={handleBack}
          onHome={handleHome}
          onToggleArchive={handleToggleArchive}
        />
      )}

    </div>
  );
}

export default ChartOfAccountsMaster;
