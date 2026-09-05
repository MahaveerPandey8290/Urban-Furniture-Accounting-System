import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Search, X } from "lucide-react";
import Toast, { useToast } from "../../../components/common/Toast";
import JournalList from "./JournalList";
import JournalForm from "./JournalForm";
import { getChartOfAccounts } from "../accounts/ChartOfAccountsMaster";

export const STORAGE_KEY_JOURNALS = "urban_furniture_journals_master";

export const INITIAL_JOURNALS = [
  {
    id: "jour-1",
    journalName: "Sales",
    type: "SALES",
    defaultAccountId: "coa-5",
    defaultAccountName: "Sales Income A/c",
  },
  {
    id: "jour-2",
    journalName: "Purchase",
    type: "PURCHASE",
    defaultAccountId: "coa-2",
    defaultAccountName: "Purchases Expense A/c",
  },
  {
    id: "jour-3",
    journalName: "Bank",
    type: "BANK",
    defaultAccountId: "coa-1",
    defaultAccountName: "Bank A/c",
  },
  {
    id: "jour-4",
    journalName: "Cash",
    type: "CASH",
    defaultAccountId: "coa-6",
    defaultAccountName: "Cash A/c",
  },
];

export const getJournals = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_JOURNALS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load journals from storage:", e);
  }
  return INITIAL_JOURNALS;
};

function JournalMaster() {
  const navigate = useNavigate();

  // Load Chart of Accounts master records
  const [accounts] = useState(() => getChartOfAccounts());

  // Load journals from localStorage or initialize with preconfigured journals
  const [journals, setJournals] = useState(() => getJournals());

  // Views: 'list' (default) | 'form'
  const [currentView, setCurrentView] = useState("list");

  // Selected journal for editing in form view (null for new)
  const [editingJournal, setEditingJournal] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const { toastMessage, showToast } = useToast();

  // Persist journals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOURNALS, JSON.stringify(journals));
    } catch (e) {
      console.error("Failed to save journals to storage:", e);
    }
  }, [journals]);

  // Open Form for New Journal
  const handleNewJournal = () => {
    setEditingJournal(null);
    setCurrentView("form");
  };

  // Open Form for Editing Existing Journal
  const handleSelectJournal = (journal) => {
    setEditingJournal(journal);
    setCurrentView("form");
  };

  // Back button handler
  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView("list");
      setEditingJournal(null);
    } else {
      const isPathAdmin = window.location.pathname.startsWith("/admin");
      navigate(isPathAdmin ? "/admin" : "/invoicing_user");
    }
  };

  // Save Journal (from Form Confirm button)
  const handleSaveJournal = (journalData) => {
    if (journalData.id) {
      // Update existing
      setJournals((prev) =>
        prev.map((j) => (j.id === journalData.id ? { ...journalData } : j))
      );
      showToast(`Journal "${journalData.journalName}" updated successfully`);
    } else {
      // Create new
      const newJour = {
        ...journalData,
        id: "jour-" + Date.now(),
      };
      setJournals((prev) => [...prev, newJour]);
      showToast(`Journal "${journalData.journalName}" created successfully`);
    }

    setCurrentView("list");
    setEditingJournal(null);
  };

  // Resolve journals with live Chart of Accounts names and apply search query
  const resolvedJournals = useMemo(() => {
    return journals.map((j) => {
      const acc = accounts.find((a) => a.id === j.defaultAccountId);
      return {
        ...j,
        defaultAccountName: acc ? acc.accountName : j.defaultAccountName,
      };
    });
  }, [journals, accounts]);

  const filteredJournals = useMemo(() => {
    if (!searchQuery.trim()) return resolvedJournals;
    const query = searchQuery.toLowerCase().trim();
    return resolvedJournals.filter((j) => {
      const nameMatch = j.journalName?.toLowerCase().includes(query);
      const typeMatch = j.type?.toLowerCase().includes(query);
      const accMatch = j.defaultAccountName?.toLowerCase().includes(query);
      return nameMatch || typeMatch || accMatch;
    });
  }, [resolvedJournals, searchQuery]);

  // Delete Journal
  const handleDeleteJournal = (journalId) => {
    if (window.confirm("Are you sure you want to delete this journal?")) {
      setJournals((prev) => prev.filter((j) => j.id !== journalId));
      showToast("Journal deleted successfully");
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Header breadcrumb & title */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#716B63] mb-1">
          <span>Account</span>
          <span>/</span>
          <span className="text-[#211D19] font-medium">Journals</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
          {currentView === "form"
            ? editingJournal
              ? `Edit Journal: ${editingJournal.journalName}`
              : "New Journal"
            : "Journals"}
        </h1>
      </div>

      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* ================= VIEW 1: LIST VIEW ================= */}
      {currentView === "list" && (
        <>
          {/* Top Action Bar */}
          {/* LEFT: [ New ] [ Search ] | RIGHT: [ Back ] */}
          <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Left Actions */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <button
                type="button"
                onClick={handleNewJournal}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
              >
                <Plus size={15} />
                <span>New</span>
              </button>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#716B63]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search journals or accounts..."
                  className="w-full h-10 pl-9 pr-8 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a89f91] hover:text-[#211D19] text-xs cursor-pointer p-0.5"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Actions: Back */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#6e6357] hover:text-[#24201a] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
                title="Return to Dashboard"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>
            </div>

          </div>

          {/* Table List */}
          <JournalList
            journals={filteredJournals}
            onSelectJournal={handleSelectJournal}
            onEditJournal={handleSelectJournal}
            onDeleteJournal={handleDeleteJournal}
            onNewJournal={handleNewJournal}
          />
        </>
      )}

      {/* ================= VIEW 2: FORM VIEW ================= */}
      {currentView === "form" && (
        <JournalForm
          initialData={editingJournal}
          accounts={accounts}
          onSave={handleSaveJournal}
          onNew={handleNewJournal}
          onBack={handleBack}
        />
      )}

    </div>
  );
}

export default JournalMaster;
