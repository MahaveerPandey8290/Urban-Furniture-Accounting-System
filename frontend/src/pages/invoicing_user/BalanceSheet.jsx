import { useState, useEffect } from "react";
import {
  Calendar,
  ShieldCheck,
  RotateCw,
  Building2,
  Banknote,
  Users,
  AlertTriangle,
  Landmark,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import api from "../../services/api";

// ─── Account-type icon mapping ────────────────────────────────────────────────
function AccountIcon({ type }) {
  const cls = "w-4 h-4 shrink-0";
  if (type === "BANK") return <Landmark className={cls} />;
  if (type === "CASH") return <Banknote className={cls} />;
  if (type === "ASSET") return <Building2 className={cls} />;
  if (type === "LIABILITY") return <AlertTriangle className={cls} />;
  if (type === "CAPITAL") return <Users className={cls} />;
  return <TrendingDown className={cls} />;
}

// ─── Pretty sub-descriptions per account name ─────────────────────────────────
function getDesc(name = "", type = "") {
  const n = name.toLowerCase();
  if (n.includes("bank")) return "Liquid cash at bank";
  if (n.includes("cash")) return "Petty cash in hand";
  if (n.includes("debtor") || n.includes("receivable")) return "Customer receivables";
  if (n.includes("creditor") || n.includes("payable")) return "Outstanding vendor procurement payables";
  if (n.includes("capital")) return "Owner equity contribution";
  if (n.includes("retained") || n.includes("earnings") || n.includes("profit"))
    return "Accumulated profit/loss from transactions";
  if (type === "ASSET") return "Asset account balance";
  if (type === "LIABILITY") return "Liability account balance";
  if (type === "CAPITAL") return "Capital account balance";
  return "";
}

function BalanceSheet() {
  const [asOfDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [equity, setEquity] = useState([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [totalEquity, setTotalEquity] = useState(0);
  const [totalLiabAndEquity, setTotalLiabAndEquity] = useState(0);
  const [isBalanced, setIsBalanced] = useState(true);

  const fetchBalanceSheet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/reports/balance-sheet");
      const data = res.data?.data || res.data || {};

      const rawAssets = (data.assets || []).map((a) => ({
        name: a.name || a.accountName || "Asset A/c",
        type: a.type || "ASSET",
        amount: Number(a.amount || 0),
        code: a.code || "",
      }));

      const rawLiabilities = (data.liabilities || []).map((l) => ({
        name: l.name || l.accountName || "Liability A/c",
        type: l.type || "LIABILITY",
        amount: Number(l.amount || 0),
        code: l.code || "",
      }));

      const rawEquity = (data.equity || []).map((e) => ({
        name: e.name || e.accountName || "Equity A/c",
        type: e.type || "CAPITAL",
        amount: Number(e.amount || 0),
        code: e.code || "",
      }));

      setAssets(rawAssets);
      setLiabilities(rawLiabilities);
      setEquity(rawEquity);
      setTotalAssets(Number(data.totalAssets || 0));
      setTotalLiabilities(Number(data.totalLiabilities || 0));
      setTotalEquity(Number(data.totalEquity || 0));
      setTotalLiabAndEquity(Number(data.totalEquityAndLiabilities || 0));
      setIsBalanced(data.isBalanced ?? true);
    } catch (err) {
      console.error("Failed to load Balance Sheet:", err);
      setError(err.response?.data?.message || "Failed to load Balance Sheet report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  return (
    <div className="w-full space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-[#e7e3da] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#211D19] tracking-tight">
            Balance Sheet
          </h1>
          <p className="text-sm text-[#716B63] mt-1">
            Financial position statement fed by real-time double-entry ledgers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchBalanceSheet}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#211D19] shadow-sm hover:bg-[#faf8f4] transition cursor-pointer disabled:opacity-50"
          >
            <RotateCw size={13} className={loading ? "animate-spin text-[#8f8274]" : "text-[#8f8274]"} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#211D19] shadow-sm">
            <Calendar size={14} className="text-[#8f8274]" />
            <span>As of: {asOfDate}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm ${
              isBalanced
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <ShieldCheck size={14} />
            <span>{isBalanced ? "Double-Entry Balanced" : "Discrepancy Detected"}</span>
          </div>
        </div>
      </div>

      {/* ── ERROR ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ── KPI SUMMARY CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Assets */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider block">
            Total Assets
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#211D19] mt-2">
            {formatCurrency(totalAssets)}
          </p>
          <span className="text-xs text-emerald-700 font-medium mt-1.5 block">
            Bank, Cash, Customer Receivables
          </span>
        </div>

        {/* Total Liabilities */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <span className="text-xs uppercase font-semibold text-amber-800 tracking-wider block">
            Total Liabilities
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-amber-700 mt-2">
            {formatCurrency(totalLiabilities)}
          </p>
          <span className="text-xs text-[#716B63] font-medium mt-1.5 block">
            Vendor Payables &amp; Creditors
          </span>
        </div>

        {/* Total Capital & Equity */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider block">
            Total Capital &amp; Equity
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#211D19] mt-2">
            {formatCurrency(totalEquity)}
          </p>
          <span className="text-xs text-[#716B63] font-medium mt-1.5 block">
            Equity &amp; Retained Earnings
          </span>
        </div>
      </div>

      {/* ── BALANCE SHEET TWO-COLUMN TABLE ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: ASSETS ───────────────────────────────────────────────── */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 bg-[#faf8f4] border-b border-[#e7e3da]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#211D19]">
              Assets
            </h3>
            <span className="text-xs text-[#716B63]">Debit Balances</span>
          </div>

          <div className="flex-1 p-5 space-y-3 min-h-[140px]">
            {loading ? (
              <div className="text-center py-8 text-sm text-[#8f8274]">
                Loading ledger balances…
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#8f8274]">
                No asset entries recorded yet
              </div>
            ) : (
              assets.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between py-2.5 border-b border-[#f0ece4] last:border-0"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-[#8f8274]">
                      <AccountIcon type={a.type} />
                    </span>
                    <div>
                      <span className="font-semibold text-sm text-[#211D19] block">
                        {a.name}
                      </span>
                      <span className="text-xs text-[#998d7f]">
                        {getDesc(a.name, a.type)}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#211D19] whitespace-nowrap ml-4">
                    {formatCurrency(a.amount)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-4 bg-[#faf8f4] border-t border-[#e7e3da] flex items-center justify-between font-bold text-sm">
            <span className="text-[#211D19]">Total Assets</span>
            <span className="text-emerald-800 text-base font-extrabold">
              {formatCurrency(totalAssets)}
            </span>
          </div>
        </div>

        {/* ── RIGHT: LIABILITIES & EQUITY ────────────────────────────────── */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 bg-[#faf8f4] border-b border-[#e7e3da]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#211D19]">
              Liabilities &amp; Equity
            </h3>
            <span className="text-xs text-[#716B63]">Credit Balances</span>
          </div>

          <div className="flex-1 p-5 space-y-4 min-h-[140px]">
            {/* Liabilities subsection */}
            <div>
              <span className="text-[11px] font-bold text-[#8f8274] uppercase tracking-wider block mb-2">
                Current Liabilities
              </span>
              {loading ? (
                <div className="py-3 text-xs text-[#8f8274]">Loading…</div>
              ) : liabilities.length === 0 ? (
                <div className="py-1 text-xs text-[#998d7f]">No liability balances recorded</div>
              ) : (
                <div className="space-y-2">
                  {liabilities.map((l, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between py-2.5 border-b border-[#f0ece4] last:border-0"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-amber-600">
                          <AccountIcon type={l.type} />
                        </span>
                        <div>
                          <span className="font-semibold text-sm text-[#211D19] block">
                            {l.name}
                          </span>
                          <span className="text-xs text-[#998d7f]">
                            {getDesc(l.name, l.type)}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-amber-700 whitespace-nowrap ml-4">
                        {formatCurrency(l.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Capital & Retained Earnings subsection */}
            <div className="pt-2 border-t border-[#f0ece4]">
              <span className="text-[11px] font-bold text-[#8f8274] uppercase tracking-wider block mb-2">
                Capital &amp; Retained Earnings
              </span>
              {loading ? (
                <div className="py-3 text-xs text-[#8f8274]">Loading…</div>
              ) : equity.length === 0 ? (
                <div className="py-1 text-xs text-[#998d7f]">No capital or equity balances recorded</div>
              ) : (
                <div className="space-y-2">
                  {equity.map((e, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between py-2.5 border-b border-[#f0ece4] last:border-0"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-[#8f8274]">
                          <AccountIcon type={e.type} />
                        </span>
                        <div>
                          <span className="font-semibold text-sm text-[#211D19] block">
                            {e.name}
                          </span>
                          <span className="text-xs text-[#998d7f]">
                            {getDesc(e.name, e.type)}
                          </span>
                        </div>
                      </div>
                      <span className={`text-sm font-bold whitespace-nowrap ml-4 ${Number(e.amount) < 0 ? "text-rose-700" : "text-[#211D19]"}`}>
                        {formatCurrency(e.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-4 bg-[#faf8f4] border-t border-[#e7e3da] flex items-center justify-between font-bold text-sm">
            <span className="text-[#211D19]">Total Liabilities &amp; Equity</span>
            <span className="text-[#211D19] text-base font-extrabold">
              {formatCurrency(totalLiabAndEquity)}
            </span>
          </div>
        </div>
      </div>

      {/* ── BALANCE CHECK NOTE ─────────────────────────────────────────────── */}
      {!loading && (
        <div
          className={`rounded-xl border p-4 text-sm font-medium ${
            isBalanced
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {isBalanced
            ? "✓ Balance sheet is balanced — Total Assets equals Total Liabilities & Equity."
            : "⚠ Balance discrepancy detected — Total Assets does not equal Total Liabilities & Equity. Please review journal postings."}
        </div>
      )}
    </div>
  );
}

export default BalanceSheet;
