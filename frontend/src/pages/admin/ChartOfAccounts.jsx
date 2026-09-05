import { useState } from "react";

import {
  Plus,
  Check,
  Archive,
  Home,
  ArrowLeft,
  X,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  CreditCard,
  User,
} from "lucide-react";

function ChartOfAccounts() {
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // New Account
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");

  // =========================================
  // ACCOUNT FILTERS
  // =========================================

  const [accountTransactionFilter, setAccountTransactionFilter] =
    useState("All");

  const [accountDateFilter, setAccountDateFilter] = useState("");

  const [accountAmountFilter, setAccountAmountFilter] = useState("");

  // Accounts
  const [accounts, setAccounts] = useState([
    {
      name: "Cash",
      type: "Asset",
      balance: 85000,
    },
    {
      name: "Bank",
      type: "Asset",
      balance: 245000,
    },
    {
      name: "Debtors",
      type: "Asset",
      balance: 125000,
    },
    {
      name: "Creditors",
      type: "Liability",
      balance: 78000,
    },
    {
      name: "Sales Income",
      type: "Income",
      balance: 450000,
    },
    {
      name: "Purchase Expense",
      type: "Expense",
      balance: 275000,
    },
  ]);

  // Account types
  const accountTypes = [
    "Asset",
    "Liability",
    "Expense",
    "Income",
    "Capital",
  ];

  // =========================================
  // SAMPLE TRANSACTIONS
  // =========================================

  const transactions = [
    {
      id: 1,
      date: "05 Sep 2026",
      party: "Raj Furniture",
      partyType: "Customer",
      description: "Sales Invoice #INV-001",
      transactionType: "Received",
      category: "Received",
      debit: 25000,
      credit: 0,
      account: "Cash",
    },
    {
      id: 2,
      date: "04 Sep 2026",
      party: "Urban Interiors",
      partyType: "Customer",
      description: "Sales Invoice #INV-002",
      transactionType: "Received",
      category: "Received",
      debit: 18000,
      credit: 0,
      account: "Bank",
    },
    {
      id: 3,
      date: "03 Sep 2026",
      party: "ABC Wood Suppliers",
      partyType: "Vendor",
      description: "Purchase Bill #PUR-021",
      transactionType: "Paid",
      category: "Paid",
      debit: 35000,
      credit: 0,
      account: "Bank",
    },
    {
      id: 4,
      date: "02 Sep 2026",
      party: "Modern Home",
      partyType: "Customer",
      description: "Payment received",
      transactionType: "Received",
      category: "Received",
      debit: 15000,
      credit: 0,
      account: "Cash",
    },
    {
      id: 5,
      date: "01 Sep 2026",
      party: "WoodCraft Suppliers",
      partyType: "Vendor",
      description: "Vendor payment",
      transactionType: "Paid",
      category: "Paid",
      debit: 22000,
      credit: 0,
      account: "Bank",
    },

    // Debtors
    {
      id: 6,
      date: "31 Aug 2026",
      party: "Modern Home",
      partyType: "Customer",
      description: "Outstanding sales invoice #INV-003",
      transactionType: "Receivable",
      category: "Receivable",
      debit: 30000,
      credit: 0,
      account: "Debtors",
    },
    {
      id: 7,
      date: "30 Aug 2026",
      party: "Raj Furniture",
      partyType: "Customer",
      description: "Payment received from customer",
      transactionType: "Received",
      category: "Received",
      debit: 15000,
      credit: 0,
      account: "Debtors",
    },

    // Creditors
    {
      id: 8,
      date: "29 Aug 2026",
      party: "ABC Wood Suppliers",
      partyType: "Vendor",
      description: "Outstanding purchase bill #PUR-022",
      transactionType: "Payable",
      category: "Payable",
      debit: 0,
      credit: 40000,
      account: "Creditors",
    },
    {
      id: 9,
      date: "28 Aug 2026",
      party: "WoodCraft Suppliers",
      partyType: "Vendor",
      description: "Payment made to vendor",
      transactionType: "Paid",
      category: "Paid",
      debit: 22000,
      credit: 0,
      account: "Creditors",
    },

    // Sales Income
    {
      id: 10,
      date: "27 Aug 2026",
      party: "Urban Interiors",
      partyType: "Customer",
      description: "Sales Invoice #INV-004",
      transactionType: "Sales",
      category: "Sales",
      debit: 0,
      credit: 50000,
      account: "Sales Income",
    },
    {
      id: 11,
      date: "26 Aug 2026",
      party: "Modern Home",
      partyType: "Customer",
      description: "Sales return #SR-001",
      transactionType: "Sales Return",
      category: "Sales Return",
      debit: 5000,
      credit: 0,
      account: "Sales Income",
    },

    // Purchase Expense
    {
      id: 12,
      date: "25 Aug 2026",
      party: "ABC Wood Suppliers",
      partyType: "Vendor",
      description: "Purchase Bill #PUR-023",
      transactionType: "Purchase",
      category: "Purchase",
      debit: 45000,
      credit: 0,
      account: "Purchase Expense",
    },
    {
      id: 13,
      date: "24 Aug 2026",
      party: "WoodCraft Suppliers",
      partyType: "Vendor",
      description: "Purchase return #PR-001",
      transactionType: "Purchase Return",
      category: "Purchase Return",
      debit: 0,
      credit: 7000,
      account: "Purchase Expense",
    },
  ];

  // =========================================
  // ACCOUNT FILTER CONFIGURATION
  // =========================================

  const getFilterOptions = (accountName) => {
    switch (accountName) {
      case "Debtors":
        return ["All", "Receivable", "Received"];

      case "Creditors":
        return ["All", "Payable", "Paid"];

      case "Sales Income":
        return ["All", "Sales", "Sales Return"];

      case "Purchase Expense":
        return ["All", "Purchase", "Purchase Return"];

      default:
        return [];
    }
  };

  // =========================================
  // CREATE NEW ACCOUNT
  // =========================================

  const handleCreate = () => {
    if (!accountName.trim() || !accountType) {
      return;
    }

    const newAccount = {
      name: accountName.trim(),
      type: accountType,
      balance: 0,
    };

    setAccounts([...accounts, newAccount]);

    setAccountName("");
    setAccountType("");
    setShowForm(false);
  };

  // =========================================
  // RESET FILTERS
  // =========================================

  const resetAccountFilters = () => {
    setAccountTransactionFilter("All");
    setAccountDateFilter("");
    setAccountAmountFilter("");
  };

  // =========================================
  // SELECT ACCOUNT
  // =========================================

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);

    // Every account starts with All
    // and no date/amount filters.
    resetAccountFilters();
  };

  // =========================================
  // GET TRANSACTIONS FOR SELECTED ACCOUNT
  // =========================================

  const getAccountTransactions = () => {
    if (!selectedAccount) {
      return [];
    }

    let result = transactions.filter(
      (transaction) =>
        transaction.account === selectedAccount.name
    );

    // =========================================
    // ACCOUNT-SPECIFIC TRANSACTION FILTER
    // =========================================

    if (
      selectedAccount.name !== "Cash" &&
      selectedAccount.name !== "Bank" &&
      accountTransactionFilter !== "All"
    ) {
      result = result.filter(
        (transaction) =>
          transaction.category === accountTransactionFilter
      );
    }

    // =========================================
    // DATE FILTER
    // =========================================

    if (accountDateFilter) {
      result = result.filter((transaction) =>
        transaction.date
          .toLowerCase()
          .includes(accountDateFilter.toLowerCase())
      );
      debugger
    }

    // =========================================
    // AMOUNT FILTER
    // =========================================

    if (accountAmountFilter) {
      result = result.filter((transaction) => {
        const amount = Math.max(
          transaction.debit,
          transaction.credit
        );

        return amount >= Number(accountAmountFilter);
      });
    }

    return result;
  };

  const selectedTransactions = getAccountTransactions();

  // =========================================
  // SUMMARY
  // =========================================

  const totalDebit = selectedTransactions.reduce(
    (total, transaction) =>
      total + transaction.debit,
    0
  );

  const totalCredit = selectedTransactions.reduce(
    (total, transaction) =>
      total + transaction.credit,
    0
  );

  // Get filters for selected account
  const selectedFilterOptions = selectedAccount
    ? getFilterOptions(selectedAccount.name)
    : [];

  const hasAccountSpecificFilters =
    selectedFilterOptions.length > 0;

  return (
    <div className="min-h-screen bg-[#f4f1eb] p-6 md:p-8">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-semibold text-[#30251e]">
            Chart of Accounts
          </h1>

          <p className="mt-1 text-sm text-[#756b63]">
            Manage your pre-configured ledger accounts.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-[#49392f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5b483b]"
        >
          <Plus size={18} />
          New
        </button>

      </div>

      {/* =========================================
          ACTION BAR
      ========================================= */}

      <div className="mb-5 flex flex-wrap gap-2">

        <button
          className="flex items-center gap-2 rounded-md border border-[#cfc5ba] bg-white px-4 py-2 text-sm text-[#40352e] transition hover:bg-[#eee8df]"
        >
          <Check size={16} />
          Confirm
        </button>

        <button
          className="flex items-center gap-2 rounded-md border border-[#cfc5ba] bg-white px-4 py-2 text-sm text-[#40352e] transition hover:bg-[#eee8df]"
        >
          <Archive size={16} />
          Archive
        </button>

        <button
          onClick={() => setSelectedAccount(null)}
          className="ml-auto flex items-center gap-2 rounded-md border border-[#cfc5ba] bg-white px-4 py-2 text-sm text-[#40352e] transition hover:bg-[#eee8df]"
        >
          <Home size={16} />
          Home
        </button>

        {selectedAccount && (
          <button
            onClick={() => {
              setSelectedAccount(null);
              resetAccountFilters();
            }}
            className="flex items-center gap-2 rounded-md border border-[#cfc5ba] bg-white px-4 py-2 text-sm text-[#40352e] transition hover:bg-[#eee8df]"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}

      </div>

      {/* =========================================
          ACCOUNT DETAILS
      ========================================= */}

      {selectedAccount ? (

        <div>

          {/* Account heading */}

          <div className="mb-6 rounded-xl border border-[#d7cec4] bg-white p-6 shadow-sm">

            <div className="flex flex-wrap items-start justify-between gap-5">

              <div>

                <p className="mb-1 text-xs uppercase tracking-wider text-[#8a7d73]">
                  Account
                </p>

                <h2 className="text-2xl font-semibold text-[#30251e]">
                  {selectedAccount.name}
                </h2>

                <span className="mt-2 inline-block rounded-full bg-[#ebe4da] px-3 py-1 text-xs font-medium text-[#49392f]">
                  {selectedAccount.type}
                </span>

              </div>

              <div className="text-right">

                <p className="text-xs text-[#756b63]">
                  Current Balance
                </p>

                <p className="mt-1 text-3xl font-semibold text-[#49392f]">
                  ₹
                  {selectedAccount.balance.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

            </div>

          </div>

          {/* =========================================
              ACCOUNT-SPECIFIC FILTERS
          ========================================= */}

          {hasAccountSpecificFilters && (

            <div className="mb-6 rounded-xl border border-[#d7cec4] bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-2">

                <Filter
                  size={18}
                  className="text-[#49392f]"
                />

                <div>

                  <h3 className="font-semibold text-[#30251e]">
                    {selectedAccount.name} Filters
                  </h3>

                  <p className="text-xs text-[#756b63]">
                    Filter transactions according to this
                    account type.
                  </p>

                </div>

              </div>

              {/* Transaction Type */}

              <div className="grid gap-4 md:grid-cols-3">

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#30251e]">
                    Transaction
                  </label>

                  <select
                    value={accountTransactionFilter}
                    onChange={(e) =>
                      setAccountTransactionFilter(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                  >

                    {selectedFilterOptions.map(
                      (filter) => (
                        <option
                          key={filter}
                          value={filter}
                        >
                          {filter}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Date */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#30251e]">
                    Date
                  </label>

                  <input
                    type="text"
                    value={accountDateFilter}
                    onChange={(e) =>
                      setAccountDateFilter(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 05 Sep"
                    className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                  />

                </div>

                {/* Amount */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#30251e]">
                    Minimum Amount
                  </label>

                  <input
                    type="number"
                    value={accountAmountFilter}
                    onChange={(e) =>
                      setAccountAmountFilter(
                        e.target.value
                      )
                    }
                    placeholder="₹ Amount"
                    className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                  />

                </div>

              </div>

              <button
                onClick={resetAccountFilters}
                className="mt-4 rounded-lg border border-[#cfc5ba] px-4 py-2 text-sm font-medium text-[#49392f] transition hover:bg-[#eee8df]"
              >
                Reset Filters
              </button>

            </div>

          )}

          {/* =========================================
              CASH / BANK
              NO TRANSACTION FILTERS
          ========================================= */}

          {(selectedAccount.name === "Cash" ||
            selectedAccount.name === "Bank") && (

            <div className="mb-6 rounded-xl border border-[#d7cec4] bg-white p-5 shadow-sm">

              <div className="flex items-center gap-2">

                {selectedAccount.name === "Cash" ? (
                  <Wallet
                    size={18}
                    className="text-[#49392f]"
                  />
                ) : (
                  <CreditCard
                    size={18}
                    className="text-[#49392f]"
                  />
                )}

                <div>

                  <h3 className="font-semibold text-[#30251e]">
                    {selectedAccount.name} Transactions
                  </h3>

                  <p className="text-xs text-[#756b63]">
                    All {selectedAccount.name.toLowerCase()}{" "}
                    transactions are shown here. No
                    transaction-type filter is required.
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* =========================================
              SUMMARY
          ========================================= */}

          <div className="mb-6 grid gap-4 md:grid-cols-3">

            {/* Total Debit */}

            <div className="rounded-xl border border-[#d7cec4] bg-white p-5">

              <div className="mb-3 flex items-center gap-2 text-[#756b63]">

                <ArrowDownLeft size={18} />

                <span className="text-sm">
                  Total Debit
                </span>

              </div>

              <p className="text-2xl font-semibold text-[#30251e]">
                ₹
                {totalDebit.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            {/* Total Credit */}

            <div className="rounded-xl border border-[#d7cec4] bg-white p-5">

              <div className="mb-3 flex items-center gap-2 text-[#756b63]">

                <ArrowUpRight size={18} />

                <span className="text-sm">
                  Total Credit
                </span>

              </div>

              <p className="text-2xl font-semibold text-[#30251e]">
                ₹
                {totalCredit.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            {/* Transactions */}

            <div className="rounded-xl border border-[#d7cec4] bg-white p-5">

              <div className="mb-3 flex items-center gap-2 text-[#756b63]">

                <Wallet size={18} />

                <span className="text-sm">
                  Transactions
                </span>

              </div>

              <p className="text-2xl font-semibold text-[#30251e]">
                {selectedTransactions.length}
              </p>

            </div>

          </div>

          {/* =========================================
              TRANSACTION HISTORY
          ========================================= */}

          <div className="overflow-hidden rounded-xl border border-[#d7cec4] bg-white shadow-sm">

            <div className="border-b border-[#d7cec4] bg-[#ebe4da] px-5 py-4">

              <h3 className="font-semibold text-[#49392f]">
                Transaction History
              </h3>

            </div>

            {selectedTransactions.length === 0 ? (

              <div className="p-10 text-center">

                <p className="text-sm text-[#756b63]">
                  No transactions found for the
                  selected filters.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[950px]">

                  <thead className="border-b border-[#e2dbd3]">

                    <tr className="text-left text-xs uppercase tracking-wider text-[#756b63]">

                      <th className="px-5 py-4">
                        Date
                      </th>

                      <th className="px-5 py-4">
                        Party
                      </th>

                      <th className="px-5 py-4">
                        Description
                      </th>

                      <th className="px-5 py-4">
                        Party Type
                      </th>

                      <th className="px-5 py-4">
                        Transaction
                      </th>

                      <th className="px-5 py-4 text-right">
                        Debit
                      </th>

                      <th className="px-5 py-4 text-right">
                        Credit
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {selectedTransactions.map(
                      (transaction) => (

                        <tr
                          key={transaction.id}
                          className="border-b border-[#eee8df] transition last:border-0 hover:bg-[#faf8f5]"
                        >

                          {/* Date */}

                          <td className="px-5 py-4 text-sm text-[#40352e]">
                            {transaction.date}
                          </td>

                          {/* Party */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                              <User
                                size={16}
                                className="text-[#49392f]"
                              />

                              <span className="text-sm font-medium text-[#30251e]">
                                {transaction.party}
                              </span>

                            </div>

                          </td>

                          {/* Description */}

                          <td className="px-5 py-4 text-sm text-[#756b63]">
                            {transaction.description}
                          </td>

                          {/* Party Type */}

                          <td className="px-5 py-4">

                            <span className="rounded-full bg-[#ebe4da] px-3 py-1 text-xs text-[#49392f]">
                              {transaction.partyType}
                            </span>

                          </td>

                          {/* Transaction */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-[#40352e]">

                              {transaction.transactionType ===
                                "Received" ||
                              transaction.transactionType ===
                                "Sales Return" ||
                              transaction.transactionType ===
                                "Paid" ? (

                                <ArrowDownLeft
                                  size={15}
                                />

                              ) : (

                                <ArrowUpRight
                                  size={15}
                                />

                              )}

                              {transaction.transactionType}

                            </div>

                          </td>

                          {/* Debit */}

                          <td className="px-5 py-4 text-right text-sm font-medium text-[#30251e]">

                            {transaction.debit > 0
                              ? `₹${transaction.debit.toLocaleString(
                                  "en-IN"
                                )}`
                              : "-"}

                          </td>

                          {/* Credit */}

                          <td className="px-5 py-4 text-right text-sm font-medium text-[#30251e]">

                            {transaction.credit > 0
                              ? `₹${transaction.credit.toLocaleString(
                                  "en-IN"
                                )}`
                              : "-"}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      ) : (

        /* =========================================
           ACCOUNT LIST
        ========================================= */

        <div className="overflow-hidden rounded-xl border border-[#d7cec4] bg-white shadow-sm">

          <div className="grid grid-cols-3 border-b border-[#d7cec4] bg-[#ebe4da] px-5 py-4 text-sm font-semibold text-[#49392f]">

            <div>
              Account Name
            </div>

            <div>
              Type
            </div>

            <div className="text-right">
              Balance
            </div>

          </div>

          {accounts.map((account, index) => (

            <button
              key={index}
              onClick={() =>
                handleAccountSelect(account)
              }
              className="grid w-full grid-cols-3 border-b border-[#e2dbd3] px-5 py-4 text-left text-sm transition last:border-b-0 hover:bg-[#faf8f5]"
            >

              <div className="font-medium text-[#d84c79]">
                {account.name}
              </div>

              <div className="text-[#d84c79]">
                {account.type}
              </div>

              <div className="text-right font-medium text-[#49392f]">
                ₹
                {account.balance.toLocaleString(
                  "en-IN"
                )}
              </div>

            </button>

          ))}

        </div>

      )}

      {/* =========================================
          NEW ACCOUNT MODAL
      ========================================= */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-[#faf8f5] shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-start justify-between border-b border-[#ddd4ca] px-7 py-6">

              <div>

                <h2 className="text-2xl font-semibold text-[#30251e]">
                  New Account
                </h2>

                <p className="mt-1 text-sm text-[#756b63]">
                  Create a new ledger account.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="text-[#756b63] transition hover:text-[#30251e]"
              >
                <X size={24} />
              </button>

            </div>

            {/* Modal Body */}

            <div className="space-y-6 px-7 py-7">

              {/* Account Name */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#30251e]">
                  Account Name
                </label>

                <input
                  type="text"
                  value={accountName}
                  onChange={(e) =>
                    setAccountName(e.target.value)
                  }
                  placeholder="Enter account name"
                  className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                />

              </div>

              {/* Account Type */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#30251e]">
                  Type
                </label>

                <select
                  value={accountType}
                  onChange={(e) =>
                    setAccountType(e.target.value)
                  }
                  className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                >

                  <option value="">
                    Select account type
                  </option>

                  {accountTypes.map((type) => (

                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>

                  ))}

                </select>

              </div>

            </div>

            {/* Modal Footer */}

            <div className="flex justify-end gap-3 border-t border-[#ddd4ca] px-7 py-5">

              <button
                onClick={() => {
                  setShowForm(false);
                  setAccountName("");
                  setAccountType("");
                }}
                className="rounded-lg border border-[#cfc5ba] px-5 py-2.5 text-sm font-medium text-[#49392f] transition hover:bg-[#eee8df]"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="rounded-lg bg-[#49392f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#5b483b]"
              >
                Create
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ChartOfAccounts;