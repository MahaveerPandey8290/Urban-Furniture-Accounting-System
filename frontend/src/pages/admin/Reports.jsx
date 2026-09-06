import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronRight,
  Download,
  FileText,
  IndianRupee,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import api from "../../services/api";

const Reports = () => {
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const [balanceSheet, setBalanceSheet] = useState({
    assets: [],
    liabilities: [],
    capital: [],
  });

  const [profitLoss, setProfitLoss] = useState({
    income: [],
    expenses: [],
  });

  const [budgets, setBudgets] = useState([]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [bsRes, plRes, bRes] = await Promise.all([
        api.get("/reports/balance-sheet").catch(() => ({ data: { data: {} } })),
        api.get("/reports/profit-loss").catch(() => ({ data: { data: {} } })),
        api.get("/budgets").catch(() => ({ data: { data: [] } })),
      ]);

      const bsData = bsRes.data?.data || bsRes.data || {};
      const plData = plRes.data?.data || plRes.data || {};
      const rawBudgets = Array.isArray(bRes.data?.data) ? bRes.data.data : Array.isArray(bRes.data) ? bRes.data : [];

      // Transform balance sheet data
      const bsAssets = (bsData.assets || []).map((a) => ({
        name: a.name || a.accountName || "Asset",
        amount: Number(a.balance || a.amount || 0),
      }));
      const bsLiabilities = (bsData.liabilities || []).map((l) => ({
        name: l.name || l.accountName || "Liability",
        amount: Number(l.balance || l.amount || 0),
      }));
      const bsCapital = (bsData.equity || bsData.capital || []).map((c) => ({
        name: c.name || c.accountName || "Capital",
        amount: Number(c.balance || c.amount || 0),
      }));

      setBalanceSheet({
        assets: bsAssets.length > 0 ? bsAssets : [{ name: "Current Assets", amount: 0 }],
        liabilities: bsLiabilities.length > 0 ? bsLiabilities : [{ name: "Current Liabilities", amount: 0 }],
        capital: bsCapital.length > 0 ? bsCapital : [{ name: "Owner's Equity", amount: 0 }],
      });

      // Transform P&L data
      const rawIncome = plData.incomeAccounts || plData.income || [];
      const rawExpenses = plData.expenseAccounts || plData.expenses || [];
      const plIncome = rawIncome.map((i) => ({
        name: i.name || i.accountName || "Income",
        amount: Number(i.balance || i.amount || 0),
      }));
      const plExpenses = rawExpenses.map((e) => ({
        name: e.name || e.accountName || "Expense",
        amount: Number(e.balance || e.amount || 0),
      }));

      setProfitLoss({
        income: plIncome.length > 0 ? plIncome : [{ name: "Operating Revenue", amount: 0 }],
        expenses: plExpenses.length > 0 ? plExpenses : [{ name: "Operating Expenses", amount: 0 }],
      });

      // Transform budgets
      const mappedBudgets = rawBudgets.map((b) => {
        const totalCommitted = (b.lines || []).reduce(
          (sum, l) => sum + Number(l.committedAmount || 0),
          0
        );
        return {
          name: b.name,
          type: "Expenses",
          committed: totalCommitted,
          achieved: 0,
        };
      });

      setBudgets(mappedBudgets.length > 0 ? mappedBudgets : [{ name: "Annual Budget", type: "Expenses", committed: 0, achieved: 0 }]);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // --------------------------------------------------
  // CALCULATIONS
  // --------------------------------------------------

  const totalAssets = useMemo(
    () => balanceSheet.assets.reduce((total, item) => total + item.amount, 0),
    [balanceSheet.assets]
  );

  const totalLiabilities = useMemo(
    () => balanceSheet.liabilities.reduce((total, item) => total + item.amount, 0),
    [balanceSheet.liabilities]
  );

  const totalCapital = useMemo(
    () => balanceSheet.capital.reduce((total, item) => total + item.amount, 0),
    [balanceSheet.capital]
  );

  const totalIncome = useMemo(
    () => profitLoss.income.reduce((total, item) => total + item.amount, 0),
    [profitLoss.income]
  );

  const totalExpenses = useMemo(
    () => profitLoss.expenses.reduce((total, item) => total + item.amount, 0),
    [profitLoss.expenses]
  );

  const netProfit = totalIncome - totalExpenses;

  const totalBudget = budgets.reduce(
    (total, item) => total + item.committed,
    0
  );

  const totalAchieved = budgets.reduce(
    (total, item) => total + item.achieved,
    0
  );

  const overallBudgetPercentage =
    totalBudget === 0
      ? 0
      : Math.round((totalAchieved / totalBudget) * 100);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // --------------------------------------------------
  // REPORT LIST
  // --------------------------------------------------

  if (!activeReport) {
    return (
      <div className="min-h-screen bg-[#f7f5f1] px-8 py-8">

        {/* Page Heading */}
        <div className="border-b border-[#e5dfd6] pb-6">
          <p className="text-sm text-[#806f62] mb-2">
            Finance / Reports
          </p>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-[#151515]">
                Reports
              </h1>

              <p className="mt-2 text-[#766b64]">
                View financial reports and analyse business performance.
              </p>
            </div>

            <button
              className="flex items-center gap-2 rounded-lg border border-[#ddd5cc]
              bg-white px-5 py-3 text-[#3b2d25] shadow-sm
              hover:bg-[#f8f5f0]"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Report Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Balance Sheet */}
          <button
            onClick={() => setActiveReport("balance")}
            className="group rounded-2xl border border-[#e4ddd4] bg-white p-6 text-left
            shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center
                rounded-xl bg-[#eee9e1] text-[#3b2d25]"
              >
                <Wallet size={24} />
              </div>

              <ChevronRight
                size={20}
                className="text-[#9b9087] transition group-hover:translate-x-1"
              />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-[#171717]">
              Balance Sheet
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#766b64]">
              View the current financial position including assets,
              liabilities and capital.
            </p>

            <div className="mt-6 border-t border-[#eee9e3] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#806f62]">
                  Total Assets
                </span>

                <span className="font-semibold">
                  {formatCurrency(totalAssets)}
                </span>
              </div>
            </div>
          </button>

          {/* Profit & Loss */}
          <button
            onClick={() => setActiveReport("profit")}
            className="group rounded-2xl border border-[#e4ddd4] bg-white p-6 text-left
            shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center
                rounded-xl bg-[#eee9e1] text-[#3b2d25]"
              >
                <TrendingUp size={24} />
              </div>

              <ChevronRight
                size={20}
                className="text-[#9b9087] transition group-hover:translate-x-1"
              />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-[#171717]">
              Profit & Loss Account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#766b64]">
              Analyse income, purchases, expenses and calculate
              the net profit or loss.
            </p>

            <div className="mt-6 border-t border-[#eee9e3] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#806f62]">
                  Net Profit
                </span>

                <span className="font-semibold">
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>
          </button>

          {/* Budget Report */}
          <button
            onClick={() => setActiveReport("budget")}
            className="group rounded-2xl border border-[#e4ddd4] bg-white p-6 text-left
            shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center
                rounded-xl bg-[#eee9e1] text-[#3b2d25]"
              >
                <BarChart3 size={24} />
              </div>

              <ChevronRight
                size={20}
                className="text-[#9b9087] transition group-hover:translate-x-1"
              />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-[#171717]">
              Budget Report
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#766b64]">
              Compare planned budget with achieved amounts
              for each analytical account.
            </p>

            <div className="mt-6 border-t border-[#eee9e3] pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#806f62]">
                  Budget Achieved
                </span>

                <span className="font-semibold">
                  {overallBudgetPercentage}%
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Summary */}
        <div className="mt-8 rounded-2xl border border-[#e4ddd4] bg-white p-6">

          <div className="flex items-center gap-3">
            <FileText size={22} className="text-[#4b3a30]" />

            <div>
              <h2 className="font-semibold text-lg">
                Financial Summary
              </h2>

              <p className="text-sm text-[#80756e]">
                Current overview of the accounting system.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">

            <SummaryCard
              title="Total Assets"
              value={formatCurrency(totalAssets)}
              icon={<Wallet size={20} />}
            />

            <SummaryCard
              title="Total Income"
              value={formatCurrency(totalIncome)}
              icon={<TrendingUp size={20} />}
            />

            <SummaryCard
              title="Total Expenses"
              value={formatCurrency(totalExpenses)}
              icon={<TrendingDown size={20} />}
            />

            <SummaryCard
              title="Net Profit"
              value={formatCurrency(netProfit)}
              icon={<IndianRupee size={20} />}
            />

          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // INDIVIDUAL REPORTS
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f7f5f1] px-8 py-8">

      {/* Back + Heading */}
      <div className="border-b border-[#e5dfd6] pb-6">

        <button
          onClick={() => setActiveReport(null)}
          className="mb-5 flex items-center gap-2 text-sm text-[#6f6259]
          hover:text-[#2f241e]"
        >
          <ArrowLeft size={18} />
          Back to Reports
        </button>

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-[#806f62] mb-2">
              Finance / Reports /
              {" "}
              {activeReport === "balance"
                ? "Balance Sheet"
                : activeReport === "profit"
                ? "Profit & Loss"
                : "Budget Report"}
            </p>

            <h1 className="text-4xl font-semibold text-[#151515]">
              {activeReport === "balance"
                ? "Balance Sheet"
                : activeReport === "profit"
                ? "Profit & Loss Account"
                : "Budget Report"}
            </h1>

            <p className="mt-2 text-[#766b64]">
              Financial report generated from accounting transactions.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              className="flex items-center gap-2 rounded-lg
              border border-[#ddd5cc] bg-white px-5 py-3
              text-[#3b2d25]"
            >
              <Calendar size={18} />
              Current Period
            </button>

            <button
              className="flex items-center gap-2 rounded-lg
              bg-[#352920] px-5 py-3 text-white"
            >
              <Download size={18} />
              Export
            </button>

          </div>
        </div>
      </div>

      {/* Balance Sheet */}
      {activeReport === "balance" && (
        <BalanceSheet
          data={balanceSheet}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          totalCapital={totalCapital}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Profit Loss */}
      {activeReport === "profit" && (
        <ProfitLoss
          data={profitLoss}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Budget */}
      {activeReport === "budget" && (
        <BudgetReport
          budgets={budgets}
          totalBudget={totalBudget}
          totalAchieved={totalAchieved}
          overallPercentage={overallBudgetPercentage}
          formatCurrency={formatCurrency}
        />
      )}

    </div>
  );
};

// ==================================================
// SUMMARY CARD
// ==================================================

const SummaryCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-xl border border-[#e5ded6] bg-[#faf9f7] p-5">

      <div className="flex items-center justify-between">
        <span className="text-sm text-[#806f62]">
          {title}
        </span>

        <span className="text-[#59473b]">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-xl font-semibold">
        {value}
      </p>

    </div>
  );
};

// ==================================================
// BALANCE SHEET
// ==================================================

const BalanceSheet = ({
  data,
  totalAssets,
  totalLiabilities,
  totalCapital,
  formatCurrency,
}) => {
  return (
    <div className="mt-8">

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Assets */}
        <ReportTable
          title="Assets"
          icon={<Wallet size={20} />}
          rows={data.assets}
          total={totalAssets}
          formatCurrency={formatCurrency}
        />

        {/* Liabilities */}
        <ReportTable
          title="Liabilities"
          icon={<FileText size={20} />}
          rows={data.liabilities}
          total={totalLiabilities}
          formatCurrency={formatCurrency}
        />

      </div>

      {/* Capital */}
      <div className="mt-6">
        <ReportTable
          title="Capital"
          icon={<IndianRupee size={20} />}
          rows={data.capital}
          total={totalCapital}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Position */}
      <div className="mt-6 rounded-2xl border border-[#e4ddd4] bg-white p-6">

        <h3 className="text-lg font-semibold">
          Financial Position
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

          <SummaryCard
            title="Total Assets"
            value={formatCurrency(totalAssets)}
            icon={<Wallet size={20} />}
          />

          <SummaryCard
            title="Liabilities"
            value={formatCurrency(totalLiabilities)}
            icon={<FileText size={20} />}
          />

          <SummaryCard
            title="Capital"
            value={formatCurrency(totalCapital)}
            icon={<IndianRupee size={20} />}
          />

        </div>

      </div>
    </div>
  );
};

// ==================================================
// REPORT TABLE
// ==================================================

const ReportTable = ({
  title,
  icon,
  rows,
  total,
  formatCurrency,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e4ddd4] bg-white">

      <div className="flex items-center gap-3 border-b border-[#ebe5de] px-6 py-5">

        <span className="text-[#58463a]">
          {icon}
        </span>

        <h2 className="text-lg font-semibold">
          {title}
        </h2>

      </div>

      <div>
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex items-center justify-between
            border-b border-[#eee9e3] px-6 py-4 last:border-0"
          >
            <span className="text-[#4e4640]">
              {row.name}
            </span>

            <span className="font-medium">
              {formatCurrency(row.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-[#f8f5f0] px-6 py-5">

        <span className="font-semibold">
          Total {title}
        </span>

        <span className="text-lg font-bold">
          {formatCurrency(total)}
        </span>

      </div>

    </div>
  );
};

// ==================================================
// PROFIT & LOSS
// ==================================================

const ProfitLoss = ({
  data,
  totalIncome,
  totalExpenses,
  netProfit,
  formatCurrency,
}) => {
  return (
    <div className="mt-8">

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Income */}
        <ReportTable
          title="Income"
          icon={<TrendingUp size={20} />}
          rows={data.income}
          total={totalIncome}
          formatCurrency={formatCurrency}
        />

        {/* Expenses */}
        <ReportTable
          title="Expenses"
          icon={<TrendingDown size={20} />}
          rows={data.expenses}
          total={totalExpenses}
          formatCurrency={formatCurrency}
        />

      </div>

      {/* Profit */}
      <div className="mt-6 rounded-2xl border border-[#e4ddd4] bg-white p-7">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-[#806f62]">
              Net Profit
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {formatCurrency(netProfit)}
            </h2>

            <p className="mt-2 text-sm text-[#806f62]">
              Income − Expenses
            </p>
          </div>

          <div
            className="flex h-16 w-16 items-center justify-center
            rounded-full bg-[#eee9e1]"
          >
            <PieChart size={30} />
          </div>

        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#e8e2db]">

          <div
            className="h-full rounded-full bg-[#3b2d25]"
            style={{
              width: `${
                totalIncome === 0
                  ? 0
                  : Math.min(
                      100,
                      (netProfit / totalIncome) * 100
                    )
              }%`,
            }}
          />

        </div>

      </div>

    </div>
  );
};

// ==================================================
// BUDGET REPORT
// ==================================================

const BudgetReport = ({
  budgets,
  totalBudget,
  totalAchieved,
  overallPercentage,
  formatCurrency,
}) => {
  return (
    <div className="mt-8">

      {/* Summary */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <SummaryCard
          title="Planned Budget"
          value={formatCurrency(totalBudget)}
          icon={<Wallet size={20} />}
        />

        <SummaryCard
          title="Achieved"
          value={formatCurrency(totalAchieved)}
          icon={<TrendingUp size={20} />}
        />

        <SummaryCard
          title="Achievement"
          value={`${overallPercentage}%`}
          icon={<BarChart3 size={20} />}
        />

      </div>

      {/* Budget Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#e4ddd4] bg-white">

        <div className="border-b border-[#ebe5de] px-6 py-5">
          <h2 className="text-lg font-semibold">
            Budget Analysis
          </h2>

          <p className="mt-1 text-sm text-[#806f62]">
            Planned budget compared with achieved amount.
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-[#e5dfd7] bg-[#faf8f5]">

                <th className="px-6 py-4 text-left text-sm font-medium text-[#6d6158]">
                  ANALYTIC ACCOUNT
                </th>

                <th className="px-6 py-4 text-left text-sm font-medium text-[#6d6158]">
                  TYPE
                </th>

                <th className="px-6 py-4 text-right text-sm font-medium text-[#6d6158]">
                  COMMITTED AMOUNT
                </th>

                <th className="px-6 py-4 text-right text-sm font-medium text-[#6d6158]">
                  ACHIEVED AMOUNT
                </th>

                <th className="px-6 py-4 text-right text-sm font-medium text-[#6d6158]">
                  ACHIEVED %
                </th>

                <th className="px-6 py-4 text-right text-sm font-medium text-[#6d6158]">
                  AMOUNT TO ACHIEVE
                </th>

              </tr>
            </thead>

            <tbody>

              {budgets.map((budget, index) => {

                const percentage =
                  budget.committed === 0
                    ? 0
                    : Math.round(
                        (budget.achieved /
                          budget.committed) *
                          100
                      );

                const remaining =
                  budget.committed - budget.achieved;

                return (
                  <tr
                    key={index}
                    className="border-b border-[#eee9e3] last:border-0"
                  >

                    <td className="px-6 py-5 font-medium">
                      {budget.name}
                    </td>

                    <td className="px-6 py-5">

                      <span
                        className="rounded-full border
                        border-[#ddd5cc] bg-[#f8f5f0]
                        px-3 py-1 text-xs"
                      >
                        {budget.type}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-right">
                      {formatCurrency(budget.committed)}
                    </td>

                    <td className="px-6 py-5 text-right font-medium">
                      {formatCurrency(budget.achieved)}
                    </td>

                    <td className="px-6 py-5 text-right">

                      <div className="flex items-center justify-end gap-3">

                        <div className="h-2 w-20 overflow-hidden rounded-full bg-[#e8e2db]">

                          <div
                            className="h-full rounded-full bg-[#4a392f]"
                            style={{
                              width: `${Math.min(
                                100,
                                percentage
                              )}%`,
                            }}
                          />

                        </div>

                        <span className="w-10 text-sm">
                          {percentage}%
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-5 text-right">
                      {formatCurrency(remaining)}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Reports;