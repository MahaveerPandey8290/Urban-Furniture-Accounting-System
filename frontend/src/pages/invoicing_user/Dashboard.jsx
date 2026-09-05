import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  ShoppingBag,
  BarChart3,
  CheckCircle2,
  FileText,
  Clock,
  TrendingUp,
  X
} from "lucide-react";
import { getPurchaseOrders } from "../../utils/storage";

function Dashboard() {
  const navigate = useNavigate();

  // Load live purchase orders for dashboard counts
  const purchaseOrders = useMemo(() => {
    try {
      return getPurchaseOrders();
    } catch {
      return [];
    }
  }, []);

  const poStats = useMemo(() => {
    const total = purchaseOrders.length;
    const confirmed = purchaseOrders.filter((p) => p.status === "Confirmed").length;
    const draft = purchaseOrders.filter((p) => p.status === "Draft" || !p.status).length;
    return { total, confirmed, draft };
  }, [purchaseOrders]);

  // Quick Action Modal State
  const [activeModal, setActiveModal] = useState(null); // 'sales' | 'purchase' | null
  const [modalForm, setModalForm] = useState({ partner: "", amount: "", reference: "" });

  const handleModalSubmit = (e) => {
    e.preventDefault();
    // Closes modal and navigates to the respective module
    if (activeModal === "sales") {
      setActiveModal(null);
      navigate("/invoicing_user/sale-invoices");
    } else if (activeModal === "purchase") {
      setActiveModal(null);
      navigate("/invoicing_user/purchase-orders?action=new");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ================= 3 MAJOR OVERVIEW CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">

        {/* ----------------- 1. SALES CARD ----------------- */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_30px_rgba(45,35,27,0.1)] hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 flex flex-col justify-between group">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0ece4]">
              <div
                onClick={() => navigate("/invoicing_user/sale-invoices")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f5f2eb] text-[#342921] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                  <FileText size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition">
                    Sales
                  </h2>
                  <span className="text-xs text-[#716B63]">Customer Billings & Orders</span>
                </div>
              </div>

              {/* Prominent "+ New" Button */}
              <button
                type="button"
                onClick={() => setActiveModal("sales")}
                className="bg-[#342921] text-white hover:bg-[#231b15] text-sm font-medium px-4 py-2 rounded-lg shadow-sm cursor-pointer transition flex items-center gap-1.5 hover:scale-102"
              >
                <Plus size={15} />
                <span>New</span>
              </button>
            </div>

            {/* Three Summary Blocks */}
            <div className="grid grid-cols-3 gap-3 mt-6">

              {/* All: 12 */}
              <div
                onClick={() => navigate("/invoicing_user/sale-invoices")}
                className="bg-[#faf8f4] border border-[#ebe6dc] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-md rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150"
              >
                <span className="text-xs font-semibold text-[#716B63] tracking-wider uppercase">
                  All
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-[#211D19] mt-1.5">
                  12
                </p>
                <span className="text-xs text-[#716B63] mt-0.5 block">
                  Total records
                </span>
              </div>

              {/* Confirmed: 10 */}
              <div
                onClick={() => navigate("/invoicing_user/sale-invoices?status=confirmed")}
                className="bg-[#faf8f4] border border-[#ebe6dc] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-md rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150"
              >
                <span className="text-xs font-semibold text-[#3e5335] tracking-wider uppercase">
                  Confirmed
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-[#342921] mt-1.5">
                  10
                </p>
                <span className="text-xs text-[#3e5335] mt-0.5 block">
                  Validated
                </span>
              </div>

              {/* Draft: 2 */}
              <div
                onClick={() => navigate("/invoicing_user/sale-invoices?status=draft")}
                className="bg-[#faf8f4] border border-[#ebe6dc] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-md rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150"
              >
                <span className="text-xs font-semibold text-[#7c6352] tracking-wider uppercase">
                  Draft
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-[#68584b] mt-1.5">
                  2
                </p>
                <span className="text-xs text-[#7c6352] mt-0.5 block">
                  In progress
                </span>
              </div>

            </div>
          </div>

          {/* Card Footer Link */}
          <button
            type="button"
            onClick={() => navigate("/invoicing_user/sale-invoices")}
            className="mt-6 pt-3.5 border-t border-[#f0ece4] text-sm font-medium text-[#4a3b2f] hover:text-[#221c16] flex items-center justify-between cursor-pointer w-full transition hover:underline"
          >
            <span>Go to Sales module</span>
            <ArrowRight size={15} />
          </button>
        </div>


        {/* ----------------- 2. PURCHASE CARD ----------------- */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_30px_rgba(45,35,27,0.1)] hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 flex flex-col justify-between group">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0ece4]">
              <div
                onClick={() => navigate("/invoicing_user/purchase-orders")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f5f2eb] text-[#342921] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                  <ShoppingBag size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition">
                    Purchase
                  </h2>
                  <span className="text-xs text-[#716B63]">Purchase Orders & Procurement</span>
                </div>
              </div>

              {/* Prominent "+ New" Button */}
              <button
                type="button"
                onClick={() => setActiveModal("purchase")}
                className="bg-[#342921] text-white hover:bg-[#231b15] text-sm font-medium px-4 py-2 rounded-lg shadow-sm cursor-pointer transition flex items-center gap-1.5 hover:scale-102"
              >
                <Plus size={15} />
                <span>New</span>
              </button>
            </div>

            {/* Three Summary Blocks */}
            <div className="grid grid-cols-3 gap-3 mt-6">

              {/* All */}
              <div
                onClick={() => navigate("/invoicing_user/purchase-orders")}
                className="bg-[#faf8f4] border border-[#ebe6dc] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-md rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150"
              >
                <span className="text-xs font-semibold text-[#716B63] tracking-wider uppercase">
                  All
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-[#211D19] mt-1.5">
                  {poStats.total}
                </p>
                <span className="text-xs text-[#716B63] mt-0.5 block">
                  Total records
                </span>
              </div>

              {/* Confirmed */}
              <div
                onClick={() => navigate("/invoicing_user/purchase-orders")}
                className="bg-[#faf8f4] border border-[#ebe6dc] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-md rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150"
              >
                <span className="text-xs font-semibold text-[#3e5335] tracking-wider uppercase">
                  Confirmed
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-[#342921] mt-1.5">
                  {poStats.confirmed}
                </p>
                <span className="text-xs text-[#3e5335] mt-0.5 block">
                  Approved
                </span>
              </div>

              {/* Draft */}
              <div
                onClick={() => navigate("/invoicing_user/purchase-orders")}
                className="bg-[#faf8f4] border border-[#ebe6dc] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-md rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150"
              >
                <span className="text-xs font-semibold text-[#7c6352] tracking-wider uppercase">
                  Draft
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-[#68584b] mt-1.5">
                  {poStats.draft}
                </p>
                <span className="text-xs text-[#7c6352] mt-0.5 block">
                  Awaiting review
                </span>
              </div>

            </div>
          </div>

          {/* Card Footer Link */}
          <button
            type="button"
            onClick={() => navigate("/invoicing_user/purchase-orders")}
            className="mt-6 pt-3.5 border-t border-[#f0ece4] text-sm font-medium text-[#4a3b2f] hover:text-[#221c16] flex items-center justify-between cursor-pointer w-full transition hover:underline"
          >
            <span>Go to Purchase module</span>
            <ArrowRight size={15} />
          </button>
        </div>


        {/* ----------------- 3. BUDGET REPORTS CARD ----------------- */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_30px_rgba(45,35,27,0.1)] hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 flex flex-col justify-between group">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0ece4]">
              <div
                onClick={() => navigate("/invoicing_user/budget-reports")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#f5f2eb] text-[#342921] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                  <BarChart3 size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition">
                    Budget Reports
                  </h2>
                  <span className="text-xs text-[#716B63]">Budget Performance & Variance</span>
                </div>
              </div>

              {/* Prominent "Report" Button */}
              <button
                type="button"
                onClick={() => navigate("/invoicing_user/budget-reports")}
                className="bg-[#342921] text-white hover:bg-[#231b15] text-sm font-medium px-4 py-2 rounded-lg shadow-sm cursor-pointer transition flex items-center gap-1.5 hover:scale-102"
              >
                <span>Report</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Three Summary Blocks */}
            <div className="grid grid-cols-3 gap-3 mt-6">

              {/* Achieved: 3 */}
              <div
                onClick={() => navigate("/invoicing_user/budget-reports")}
                className="bg-[#faf8f4] border border-[#ebe6dc] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-md rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150"
              >
                <span className="text-xs font-semibold text-[#716B63] tracking-wider uppercase">
                  Achieved
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-[#211D19] mt-1.5">
                  3
                </p>
                <span className="text-xs text-[#716B63] mt-0.5 block">
                  Met targets
                </span>
              </div>

              {/* Budget: 2 */}
              <div
                onClick={() => navigate("/invoicing_user/budget-reports")}
                className="bg-[#faf8f4] border border-[#ebe6dc] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-md rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150"
              >
                <span className="text-xs font-semibold text-[#3e5335] tracking-wider uppercase">
                  Budget
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-[#342921] mt-1.5">
                  2
                </p>
                <span className="text-xs text-[#3e5335] mt-0.5 block">
                  Active lines
                </span>
              </div>

              {/* Committed: 4 */}
              <div
                onClick={() => navigate("/invoicing_user/budget-reports")}
                className="bg-[#faf8f4] border border-[#ebe6dc] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-md rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150"
              >
                <span className="text-xs font-semibold text-[#7c6352] tracking-wider uppercase">
                  Committed
                </span>
                <p className="text-2xl sm:text-3xl font-bold text-[#68584b] mt-1.5">
                  4
                </p>
                <span className="text-xs text-[#7c6352] mt-0.5 block">
                  Allocated
                </span>
              </div>

            </div>
          </div>

          {/* Card Footer Link */}
          <button
            type="button"
            onClick={() => navigate("/invoicing_user/budget-reports")}
            className="mt-6 pt-3.5 border-t border-[#f0ece4] text-sm font-medium text-[#4a3b2f] hover:text-[#221c16] flex items-center justify-between cursor-pointer w-full transition hover:underline"
          >
            <span>Open Budget Report</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>


      {/* ================= SECONDARY SECTION: RECENT ACCOUNTING ENTRIES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 pt-2">

        {/* Recent Invoices & Orders Table (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(45,35,27,0.08)] hover:-translate-y-0.5 hover:border-[#cfc6b6] transition-all duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-[#f0ece4]">
            <div>
              <h3 className="text-lg font-semibold text-[#211D19]">
                Recent Invoices & Purchase Orders
              </h3>
              <p className="text-xs text-[#716B63] mt-1">
                Latest accounting activities for Urban Furniture
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/invoicing_user/sale-invoices")}
              className="text-sm font-medium text-[#4a3b2f] hover:underline cursor-pointer"
            >
              View all invoices →
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#f0ece4] text-xs text-[#716B63] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3.5">DOCUMENT #</th>
                  <th className="py-3 px-3.5">PARTNER / CLIENT</th>
                  <th className="py-3 px-3.5">DATE</th>
                  <th className="py-3 px-3.5 text-right">AMOUNT</th>
                  <th className="py-3 px-3.5 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f2eb]">
                <tr className="hover:bg-[#faf8f4] transition cursor-pointer" onClick={() => navigate("/invoicing_user/sale-invoices")}>
                  <td className="py-3.5 px-3.5 font-semibold text-[#211D19]">INV-2025-012</td>
                  <td className="py-3.5 px-3.5 text-[#38332c]">The Grand Regal Hotel</td>
                  <td className="py-3.5 px-3.5 text-[#716B63]">04 Mar 2025</td>
                  <td className="py-3.5 px-3.5 text-right font-semibold text-[#211D19]">₹ 1,28,500</td>
                  <td className="py-3.5 px-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#eef3e8] text-[#3e5335] border border-[#d3dfca]">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#faf8f4] transition cursor-pointer" onClick={() => navigate("/invoicing_user/purchase-orders")}>
                  <td className="py-3.5 px-3.5 font-semibold text-[#211D19]">PO-2025-008</td>
                  <td className="py-3.5 px-3.5 text-[#38332c]">Timber & Oak Raw Supplies</td>
                  <td className="py-3.5 px-3.5 text-[#716B63]">03 Mar 2025</td>
                  <td className="py-3.5 px-3.5 text-right font-semibold text-[#211D19]">₹ 48,200</td>
                  <td className="py-3.5 px-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#eef3e8] text-[#3e5335] border border-[#d3dfca]">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#faf8f4] transition cursor-pointer" onClick={() => navigate("/invoicing_user/sale-invoices")}>
                  <td className="py-3.5 px-3.5 font-semibold text-[#211D19]">INV-2025-011</td>
                  <td className="py-3.5 px-3.5 text-[#38332c]">Prestige Modern Lofts</td>
                  <td className="py-3.5 px-3.5 text-[#716B63]">01 Mar 2025</td>
                  <td className="py-3.5 px-3.5 text-right font-semibold text-[#211D19]">₹ 45,000</td>
                  <td className="py-3.5 px-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#fcf5e8] text-[#7a5933] border border-[#ebd8bc]">
                      Draft
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#faf8f4] transition cursor-pointer" onClick={() => navigate("/invoicing_user/sale-invoices")}>
                  <td className="py-3.5 px-3.5 font-semibold text-[#211D19]">INV-2025-010</td>
                  <td className="py-3.5 px-3.5 text-[#38332c]">Studio Arch Interiors</td>
                  <td className="py-3.5 px-3.5 text-[#716B63]">28 Feb 2025</td>
                  <td className="py-3.5 px-3.5 text-right font-semibold text-[#211D19]">₹ 32,400</td>
                  <td className="py-3.5 px-3.5 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#eef3e8] text-[#3e5335] border border-[#d3dfca]">
                      Confirmed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Accounting Access (1 col) */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(45,35,27,0.08)] hover:-translate-y-0.5 hover:border-[#cfc6b6] transition-all duration-200 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#211D19] pb-4 border-b border-[#f0ece4]">
              Accounting Modules
            </h3>

            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => navigate("/invoicing_user/chart-of-accounts")}
                className="w-full p-3.5 rounded-xl border border-[#ebe6dc] bg-[#faf8f4] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-xs transition-all duration-150 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-[#211D19]">Chart of Accounts</p>
                  <p className="text-xs text-[#716B63] mt-0.5">Assets, Liabilities, Incomes & Expenses</p>
                </div>
                <ArrowRight size={15} className="text-[#68584b]" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/invoicing_user/journal-entries")}
                className="w-full p-3.5 rounded-xl border border-[#ebe6dc] bg-[#faf8f4] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-xs transition-all duration-150 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-[#211D19]">Journal Entries</p>
                  <p className="text-xs text-[#716B63] mt-0.5">General ledger debits and credits</p>
                </div>
                <ArrowRight size={15} className="text-[#68584b]" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/invoicing_user/balance-sheet")}
                className="w-full p-3.5 rounded-xl border border-[#ebe6dc] bg-[#faf8f4] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-xs transition-all duration-150 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-[#211D19]">Balance Sheet</p>
                  <p className="text-xs text-[#716B63] mt-0.5">Financial position & equity statement</p>
                </div>
                <ArrowRight size={15} className="text-[#68584b]" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/invoicing_user/profit-and-loss")}
                className="w-full p-3.5 rounded-xl border border-[#ebe6dc] bg-[#faf8f4] hover:border-[#bfaea0] hover:bg-white hover:-translate-y-0.5 hover:shadow-xs transition-all duration-150 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-[#211D19]">Profit and Loss</p>
                  <p className="text-xs text-[#716B63] mt-0.5">Income statement & margin performance</p>
                </div>
                <ArrowRight size={15} className="text-[#68584b]" />
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#f0ece4] flex items-center justify-between text-xs text-[#716B63]">
            <span>Role: Invoicing User / Accountant</span>
            <span className="font-semibold text-[#211D19]">Urban Furniture</span>
          </div>
        </div>

      </div>


      {/* ================= MODAL: QUICK NEW ENTRY ================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#e7e3da] shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ece4]">
              <h3 className="text-lg font-semibold text-[#211D19]">
                {activeModal === "sales" ? "New Sale Invoice" : "New Purchase Order"}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-lg text-[#716B63] hover:text-[#211D19] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1">
                  {activeModal === "sales" ? "Customer Name" : "Vendor Name"}
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.partner}
                  onChange={(e) => setModalForm({ ...modalForm, partner: e.target.value })}
                  placeholder={activeModal === "sales" ? "e.g. Prestige Modern Lofts" : "e.g. Timber & Oak Supplies"}
                  className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={modalForm.amount}
                  onChange={(e) => setModalForm({ ...modalForm, amount: e.target.value })}
                  placeholder="e.g. 45000"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1">
                  Reference / Description
                </label>
                <input
                  type="text"
                  value={modalForm.reference}
                  onChange={(e) => setModalForm({ ...modalForm, reference: e.target.value })}
                  placeholder="e.g. Custom Conference Tables"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#f0ece4]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-sm font-medium text-[#716B63] hover:text-[#211D19] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
                >
                  Create & Proceed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
