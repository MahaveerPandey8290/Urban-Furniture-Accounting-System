import { Pencil, Trash2 } from "lucide-react";

function ContactCard({ contact, onClick, onEdit, onDelete }) {
  const hasImage = Boolean(contact.image);

  return (
    <div
      onClick={() => onClick(contact)}
      className="bg-white border border-[#e7e3da] rounded-xl p-5 shadow-xs hover:border-[#b8ad9e] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div className={hasImage ? "flex items-start gap-3.5" : ""}>
        {/* Only show image if user uploaded an image */}
        {hasImage && (
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f5f2eb] border border-[#e7e3da] flex-shrink-0 flex items-center justify-center">
            <img
              src={contact.image}
              alt={contact.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-[#211D19] group-hover:text-[#4d3f35] truncate transition">
              {contact.name || "Untitled Contact"}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  contact.type === "Vendor"
                    ? "bg-[#faf0e6] text-[#7a4e2d] border border-[#e8d7c5]"
                    : "bg-[#eef3e8] text-[#3e5335] border border-[#d3dfca]"
                }`}
              >
                {contact.type || "Customer"}
              </span>
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => (onEdit || onClick)(contact)}
                  className="p-1 rounded-md text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
                  title="Edit Contact"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete && onDelete(contact.id)}
                  className="p-1 rounded-md text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Delete Contact"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-[#716B63] truncate mt-1.5">
            {contact.email || "No email"}
          </p>
          <p className="text-sm text-[#211D19] font-medium mt-1">
            {contact.phone || "No phone"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactCard;
