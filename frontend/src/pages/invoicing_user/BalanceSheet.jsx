import { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Scale,
  DollarSign,
  TrendingUp,
  RotateCw,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import api from "../../services/api";

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
        amount: Number(a.amount || 0),
        desc: `Account code: ${a.code || "N/A"}`,
      }));

      const rawLiabilities = (data.liabilities || []).map((l) => ({
        name: l.name || l.accountName || "Liability A/c",
        amount: Number(l.amount || 0),
        desc: `Account code: ${l.code || "N/A"}`,
      }));

      const rawEquity = (data.equity || []).map((e) => ({
        name: e.name || e.accountName || "Equity A/c",
        amount: Number(e.amount || 0),
        desc: `Account code: ${e.code || "N/A"}`,
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
          <button
            onClick={fetchBalanceSheet}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#211D19] shadow-2xs hover:bg-[#faf8f4] transition cursor-pointer"
          >
            <RotateCw size={13} className={loading ? "animate-spin text-[#8f8274]" : "text-[#8f8274]"} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#211D19] shadow-2xs">
            <Calendar size={14} className="text-[#8f8274]" />
            <span>As of: {asOfDate}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs ${
            isBalanced
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}>
            <ShieldCheck size={14} />
            <span>{isBalanced ? "Double-Entry Balanced" : "Discrepancy Detected"}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ================= TOTALS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Assets */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200">
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
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200">
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
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200">
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
        <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-2xs hover:shadow-lg hover:-translate-y-0.5 hover:border-[#cfc6b6] transition-all duration-200 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-[#faf8f4] border-b border-[#e7e3da] flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold text-[#211D19] tracking-wider">
                Assets
              </h3>
              <span className="text-xs text-[#716B63]">Debit Balances</span>
            </div>

            <div className="p-5 space-y-3 min-h-[120px]">
              {loading ? (
                <div className="text-center py-6 text-sm text-[#8f8274]">Loading ledger balances...</div>
              ) : assets.length === 0 ? (
                <div className="text-center py-6 text-sm text-[#8f8274]">No asset entries recorded yet</div>
              ) : (
                assets.map((a, idx) => (
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
                ))
              )}
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
        <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-2xs hover:shadow-lg hover:-translate-y-0.5 hover:border-[#cfc6b6] transition-all duration-200 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 bg-[#faf8f4] border-b border-[#e7e3da] flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold text-[#211D19] tracking-wider">
                Liabilities & Equity
              </h3>
              <span className="text-xs text-[#716B63]">Credit Balances</span>
            </div>

            <div className="p-5 space-y-4 min-h-[120px]">
              {/* Liabilities Subsection */}
              <div>
                <span className="text-[11px] font-bold text-[#8f8274] uppercase tracking-wider block mb-2">
                  Current Liabilities
                </span>
                {loading ? (
                  <div className="text-center py-3 text-sm text-[#8f8274]">Loading...</div>
                ) : liabilities.length === 0 ? (
                  <div className="text-xs text-[#998d7f] py-1">No liability balances recorded</div>
                ) : (
                  liabilities.map((l, idx) => (
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
                  ))
                )}
              </div>

              {/* Equity Subsection */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#8f8274] uppercase tracking-wider block mb-2">
                  Capital & Retained Earnings
                </span>
                {loading ? (
                  <div className="text-center py-3 text-sm text-[#8f8274]">Loading...</div>
                ) : equity.length === 0 ? (
                  <div className="text-xs text-[#998d7f] py-1">No capital or equity balances recorded</div>
                ) : (
                  equity.map((e, idx) => (
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
                  ))
                )}
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
