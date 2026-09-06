import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Search, X } from "lucide-react";
import Toast, { useToast } from "../../../components/common/Toast";
import JournalList from "./JournalList";
import JournalForm from "./JournalForm";
import api from "../../../services/api";

export const getJournals = async () => {
  try {
    const res = await api.get("/journals");
    return (res.data?.items || []).map((j) => ({
      id: j.id,
      journalName: j.name,
      code: j.code,
      type: j.type,
      defaultAccountId: j.defaultAccountId,
      defaultAccountName: j.defaultAccount?.name || "General",
    }));
  } catch (e) {
    console.error("Failed to load journals:", e);
    return [];
  }
};

function JournalMaster() {
  const navigate = useNavigate();

  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Views: 'list' (default) | 'form'
  const [currentView, setCurrentView] = useState("list");
  const [editingJournal, setEditingJournal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toastMessage, showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jRes, aRes] = await Promise.all([
        api.get("/journals"),
        api.get("/accounts?limit=100").catch(() => ({ data: { items: [] } })),
      ]);

      const jList = (jRes.data?.items || []).map((j) => ({
        id: j.id,
        journalName: j.name,
        code: j.code,
        type: j.type,
        defaultAccountId: j.defaultAccountId,
        defaultAccountName: j.defaultAccount?.name || "General",
      }));
      setJournals(jList);

      const aList = (aRes.data?.items || []).map((a) => ({
        id: a.id,
        accountName: a.name,
        status: a.isArchived ? "ARCHIVED" : "ACTIVE",
      }));
      setAccounts(aList);
    } catch (err) {
      console.error("Failed to load journals:", err);
      showToast("Failed to load journals", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
  const handleSaveJournal = async (journalData) => {
    const payload = {
      name: journalData.journalName,
      code: journalData.code || journalData.journalName.substring(0, 4).toUpperCase(),
      type: journalData.type,
      defaultAccountId: Number(journalData.defaultAccountId) || undefined,
      sequencePrefix: journalData.sequencePrefix || journalData.journalName.substring(0, 3).toUpperCase(),
    };

    try {
      if (journalData.id && typeof journalData.id === "number") {
        await api.patch(`/journals/${journalData.id}`, payload);
        showToast(`Journal "${journalData.journalName}" updated successfully`);
      } else {
        await api.post("/journals", payload);
        showToast(`Journal "${journalData.journalName}" created successfully`);
      }
      await fetchData();
      setCurrentView("list");
      setEditingJournal(null);
    } catch (err) {
      console.error("Failed to save journal:", err);
      showToast(err.response?.data?.message || "Failed to save journal", "error");
    }
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
  const handleDeleteJournal = async (journalId) => {
    if (window.confirm("Are you sure you want to delete this journal?")) {
      try {
        await api.delete(`/journals/${journalId}`);
        showToast("Journal deleted successfully");
        await fetchData();
      } catch (err) {
        console.error("Failed to delete journal:", err);
        showToast(err.response?.data?.message || "Failed to delete journal", "error");
      }
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
