import { BookOpen, Archive, RotateCcw, Plus, Pencil, Trash2 } from "lucide-react";

function AccountList({
  accounts,
  isArchivedView,
  hasActiveFilter,
  onClearFilters,
  onSelectAccount,
  onEditAccount,
  onDeleteAccount,
  onToggleArchive,
  onNewAccount,
}) {
  const getBadgeStyle = (type, displayType) => {
    switch (type) {
      case "ASSET":
        return "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]";
      case "LIABILITY":
        return "bg-[#fbf0ee] text-[#8e392e] border-[#f0d4d0]";
      case "INCOME":
        return "bg-[#eaf5f0] text-[#2c634c] border-[#cde7dc]";
      case "EXPENSE":
        return "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]";
      case "CAPITAL":
        return "bg-[#f2eff7] text-[#543b78] border-[#ded5ec]";
      default:
        return "bg-[#faf8f4] text-[#6e6357] border-[#e7e3da]";
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#f5f2eb] text-[#716B63] mx-auto flex items-center justify-center mb-3">
          <BookOpen size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#211D19]">
          {hasActiveFilter
            ? "No matching accounts"
            : isArchivedView
            ? "No archived accounts"
            : "No accounts found"}
        </h3>
        <p className="text-sm text-[#716B63] mt-2 max-w-sm mx-auto">
          {hasActiveFilter
            ? "No accounts match your current search query or account type filter."
            : isArchivedView
            ? "There are no archived accounts. Archived accounts will appear here."
            : "No accounts match your criteria. You can create a new account."}
        </p>
        {hasActiveFilter ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
          >
            <RotateCcw size={16} />
            <span>Clear Filters</span>
          </button>
        ) : (
          !isArchivedView && (
            <button
              type="button"
              onClick={onNewAccount}
              className="mt-5 inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              <span>New Account</span>
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e7e3da] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-xs text-[#716B63] font-semibold uppercase tracking-wider select-none">
              <th className="py-3.5 px-6">ACCOUNT NAME</th>
              <th className="py-3.5 px-6">TYPE</th>
              <th className="py-3.5 px-6 text-right w-28">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f2eb]">
            {accounts.map((acc) => (
              <tr
                key={acc.id}
                onClick={() => onSelectAccount(acc)}
                className="hover:bg-[#faf8f4] transition cursor-pointer group"
              >
                {/* Account Name */}
                <td className="py-3.5 px-6 font-semibold text-sm text-[#211D19] group-hover:text-[#4d3f35] transition">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#543b2b] opacity-40" />
                    <span>{acc.accountName}</span>
                  </div>
                </td>

                {/* Account Type */}
                <td className="py-3.5 px-6">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeStyle(
                      acc.type,
                      acc.displayType
                    )}`}
                  >
                    {acc.displayType || acc.type}
                  </span>
                </td>

                {/* Action (Edit / Archive / Delete) */}
                <td
                  className="py-3.5 px-6 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => (onEditAccount || onSelectAccount)(acc)}
                      title="Edit account"
                      className="p-1.5 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#f5f2eb] transition cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleArchive(acc.id)}
                      title={isArchivedView ? "Restore account" : "Archive account"}
                      className="p-1.5 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#f5f2eb] transition cursor-pointer"
                    >
                      {isArchivedView ? <RotateCcw size={14} /> : <Archive size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAccount && onDeleteAccount(acc.id)}
                      title="Delete account"
                      className="p-1.5 rounded-lg text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountList;
