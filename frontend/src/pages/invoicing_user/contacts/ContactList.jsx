import { Users, Plus, Pencil, Trash2 } from "lucide-react";

function ContactList({
  contacts,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onNewContact
}) {
  const isAllSelected = contacts.length > 0 && contacts.every((c) => selectedIds.includes(c.id));

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
    <div className="bg-white border border-[#e7e3da] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-xs text-[#716B63] font-semibold uppercase tracking-wider select-none">
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  aria-label="Select all contacts"
                  className="rounded border-[#cfc6b6] text-[#342921] focus:ring-[#342921] cursor-pointer w-4 h-4 accent-[#342921]"
                />
              </th>
              <th className="py-3.5 px-4 w-16">IMAGE</th>
              <th className="py-3.5 px-4">NAME</th>
              <th className="py-3.5 px-4">TYPE</th>
              <th className="py-3.5 px-4">EMAIL</th>
              <th className="py-3.5 px-4">PHONE</th>
              <th className="py-3.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f2eb]">
            {contacts.map((contact) => {
              const isSelected = selectedIds.includes(contact.id);
              return (
                <tr
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className={`hover:bg-[#faf8f4] transition cursor-pointer ${
                    isSelected ? "bg-[#f8f5ee]/60" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(contact.id)}
                      aria-label={`Select ${contact.name}`}
                      className="rounded border-[#cfc6b6] text-[#342921] focus:ring-[#342921] cursor-pointer w-4 h-4 accent-[#342921]"
                    />
                  </td>

                  {/* Image: ONLY show if user uploaded image */}
                  <td className="py-3.5 px-4">
                    {contact.image ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f5f2eb] border border-[#e7e3da] flex items-center justify-center flex-shrink-0">
                        <img
                          src={contact.image}
                          alt={contact.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center text-[#cfc6b6] text-xs font-medium select-none">
                        —
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="py-3.5 px-4 font-semibold text-sm text-[#211D19]">
                    {contact.name || "Untitled Contact"}
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        contact.type === "Vendor"
                          ? "bg-[#faf0e6] text-[#7a4e2d] border border-[#e8d7c5]"
                          : "bg-[#eef3e8] text-[#3e5335] border border-[#d3dfca]"
                      }`}
                    >
                      {contact.type || "Customer"}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-sm text-[#716B63]">
                    {contact.email || "—"}
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 text-sm text-[#211D19] font-medium">
                    {contact.phone || "—"}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => (onEditContact || onSelectContact)(contact)}
                        className="p-1.5 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
                        title="Edit Contact"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteContact && onDeleteContact(contact.id)}
                        className="p-1.5 rounded-lg text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Contact"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContactList;
