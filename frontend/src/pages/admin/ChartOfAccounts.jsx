import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Archive,
  ArrowLeft,
  X,
  ChevronDown,
} from "lucide-react";
import api from "../../services/api";

function ChartOfAccounts() {
  // =========================
  // ACCOUNT TYPES
  // =========================

  const accountTypes = [
    {
      heading: "Balance Sheet",
      options: [
        "Asset",
        "Liability",
        "Bank",
        "Capital",
        "Cash",
      ],
    },
    {
      heading: "Profit and Loss",
      options: [
        "Income",
        "Expenses",
        "Other Expenses",
      ],
    },
  ];

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [error, setError] = useState("");

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounts?limit=200");
      // Backend returns { items: [...] }
      setAccounts(res.data.items || []);
    } catch {
      // Error toasted by api.js interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // =========================
  // ADD NEW ACCOUNT
  // =========================

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setError("");

    if (!accountName.trim()) {
      setError("Please enter account name.");
      return;
    }

    if (!accountType) {
      setError("Please select account type.");
      return;
    }

    // Map UI type to Backend AccountType & AccountGroup
    const typeMapping = {
      Asset: { type: "ASSET", group: "BALANCE_SHEET" },
      Liability: { type: "LIABILITY", group: "BALANCE_SHEET" },
      Bank: { type: "BANK", group: "BALANCE_SHEET" },
      Capital: { type: "CAPITAL", group: "BALANCE_SHEET" },
      Cash: { type: "CASH", group: "BALANCE_SHEET" },
      Income: { type: "INCOME", group: "PROFIT_AND_LOSS" },
      Expenses: { type: "EXPENSE", group: "PROFIT_AND_LOSS" },
      "Other Expenses": { type: "OTHER_EXPENSE", group: "PROFIT_AND_LOSS" },
    };

    const mapped = typeMapping[accountType] || { type: "ASSET", group: "BALANCE_SHEET" };
    const code = accountCode.trim() || `ACC${Date.now().toString().slice(-4)}`;

    try {
      await api.post("/accounts", {
        code,
        name: accountName.trim(),
        type: mapped.type,
        group: mapped.group,
      });

      setAccountCode("");
      setAccountName("");
      setAccountType("");
      setShowModal(false);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account.");
    }
  };

  // =========================
  // ARCHIVE ACCOUNT
  // =========================

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this account?")) return;
    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to archive account.");
    }
  };

  // =========================
  // FILTER ACCOUNTS
  // =========================

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      account.type
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesArchive = showArchived
      ? account.status === "Archived"
      : account.status === "Active";

    return matchesSearch && matchesArchive;
  });

  const archivedCount = accounts.filter(
    (account) => account.status === "Archived"
  ).length;

  // =========================
  // TYPE BADGE CLASS
  // =========================

  const getTypeClass = (type) => {
    switch (type) {
      case "Asset":
        return "asset";

      case "Liability":
        return "liability";

      case "Bank":
        return "bank";

      case "Capital":
        return "capital";

      case "Cash":
        return "cash";

      case "Income":
        return "income";

      case "Expenses":
        return "expenses";

      case "Other Expenses":
        return "other-expenses";

      default:
        return "";
    }
  };

  return (
    <div className="chart-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Account</span>
            <span>/</span>
            <strong>Chart of Accounts</strong>
          </div>

          <h1>Chart of Accounts</h1>
        </div>
      </div>

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="toolbar">

        <button
          className="new-btn"
          onClick={() => {
            setError("");
            setAccountName("");
            setAccountType("");
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          New
        </button>

        <button
          className={`archive-btn ${
            showArchived ? "active-archive" : ""
          }`}
          onClick={() => setShowArchived(!showArchived)}
        >
          <Archive size={18} />
          Archived ({archivedCount})
        </button>

        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-spacer" />

        <button className="back-btn">
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* =========================
          ACCOUNT TABLE
      ========================= */}

      <div className="account-table">

        <div className="table-header">
          <div>ACCOUNT NAME</div>
          <div>TYPE</div>
          <div>ACTION</div>
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="empty-state">
            No accounts found.
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <div
              className="table-row"
              key={account.id}
            >
              <div className="account-name">
                <span className="bullet"></span>

                <strong>{account.name}</strong>
              </div>

              <div>
                <span
                  className={`type-badge ${getTypeClass(
                    account.type
                  )}`}
                >
                  {account.type}
                </span>
              </div>

              <div className="action-cell">
                {account.status === "Active" && (
                  <button
                    className="archive-action"
                    onClick={() =>
                      handleArchive(account.id)
                    }
                  >
                    <Archive size={17} />
                    Archive
                  </button>
                )}

                {account.status === "Archived" && (
                  <span className="archived-text">
                    Archived
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* =========================
          NEW ACCOUNT MODAL
      ========================= */}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="new-account-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="modal-header">
              <div>
                <h2>New Account</h2>
                <p>
                  Create a new account for your chart of
                  accounts.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={21} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleAddAccount}>

              {/* ACCOUNT NAME */}

              <div className="form-group">
                <label>
                  Account Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter account name"
                  value={accountName}
                  onChange={(e) =>
                    setAccountName(e.target.value)
                  }
                />
              </div>

              {/* ACCOUNT TYPE */}

              <div className="form-group">
                <label>
                  Type
                  <span>*</span>
                </label>

                <div className="select-wrapper">
                  <select
                    value={accountType}
                    onChange={(e) =>
                      setAccountType(e.target.value)
                    }
                  >
                    <option value="">
                      Select account type
                    </option>

                    {/* BALANCE SHEET */}

                    <optgroup label="Balance Sheet">
                      <option value="Asset">
                        Asset
                      </option>

                      <option value="Liability">
                        Liability
                      </option>

                      <option value="Bank">
                        Bank
                      </option>

                      <option value="Capital">
                        Capital
                      </option>

                      <option value="Cash">
                        Cash
                      </option>
                    </optgroup>

                    {/* PROFIT AND LOSS */}

                    <optgroup label="Profit and Loss">
                      <option value="Income">
                        Income
                      </option>

                      <option value="Expenses">
                        Expenses
                      </option>

                      <option value="Other Expenses">
                        Other Expenses
                      </option>
                    </optgroup>
                  </select>

                  <ChevronDown
                    size={18}
                    className="select-icon"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="type-description">

                {accountType === "Asset" && (
                  <>
                    <strong>Asset</strong>
                    <p>
                      Accounts representing things owned by
                      the business.
                    </p>
                  </>
                )}

                {accountType === "Liability" && (
                  <>
                    <strong>Liability</strong>
                    <p>
                      Accounts representing amounts owed by
                      the business.
                    </p>
                  </>
                )}

                {accountType === "Bank" && (
                  <>
                    <strong>Bank</strong>
                    <p>
                      Accounts used for bank-related
                      transactions.
                    </p>
                  </>
                )}

                {accountType === "Capital" && (
                  <>
                    <strong>Capital</strong>
                    <p>
                      Accounts representing owner's capital
                      or investment.
                    </p>
                  </>
                )}

                {accountType === "Cash" && (
                  <>
                    <strong>Cash</strong>
                    <p>
                      Accounts used for cash transactions.
                    </p>
                  </>
                )}

                {accountType === "Income" && (
                  <>
                    <strong>Income</strong>
                    <p>
                      Accounts used to record business
                      income and revenue.
                    </p>
                  </>
                )}

                {accountType === "Expenses" && (
                  <>
                    <strong>Expenses</strong>
                    <p>
                      Accounts used to record normal business
                      expenses.
                    </p>
                  </>
                )}

                {accountType === "Other Expenses" && (
                  <>
                    <strong>Other Expenses</strong>
                    <p>
                      Accounts used for other expenses that
                      are not regular operating expenses.
                    </p>
                  </>
                )}
              </div>

              {/* ERROR */}

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              {/* BUTTONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  Create Account
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================
          STYLES
      ========================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .chart-page {
          min-height: 100vh;
          background: #f8f7f3;
          padding: 40px;
          color: #111;
        }

        .page-header {
          border-bottom: 1px solid #ddd8cf;
          padding-bottom: 25px;
        }

        .breadcrumb {
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 16px;
          color: #777;
          margin-bottom: 8px;
        }

        .breadcrumb strong {
          color: #111;
          font-weight: 500;
        }

        .page-header h1 {
          font-size: 36px;
          margin: 0;
          font-weight: 700;
        }

        /* TOOLBAR */

        .toolbar {
          margin-top: 30px;
          background: white;
          border: 1px solid #e3ded5;
          border-radius: 20px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }

        button {
          font-family: inherit;
        }

        .new-btn {
          height: 52px;
          padding: 0 25px;
          border: none;
          border-radius: 10px;
          background: #342820;
          color: white;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .new-btn:hover {
          background: #241b16;
        }

        .archive-btn,
        .back-btn {
          height: 52px;
          padding: 0 22px;
          border: 1px solid #e1dbd2;
          background: white;
          border-radius: 10px;
          font-size: 16px;
          color: #302820;
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
        }

        .active-archive {
          background: #342820;
          color: white;
        }

        .search-box {
          height: 52px;
          width: 380px;
          border: 1px solid #d8d0c5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 15px;
          color: #777;
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 16px;
        }

        .toolbar-spacer {
          flex: 1;
        }

        /* TABLE */

        .account-table {
          margin-top: 30px;
          background: white;
          border: 1px solid #e3ded5;
          border-radius: 20px;
          overflow: hidden;
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 1.3fr 1fr 180px;
          align-items: center;
        }

        .table-header {
          padding: 20px 30px;
          background: #faf9f6;
          color: #666;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e4ded5;
        }

        .table-row {
          padding: 20px 30px;
          min-height: 70px;
          border-bottom: 1px solid #eee9e1;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .account-name {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 16px;
        }

        .bullet {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #bcb6af;
        }

        .type-badge {
          display: inline-flex;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
          border: 1px solid;
        }

        .asset {
          background: #eef5e9;
          border-color: #cfdec6;
          color: #4b693d;
        }

        .liability {
          background: #fff0ed;
          border-color: #efcbc4;
          color: #a54d3e;
        }

        .bank {
          background: #edf5f9;
          border-color: #c9e0eb;
          color: #36718c;
        }

        .capital {
          background: #f3eef9;
          border-color: #ddd0eb;
          color: #76558d;
        }

        .cash {
          background: #eaf6f1;
          border-color: #cce5da;
          color: #3d7a65;
        }

        .income {
          background: #e9f5f1;
          border-color: #c9e2d9;
          color: #3b7964;
        }

        .expenses,
        .other-expenses {
          background: #fff1e7;
          border-color: #efd5c0;
          color: #a15d35;
        }

        .action-cell {
          display: flex;
          justify-content: flex-start;
        }

        .archive-action {
          border: none;
          background: transparent;
          color: #756d65;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          cursor: pointer;
        }

        .archive-action:hover {
          color: #342820;
        }

        .archived-text {
          color: #999;
          font-size: 14px;
        }

        .empty-state {
          padding: 50px;
          text-align: center;
          color: #777;
        }

        /* MODAL */

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .new-account-modal {
          width: 100%;
          max-width: 570px;
          background: white;
          border-radius: 18px;
          padding: 30px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 22px;
          border-bottom: 1px solid #e6e0d7;
          margin-bottom: 25px;
        }

        .modal-header h2 {
          margin: 0 0 6px;
          font-size: 26px;
        }

        .modal-header p {
          margin: 0;
          color: #777;
          font-size: 14px;
        }

        .close-btn {
          border: none;
          background: #f5f3ef;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* FORM */

        .form-group {
          margin-bottom: 22px;
        }

        .form-group label {
          display: block;
          margin-bottom: 9px;
          font-size: 15px;
          font-weight: 600;
        }

        .form-group label span {
          color: #c34d3d;
          margin-left: 4px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          height: 50px;
          border: 1px solid #d8d0c5;
          border-radius: 9px;
          padding: 0 14px;
          font-size: 15px;
          outline: none;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #342820;
        }

        .select-wrapper {
          position: relative;
        }

        .select-wrapper select {
          appearance: none;
          padding-right: 45px;
          cursor: pointer;
        }

        .select-icon {
          position: absolute;
          right: 15px;
          top: 16px;
          pointer-events: none;
          color: #777;
        }

        /*
          Dropdown headings:
          Balance Sheet
          Profit and Loss

          These are optgroup labels and cannot be selected.
        */

        .type-description {
          min-height: 65px;
          background: #faf8f4;
          border: 1px solid #e8e1d8;
          border-radius: 10px;
          padding: 12px 15px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #555;
        }

        .type-description:empty {
          display: none;
        }

        .type-description strong {
          color: #342820;
          display: block;
          margin-bottom: 4px;
        }

        .type-description p {
          margin: 0;
          line-height: 1.4;
        }

        .form-error {
          color: #b44234;
          background: #fff1ee;
          border: 1px solid #efcbc4;
          padding: 10px 13px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 18px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 10px;
        }

        .cancel-btn,
        .save-btn {
          height: 46px;
          padding: 0 22px;
          border-radius: 9px;
          font-size: 15px;
          cursor: pointer;
        }

        .cancel-btn {
          background: white;
          border: 1px solid #d8d0c5;
          color: #342820;
        }

        .save-btn {
          background: #342820;
          border: 1px solid #342820;
          color: white;
        }

        .save-btn:hover {
          background: #241b16;
        }

        @media (max-width: 900px) {

          .chart-page {
            padding: 20px;
          }

          .toolbar {
            flex-wrap: wrap;
          }

          .search-box {
            width: 100%;
          }

          .toolbar-spacer {
            display: none;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }

          .table-header div:last-child,
          .table-row .action-cell {
            grid-column: 1 / -1;
          }
        }

      `}</style>
    </div>
  );
}

export default ChartOfAccounts;