import { useState } from "react";
import { Plus, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Journal() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);

  const [journalName, setJournalName] = useState("");
  const [journalType, setJournalType] = useState("");
  const [defaultAccount, setDefaultAccount] = useState("");

  // -----------------------------------------
  // JOURNALS
  // -----------------------------------------

  const [journals, setJournals] = useState([
    {
      name: "Sales",
      type: "Sales",
      defaultAccount: "Sales Income A/c",
    },
    {
      name: "Purchase",
      type: "Purchase",
      defaultAccount: "Purchase Expense A/c",
    },
    {
      name: "Bank",
      type: "Bank",
      defaultAccount: "Bank A/c",
    },
    {
      name: "Cash",
      type: "Cash",
      defaultAccount: "Cash A/c",
    },
  ]);

  // -----------------------------------------
  // CHART OF ACCOUNTS
  // -----------------------------------------

  const accounts = [
    {
      name: "Cash",
      type: "Asset",
      displayName: "Cash A/c",
    },
    {
      name: "Bank",
      type: "Asset",
      displayName: "Bank A/c",
    },
    {
      name: "Debtors",
      type: "Asset",
      displayName: "Debtors A/c",
    },
    {
      name: "Creditors",
      type: "Liability",
      displayName: "Creditors A/c",
    },
    {
      name: "Sales Income",
      type: "Income",
      displayName: "Sales Income A/c",
    },
    {
      name: "Purchase Expense",
      type: "Expense",
      displayName: "Purchase Expense A/c",
    },
  ];

  // -----------------------------------------
  // JOURNAL TYPES
  // -----------------------------------------

  const journalTypes = [
    "Sales",
    "Purchase",
    "Bank",
    "Cash",
  ];

  // -----------------------------------------
  // DEFAULT ACCOUNT OPTIONS
  // -----------------------------------------

  const getDefaultAccounts = (type) => {
    switch (type) {
      case "Sales":
        return accounts.filter(
          (account) => account.name === "Sales Income"
        );

      case "Purchase":
        return accounts.filter(
          (account) => account.name === "Purchase Expense"
        );

      case "Bank":
        return accounts.filter(
          (account) => account.name === "Bank"
        );

      case "Cash":
        return accounts.filter(
          (account) => account.name === "Cash"
        );

      default:
        return [];
    }
  };

  // -----------------------------------------
  // JOURNAL TYPE CHANGE
  // -----------------------------------------

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;

    setJournalType(selectedType);

    // Reset account whenever journal type changes
    setDefaultAccount("");

    // Automatically select the default account
    // when there is only one valid account.
    const availableAccounts =
      getDefaultAccounts(selectedType);

    if (availableAccounts.length === 1) {
      setDefaultAccount(
        availableAccounts[0].displayName
      );
    }
  };

  // -----------------------------------------
  // CREATE JOURNAL
  // -----------------------------------------

  const handleCreateJournal = () => {
    if (!journalName.trim()) {
      alert("Please enter Journal Name.");
      return;
    }

    if (!journalType) {
      alert("Please select Journal Type.");
      return;
    }

    if (!defaultAccount) {
      alert("Please select Default Account.");
      return;
    }

    // Prevent duplicate journal names
    const alreadyExists = journals.some(
      (journal) =>
        journal.name.toLowerCase() ===
        journalName.trim().toLowerCase()
    );

    if (alreadyExists) {
      alert("A journal with this name already exists.");
      return;
    }

    const newJournal = {
      name: journalName.trim(),
      type: journalType,
      defaultAccount: defaultAccount,
    };

    setJournals((previousJournals) => [
      ...previousJournals,
      newJournal,
    ]);

    // Reset form
    setJournalName("");
    setJournalType("");
    setDefaultAccount("");

    setShowForm(false);
  };

  // -----------------------------------------
  // CLOSE FORM
  // -----------------------------------------

  const handleCloseForm = () => {
    setShowForm(false);

    setJournalName("");
    setJournalType("");
    setDefaultAccount("");
  };

  // -----------------------------------------
  // BACK
  // -----------------------------------------

  const handleBack = () => {
    navigate(-1);
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="min-h-screen bg-[#f4f1eb] p-6 md:p-8">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-semibold text-[#30251e]">
            Journals
          </h1>

          <p className="mt-1 text-sm text-[#756b63]">
            Manage your accounting journals.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* NEW */}

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-[#49392f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5b483b]"
          >
            <Plus size={18} />
            New
          </button>

          {/* BACK */}

          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg border border-[#cfc5ba] bg-white px-5 py-3 text-sm font-medium text-[#40352e] transition hover:bg-[#eee8df]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

        </div>

      </div>

      {/* =====================================
          JOURNAL TABLE
      ===================================== */}

      <div className="overflow-hidden rounded-xl border border-[#d7cec4] bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="grid grid-cols-3 border-b border-[#d7cec4] bg-[#ebe4da] px-6 py-4 text-sm font-semibold text-[#49392f]">

          <div>
            Journal Name
          </div>

          <div>
            Type
          </div>

          <div>
            Default Account
          </div>

        </div>

        {/* TABLE ROWS */}

        {journals.map((journal, index) => (

          <div
            key={index}
            className="grid grid-cols-3 border-b border-[#e2dbd3] px-6 py-4 text-sm last:border-b-0 hover:bg-[#faf8f5]"
          >

            <div className="font-medium text-[#d84c79]">
              {journal.name}
            </div>

            <div className="text-[#d84c79]">
              {journal.type}
            </div>

            <div className="text-[#d84c79]">
              {journal.defaultAccount}
            </div>

          </div>

        ))}

      </div>

      {/* =====================================
          NEW JOURNAL MODAL
      ===================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-xl rounded-2xl bg-[#faf8f5] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-[#ddd4ca] px-7 py-6">

              <div>

                <h2 className="text-2xl font-semibold text-[#30251e]">
                  New Journal
                </h2>

                <p className="mt-1 text-sm text-[#756b63]">
                  Create a new accounting journal.
                </p>

              </div>

              <button
                onClick={handleCloseForm}
                className="text-[#756b63] transition hover:text-[#30251e]"
              >
                <X size={24} />
              </button>

            </div>

            {/* =================================
                FORM
            ================================= */}

            <div className="space-y-6 px-7 py-7">

              {/* JOURNAL NAME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#30251e]">
                  Journal Name
                </label>

                <input
                  type="text"
                  value={journalName}
                  onChange={(e) =>
                    setJournalName(e.target.value)
                  }
                  placeholder="Enter journal name"
                  className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                />

              </div>

              {/* JOURNAL TYPE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#30251e]">
                  Journal Type
                </label>

                <select
                  value={journalType}
                  onChange={handleTypeChange}
                  className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                >

                  <option value="">
                    Select Journal Type
                  </option>

                  {journalTypes.map((type) => (

                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>

                  ))}

                </select>

              </div>

              {/* DEFAULT ACCOUNT */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#30251e]">
                  Default Account
                </label>

                <select
                  value={defaultAccount}
                  onChange={(e) =>
                    setDefaultAccount(e.target.value)
                  }
                  disabled={!journalType}
                  className="w-full rounded-lg border border-[#d6ccc1] bg-white px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#eeeae5] focus:border-[#49392f] focus:ring-1 focus:ring-[#49392f]"
                >

                  <option value="">
                    {journalType
                      ? "Select Default Account"
                      : "Select Journal Type First"}
                  </option>

                  {getDefaultAccounts(
                    journalType
                  ).map((account) => (

                    <option
                      key={account.name}
                      value={account.displayName}
                    >
                      {account.displayName}
                    </option>

                  ))}

                </select>

              </div>

            </div>

            {/* =================================
                MODAL FOOTER
            ================================= */}

            <div className="flex justify-end gap-3 border-t border-[#ddd4ca] px-7 py-5">

              <button
                onClick={handleCloseForm}
                className="rounded-lg border border-[#cfc5ba] px-5 py-2.5 text-sm font-medium text-[#49392f] transition hover:bg-[#eee8df]"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateJournal}
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

export default Journal;