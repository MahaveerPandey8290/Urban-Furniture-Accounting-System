import ContactCard from "./ContactCard";
import { Users, Plus } from "lucide-react";

function ContactKanban({ contacts, onSelectContact, onNewContact }) {
  if (contacts.length === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#f5f2eb] text-[#716B63] mx-auto flex items-center justify-center mb-3">
          <Users size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#211D19]">No contacts found</h3>
        <p className="text-sm text-[#716B63] mt-2 max-w-sm mx-auto">
          No matching contact records available. You can add a new contact to your master records.
        </p>
        <button
          type="button"
          onClick={onNewContact}
          className="mt-5 inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>New Contact</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onClick={onSelectContact}
        />
      ))}
    </div>
  );
}

export default ContactKanban;
