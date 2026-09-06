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
import api from "../../../services/api";

export const getChartOfAccounts = async () => {
  try {
    const res = await api.get("/accounts?limit=200");
    // Backend returns { items: [...] }
    return (res.data.items || []).map((a) => ({
      id: a.id,
      code: a.code,
      accountName: a.name,
      type: a.type,
      displayType: a.group === "BALANCE_SHEET" ? "Balance Sheet" : "Profit and Loss",
      classification: a.type,
      status: a.isArchived ? "ARCHIVED" : "ACTIVE",
    }));
  } catch {
    return [];
  }
};

function ChartOfAccountsMaster() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounts?limit=200");
      // Backend returns { items: [...] }
      const mapped = (res.data.items || []).map((a) => ({
        id: a.id,
        code: a.code,
        accountName: a.name,
        type: a.type,
        displayType: a.group === "BALANCE_SHEET" ? "Balance Sheet" : "Profit and Loss",
        classification: a.type,
        status: a.isArchived ? "ARCHIVED" : "ACTIVE",
      }));
      setAccounts(mapped);
    } catch {
      showToast("Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

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
  const handleSaveAccount = async (accountData) => {
    const rawType = (accountData.classification || accountData.type || "ASSET").toUpperCase();
    const typeEnum = ["ASSET", "LIABILITY", "BANK", "CAPITAL", "CASH", "INCOME", "EXPENSE", "OTHER_EXPENSE"].includes(rawType)
      ? rawType
      : "ASSET";

    const groupEnum = ["INCOME", "EXPENSE", "OTHER_EXPENSE"].includes(typeEnum)
      ? "PROFIT_AND_LOSS"
      : "BALANCE_SHEET";

    const payload = {
      code: accountData.code || "ACC-" + Math.floor(1000 + Math.random() * 9000),
      name: accountData.accountName,
      type: typeEnum,
      group: groupEnum,
    };

    try {
      await api.post("/accounts", payload);
      showToast("Account saved successfully");
      await fetchAccounts();
      setCurrentView("list");
      setEditingAccount(null);
    } catch (err) {
      console.error("Failed to save account:", err);
      showToast(err.response?.data?.message || "Failed to save account", "error");
    }
  };

  // Toggle Archive status for an account
  const handleToggleArchive = async (id) => {
    try {
      await api.delete(`/accounts/${id}`);
      showToast("Account status updated");
      await fetchAccounts();
    } catch (err) {
      console.error("Failed to archive account:", err);
      showToast(err.response?.data?.message || "Failed to archive account", "error");
    }

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

  // Delete account
  const handleDeleteAccount = (id) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast("Account deleted successfully");
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Header breadcrumb & title */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#716B63] mb-1">
          <span>Account</span>
          <span>/</span>
          <span className="text-[#211D19] font-medium">Chart of Accounts</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
          {currentView === "form"
            ? editingAccount
              ? `Edit Account: ${editingAccount.accountName}`
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
          {/* LEFT: [ New ] [ Archived ] [ Search & Filter Bar ] | RIGHT: [ Home ] [ Back ] */}
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

              {/* Combined Search + Category Filter Bar */}
              <div className="flex items-center gap-2 flex-1 max-w-xl">
                <div className="relative flex-1 flex items-center bg-white rounded-lg border border-[#cfc6b6] focus-within:border-[#342921] transition overflow-hidden">
                  <Search
                    size={16}
                    className="absolute left-3.5 text-[#716B63] pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search accounts..."
                    className="w-full h-10 pl-10 pr-8 bg-transparent text-sm text-[#211D19] outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 text-[#716B63] hover:text-[#211D19] text-xs cursor-pointer p-1"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}

                  {/* Vertical Divider */}
                  <div className="w-[1px] h-6 bg-[#cfc6b6] self-center flex-shrink-0" />

                  {/* Account Category Filter Dropdown */}
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
            onEditAccount={handleSelectAccount}
            onDeleteAccount={handleDeleteAccount}
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
