import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit3,
  Check,
  X,
  Eye,
  BarChart3,
  PieChart,
  LayoutGrid,
  List,
  CalendarDays,
  User,
  Wallet,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialBudgets = [
  {
    id: 1,
    name: "January 2026",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    responsible: "Admin",
    status: "Confirmed",
    revised: false,
    originalBudget: null,
    rows: [
      {
        analytic: "Furniture",
        type: "Expense",
        committed: 200000,
        achieved: 10000,
      },
      {
        analytic: "Marketing",
        type: "Expense",
        committed: 100000,
        achieved: 25000,
      },
    ],
  },
  {
    id: 2,
    name: "February 2026",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    responsible: "Admin",
    status: "Draft",
    revised: false,
    originalBudget: null,
    rows: [
      {
        analytic: "Furniture",
        type: "Expense",
        committed: 150000,
        achieved: 30000,
      },
    ],
  },
];

const emptyRow = {
  analytic: "Furniture",
  type: "Expense",
  committed: "",
  achieved: "",
};

function Budgets() {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState(initialBudgets);
  const [view, setView] = useState("list");

  const [mode, setMode] = useState("report");
  const [selectedBudget, setSelectedBudget] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    responsible: "",
    rows: [{ ...emptyRow }],
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [budgetToCancel, setBudgetToCancel] = useState(null);

  /* =========================================================
     HELPERS
  ========================================================= */

  const calculatePercentage = (committed, achieved) => {
    if (!committed || Number(committed) === 0) return 0;

    return Math.round(
      (Number(achieved || 0) / Number(committed)) * 100
    );
  };

  const calculateBudget = (budget) => {
    const committed = budget.rows.reduce(
      (sum, row) => sum + Number(row.committed || 0),
      0
    );

    const achieved = budget.rows.reduce(
      (sum, row) => sum + Number(row.achieved || 0),
      0
    );

    const balance = committed - achieved;

    const percentage =
      committed > 0 ? Math.round((achieved / committed) * 100) : 0;

    return {
      committed,
      achieved,
      balance,
      percentage,
    };
  };

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const value = search.toLowerCase();

      return (
        budget.name.toLowerCase().includes(value) ||
        budget.responsible.toLowerCase().includes(value) ||
        budget.status.toLowerCase().includes(value)
      );
    });
  }, [budgets, search]);

  /* =========================================================
     FORM HANDLERS
  ========================================================= */

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRowChange = (index, field, value) => {
    setForm((prev) => {
      const rows = [...prev.rows];

      rows[index] = {
        ...rows[index],
        [field]: value,
      };

      return {
        ...prev,
        rows,
      };
    });
  };

  const addBudgetRow = () => {
    setForm((prev) => ({
      ...prev,
      rows: [...prev.rows, { ...emptyRow }],
    }));
  };

  const removeBudgetRow = (index) => {
    if (form.rows.length === 1) return;

    setForm((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }));
  };

  /* =========================================================
     NEW BUDGET
  ========================================================= */

  const openNewBudget = () => {
    setForm({
      name: "",
      startDate: "",
      endDate: "",
      responsible: "",
      rows: [{ ...emptyRow }],
    });

    setMode("new");
    setSelectedBudget(null);
  };

  const createBudget = (status = "Draft") => {
    if (!form.name || !form.startDate || !form.endDate) {
      alert("Please enter Budget Name, Start Date and End Date.");
      return;
    }

    const newBudget = {
      id: Date.now(),
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      responsible: form.responsible || "Admin",
      status,
      revised: false,
      originalBudget: null,
      rows: form.rows.map((row) => ({
        ...row,
        committed: Number(row.committed || 0),
        achieved: Number(row.achieved || 0),
      })),
    };

    setBudgets((prev) => [newBudget, ...prev]);

    setSelectedBudget(newBudget);
    setMode("detail");
  };

  /* =========================================================
     CONFIRM
  ========================================================= */

  const confirmBudget = (budget) => {
    const updated = {
      ...budget,
      status: "Confirmed",
    };

    setBudgets((prev) =>
      prev.map((item) =>
        item.id === budget.id ? updated : item
      )
    );

    setSelectedBudget(updated);
  };

  /* =========================================================
     REVISE
  ========================================================= */

  const reviseBudget = (budget) => {
    setForm({
      name: budget.name,
      startDate: budget.startDate,
      endDate: budget.endDate,
      responsible: budget.responsible,
      rows: budget.rows.map((row) => ({ ...row })),
    });

    setSelectedBudget(budget);
    setMode("revise");
  };

  const saveRevision = () => {
    if (!selectedBudget) return;

    const revisedBudget = {
      ...selectedBudget,
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      responsible: form.responsible,
      revised: true,
      originalBudget: selectedBudget.id,
      status: "Confirmed",
      rows: form.rows.map((row) => ({
        ...row,
        committed: Number(row.committed || 0),
        achieved: Number(row.achieved || 0),
      })),
    };

    setBudgets((prev) =>
      prev.map((item) =>
        item.id === selectedBudget.id ? revisedBudget : item
      )
    );

    setSelectedBudget(revisedBudget);
    setMode("detail");
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const openCancel = (budget) => {
    setBudgetToCancel(budget);
    setShowCancelModal(true);
  };

  const cancelBudget = () => {
    if (!budgetToCancel) return;

    setBudgets((prev) =>
      prev.map((item) =>
        item.id === budgetToCancel.id
          ? { ...item, status: "Cancelled" }
          : item
      )
    );

    setShowCancelModal(false);
    setBudgetToCancel(null);
  };

  /* =========================================================
     OPEN DETAIL
  ========================================================= */

  const openBudget = (budget) => {
    setSelectedBudget(budget);
    setMode("detail");
  };

  const goBack = () => {
    setSelectedBudget(null);
    setMode("report");
  };

  /* =========================================================
     COMMON HEADER
  ========================================================= */

  const PageHeader = () => (
    <div className="mb-7">
      <div className="text-sm text-gray-500 mb-2">
        Finance <span className="mx-2">/</span> Budgets
      </div>

      <div className="flex items-center justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Budgets
          </h1>

          <p className="text-gray-500 mt-1">
            Create, revise and monitor your budgets
          </p>
        </div>

        <button
          onClick={openNewBudget}
          className="flex items-center gap-2 bg-[#33261f] text-white px-5 py-3 rounded-lg hover:opacity-90"
        >
          <Plus size={18} />
          New
        </button>
      </div>
    </div>
  );

  /* =========================================================
     NEW / REVISE FORM
  ========================================================= */

  if (mode === "new" || mode === "revise") {
    return (
      <div className="p-8">
        <div className="mb-7">
          <div className="text-sm text-gray-500 mb-2">
            Finance <span className="mx-2">/</span> Budgets
            <span className="mx-2">/</span>
            {mode === "new" ? "New Budget" : "Revise Budget"}
          </div>

          <div className="flex items-center justify-between border-b pb-5">
            <div>
              <h1 className="text-3xl font-semibold">
                {mode === "new"
                  ? "New Budget"
                  : "Revise Budget"}
              </h1>

              <p className="text-gray-500 mt-1">
                {mode === "new"
                  ? "Create a new budget"
                  : "Revise the selected budget"}
              </p>
            </div>

            <button
              onClick={() => setMode("report")}
              className="flex items-center gap-2 border px-5 py-3 rounded-lg"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>

        {/* TOP FORM */}

        <div className="bg-white border rounded-2xl p-7 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Budget Name
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  handleFormChange("name", e.target.value)
                }
                placeholder="January 2026"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Responsible
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <input
                  value={form.responsible}
                  onChange={(e) =>
                    handleFormChange(
                      "responsible",
                      e.target.value
                    )
                  }
                  placeholder="Admin"
                  className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Start Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    handleFormChange(
                      "startDate",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg pl-10 pr-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                End Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    handleFormChange(
                      "endDate",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg pl-10 pr-4 py-3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BUDGET LINES */}

        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">
                Budget Lines
              </h2>

              <p className="text-sm text-gray-500">
                Select analytic account and define the budget.
              </p>
            </div>

            <button
              onClick={addBudgetRow}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg"
            >
              <Plus size={17} />
              Add Line
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#faf8f5]">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-5 py-4">Analytic Account</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">
                    Committed Amount
                  </th>
                  <th className="px-5 py-4">
                    Achieved Amount
                  </th>
                  <th className="px-5 py-4">Achieved %</th>
                  <th className="px-5 py-4">Amount to Achieve</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {form.rows.map((row, index) => {
                  const percentage = calculatePercentage(
                    row.committed,
                    row.achieved
                  );

                  const remaining =
                    Number(row.committed || 0) -
                    Number(row.achieved || 0);

                  return (
                    <tr
                      key={index}
                      className="border-t"
                    >
                      <td className="px-5 py-4">
                        <select
                          value={row.analytic}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "analytic",
                              e.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-full"
                        >
                          <option>Furniture</option>
                          <option>Marketing</option>
                          <option>Sales</option>
                          <option>Operations</option>
                          <option>Administration</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={row.type}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "type",
                              e.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2"
                        >
                          <option>Expense</option>
                          <option>Income</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="number"
                          value={row.committed}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "committed",
                              e.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-36"
                          placeholder="200000"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="number"
                          value={row.achieved}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "achieved",
                              e.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-36"
                          placeholder="10000"
                        />
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {percentage}%
                      </td>

                      <td className="px-5 py-4 font-medium">
                        ₹{remaining.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            removeBudgetRow(index)
                          }
                          className="text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-5 border-t flex justify-end gap-3">
            <button
              onClick={() => setMode("report")}
              className="px-5 py-3 border rounded-lg"
            >
              Cancel
            </button>

            {mode === "new" ? (
              <>
                <button
                  onClick={() => createBudget("Draft")}
                  className="px-5 py-3 border rounded-lg"
                >
                  Save Draft
                </button>

                <button
                  onClick={() => createBudget("Confirmed")}
                  className="px-5 py-3 bg-[#33261f] text-white rounded-lg flex items-center gap-2"
                >
                  <Check size={18} />
                  Confirm
                </button>
              </>
            ) : (
              <button
                onClick={saveRevision}
                className="px-5 py-3 bg-[#33261f] text-white rounded-lg flex items-center gap-2"
              >
                <Check size={18} />
                Save Revision
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     BUDGET DETAIL
  ========================================================= */

  if (mode === "detail" && selectedBudget) {
    const totals = calculateBudget(selectedBudget);

    return (
      <div className="p-8">
        <div className="mb-7">
          <div className="text-sm text-gray-500 mb-2">
            Finance
            <span className="mx-2">/</span>
            Budgets
            <span className="mx-2">/</span>
            {selectedBudget.name}
          </div>

          <div className="flex justify-between items-center border-b pb-5">
            <div>
              <h1 className="text-3xl font-semibold">
                {selectedBudget.name}
              </h1>

              <p className="text-gray-500 mt-1">
                Budget Report
              </p>
            </div>

            <div className="flex gap-3">
              {selectedBudget.status !== "Confirmed" &&
                selectedBudget.status !== "Cancelled" && (
                  <button
                    onClick={() =>
                      confirmBudget(selectedBudget)
                    }
                    className="flex items-center gap-2 bg-[#33261f] text-white px-5 py-3 rounded-lg"
                  >
                    <Check size={18} />
                    Confirm
                  </button>
                )}

              {selectedBudget.status === "Confirmed" && (
                <button
                  onClick={() =>
                    reviseBudget(selectedBudget)
                  }
                  className="flex items-center gap-2 border px-5 py-3 rounded-lg"
                >
                  <Edit3 size={18} />
                  Revise
                </button>
              )}

              {selectedBudget.status !== "Cancelled" && (
                <button
                  onClick={() =>
                    openCancel(selectedBudget)
                  }
                  className="flex items-center gap-2 border border-red-200 text-red-600 px-5 py-3 rounded-lg"
                >
                  <X size={18} />
                  Cancel
                </button>
              )}

              <button
                onClick={goBack}
                className="flex items-center gap-2 border px-5 py-3 rounded-lg"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* INFORMATION */}

        <div className="bg-white border rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">
                Budget Name
              </p>

              <p className="font-semibold mt-2">
                {selectedBudget.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Budget Period
              </p>

              <p className="font-semibold mt-2">
                {selectedBudget.startDate} →{" "}
                {selectedBudget.endDate}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Responsible
              </p>

              <p className="font-semibold mt-2">
                {selectedBudget.responsible}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                  selectedBudget.status === "Confirmed"
                    ? "bg-green-100 text-green-700"
                    : selectedBudget.status ===
                      "Cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {selectedBudget.status}
              </span>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-4 gap-5 mb-6">
          <SummaryCard
            title="Committed Amount"
            value={totals.committed}
            icon={<Wallet size={20} />}
          />

          <SummaryCard
            title="Achieved Amount"
            value={totals.achieved}
            icon={<TrendingUp size={20} />}
          />

          <SummaryCard
            title="Balance"
            value={totals.balance}
            icon={<TrendingDown size={20} />}
          />

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">
              Achieved %
            </p>

            <p className="text-3xl font-semibold mt-3">
              {totals.percentage}%
            </p>

            <div className="w-full h-2 bg-gray-100 rounded-full mt-4">
              <div
                className="h-2 bg-[#33261f] rounded-full"
                style={{
                  width: `${Math.min(
                    totals.percentage,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ANALYTIC TABLE */}

        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="font-semibold text-lg">
              Budget Analysis
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Detailed budget performance by analytic account.
            </p>
          </div>

          <table className="w-full">
            <thead className="bg-[#faf8f5]">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-6 py-4">
                  Analytic Account
                </th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">
                  Committed Amount
                </th>
                <th className="px-6 py-4">
                  Achieved Amount
                </th>
                <th className="px-6 py-4">
                  Achieved %
                </th>
                <th className="px-6 py-4">
                  Amount To Achieve
                </th>
              </tr>
            </thead>

            <tbody>
              {selectedBudget.rows.map((row, index) => {
                const percentage = calculatePercentage(
                  row.committed,
                  row.achieved
                );

                const remaining =
                  Number(row.committed) -
                  Number(row.achieved);

                return (
                  <tr
                    key={index}
                    className="border-t"
                  >
                    <td className="px-6 py-5 font-medium">
                      {row.analytic}
                    </td>

                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm">
                        {row.type}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      ₹
                      {Number(
                        row.committed
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-5">
                      ₹
                      {Number(
                        row.achieved
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-5 font-medium">
                      {percentage}%
                    </td>

                    <td className="px-6 py-5 font-medium">
                      ₹
                      {remaining.toLocaleString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {showCancelModal && (
          <CancelModal
            onCancel={() => {
              setShowCancelModal(false);
              setBudgetToCancel(null);
            }}
            onConfirm={cancelBudget}
          />
        )}
      </div>
    );
  }

  /* =========================================================
     BUDGET REPORT
  ========================================================= */

  return (
    <div className="p-8">
      <PageHeader />

      {/* TOOLBAR */}

      <div className="bg-white border rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={openNewBudget}
            className="flex items-center gap-2 bg-[#33261f] text-white px-5 py-3 rounded-lg"
          >
            <Plus size={18} />
            New
          </button>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search budgets..."
              className="border rounded-lg pl-10 pr-4 py-3 w-72 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 border rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded ${
              view === "list"
                ? "bg-[#33261f] text-white"
                : ""
            }`}
            title="List View"
          >
            <List size={18} />
          </button>

          <button
            onClick={() => setView("kanban")}
            className={`p-2 rounded ${
              view === "kanban"
                ? "bg-[#33261f] text-white"
                : ""
            }`}
            title="Kanban View"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* LIST VIEW */}

      {view === "list" && (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#faf8f5]">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-6 py-4">
                  Budget Name
                </th>

                <th className="px-6 py-4">
                  Start Date
                </th>

                <th className="px-6 py-4">
                  End Date
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Achieved %
                </th>

                <th className="px-6 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBudgets.map((budget) => {
                const totals =
                  calculateBudget(budget);

                return (
                  <tr
                    key={budget.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-6 py-5 font-semibold">
                      {budget.name}
                    </td>

                    <td className="px-6 py-5">
                      {budget.startDate}
                    </td>

                    <td className="px-6 py-5">
                      {budget.endDate}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge
                        status={budget.status}
                      />
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-2 bg-[#33261f] rounded-full"
                            style={{
                              width: `${Math.min(
                                totals.percentage,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <span>
                          {totals.percentage}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openBudget(budget)
                          }
                          className="p-2 border rounded-lg hover:bg-gray-100"
                          title="Open"
                        >
                          <Eye size={17} />
                        </button>

                        {budget.status ===
                          "Confirmed" && (
                          <button
                            onClick={() =>
                              reviseBudget(budget)
                            }
                            className="p-2 border rounded-lg hover:bg-gray-100"
                            title="Revise"
                          >
                            <RotateCcw size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredBudgets.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              No budgets found.
            </div>
          )}
        </div>
      )}

      {/* KANBAN VIEW */}

      {view === "kanban" && (
        <div className="grid grid-cols-3 gap-5">
          {["Draft", "Confirmed", "Cancelled"].map(
            (status) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">
                    {status}
                  </h2>

                  <span className="text-sm text-gray-500">
                    {
                      filteredBudgets.filter(
                        (budget) =>
                          budget.status === status
                      ).length
                    }
                  </span>
                </div>

                <div className="space-y-4">
                  {filteredBudgets
                    .filter(
                      (budget) =>
                        budget.status === status
                    )
                    .map((budget) => {
                      const totals =
                        calculateBudget(budget);

                      return (
                        <div
                          key={budget.id}
                          className="bg-white border rounded-2xl p-5 hover:shadow-sm"
                        >
                          <div className="flex justify-between">
                            <h3 className="font-semibold">
                              {budget.name}
                            </h3>

                            <button
                              onClick={() =>
                                openBudget(budget)
                              }
                              className="p-1"
                            >
                              <Eye size={17} />
                            </button>
                          </div>

                          <p className="text-sm text-gray-500 mt-2">
                            {budget.startDate} →{" "}
                            {budget.endDate}
                          </p>

                          <div className="mt-5">
                            <div className="flex justify-between text-sm mb-2">
                              <span>
                                Achieved
                              </span>

                              <span>
                                {
                                  totals.percentage
                                }
                                %
                              </span>
                            </div>

                            <div className="w-full h-2 bg-gray-100 rounded-full">
                              <div
                                className="h-2 bg-[#33261f] rounded-full"
                                style={{
                                  width: `${Math.min(
                                    totals.percentage,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-5">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">
                                Committed
                              </p>

                              <p className="font-semibold mt-1">
                                ₹
                                {totals.committed.toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">
                                Achieved
                              </p>

                              <p className="font-semibold mt-1">
                                ₹
                                {totals.achieved.toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* CANCEL MODAL */}

      {showCancelModal && (
        <CancelModal
          onCancel={() => {
            setShowCancelModal(false);
            setBudgetToCancel(null);
          }}
          onConfirm={cancelBudget}
        />
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="flex justify-between">
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <span className="text-gray-500">{icon}</span>
      </div>

      <p className="text-2xl font-semibold mt-4">
        ₹{Number(value).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  let classes =
    "bg-yellow-100 text-yellow-700";

  if (status === "Confirmed") {
    classes = "bg-green-100 text-green-700";
  }

  if (status === "Cancelled") {
    classes = "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm ${classes}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   CANCEL MODAL
========================================================= */

function CancelModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[420px] p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          Cancel Budget?
        </h2>

        <p className="text-gray-500 mt-2">
          Are you sure you want to cancel this budget?
          This action will mark the budget as cancelled.
        </p>

        <div className="flex justify-end gap-3 mt-7">
          <button
            onClick={onCancel}
            className="border px-5 py-2.5 rounded-lg"
          >
            No
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Budgets;