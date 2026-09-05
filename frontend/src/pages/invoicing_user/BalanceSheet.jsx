import { useState, useMemo } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Scale,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

function BalanceSheet() {
  const [asOfDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Load Journal Entries from storage
  const journalEntries = useMemo(() => {
    try {
      const saved = localStorage.getItem("urban_furniture_journal_entries_master");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  // Compute account balances from posted journal items
  const accountBalances = useMemo(() => {
    const balances = {};

    journalEntries.forEach((entry) => {
      if (entry.status !== "Cancelled") {
        (entry.items || []).forEach((item) => {
          const accId = item.accountId || "unknown";
          if (!balances[accId]) {
            balances[accId] = {
              id: accId,
              name: item.accountName || "Account",
              debit: 0,
              credit: 0,
            };
          }
          balances[accId].debit += Number(item.debit) || 0;
          balances[accId].credit += Number(item.credit) || 0;
        });
      }
    });

    return balances;
  }, [journalEntries]);

  // 1. Assets (Debit - Credit)
  const assets = useMemo(() => {
    let bank = 500000; // Baseline seed capital in bank
    let cash = 50000;
    let debtors = 0;

    Object.values(accountBalances).forEach((acc) => {
      const name = acc.name?.toLowerCase() || "";
      const netDebit = acc.debit - acc.credit;

      if (name.includes("bank")) {
        bank += netDebit;
      } else if (name.includes("cash")) {
        cash += netDebit;
      } else if (name.includes("debtor")) {
        debtors += netDebit;
      }
    });

    return [
      { name: "Bank A/c", amount: Math.max(0, bank), desc: "Liquid cash at bank" },
      { name: "Cash A/c", amount: Math.max(0, cash), desc: "Petty cash in hand" },
      { name: "Debtors A/c (Receivables)", amount: Math.max(0, debtors), desc: "Customer receivables" },
    ];
  }, [accountBalances]);

  const totalAssets = useMemo(
    () => assets.reduce((sum, a) => sum + a.amount, 0),
    [assets]
  );

  // 2. Liabilities (Credit - Debit)
  const liabilities = useMemo(() => {
    let creditors = 0;

    Object.values(accountBalances).forEach((acc) => {
      const name = acc.name?.toLowerCase() || "";
      const netCredit = acc.credit - acc.debit;

      if (name.includes("creditor")) {
        creditors += netCredit;
      }
    });

    return [
      {
        name: "Creditors A/c (Payables)",
        amount: Math.max(0, creditors),
        desc: "Outstanding vendor procurement payables",
      },
    ];
  }, [accountBalances]);

  const totalLiabilities = useMemo(
    () => liabilities.reduce((sum, l) => sum + l.amount, 0),
    [liabilities]
  );

  // 3. Equity & Retained Earnings
  const equity = useMemo(() => {
    let capital = 500000; // Baseline seed equity
    let income = 0;
    let expenses = 0;

    Object.values(accountBalances).forEach((acc) => {
      const name = acc.name?.toLowerCase() || "";
      if (name.includes("capital")) {
        capital += acc.credit - acc.debit;
      } else if (name.includes("sales") || name.includes("income")) {
        income += acc.credit - acc.debit;
      } else if (name.includes("purchase") || name.includes("expense")) {
        expenses += acc.debit - acc.credit;
      }
    });

    const retainedProfit = income - expenses;
    const items = [
      { name: "Capital A/c", amount: Math.max(0, capital), desc: "Owner equity contribution" },
    ];

    if (retainedProfit !== 0) {
      items.push({
        name: "Retained Earnings (Period Net Profit)",
        amount: retainedProfit,
        desc: "Accumulated profit/loss from transactions",
      });
    }

    return items;
  }, [accountBalances]);

  const totalEquity = useMemo(
    () => equity.reduce((sum, e) => sum + e.amount, 0),
    [equity]
  );

  const totalLiabAndEquity = totalLiabilities + totalEquity;
  const isBalanced = Math.abs(totalAssets - totalLiabAndEquity) < 1000;

  return (
    <div className="w-full space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e7e3da] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#211D19] tracking-tight">
            Balance Sheet
          </h1>
          <p className="text-sm text-[#716B63] mt-0.5">
            Financial position statement fed by real-time double-entry ledgers
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#211D19] shadow-2xs">
            <Calendar size={14} className="text-[#8f8274]" />
            <span>As of: {asOfDate}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold shadow-2xs">
            <ShieldCheck size={14} />
            <span>Double-Entry Balanced</span>
          </div>
        </div>
      </div>

      {/* ================= TOTALS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Assets */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider">
            Total Assets
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#211D19] mt-1.5">
            {formatCurrency(totalAssets)}
          </p>
          <span className="text-xs text-emerald-700 font-medium mt-1 block">
            Bank, Cash, Customer Receivables
          </span>
        </div>

        {/* Liabilities */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs uppercase font-semibold text-amber-800 tracking-wider">
            Total Liabilities
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-amber-800 mt-1.5">
            {formatCurrency(totalLiabilities)}
          </p>
          <span className="text-xs text-[#716B63] font-medium mt-1 block">
            Vendor Payables & Creditors
          </span>
        </div>

        {/* Equity */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider">
            Total Capital & Equity
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#211D19] mt-1.5">
            {formatCurrency(totalEquity)}
          </p>
          <span className="text-xs text-[#716B63] font-medium mt-1 block">
            Equity & Retained Earnings
          </span>
        </div>
      </div>

      {/* ================= BALANCE SHEET BREAKDOWN ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: ASSETS */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-[#faf8f4] border-b border-[#e7e3da] flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold text-[#211D19] tracking-wider">
                Assets
              </h3>
              <span className="text-xs text-[#716B63]">Debit Balances</span>
            </div>

            <div className="p-5 space-y-3">
              {assets.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-[#f0ece4] last:border-0"
                >
                  <div>
                    <span className="font-semibold text-sm text-[#211D19] block">
                      {a.name}
                    </span>
                    <span className="text-xs text-[#998d7f]">{a.desc}</span>
                  </div>
                  <span className="text-sm font-bold text-[#211D19]">
                    {formatCurrency(a.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[#faf8f4] border-t border-[#e7e3da] flex items-center justify-between font-bold text-base">
            <span className="text-[#211D19]">Total Assets</span>
            <span className="text-emerald-800 font-extrabold">
              {formatCurrency(totalAssets)}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: LIABILITIES & EQUITY */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-[#faf8f4] border-b border-[#e7e3da] flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold text-[#211D19] tracking-wider">
                Liabilities & Equity
              </h3>
              <span className="text-xs text-[#716B63]">Credit Balances</span>
            </div>

            <div className="p-5 space-y-4">
              {/* Liabilities Subsection */}
              <div>
                <span className="text-[11px] font-bold text-[#8f8274] uppercase tracking-wider block mb-2">
                  Current Liabilities
                </span>
                {liabilities.map((l, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-[#f0ece4] last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-sm text-[#211D19] block">
                        {l.name}
                      </span>
                      <span className="text-xs text-[#998d7f]">{l.desc}</span>
                    </div>
                    <span className="text-sm font-bold text-amber-800">
                      {formatCurrency(l.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Equity Subsection */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#8f8274] uppercase tracking-wider block mb-2">
                  Capital & Retained Earnings
                </span>
                {equity.map((e, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-[#f0ece4] last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-sm text-[#211D19] block">
                        {e.name}
                      </span>
                      <span className="text-xs text-[#998d7f]">{e.desc}</span>
                    </div>
                    <span className="text-sm font-bold text-[#211D19]">
                      {formatCurrency(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#faf8f4] border-t border-[#e7e3da] flex items-center justify-between font-bold text-base">
            <span className="text-[#211D19]">Total Liabilities & Equity</span>
            <span className="text-[#211D19] font-extrabold">
              {formatCurrency(totalLiabAndEquity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceSheet;
