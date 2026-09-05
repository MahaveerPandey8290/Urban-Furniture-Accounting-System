import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Search, X } from "lucide-react";
import Toast, { useToast } from "../../../components/common/Toast";
import JournalEntryList from "./JournalEntryList";
import JournalEntryForm from "./JournalEntryForm";
import { getChartOfAccounts } from "../accounts/ChartOfAccountsMaster";
import { getJournals } from "../journals/JournalMaster";

const STORAGE_KEY_JOURNAL_ENTRIES = "urban_furniture_journal_entries_master";

// Helper to load contacts from Contact Master
const getContacts = () => {
  let list = [];
  try {
    const saved = localStorage.getItem("urban_furniture_contacts_master");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load contacts:", e);
  }

  const defaultContacts = [
    { id: "cnt-rahul", name: "Rahul", type: "Vendor" },
    { id: "cnt-raj", name: "Mr. Raj", type: "Customer" },
    { id: "cnt-1", name: "Open Wood", type: "Customer" },
    { id: "cnt-2", name: "Joey Wills", type: "Vendor" },
  ];

  defaultContacts.forEach((d) => {
    if (!list.some((c) => c.name?.toLowerCase() === d.name.toLowerCase())) {
      list.push(d);
    }
  });

  return list;
};

// Initial records from the reference wireframe
export const INITIAL_JOURNAL_ENTRIES = [
  {
    id: "je-1",
    number: "Bill/2026/001",
    accountingDate: "2026-09-01",
    dateDisplay: "Sep 1",
    partnerId: "cnt-rahul",
    partnerName: "Rahul",
    journalId: "jour-2",
    journalName: "Purchases",
    total: 30000,
    status: "Posted",
    items: [
      {
        id: "item-1-1",
        accountId: "coa-2",
        accountName: "Purchases Expense A/c",
        partnerId: "cnt-rahul",
        partnerName: "Rahul",
        debit: 30000,
        credit: 0,
      },
      {
        id: "item-1-2",
        accountId: "coa-4",
        accountName: "Creditors A/c",
        partnerId: "cnt-rahul",
        partnerName: "Rahul",
        debit: 0,
        credit: 30000,
      },
    ],
  },
  {
    id: "je-2",
    number: "Inv/2026/001",
    accountingDate: "2026-09-02",
    dateDisplay: "Sep 2",
    partnerId: "cnt-raj",
    partnerName: "Mr. Raj",
    journalId: "jour-1",
    journalName: "Sales",
    total: 10500,
    status: "Draft",
    items: [
      {
        id: "item-2-1",
        accountId: "coa-3",
        accountName: "Debtors A/c",
        partnerId: "cnt-raj",
        partnerName: "Mr. Raj",
        debit: 10500,
        credit: 0,
      },
      {
        id: "item-2-2",
        accountId: "coa-5",
        accountName: "Sales Income A/c",
        partnerId: "cnt-raj",
        partnerName: "Mr. Raj",
        debit: 0,
        credit: 10500,
      },
    ],
  },
];

function JournalEntriesMaster() {
  const navigate = useNavigate();

  // Load live master data
  const [accounts] = useState(() => getChartOfAccounts());
  const [journals] = useState(() => getJournals());
  const [contacts] = useState(() => getContacts());

  // Load journal entries from localStorage or fallback to sample wireframe data
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOURNAL_ENTRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load journal entries from storage:", e);
    }
    return INITIAL_JOURNAL_ENTRIES;
  });

  // Views: 'list' (default) | 'form'
  const [currentView, setCurrentView] = useState("list");

  // Selected entry for editing/viewing (null for new)
  const [editingEntry, setEditingEntry] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const { toastMessage, showToast } = useToast();

  // Persist entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOURNAL_ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save journal entries to storage:", e);
    }
  }, [entries]);

  // Open form for a new Journal Entry
  const handleNewEntry = () => {
    setEditingEntry(null);
    setCurrentView("form");
  };

  // Open form for viewing/editing an existing Journal Entry
  const handleSelectEntry = (entry) => {
    setEditingEntry(entry);
    setCurrentView("form");
  };

  // Back button handler
  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView("list");
      setEditingEntry(null);
    } else {
      navigate("/invoicing_user");
    }
  };

  // Save entry (Draft or Post)
  const handleSaveEntry = (entryData) => {
    if (entryData.id) {
      // Update existing
      setEntries((prev) =>
        prev.map((e) => (e.id === entryData.id ? { ...entryData } : e))
      );
      showToast(
        entryData.status === "Posted"
          ? `Journal Entry "${entryData.number}" posted successfully`
          : `Draft "${entryData.number}" saved successfully`
      );
    } else {
      // Create new
      const newEntry = {
        ...entryData,
        id: "je-" + Date.now(),
      };
      setEntries((prev) => [newEntry, ...prev]);
      showToast(
        entryData.status === "Posted"
          ? `Journal Entry "${newEntry.number}" posted successfully`
          : `Draft "${newEntry.number}" saved successfully`
      );
    }

    setCurrentView("list");
    setEditingEntry(null);
  };

  // Filter entries based on search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase().trim();
    return entries.filter((e) => {
      const numberMatch = e.number?.toLowerCase().includes(query);
      const partnerMatch = e.partnerName?.toLowerCase().includes(query);
      const journalMatch = e.journalName?.toLowerCase().includes(query);
      const statusMatch = e.status?.toLowerCase().includes(query);
      const accountMatch = e.items?.some((i) =>
        i.accountName?.toLowerCase().includes(query)
      );
      return numberMatch || partnerMatch || journalMatch || statusMatch || accountMatch;
    });
  }, [entries, searchQuery]);

  // Delete journal entry
  const handleDeleteEntry = (entryId) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      showToast("Journal entry deleted successfully");
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Header breadcrumb & title */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#716B63] mb-1">
          <span>Account</span>
          <span>/</span>
          <span className="text-[#211D19] font-medium">Journal Entries</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
          {currentView === "form"
            ? editingEntry
              ? `Journal Entry: ${editingEntry.number}`
              : "New Journal Entry"
            : "Journal Entries"}
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
                onClick={handleNewEntry}
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
                  placeholder="Search number, partner, journal..."
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
          <JournalEntryList
            entries={filteredEntries}
            onSelectEntry={handleSelectEntry}
            onEditEntry={handleSelectEntry}
            onDeleteEntry={handleDeleteEntry}
            onNewEntry={handleNewEntry}
          />
        </>
      )}

      {/* ================= VIEW 2: FORM VIEW ================= */}
      {currentView === "form" && (
        <JournalEntryForm
          initialData={editingEntry}
          journals={journals}
          accounts={accounts}
          contacts={contacts}
          onSave={handleSaveEntry}
          onBack={handleBack}
        />
      )}

    </div>
  );
}

export default JournalEntriesMaster;
