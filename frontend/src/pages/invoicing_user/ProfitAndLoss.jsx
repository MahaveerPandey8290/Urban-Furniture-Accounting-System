import { useState, useEffect } from "react";
import {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  RotateCw,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import api from "../../services/api";

function ProfitAndLoss() {
  const [period] = useState("FY 2026-27");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [incomeItems, setIncomeItems] = useState([]);
  const [expenseItems, setExpenseItems] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  const fetchProfitLoss = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/reports/profit-loss");
      const data = res.data?.data || res.data || {};

      const rawIncome = data.incomeAccounts || data.income || [];
      const rawExpenses = data.expenseAccounts || data.expenses || [];

      const mappedIncome = rawIncome.map((inc, i) => ({
        id: inc.accountId || `inc-${i}`,
        name: inc.name || inc.accountName || "Income A/c",
        amount: Number(inc.amount || inc.balance || 0),
      }));

      const mappedExpenses = rawExpenses.map((exp, i) => ({
        id: exp.accountId || `exp-${i}`,
        name: exp.name || exp.accountName || "Expense A/c",
        amount: Number(exp.amount || exp.balance || 0),
      }));

      setIncomeItems(mappedIncome);
      setExpenseItems(mappedExpenses);
      setTotalIncome(Number(data.totalIncome || 0));
      setTotalExpenses(Number(data.totalExpense || data.totalExpenses || 0));
      setNetProfit(Number(data.netProfit || 0));
    } catch (err) {
      console.error("Failed to load Profit & Loss:", err);
      setError(err.response?.data?.message || "Failed to load Profit & Loss report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitLoss();
  }, []);

  const marginPercent =
    totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0.0";

  return (
    <div className="w-full space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e7e3da] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#211D19] tracking-tight">
            Profit and Loss Statement
          </h1>
          <p className="text-sm text-[#716B63] mt-0.5">
            Dynamic income vs. procurement expenses statement fed by real-time ledger entries
          </p>
        </div>

        {/* Period Selector & Refresh */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProfitLoss}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#211D19] shadow-2xs hover:bg-[#faf8f4] transition cursor-pointer"
          >
            <RotateCw size={13} className={loading ? "animate-spin text-[#8f8274]" : "text-[#8f8274]"} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#211D19] shadow-2xs">
            <Calendar size={14} className="text-[#8f8274]" />
            <span>{period}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ================= 3 KPI SUMMARY METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Income */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#211D19] mt-2">
            {formatCurrency(totalIncome)}
          </p>
          <span className="text-xs text-emerald-700 font-medium mt-1 block">
            Customer Invoicing & Sales
          </span>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider">
              Procurement & Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#211D19] mt-2">
            {formatCurrency(totalExpenses)}
          </p>
          <span className="text-xs text-amber-800 font-medium mt-1 block">
            Vendor Bills & Purchases
          </span>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider">
              Net Profit / (Loss)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#faf8f4] text-[#342921] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p
            className={`text-2xl sm:text-3xl font-bold mt-2 ${
              netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {formatCurrency(netProfit)}
          </p>
          <span className="text-xs text-[#716B63] font-medium mt-1 block">
            Net Margin: {marginPercent}%
          </span>
        </div>
      </div>

      {/* ================= DETAILED FINANCIAL TABLE ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-2xs hover:shadow-lg hover:-translate-y-0.5 hover:border-[#cfc6b6] transition-all duration-200 overflow-hidden">
        <div className="p-5 bg-[#faf8f4] border-b border-[#e7e3da] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#211D19] uppercase tracking-wider">
            Statement of Financial Performance
          </h3>
          <span className="text-xs text-[#716B63]">Figures in INR (₹)</span>
        </div>

        <div className="divide-y divide-[#f0ece4] text-sm">
          {/* 1. Operating Income Section */}
          <div className="p-5 bg-stone-50/50">
            <h4 className="text-xs uppercase font-bold text-[#523e2b] tracking-wider mb-3">
              1. Operating Revenue & Income
            </h4>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-xs text-[#8f8274]">Loading revenue figures...</div>
              ) : incomeItems.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#8f8274]">No operating revenue recorded yet</div>
              ) : (
                incomeItems.map((inc) => (
                  <div
                    key={inc.id}
                    className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white transition"
                  >
                    <span className="text-[#211D19]">{inc.name}</span>
                    <span className="font-semibold text-[#211D19]">
                      {formatCurrency(inc.amount)}
                    </span>
                  </div>
                ))
              )}
              <div className="flex items-center justify-between pt-2 border-t border-[#e7e3da] font-bold text-[#211D19]">
                <span>Total Operating Income</span>
                <span className="text-emerald-800">{formatCurrency(totalIncome)}</span>
              </div>
            </div>
          </div>

          {/* 2. Operating Expenses Section */}
          <div className="p-5 bg-stone-50/50">
            <h4 className="text-xs uppercase font-bold text-[#523e2b] tracking-wider mb-3">
              2. Cost of Sales & Procurement Expenses
            </h4>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-xs text-[#8f8274]">Loading expense figures...</div>
              ) : expenseItems.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#8f8274]">No procurement or operating expenses recorded yet</div>
              ) : (
                expenseItems.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white transition"
                  >
                    <span className="text-[#211D19]">{exp.name}</span>
                    <span className="font-semibold text-rose-700">
                      {formatCurrency(exp.amount)}
                    </span>
                  </div>
                ))
              )}
              <div className="flex items-center justify-between pt-2 border-t border-[#e7e3da] font-bold text-[#211D19]">
                <span>Total Procurement & Expenses</span>
                <span className="text-rose-700">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* 3. Net Result */}
          <div className="p-6 bg-[#faf8f4] flex items-center justify-between font-bold text-base sm:text-lg">
            <span className="text-[#211D19]">Net Profit / (Loss) for Period</span>
            <span
              className={`text-xl sm:text-2xl font-black ${
                netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {formatCurrency(netProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfitAndLoss;
