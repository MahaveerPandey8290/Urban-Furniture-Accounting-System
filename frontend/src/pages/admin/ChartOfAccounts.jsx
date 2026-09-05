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

  // Cash filters
  const [cashPartyFilter, setCashPartyFilter] =
    useState("Customer");

  const [cashTransactionFilter, setCashTransactionFilter] =
    useState("All");

  const [cashDateFilter, setCashDateFilter] =
    useState("");

  const [cashAmountFilter, setCashAmountFilter] =
    useState("");

  // Bank filters
  const [bankPartyFilter, setBankPartyFilter] =
    useState("All");

  const [bankTransactionFilter, setBankTransactionFilter] =
    useState("All");

  const [bankDateFilter, setBankDateFilter] =
    useState("");

  const [bankAmountFilter, setBankAmountFilter] =
    useState("");

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

  // Sample transactions
  const transactions = [
    {
      id: 1,
      date: "05 Sep 2026",
      party: "Raj Furniture",
      partyType: "Customer",
      description: "Sales Invoice #INV-001",
      transactionType: "Received",
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
      debit: 22000,
      credit: 0,
      account: "Bank",
    },
  ];

  // Create new account
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

  // Reset Cash filters
  const resetCashFilters = () => {
    setCashPartyFilter("Customer");
    setCashTransactionFilter("All");
    setCashDateFilter("");
    setCashAmountFilter("");
  };

  // Reset Bank filters
  const resetBankFilters = () => {
    setBankPartyFilter("All");
    setBankTransactionFilter("All");
    setBankDateFilter("");
    setBankAmountFilter("");
  };

  // Get transactions for selected account
  const getAccountTransactions = () => {
    if (!selectedAccount) {
      return [];
    }

    let result = transactions.filter(
      (transaction) =>
        transaction.account === selectedAccount.name
    );

    // ============================
    // CASH FILTERS
    // ============================

    if (selectedAccount.name === "Cash") {
      result = result.filter(
        (transaction) =>
          transaction.partyType === "Customer"
      );

      if (cashTransactionFilter !== "All") {
        result = result.filter(
          (transaction) =>
            transaction.transactionType ===
            cashTransactionFilter
        );
      }

      if (cashDateFilter) {
        result = result.filter((transaction) =>
          transaction.date
            .toLowerCase()
            .includes(cashDateFilter.toLowerCase())
        );
      }

      if (cashAmountFilter) {
        result = result.filter(
          (transaction) =>
            transaction.debit >=
            Number(cashAmountFilter)
        );
      }
    }

    // ============================
    // BANK FILTERS
    // ============================

    if (selectedAccount.name === "Bank") {
      if (bankPartyFilter !== "All") {
        result = result.filter(
          (transaction) =>
            transaction.partyType === bankPartyFilter
        );
      }

      if (bankTransactionFilter !== "All") {
        result = result.filter(
          (transaction) =>
            transaction.transactionType ===
            bankTransactionFilter
        );
      }

      if (bankDateFilter) {
        result = result.filter((transaction) =>
          transaction.date
            .toLowerCase()
            .includes(bankDateFilter.toLowerCase())
        );
      }

      if (bankAmountFilter) {
        result = result.filter(
          (transaction) =>
            transaction.debit >=
            Number(bankAmountFilter)
        );
      }
    }

    return result;
  };

  const selectedTransactions =
    getAccountTransactions();

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
            onClick={() => setSelectedAccount(null)}
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
              CASH FILTERS
          ========================================= */}

          {selectedAccount.name === "Cash" && (

            <div className="mb-6 rounded-xl border border-[#d7cec4] bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-2">

                <Wallet
                  size={18}
                  className="text-[#49392f]"
                />

                <div>
                  <h3 className="font-semibold text-[#30251e]">
                    Cash Filters
                  </h3>

                  <p className="text-xs text-[#756b63]">
                    Cash transactions are available only for customers.
                  </p>
                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-4">

                {/* Party */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#30251e]">
                    Party
                  </label>

                  <select
                    value={cashPartyFilter}
                    onChange={(e) =>
                      setCashPartyFilter(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                  >
                    <option value="Customer">
                      Customer
                    </option>
                  </select>

                </div>

                {/* Transaction */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#30251e]">
                    Transaction
                  </label>

                  <select
                    value={cashTransactionFilter}
                    onChange={(e) =>
                      setCashTransactionFilter(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                  >

                    <option value="All">
                      All
                    </option>

                    <option value="Received">
                      Cash Received
                    </option>

                    <option value="Paid">
                      Cash Paid
                    </option>

                  </select>

                </div>

                {/* Date */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#30251e]">
                    Date
                  </label>

                  <input
                    type="text"
                    value={cashDateFilter}
                    onChange={(e) =>
                      setCashDateFilter(
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
                    value={cashAmountFilter}
                    onChange={(e) =>
                      setCashAmountFilter(
                        e.target.value
                      )
                    }
                    placeholder="₹ Amount"
                    className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                  />

                </div>

              </div>

              <button
                onClick={resetCashFilters}
                className="mt-4 rounded-lg border border-[#cfc5ba] px-4 py-2 text-sm font-medium text-[#49392f] transition hover:bg-[#eee8df]"
              >
                Reset Cash Filters
              </button>

            </div>

          )}

          {/* =========================================
              BANK FILTERS
          ========================================= */}

          {selectedAccount.name === "Bank" && (

            <div className="mb-6 rounded-xl border border-[#d7cec4] bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-2">

                <CreditCard
                  size={18}
                  className="text-[#49392f]"
                />

                <div>
                  <h3 className="font-semibold text-[#30251e]">
                    Bank Filters
                  </h3>

                  <p className="text-xs text-[#756b63]">
                    View customer and vendor bank transactions.
                  </p>
                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-4">

                {/* Party */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#30251e]">
                    Party
                  </label>

                  <select
                    value={bankPartyFilter}
                    onChange={(e) =>
                      setBankPartyFilter(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                  >

                    <option value="All">
                      All Parties
                    </option>

                    <option value="Customer">
                      Customer
                    </option>

                    <option value="Vendor">
                      Vendor
                    </option>

                  </select>

                </div>

                {/* Transaction */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#30251e]">
                    Transaction
                  </label>

                  <select
                    value={bankTransactionFilter}
                    onChange={(e) =>
                      setBankTransactionFilter(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                  >

                    <option value="All">
                      All
                    </option>

                    <option value="Received">
                      Money Received
                    </option>

                    <option value="Paid">
                      Money Paid
                    </option>

                  </select>

                </div>

                {/* Date */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#30251e]">
                    Date
                  </label>

                  <input
                    type="text"
                    value={bankDateFilter}
                    onChange={(e) =>
                      setBankDateFilter(
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
                    value={bankAmountFilter}
                    onChange={(e) =>
                      setBankAmountFilter(
                        e.target.value
                      )
                    }
                    placeholder="₹ Amount"
                    className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                  />

                </div>

              </div>

              <button
                onClick={resetBankFilters}
                className="mt-4 rounded-lg border border-[#cfc5ba] px-4 py-2 text-sm font-medium text-[#49392f] transition hover:bg-[#eee8df]"
              >
                Reset Bank Filters
              </button>

            </div>

          )}

          {/* =========================================
              SUMMARY
          ========================================= */}

          <div className="mb-6 grid gap-4 md:grid-cols-3">

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
                  No transactions found for the selected filters.
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

                          <td className="px-5 py-4 text-sm text-[#40352e]">
                            {transaction.date}
                          </td>

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

                          <td className="px-5 py-4 text-sm text-[#756b63]">
                            {transaction.description}
                          </td>

                          <td className="px-5 py-4">

                            <span className="rounded-full bg-[#ebe4da] px-3 py-1 text-xs text-[#49392f]">
                              {transaction.partyType}
                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-[#40352e]">

                              {transaction.transactionType ===
                              "Received" ? (
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

                          <td className="px-5 py-4 text-right text-sm font-medium text-[#30251e]">

                            {transaction.debit > 0
                              ? `₹${transaction.debit.toLocaleString(
                                  "en-IN"
                                )}`
                              : "-"}

                          </td>

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
              onClick={() => {

                setSelectedAccount(account);

                // Cash always starts with Customer
                if (account.name === "Cash") {
                  resetCashFilters();
                }

                // Bank starts with All Parties
                if (account.name === "Bank") {
                  resetBankFilters();
                }

              }}
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
                onClick={() => setShowForm(false)}
                className="text-[#756b63] transition hover:text-[#30251e]"
              >
                <X size={24} />
              </button>

            </div>

            <div className="space-y-6 px-7 py-7">

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