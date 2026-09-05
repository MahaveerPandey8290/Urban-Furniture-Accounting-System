import { BookOpen, Plus, Landmark, Wallet, ShoppingCart, ShoppingBag } from "lucide-react";

function JournalList({
  journals,
  onSelectJournal,
  onNewJournal,
}) {
  const getTypeBadge = (type) => {
    switch (type?.toUpperCase()) {
      case "SALES":
        return {
          style: "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]",
          label: "Sales",
          icon: <ShoppingCart size={11} className="mr-1 inline" />,
        };
      case "PURCHASE":
        return {
          style: "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]",
          label: "Purchase",
          icon: <ShoppingBag size={11} className="mr-1 inline" />,
        };
      case "BANK":
        return {
          style: "bg-[#e8f1f5] text-[#2c5364] border-[#d0e1e9]",
          label: "Bank",
          icon: <Landmark size={11} className="mr-1 inline" />,
        };
      case "CASH":
        return {
          style: "bg-[#eaf5f0] text-[#2c634c] border-[#cde7dc]",
          label: "Cash",
          icon: <Wallet size={11} className="mr-1 inline" />,
        };
      default:
        return {
          style: "bg-[#faf8f4] text-[#6e6357] border-[#e7e3da]",
          label: type || "General",
          icon: null,
        };
    }
  };

  if (journals.length === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#f5f2eb] text-[#7a7065] mx-auto flex items-center justify-center mb-3">
          <BookOpen size={22} />
        </div>
        <h3 className="text-lg font-semibold text-[#211D19]">No journals found</h3>
        <p className="text-sm text-[#716B63] mt-1.5 max-w-sm mx-auto">
          No matching journal records available. You can add a new journal to group accounting transactions.
        </p>
        <button
          type="button"
          onClick={onNewJournal}
          className="mt-4 inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          <span>New Journal</span>
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
              <th className="py-3.5 px-6">JOURNAL NAME</th>
              <th className="py-3.5 px-6">TYPE</th>
              <th className="py-3.5 px-6">DEFAULT ACCOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f2eb]">
            {journals.map((journal) => {
              const badge = getTypeBadge(journal.type);
              return (
                <tr
                  key={journal.id}
                  onClick={() => onSelectJournal(journal)}
                  className="hover:bg-[#faf8f4] transition cursor-pointer group"
                >
                  {/* 1. Journal Name */}
                  <td className="py-3.5 px-6 font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#543b2b] opacity-40 group-hover:opacity-100 transition" />
                      <span>{journal.journalName}</span>
                    </div>
                  </td>

                  {/* 2. Type */}
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.style}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </td>

                  {/* 3. Default Account */}
                  <td className="py-3.5 px-6 text-[#4a3b2f]">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#8e8174] flex-shrink-0" />
                      <span className="font-medium text-[#211D19]">
                        {journal.defaultAccountName || "Not assigned"}
                      </span>
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

export default JournalList;
