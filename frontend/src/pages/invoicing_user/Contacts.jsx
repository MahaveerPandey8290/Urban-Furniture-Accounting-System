import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ArrowLeft } from "lucide-react";
import ContactList from "./contacts/ContactList";
import ContactKanban from "./contacts/ContactKanban";
import ContactForm from "./contacts/ContactForm";
import Toast, { useToast } from "../../components/common/Toast";
import ViewToggle from "../../components/common/ViewToggle";

const STORAGE_KEY = "urban_furniture_contacts_master";

const INITIAL_CONTACTS = [
  {
    id: "cnt-1",
    name: "Open Wood",
    type: "Customer",
    email: "openwood21@example.com",
    phone: "+91 9090909090",
    street: "Plot 42, Timber Craft Industrial Estate, Outer Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    pincode: "560103",
    image: null,
  },
  {
    id: "cnt-2",
    name: "Joey Wills",
    type: "Vendor",
    email: "joey.wills@example.com",
    phone: "+91 8080808080",
    street: "Suite 304, Regent Heritage Square, MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400001",
    image: null,
  },
  {
    id: "cnt-3",
    name: "Prestige Modern Lofts",
    type: "Customer",
    email: "procurements@prestigelofts.com",
    phone: "+91 98450 12345",
    street: "Tower 8, Horizon Financial District",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    pincode: "500081",
    image: null,
  },
  {
    id: "cnt-4",
    name: "Studio Arch Interiors",
    type: "Vendor",
    email: "contact@studioarch.in",
    phone: "+91 97330 99881",
    street: "14 Design Guild Avenue, Koregaon Park",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    pincode: "411001",
    image: null,
  },
];

function Contacts() {
  const navigate = useNavigate();

  // Load contacts from localStorage or initialize with mock data
  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            ...item,
            type: item.type || "Customer",
            image:
              typeof item.image === "string" && item.image.includes("unsplash.com")
                ? null
                : item.image || null,
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load contacts from storage:", e);
    }
    return INITIAL_CONTACTS;
  });

  // Views: 'list' (default) | 'kanban' | 'form'
  const [currentView, setCurrentView] = useState("list");
  // Keep track of the view (list or kanban) before entering form view, so Back returns to it
  const [previousBrowseView, setPreviousBrowseView] = useState("list");

  // Selected contact for editing in form view (null for new)
  const [editingContact, setEditingContact] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Checkbox selections for table
  const [selectedIds, setSelectedIds] = useState([]);
  const { toastMessage, showToast } = useToast();

  // Persist contacts whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error("Failed to save contacts to storage:", e);
    }
  }, [contacts]);

  // Switch to Form View for creating a new Contact
  const handleNewContact = () => {
    if (currentView !== "form") {
      setPreviousBrowseView(currentView);
    }
    setEditingContact(null);
    setCurrentView("form");
  };

  // Switch to Form View for viewing/editing an existing Contact
  const handleSelectContact = (contact) => {
    if (currentView !== "form") {
      setPreviousBrowseView(currentView);
    }
    setEditingContact(contact);
    setCurrentView("form");
  };

  // Back button handler
  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView(previousBrowseView);
      setEditingContact(null);
    } else {
      const isPathAdmin = window.location.pathname.startsWith("/admin");
      navigate(isPathAdmin ? "/admin" : "/invoicing_user");
    }
  };

  // Save contact (Confirm button in form)
  const handleSaveContact = (formData) => {
    if (formData.id) {
      // Update existing record
      setContacts((prev) =>
        prev.map((c) => (c.id === formData.id ? { ...formData } : c))
      );
      showToast("Contact updated successfully");
    } else {
      // Create new record
      const newRecord = {
        ...formData,
        id: "cnt-" + Date.now(),
      };
      setContacts((prev) => [newRecord, ...prev]);
      showToast("Contact created successfully");
    }

    // Return to the previous browse view (list or kanban)
    setCurrentView(previousBrowseView);
    setEditingContact(null);
  };

  // Filtered contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase().trim();
    return contacts.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(query);
      const emailMatch = c.email?.toLowerCase().includes(query);
      const phoneMatch = c.phone?.toLowerCase().includes(query);
      const cityMatch = c.city?.toLowerCase().includes(query);
      const typeMatch = c.type?.toLowerCase().includes(query);
      return nameMatch || emailMatch || phoneMatch || cityMatch || typeMatch;
    });
  }, [contacts, searchQuery]);

  // Checkbox handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredContacts.map((c) => c.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Delete contact
  const handleDeleteContact = (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      setSelectedIds((prev) => prev.filter((id) => id !== contactId));
      showToast("Contact deleted successfully");
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Header breadcrumb & title */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-2 text-sm text-[#716B63] mb-1">
          <span>Account</span>
          <span>/</span>
          <span className="text-[#211D19] font-medium">Contact</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
          {currentView === "form"
            ? editingContact
              ? editingContact.name || "Contact Master"
              : "New Contact"
            : "Contact Master"}
        </h1>
      </div>

      {/* Toast alert */}
      <Toast message={toastMessage} />

      {/* ================= VIEW 1 & 2: LIST / KANBAN ================= */}
      {currentView !== "form" && (
        <>
          {/* Top Action Bar: [ New ]    [ Search ]                         [ Back ] */}
          {/* On right side: [ List View ] [ Kanban View ] */}
          <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Left side: [ New ]  [ Search ] */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <button
                type="button"
                onClick={handleNewContact}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
              >
                <Plus size={16} />
                <span>New</span>
              </button>

              {/* Search Field */}
              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716B63]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
                />
              </div>
            </div>

            {/* Right side: [ List View ] [ Kanban View ]  [ Back ] */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">

              {/* Toggle Buttons */}
              <ViewToggle currentView={currentView} onChange={setCurrentView} />

              {/* Back Button */}
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

            </div>

          </div>

          {/* List or Kanban Display */}
          {currentView === "list" ? (
            <ContactList
              contacts={filteredContacts}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onSelectContact={handleSelectContact}
              onEditContact={handleSelectContact}
              onDeleteContact={handleDeleteContact}
              onNewContact={handleNewContact}
            />
          ) : (
            <ContactKanban
              contacts={filteredContacts}
              onSelectContact={handleSelectContact}
              onEditContact={handleSelectContact}
              onDeleteContact={handleDeleteContact}
              onNewContact={handleNewContact}
            />
          )}
        </>
      )}

      {/* ================= VIEW 3: CONTACT MASTER FORM VIEW ================= */}
      {currentView === "form" && (
        <ContactForm
          initialData={editingContact}
          existingContacts={contacts}
          onSave={handleSaveContact}
          onNew={handleNewContact}
          onBack={handleBack}
        />
      )}

    </div>
  );
}

export default Contacts;
