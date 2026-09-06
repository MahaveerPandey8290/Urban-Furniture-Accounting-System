import { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  ShoppingCart,
  ShoppingBag,
  Landmark,
  WalletCards,
  BookOpen,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Package,
  FileText,
  CalendarDays,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Journals() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [journals, setJournals] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const getIcon = (type) => {
    switch (type) {
      case "SALES":
        return ShoppingCart;
      case "PURCHASE":
        return ShoppingBag;
      case "BANK":
        return Landmark;
      case "CASH":
        return WalletCards;
      default:
        return BookOpen;
    }
  };

  const fetchJournalsData = async () => {
    setLoading(true);
    try {
      const [jRes, eRes] = await Promise.all([
        api.get("/journals"),
        api.get("/journal-entries").catch(() => ({ data: [] })),
      ]);

      // journals returns { items: [] }
      const jList = (jRes.data.items || []).map((j) => ({
        id: j.id,
        name: j.name,
        type: j.type,
        icon: getIcon(j.type),
        defaultAccount: j.defaultAccount?.name || "None",
      }));

      setJournals(jList);
      // journal-entries returns a direct array
      setEntries(Array.isArray(eRes.data) ? eRes.data : []);
    } catch {
      // Error toasted by api.js interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalsData();
  }, []);

  // Map backend journal entries into transaction presentation objects
  const transactions = useMemo(() => {
    return entries.map((e) => {
      const firstItem = e.items?.[0] || {};
      const secondItem = e.items?.[1] || {};
      return {
        id: e.id,
        journalId: e.journalId,
        journal: e.journal?.name || "General",
        date: new Date(e.entryDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        reference: e.number || e.reference || "-",
        party: e.partner?.name || "-",
        partyType: e.partner?.type || "-",
        product: firstItem.product?.name || "-",
        quantity: Number(firstItem.quantity) || 0,
        unitPrice: Number(firstItem.unitPrice) || 0,
        total: Number(e.totalDebit) || 0,
        paymentStatus: e.status,
        paymentMode: e.journal?.type === "BANK" ? "Bank" : "Cash",
        debitAccount: firstItem.account?.name || "-",
        creditAccount: secondItem.account?.name || "-",
        debit: Number(e.totalDebit) || 0,
        credit: Number(e.totalCredit) || 0,
        description: e.narration || e.reference || `Entry ${e.number}`,
      };
    });
  }, [entries]);

  // =========================================================
  // SEARCH JOURNALS
  // =========================================================

  const filteredJournals = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return journals;
    }

    return journals.filter(
      (journal) =>
        journal.name.toLowerCase().includes(value) ||
        journal.type.toLowerCase().includes(value) ||
        journal.defaultAccount.toLowerCase().includes(value)
    );
  }, [search]);

  // =========================================================
  // JOURNAL TRANSACTIONS
  // =========================================================

  const selectedTransactions = selectedJournal
    ? transactions.filter(
        (transaction) =>
          transaction.journal === selectedJournal.name
      )
    : [];

  // =========================================================
  // TOTALS
  // =========================================================

  const totalAmount = selectedTransactions.reduce(
    (sum, transaction) => sum + transaction.total,
    0
  );

  const totalDebit = selectedTransactions.reduce(
    (sum, transaction) => sum + transaction.debit,
    0
  );

  const totalCredit = selectedTransactions.reduce(
    (sum, transaction) => sum + transaction.credit,
    0
  );

  // =========================================================
  // TYPE STYLE
  // =========================================================

  const getTypeClass = (type) => {
    switch (type) {
      case "Sales":
        return "bg-green-50 text-green-700 border-green-200";

      case "Purchase":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "Bank":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Cash":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // =========================================================
  // JOURNAL DETAIL VIEW
  // =========================================================

  if (selectedJournal) {
    const Icon = selectedJournal.icon;

    return (
      <div className="min-h-screen bg-[#f8f7f4] px-8 py-8">

        {/* Back / Heading */}
        <div className="mb-7">

          <button
            onClick={() => setSelectedJournal(null)}
            className="
              flex items-center gap-2
              text-[#665b53]
              mb-5
              hover:text-black
              transition
            "
          >
            <ArrowLeft size={18} />
            Back to Journals
          </button>

          <div className="flex items-center gap-4">

            <div
              className="
                w-12 h-12
                rounded-xl
                bg-white
                border
                border-[#e2ddd5]
                flex items-center justify-center
              "
            >
              <Icon size={24} />
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm mb-1">
                <span className="text-gray-500">
                  Account
                </span>

                <span className="text-gray-400">
                  /
                </span>

                <span className="text-gray-900">
                  Journals
                </span>

                <span className="text-gray-400">
                  /
                </span>

                <span className="text-gray-900">
                  {selectedJournal.name}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-950">
                {selectedJournal.name} Journal
              </h1>
            </div>
          </div>

          <div className="border-b border-[#dedbd5] mt-6" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-5 mb-7">

          <div className="bg-white border border-[#e5e0d8] rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Transactions
            </p>

            <p className="text-2xl font-bold mt-2">
              {selectedTransactions.length}
            </p>
          </div>

          <div className="bg-white border border-[#e5e0d8] rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Total Amount
            </p>

            <p className="text-2xl font-bold mt-2">
              {formatMoney(totalAmount)}
            </p>
          </div>

          <div className="bg-white border border-[#e5e0d8] rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Total Debit
            </p>

            <p className="text-2xl font-bold text-green-700 mt-2">
              {formatMoney(totalDebit)}
            </p>
          </div>

          <div className="bg-white border border-[#e5e0d8] rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Total Credit
            </p>

            <p className="text-2xl font-bold text-red-700 mt-2">
              {formatMoney(totalCredit)}
            </p>
          </div>

        </div>

        {/* Default Account */}
        <div className="bg-white border border-[#e5e0d8] rounded-2xl p-5 mb-7">

          <div className="flex items-center gap-3">

            <BookOpen
              size={20}
              className="text-[#756b63]"
            />

            <div>
              <p className="text-xs text-gray-500">
                DEFAULT ACCOUNT
              </p>

              <p className="font-semibold text-lg">
                {selectedJournal.defaultAccount}
              </p>
            </div>

          </div>

        </div>

        {/* Transactions */}
        <div className="bg-white border border-[#e5e0d8] rounded-[20px] overflow-hidden shadow-sm">

          <div className="px-7 py-5 border-b border-[#e5e0d8]">

            <h2 className="text-xl font-semibold">
              Journal Transactions
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              All transactions recorded under the{" "}
              {selectedJournal.name} journal
            </p>

          </div>

          {selectedTransactions.length === 0 ? (

            <div className="py-16 text-center text-gray-500">
              No transactions found.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-[#fbfaf8]">

                  <tr className="text-left text-xs text-[#675e57]">

                    <th className="px-6 py-4">
                      DATE
                    </th>

                    <th className="px-6 py-4">
                      REFERENCE
                    </th>

                    <th className="px-6 py-4">
                      PARTY
                    </th>

                    <th className="px-6 py-4">
                      DESCRIPTION
                    </th>

                    <th className="px-6 py-4">
                      AMOUNT
                    </th>

                    <th className="px-6 py-4">
                      PAYMENT
                    </th>

                    <th className="px-6 py-4">
                      STATUS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {selectedTransactions.map(
                    (transaction) => (

                      <tr
                        key={transaction.id}
                        className="
                          border-t
                          border-[#eeeae4]
                          hover:bg-[#fcfbf9]
                          cursor-pointer
                        "
                        onClick={() => {
                          alert(
                            `Reference: ${transaction.reference}`
                          );
                        }}
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <CalendarDays
                              size={16}
                              className="text-gray-400"
                            />

                            {transaction.date}

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <span className="font-semibold">
                            {transaction.reference}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <div>

                            <div className="flex items-center gap-2 font-medium">

                              <User size={16} />

                              {transaction.party}

                            </div>

                            <p className="text-xs text-gray-500 ml-6">
                              {transaction.partyType}
                            </p>

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <Package
                              size={16}
                              className="text-gray-400"
                            />

                            <div>

                              <p className="font-medium">
                                {transaction.product}
                              </p>

                              {transaction.quantity > 0 && (
                                <p className="text-xs text-gray-500">
                                  Qty:{" "}
                                  {transaction.quantity} ×{" "}
                                  {formatMoney(
                                    transaction.unitPrice
                                  )}
                                </p>
                              )}

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-5 font-semibold">

                          {formatMoney(
                            transaction.total
                          )}

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-2
                              px-3
                              py-1.5
                              rounded-full
                              bg-gray-50
                              border
                              border-gray-200
                              text-sm
                            "
                          >

                            <CreditCard size={14} />

                            {transaction.paymentMode}

                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1.5
                              rounded-full
                              text-sm
                              border
                              ${
                                transaction.paymentStatus ===
                                "Paid" ||
                                transaction.paymentStatus ===
                                "Received"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                              }
                            `}
                          >
                            {transaction.paymentStatus}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* Accounting Entries */}
        <div className="bg-white border border-[#e5e0d8] rounded-[20px] overflow-hidden shadow-sm mt-7">

          <div className="px-7 py-5 border-b border-[#e5e0d8]">

            <h2 className="text-xl font-semibold">
              Accounting Entries
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Debit and credit accounts generated from
              the journal transactions
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-[#fbfaf8]">

                <tr className="text-left text-xs text-[#675e57]">

                  <th className="px-6 py-4">
                    DATE
                  </th>

                  <th className="px-6 py-4">
                    REFERENCE
                  </th>

                  <th className="px-6 py-4">
                    DEBIT ACCOUNT
                  </th>

                  <th className="px-6 py-4">
                    CREDIT ACCOUNT
                  </th>

                  <th className="px-6 py-4">
                    DEBIT
                  </th>

                  <th className="px-6 py-4">
                    CREDIT
                  </th>

                </tr>

              </thead>

              <tbody>

                {selectedTransactions.map(
                  (transaction) => (

                    <tr
                      key={`entry-${transaction.id}`}
                      className="border-t border-[#eeeae4]"
                    >

                      <td className="px-6 py-5">
                        {transaction.date}
                      </td>

                      <td className="px-6 py-5 font-medium">
                        {transaction.reference}
                      </td>

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <ArrowDownLeft
                            size={16}
                            className="text-green-600"
                          />

                          {transaction.debitAccount}

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <ArrowUpRight
                            size={16}
                            className="text-red-600"
                          />

                          {transaction.creditAccount}

                        </div>

                      </td>

                      <td className="px-6 py-5 font-semibold text-green-700">
                        {formatMoney(transaction.debit)}
                      </td>

                      <td className="px-6 py-5 font-semibold text-red-700">
                        {formatMoney(transaction.credit)}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN JOURNAL LIST
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f8f7f4] px-8 py-8">

      {/* Page Heading */}
      <div className="mb-7">

        <div className="flex items-center gap-2 text-sm mb-2">

          <span className="text-gray-500">
            Account
          </span>

          <span className="text-gray-400">
            /
          </span>

          <span className="text-gray-900">
            Journals
          </span>

        </div>

        <h1 className="text-4xl font-bold text-gray-950">
          Journals
        </h1>

        <div className="border-b border-[#dedbd5] mt-6" />

      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#e5e0d8] rounded-[20px] px-6 py-6 mb-7 shadow-sm">

        <div className="flex items-center gap-4">

          <button
            onClick={() => {
              // New Journal functionality later
            }}
            className="
              flex items-center gap-2
              bg-[#352a23]
              text-white
              px-6 py-4
              rounded-xl
              text-lg
              font-medium
              hover:bg-[#29211c]
              transition
            "
          >
            <Plus size={21} />
            New
          </button>

          {/* Search */}
          <div className="relative w-[400px]">

            <Search
              size={21}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-500
              "
            />

            <input
              type="text"
              placeholder="Search journals or accounts..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                w-full
                h-[52px]
                pl-12
                pr-4
                rounded-xl
                border
                border-[#d8cfc3]
                bg-white
                text-gray-900
                text-lg
                outline-none
                focus:border-[#8f7968]
                focus:ring-1
                focus:ring-[#8f7968]
              "
            />

          </div>

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="
              ml-auto
              flex items-center gap-2
              px-6
              py-4
              rounded-xl
              border
              border-[#e2ddd5]
              bg-white
              text-[#5b514a]
              text-lg
              hover:bg-[#f8f6f2]
              transition
              shadow-sm
            "
          >
            <ArrowLeft size={20} />
            Back
          </button>

        </div>

      </div>

      {/* Journal Table */}
      <div className="bg-white rounded-[20px] border border-[#e5e0d8] overflow-hidden shadow-sm">

        {/* Header */}
        <div
          className="
            grid
            grid-cols-[1.1fr_1fr_1.5fr]
            items-center
            px-7
            py-5
            bg-[#fbfaf8]
            border-b
            border-[#e5e0d8]
            text-sm
            font-semibold
            tracking-wide
            text-[#675e57]
          "
        >

          <div>
            JOURNAL NAME
          </div>

          <div>
            TYPE
          </div>

          <div>
            DEFAULT ACCOUNT
          </div>

        </div>

        {/* Rows */}
        {filteredJournals.length > 0 ? (

          filteredJournals.map((journal) => {

            const Icon = journal.icon;

            return (
              <div
                key={journal.id}
                onClick={() =>
                  setSelectedJournal(journal)
                }
                className="
                  grid
                  grid-cols-[1.1fr_1fr_1.5fr]
                  items-center
                  px-7
                  py-5
                  border-b
                  border-[#eeeae4]
                  last:border-b-0
                  hover:bg-[#fcfbf9]
                  transition
                  cursor-pointer
                "
              >

                {/* Name */}
                <div className="flex items-center gap-3">

                  <span className="w-2 h-2 rounded-full bg-[#bcb5ae]" />

                  <span className="text-lg font-semibold text-gray-950">
                    {journal.name}
                  </span>

                </div>

                {/* Type */}
                <div>

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-2
                      rounded-full
                      border
                      text-sm
                      font-medium
                      ${getTypeClass(journal.type)}
                    `}
                  >

                    <Icon size={15} />

                    {journal.type}

                  </span>

                </div>

                {/* Default Account */}
                <div className="flex items-center gap-3">

                  <BookOpen
                    size={19}
                    strokeWidth={1.7}
                    className="text-[#8b8178]"
                  />

                  <span className="text-lg text-gray-950">
                    {journal.defaultAccount}
                  </span>

                </div>

              </div>
            );
          })

        ) : (

          <div className="py-14 text-center text-gray-500">
            No journals found.
          </div>

        )}

      </div>

    </div>
  );
}

export default Journals;