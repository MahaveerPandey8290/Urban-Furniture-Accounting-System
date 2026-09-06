import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Search, X } from "lucide-react";
import Toast, { useToast } from "../../../components/common/Toast";
import JournalEntryList from "./JournalEntryList";
import JournalEntryForm from "./JournalEntryForm";
import api from "../../../services/api";

function JournalEntriesMaster() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Views: 'list' (default) | 'form'
  const [currentView, setCurrentView] = useState("list");
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toastMessage, showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jeRes, accRes, jourRes, cRes] = await Promise.all([
        api.get("/journal-entries?limit=100").catch(() => ({ data: [] })),
        api.get("/accounts?limit=100").catch(() => ({ data: { items: [] } })),
        api.get("/journals").catch(() => ({ data: { items: [] } })),
        api.get("/contacts?limit=100").catch(() => ({ data: { items: [] } })),
      ]);

      const rawEntries = Array.isArray(jeRes.data) ? jeRes.data : [];
      const jeList = rawEntries.map((e) => ({
        id: e.id,
        number: e.number,
        accountingDate: e.entryDate ? new Date(e.entryDate).toISOString().split("T")[0] : "",
        dateDisplay: e.entryDate
          ? new Date(e.entryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
          : "",
        partnerId: e.partnerId,
        partnerName: e.partner?.name || "",
        journalId: e.journalId,
        journalName: e.journal?.name || "General",
        total: Number(e.totalDebit || e.totalCredit || 0),
        status: e.status === "POSTED" ? "Posted" : "Draft",
        items: (e.items || []).map((item) => ({
          id: item.id,
          accountId: item.accountId,
          accountName: item.account?.name || "Account",
          partnerId: item.partnerId,
          partnerName: item.partner?.name || "",
          debit: Number(item.debit || 0),
          credit: Number(item.credit || 0),
        })),
      }));
      setEntries(jeList);

      const accList = (accRes.data?.items || []).map((a) => ({
        id: a.id,
        accountName: a.name,
        status: a.isArchived ? "ARCHIVED" : "ACTIVE",
      }));
      setAccounts(accList);

      const jourList = (jourRes.data?.items || []).map((j) => ({
        id: j.id,
        journalName: j.name,
        type: j.type,
      }));
      setJournals(jourList);

      const contList = (cRes.data?.items || []).map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type === "CUSTOMER" ? "Customer" : "Vendor",
      }));
      setContacts(contList);
    } catch (err) {
      console.error("Failed to load journal entries:", err);
      showToast("Failed to load journal entries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
  const handleSaveEntry = async (entryData) => {
    const lines = (entryData.items || []).map((it) => ({
      accountId: Number(it.accountId),
      debit: String(Number(it.debit) || 0),
      credit: String(Number(it.credit) || 0),
      partnerId: it.partnerId ? Number(it.partnerId) : undefined,
    }));

    const payload = {
      journalId: Number(entryData.journalId) || (journals[0]?.id || 1),
      entryDate: entryData.accountingDate || new Date().toISOString().split("T")[0],
      reference: entryData.reference || undefined,
      narration: entryData.narration || undefined,
      lines,
    };

    try {
      await api.post("/journal-entries", payload);
      showToast(
        entryData.status === "Posted"
          ? `Journal Entry posted successfully`
          : `Journal Entry saved successfully`
      );
      await fetchData();
      setCurrentView("list");
      setEditingEntry(null);
    } catch (err) {
      console.error("Failed to save journal entry:", err);
      showToast(err.response?.data?.message || "Failed to post journal entry", "error");
    }
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

  // Delete journal entry (or reverse)
  const handleDeleteEntry = async (entryId) => {
    if (window.confirm("Do you want to reverse this journal entry?")) {
      try {
        await api.post(`/journal-entries/${entryId}/reverse`, {
          reversalDate: new Date().toISOString().split("T")[0],
        });
        showToast("Journal entry reversed successfully");
        await fetchData();
      } catch (err) {
        console.error("Failed to reverse entry:", err);
        showToast(err.response?.data?.message || "Failed to reverse journal entry", "error");
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
