import { FileText, Plus, CheckCircle, Clock, Pencil, Trash2 } from "lucide-react";
import { formatDate, formatCurrency } from "../../../utils/formatters";

function JournalEntryList({
  entries,
  onSelectEntry,
  onEditEntry,
  onDeleteEntry,
  onNewEntry,
}) {
  const getStatusBadge = (status) => {
    if (status === "Posted") {
      return {
        style: "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]",
        icon: <CheckCircle size={11} className="mr-1 inline" />,
        label: "Posted",
      };
    }
    return {
      style: "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]",
      icon: <Clock size={11} className="mr-1 inline" />,
      label: "Draft",
    };
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#f5f2eb] text-[#7a7065] mx-auto flex items-center justify-center mb-3">
          <FileText size={22} />
        </div>
        <h3 className="text-lg font-semibold text-[#211D19]">No journal entries found</h3>
        <p className="text-sm text-[#716B63] mt-1.5 max-w-sm mx-auto">
          No accounting transactions recorded. You can create a new journal entry to record financial transactions.
        </p>
        <button
          type="button"
          onClick={onNewEntry}
          className="mt-4 inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>New Journal Entry</span>
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
              <th className="py-3.5 px-6">DATE</th>
              <th className="py-3.5 px-6">NUMBER</th>
              <th className="py-3.5 px-6">PARTNER</th>
              <th className="py-3.5 px-6">JOURNAL</th>
              <th className="py-3.5 px-6 text-right">TOTAL</th>
              <th className="py-3.5 px-6 text-center">STATUS</th>
              <th className="py-3.5 px-6 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f2eb]">
            {entries.map((entry) => {
              const statusBadge = getStatusBadge(entry.status);
              const partnerDisplay =
                entry.partnerName ||
                entry.items?.find((i) => i.partnerName)?.partnerName ||
                "-";

              return (
                <tr
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className="hover:bg-[#faf8f4] transition cursor-pointer group"
                >
                  {/* 1. Date */}
                  <td className="py-3.5 px-6 text-[#716B63] font-medium whitespace-nowrap">
                    {formatDate(entry.accountingDate, entry.dateDisplay)}
                  </td>

                  {/* 2. Number */}
                  <td className="py-3.5 px-6 font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#543b2b] opacity-40 group-hover:opacity-100 transition" />
                      <span>{entry.number}</span>
                    </div>
                  </td>

                  {/* 3. Partner */}
                  <td className="py-3.5 px-6 text-[#4a3b2f] font-medium">
                    {partnerDisplay}
                  </td>

                  {/* 4. Journal */}
                  <td className="py-3.5 px-6 text-[#211D19]">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#f5f2eb] text-[#4a3b2f] border border-[#e7e3da]">
                      {entry.journalName || "General"}
                    </span>
                  </td>

                  {/* 5. Total */}
                  <td className="py-3.5 px-6 text-right font-semibold text-[#211D19] whitespace-nowrap">
                    {formatCurrency(entry.total)}
                  </td>

                  {/* 6. Status */}
                  <td className="py-3.5 px-6 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.style}`}
                    >
                      {statusBadge.icon}
                      <span>{statusBadge.label}</span>
                    </span>
                  </td>

                  {/* 7. Actions */}
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => (onEditEntry || onSelectEntry)(entry)}
                        className="p-1.5 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
                        title="Edit Journal Entry"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEntry && onDeleteEntry(entry.id)}
                        className="p-1.5 rounded-lg text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Journal Entry"
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

export default JournalEntryList;
