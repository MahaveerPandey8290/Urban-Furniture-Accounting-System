import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  List,
  LayoutGrid,
  Edit3,
  Trash2,
  Calendar,
  User,
  RotateCcw,
  RotateCw,
  CheckCircle,
  XCircle,
  ChevronRight,
  Target,
  TrendingUp,
  Wallet,
  Clock,
  ArrowLeft,
  X,
} from "lucide-react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatters";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    REVISED: "bg-amber-100 text-amber-800 border-amber-200",
    CANCELLED: "bg-rose-100 text-rose-800 border-rose-200",
  };
  const labels = {
    CONFIRMED: "Confirmed",
    DRAFT: "Draft",
    REVISED: "Revised",
    CANCELLED: "Cancelled",
  };
  const cls = map[status] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center border text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {labels[status] || status}
    </span>
  );
}

// ─── Circular progress ring ───────────────────────────────────────────────────
function CircleProgress({ pct, color = "#22c55e" }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = ((Math.min(pct, 100) / 100) * circ).toFixed(1);
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
      <circle
        cx="26" cy="26" r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text x="26" y="30" textAnchor="middle" fontSize="9" fontWeight="700" fill="#374151">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ─── Kanban column colors ─────────────────────────────────────────────────────
const KANBAN_COLS = [
  { status: "CONFIRMED", label: "Confirmed", dot: "bg-emerald-500", num: "text-emerald-700" },
  { status: "DRAFT",     label: "Draft",     dot: "bg-gray-400",    num: "text-gray-600"    },
  { status: "REVISED",   label: "Revised",   dot: "bg-amber-500",   num: "text-amber-700"   },
  { status: "CANCELLED", label: "Cancelled", dot: "bg-rose-500",    num: "text-rose-700"    },
];

// ─── helper ───────────────────────────────────────────────────────────────────
const fmt = (n) => formatCurrency(Number(n) || 0);
const pct = (committed, achieved) => {
  const c = Number(committed) || 0;
  const a = Number(achieved) || 0;
  if (c === 0) return 0;
  return Math.min(100, Math.round((a / c) * 100));
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function BudgetReport() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "kanban"
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [analytics, setAnalytics] = useState([]);
  const [responsibles, setResponsibles] = useState([]);

  // modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: "", startDate: "", endDate: "", responsibleId: "",
    lines: [{ analyticAccountId: "", type: "EXPENSE", committedAmount: "" }],
  };
  const [form, setForm] = useState(emptyForm);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, aRes, cRes] = await Promise.all([
        api.get("/budgets?limit=100"),
        api.get("/analytic-accounts").catch(() => ({ data: { items: [] } })),
        api.get("/contacts?limit=100").catch(() => ({ data: { items: [] } })),
      ]);

      const raw = Array.isArray(bRes.data) ? bRes.data : bRes.data?.data || [];
      const mapped = raw.map((b) => {
        const committed = (b.lines || []).reduce((s, l) => s + Number(l.committedAmount || 0), 0);
        const achieved  = (b.lines || []).reduce((s, l) => s + Number(l.achievedAmount  || 0), 0);
        return {
          id:            b.id,
          name:          b.name,
          startDate:     b.startDate?.split("T")[0] || "",
          endDate:       b.endDate?.split("T")[0]   || "",
          responsible:   b.responsible?.name || "Admin",
          responsibleId: b.responsibleId,
          analyticName:  b.lines?.[0]?.analyticAccount?.name || "General",
          status:        b.status || "DRAFT",
          committed,
          achieved,
          toAchieve:     Math.max(0, committed - achieved),
          pct:           pct(committed, achieved),
          lines:         b.lines || [],
        };
      });

      setBudgets(mapped);
      setAnalytics(aRes.data?.items || []);
      setResponsibles(cRes.data?.items || []);
    } catch (e) {
      console.error("Budget fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── aggregate KPIs ─────────────────────────────────────────────────────────
  const totalCommitted = useMemo(() => budgets.reduce((s, b) => s + b.committed, 0), [budgets]);
  const totalAchieved  = useMemo(() => budgets.reduce((s, b) => s + b.achieved,  0), [budgets]);
  const totalToAchieve = useMemo(() => budgets.reduce((s, b) => s + b.toAchieve, 0), [budgets]);
  const confirmedCount = useMemo(() => budgets.filter((b) => b.status === "CONFIRMED").length, [budgets]);
  const overallPct     = totalCommitted > 0 ? Math.round((totalAchieved / totalCommitted) * 100) : 0;

  // ── filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return budgets.filter((b) => {
      const q = search.toLowerCase();
      if (q && !b.name.toLowerCase().includes(q) && !b.responsible.toLowerCase().includes(q)) return false;
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      if (filterFrom && b.startDate < filterFrom) return false;
      if (filterTo   && b.endDate   > filterTo)   return false;
      return true;
    });
  }, [budgets, search, filterStatus, filterFrom, filterTo]);

  // ── actions ────────────────────────────────────────────────────────────────
  const handleConfirm = async (b) => {
    try {
      await api.patch(`/budgets/${b.id}/confirm`);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || "Could not confirm budget.");
    }
  };

  const openCancel = (b) => { setCancelTarget(b); setShowCancelModal(true); };
  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await api.patch(`/budgets/${cancelTarget.id}/cancel`);
      setShowCancelModal(false);
      setCancelTarget(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || "Could not cancel budget.");
      setShowCancelModal(false);
    }
  };

  // ── create budget ──────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      alert("Please fill Budget Name, Start Date and End Date.");
      return;
    }
    const defaultAnalytic = analytics[0]?.id || 1;
    const defaultResp = Number(form.responsibleId) || responsibles[0]?.id || 1;
    const lines = form.lines.map((l) => ({
      analyticAccountId: Number(l.analyticAccountId) || defaultAnalytic,
      type:              l.type || "EXPENSE",
      committedAmount:   Number(l.committedAmount) || 0,
    }));

    setSaving(true);
    try {
      await api.post("/budgets", {
        name:          form.name,
        startDate:     form.startDate,
        endDate:       form.endDate,
        responsibleId: defaultResp,
        lines,
      });
      setShowNewModal(false);
      setForm(emptyForm);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to create budget.");
    } finally {
      setSaving(false);
    }
  };

  const addLine = () =>
    setForm((f) => ({ ...f, lines: [...f.lines, { analyticAccountId: "", type: "EXPENSE", committedAmount: "" }] }));
  const removeLine = (i) =>
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  const setLine = (i, field, val) =>
    setForm((f) => {
      const lines = [...f.lines];
      lines[i] = { ...lines[i], [field]: val };
      return { ...f, lines };
    });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-[#e7e3da] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#211D19] tracking-tight">
              Budget Reports
            </h1>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#f0ece4] text-[#6b5e54] px-2 py-0.5 rounded-full">
              Financial Reports
            </span>
          </div>
          <p className="text-sm text-[#716B63] mt-0.5">
            Track allocated expenditure, actual performance realization, and variance analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#211D19] shadow-sm hover:bg-[#faf8f4] transition cursor-pointer disabled:opacity-50"
          >
            <RotateCw size={13} className={loading ? "animate-spin text-[#8f8274]" : "text-[#8f8274]"} />
            Refresh
          </button>
          <button
            onClick={() => { setForm(emptyForm); setShowNewModal(true); }}
            className="flex items-center gap-2 bg-[#33261f] text-white px-4 py-2 rounded-xl hover:bg-[#4a3829] transition text-sm font-semibold"
          >
            <Plus size={16} />
            New Budget
          </button>
        </div>
      </div>

      {/* ── KPI SUMMARY CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Committed */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-[#716B63] tracking-wider">
              Total Committed
            </span>
            <div className="w-7 h-7 bg-[#f0ece4] rounded-lg flex items-center justify-center">
              <Target size={14} className="text-[#6b5e54]" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#211D19]">{fmt(totalCommitted)}</p>
          <p className="text-xs text-[#8f8274] mt-0.5">
            Across {budgets.length} planned budgets
          </p>
        </div>

        {/* Total Achieved */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
              Total Achieved
            </span>
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={14} className="text-emerald-700" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#211D19]">{fmt(totalAchieved)}</p>
          <p className="text-xs text-emerald-700 mt-0.5">Realized via confirmed ledger bills</p>
        </div>

        {/* Amount to Achieve */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-[#716B63] tracking-wider">
              Amount to Achieve
            </span>
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-amber-700" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#211D19]">{fmt(totalToAchieve)}</p>
          <p className="text-xs text-[#8f8274] mt-0.5">Remaining target to realize</p>
        </div>

        {/* Overall % */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#716B63] tracking-wider block">
                Overall Achieved %
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {confirmedCount} Confirmed
              </span>
            </div>
          </div>
          <p className="text-xl font-bold text-[#211D19] mt-1">{overallPct}% completion</p>
          <div className="mt-2 h-2 rounded-full bg-[#e7e3da] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTERS ───────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#211D19]">
          <span>⛉</span>
          <span>Filter Reports</span>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8274]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search budgets by title, analytic account, or manager…"
              className="w-full pl-9 pr-4 py-2 border border-[#e7e3da] rounded-xl text-sm bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-[#c4b8ac]"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#8f8274] tracking-wider">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-[#e7e3da] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DRAFT">Draft</option>
              <option value="REVISED">Revised</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* From Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#8f8274] tracking-wider">From Date</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="border border-[#e7e3da] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#8f8274] tracking-wider">To Date</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="border border-[#e7e3da] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
            />
          </div>

          {(search || filterStatus !== "all" || filterFrom || filterTo) && (
            <button
              onClick={() => { setSearch(""); setFilterStatus("all"); setFilterFrom(""); setFilterTo(""); }}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 border border-rose-200 rounded-xl px-3 py-2"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── VIEW TOGGLE ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            view === "list"
              ? "bg-[#33261f] text-white border-[#33261f]"
              : "bg-white text-[#211D19] border-[#e7e3da] hover:bg-[#faf8f4]"
          }`}
        >
          <List size={14} /> List View
        </button>
        <button
          onClick={() => setView("kanban")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            view === "kanban"
              ? "bg-[#33261f] text-white border-[#33261f]"
              : "bg-white text-[#211D19] border-[#e7e3da] hover:bg-[#faf8f4]"
          }`}
        >
          <LayoutGrid size={14} /> Kanban View
        </button>
      </div>

      {/* ── LIST VIEW ──────────────────────────────────────────────────────── */}
      {view === "list" && (
        <div className="bg-white border border-[#e7e3da] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf8f4] border-b border-[#e7e3da] text-[10px] uppercase font-bold text-[#716B63] tracking-wider">
                  <th className="px-5 py-3 text-left">Budget</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Committed</th>
                  <th className="px-4 py-3 text-right">Achieved</th>
                  <th className="px-4 py-3 text-right">To Achieve</th>
                  <th className="px-4 py-3 text-center">Ratio</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ece4]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-[#8f8274]">
                      Loading budgets…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-[#8f8274]">
                      No budgets found. Create your first budget.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-[#faf8f4] transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#f0ece4] rounded-xl flex items-center justify-center shrink-0">
                            <Wallet size={16} className="text-[#6b5e54]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#211D19]">{b.name}</p>
                            <p className="text-xs text-[#8f8274]">
                              {b.analyticName} &bull; {b.responsible}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#716B63]">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar size={12} />
                          {b.startDate} – {b.endDate}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-[#211D19]">
                        {fmt(b.committed)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-emerald-700">
                        {fmt(b.achieved)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-amber-700">
                        {fmt(b.toAchieve)}
                      </td>
                      <td className="px-4 py-4 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <CircleProgress
                            pct={b.pct}
                            color={b.pct >= 75 ? "#22c55e" : b.pct >= 40 ? "#f59e0b" : "#ef4444"}
                          />
                          <span className="text-[9px] font-bold text-[#8f8274] uppercase tracking-wider">
                            Ratio
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {b.status === "DRAFT" && (
                            <button
                              onClick={() => handleConfirm(b)}
                              title="Confirm"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() => openCancel(b)}
                              title="Cancel"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                          <button
                            title="Edit (revise)"
                            className="p-1.5 rounded-lg bg-[#f0ece4] text-[#6b5e54] hover:bg-[#e7e0d5] transition"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            title="Delete"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── KANBAN VIEW ────────────────────────────────────────────────────── */}
      {view === "kanban" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {KANBAN_COLS.map((col) => {
            const items = filtered.filter((b) => b.status === col.status);
            return (
              <div key={col.status} className="space-y-3">
                {/* Column header */}
                <div className="flex items-center gap-2 px-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.num}`}>
                    {col.label}
                  </span>
                  <span className="ml-auto text-xs font-bold bg-[#f0ece4] text-[#6b5e54] w-6 h-6 rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                {loading ? (
                  <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 text-xs text-center text-[#8f8274]">
                    Loading…
                  </div>
                ) : items.length === 0 ? (
                  <div className="bg-white border border-dashed border-[#e7e3da] rounded-2xl p-4 text-xs text-center text-[#8f8274]">
                    No {col.label.toLowerCase()} budgets
                  </div>
                ) : (
                  items.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-[#e7e3da] rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-3"
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#f0ece4] rounded-lg flex items-center justify-center shrink-0">
                            <Wallet size={14} className="text-[#6b5e54]" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#211D19] leading-tight line-clamp-1">
                              {b.name}
                            </p>
                            <StatusBadge status={b.status} />
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {b.status === "DRAFT" && (
                            <button
                              onClick={() => handleConfirm(b)}
                              className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                              title="Confirm"
                            >
                              <CheckCircle size={13} />
                            </button>
                          )}
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() => openCancel(b)}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                              title="Cancel"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                          <button className="p-1 rounded-lg text-[#8f8274] hover:bg-[#f0ece4] transition">
                            <Edit3 size={13} />
                          </button>
                          <button className="p-1 rounded-lg text-rose-400 hover:bg-rose-50 transition">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Analytic account & responsible */}
                      <div>
                        <p className="text-xs text-[#8f8274]">{b.analyticName}</p>
                        <div className="flex items-center gap-1 text-xs text-[#8f8274] mt-0.5">
                          <User size={11} />
                          <span>{b.responsible}</span>
                        </div>
                      </div>

                      {/* Progress ring */}
                      <div className="flex items-center gap-3">
                        <CircleProgress
                          pct={b.pct}
                          color={b.pct >= 75 ? "#22c55e" : b.pct >= 40 ? "#f59e0b" : "#ef4444"}
                        />
                        <div className="text-xs text-[#716B63]">
                          <p className="font-bold text-[#211D19]">{b.pct}% Realized</p>
                          <p>{fmt(b.achieved)} of {fmt(b.committed)}</p>
                        </div>
                      </div>

                      {/* Committed / To Achieve */}
                      <div className="flex justify-between text-xs border-t border-[#f0ece4] pt-3">
                        <div>
                          <p className="text-[#8f8274] uppercase font-bold tracking-wider text-[9px]">Committed</p>
                          <p className="font-bold text-[#211D19]">{fmt(b.committed)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#8f8274] uppercase font-bold tracking-wider text-[9px]">To Achieve</p>
                          <p className="font-bold text-amber-700">{fmt(b.toAchieve)}</p>
                        </div>
                      </div>

                      {/* Period */}
                      <div className="flex items-center gap-1.5 text-[10px] text-[#8f8274] border-t border-[#f0ece4] pt-2">
                        <Calendar size={10} />
                        <span>{b.startDate} – {b.endDate}</span>
                        <ChevronRight size={10} className="ml-auto" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          NEW BUDGET MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7e3da] bg-[#faf8f4]">
              <div>
                <h2 className="text-lg font-bold text-[#211D19]">New Budget</h2>
                <p className="text-xs text-[#716B63] mt-0.5">Create and configure a new budget plan</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 rounded-xl text-[#8f8274] hover:bg-[#f0ece4] hover:text-[#211D19] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Budget Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
                    Budget Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. January 2026"
                    className="w-full border border-[#e7e3da] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c4b8ac]"
                  />
                </div>

                {/* Responsible */}
                <div>
                  <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
                    Responsible
                  </label>
                  <select
                    value={form.responsibleId}
                    onChange={(e) => setForm((f) => ({ ...f, responsibleId: e.target.value }))}
                    className="w-full border border-[#e7e3da] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#c4b8ac]"
                  >
                    <option value="">Select responsible…</option>
                    {responsibles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full border border-[#e7e3da] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c4b8ac]"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full border border-[#e7e3da] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c4b8ac]"
                  />
                </div>
              </div>

              {/* Budget Lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-[#716B63] uppercase tracking-wider">
                    Budget Lines
                  </label>
                  <button
                    onClick={addLine}
                    className="flex items-center gap-1 text-xs font-semibold text-[#33261f] hover:text-[#4a3829] border border-[#e7e3da] rounded-lg px-2.5 py-1 hover:bg-[#faf8f4] transition"
                  >
                    <Plus size={12} /> Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {form.lines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#faf8f4] border border-[#e7e3da] rounded-xl p-3">
                      <select
                        value={line.analyticAccountId}
                        onChange={(e) => setLine(i, "analyticAccountId", e.target.value)}
                        className="flex-1 border border-[#e7e3da] rounded-lg px-3 py-2 text-xs bg-white focus:outline-none"
                      >
                        <option value="">Select analytic account…</option>
                        {analytics.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>

                      <select
                        value={line.type}
                        onChange={(e) => setLine(i, "type", e.target.value)}
                        className="border border-[#e7e3da] rounded-lg px-3 py-2 text-xs bg-white focus:outline-none w-28"
                      >
                        <option value="EXPENSE">Expense</option>
                        <option value="INCOME">Income</option>
                      </select>

                      <input
                        type="number"
                        placeholder="Amount"
                        value={line.committedAmount}
                        onChange={(e) => setLine(i, "committedAmount", e.target.value)}
                        className="w-32 border border-[#e7e3da] rounded-lg px-3 py-2 text-xs focus:outline-none"
                      />

                      {form.lines.length > 1 && (
                        <button
                          onClick={() => removeLine(i)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e7e3da] bg-[#faf8f4]">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e7e3da] text-sm text-[#211D19] hover:bg-[#f0ece4] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#33261f] text-white text-sm font-semibold hover:bg-[#4a3829] transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <RotateCw size={14} className="animate-spin" />}
                {saving ? "Saving…" : "Create Budget"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL CONFIRM MODAL ───────────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <XCircle size={20} className="text-rose-700" />
              </div>
              <div>
                <h3 className="font-bold text-[#211D19]">Cancel Budget?</h3>
                <p className="text-xs text-[#716B63] mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            {cancelTarget && (
              <p className="text-sm text-[#211D19]">
                Are you sure you want to cancel <strong>{cancelTarget.name}</strong>?
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowCancelModal(false); setCancelTarget(null); }}
                className="px-4 py-2 rounded-xl border border-[#e7e3da] text-sm text-[#211D19] hover:bg-[#faf8f4] transition"
              >
                Keep It
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetReport;
