import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  FileText,
  Receipt,
  ShoppingCart,
  WalletCards,
  CheckCircle2,
  Clock,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { getPurchaseOrders } from "../../utils/storage";

function AdminDashboard() {
  const navigate = useNavigate();

  // Load purchase orders stats if available
  const purchaseOrders = useMemo(() => {
    try {
      return getPurchaseOrders();
    } catch {
      return [];
    }
  }, []);

  const poCount = purchaseOrders.length;
  const poConfirmed = purchaseOrders.filter((p) => p.status === "Confirmed").length;

  return (
    <div className="w-full space-y-7">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e7e3da]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#211D19] tracking-tight">
            Administrator Overview
          </h1>
          <p className="text-sm text-[#716B63] mt-0.5">
            Enterprise accounting, master data management, and operational analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#e7e3da] text-xs font-semibold text-[#5c5245] hover:text-[#211D19] hover:bg-[#faf8f4] transition shadow-2xs cursor-pointer"
          >
            <Users size={15} />
            <span>Manage Users</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/sales-orders")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#342921] hover:bg-[#251d17] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* ================= 4 FINANCIAL KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Sales */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:border-[#cfc6b6] transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider">
              Total Sales
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#faf8f4] border border-[#e7e3da] flex items-center justify-center text-[#342921]">
              <FileText size={17} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-[#211D19]">₹ 4,82,500</h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-700 font-medium">
              <TrendingUp size={13} />
              <span>+12.5% from last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Purchases */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:border-[#cfc6b6] transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider">
              Total Purchases
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#faf8f4] border border-[#e7e3da] flex items-center justify-center text-[#342921]">
              <ShoppingCart size={17} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-[#211D19]">₹ 2,64,800</h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-800 font-medium">
              <TrendingDown size={13} />
              <span>+8.2% cost variance</span>
            </div>
          </div>
        </div>

        {/* Card 3: Outstanding Invoices */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:border-[#cfc6b6] transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-[#716B63] tracking-wider">
              Outstanding Invoices
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#faf8f4] border border-[#e7e3da] flex items-center justify-center text-[#342921]">
              <Receipt size={17} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-[#211D19]">₹ 1,28,450</h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#716B63]">
              <Clock size={13} />
              <span>18 customer invoices pending</span>
            </div>
          </div>
        </div>

        {/* Card 4: Net Operating Profit */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs hover:border-[#cfc6b6] transition flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider">
              Net Profit
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <BarChart3 size={17} />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-emerald-700">₹ 2,17,700</h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-700 font-medium">
              <TrendingUp size={13} />
              <span>+15.4% operating margin</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3 MAJOR MODULE CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. SALES MODULE CARD */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs hover:border-[#cfc6b6] transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#f0ece4]">
              <div
                onClick={() => navigate("/admin/sales-orders")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#faf8f4] text-[#342921] border border-[#e7e3da] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                  <FileText size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#211D19] group-hover:text-[#342921] transition">
                    Sales
                  </h2>
                  <span className="text-xs text-[#716B63]">Customer Billings & Orders</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/sales-orders")}
                className="bg-[#342921] text-white hover:bg-[#251d17] text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#716B63]">Confirmed Orders</span>
                <span className="font-semibold text-[#211D19]">24 orders</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#716B63]">Active Quotations</span>
                <span className="font-semibold text-[#211D19]">7 pending</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#716B63]">Invoiced Rate</span>
                <span className="font-bold text-emerald-700">82.4%</span>
              </div>

              <div className="w-full bg-[#f0ece4] h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-[#342921] h-full rounded-full" style={{ width: "82.4%" }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#f0ece4] flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/admin/customer-invoices")}
              className="text-xs font-semibold text-[#342921] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Customer Invoices</span>
              <ArrowRight size={13} />
            </button>
            <span className="text-xs text-[#716B63]">₹ 4,82,500</span>
          </div>
        </div>

        {/* 2. PURCHASES MODULE CARD */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs hover:border-[#cfc6b6] transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#f0ece4]">
              <div
                onClick={() => navigate("/admin/purchase-orders")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#faf8f4] text-[#342921] border border-[#e7e3da] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                  <ShoppingCart size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#211D19] group-hover:text-[#342921] transition">
                    Purchases
                  </h2>
                  <span className="text-xs text-[#716B63]">Vendor Orders & Bills</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/purchase-orders")}
                className="bg-[#342921] text-white hover:bg-[#251d17] text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#716B63]">Total POs</span>
                <span className="font-semibold text-[#211D19]">{poCount || 16} POs</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#716B63]">Confirmed POs</span>
                <span className="font-semibold text-[#211D19]">{poConfirmed || 11} confirmed</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#716B63]">Billed Commitment</span>
                <span className="font-bold text-amber-800">68.5%</span>
              </div>

              <div className="w-full bg-[#f0ece4] h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-[#342921] h-full rounded-full" style={{ width: "68.5%" }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#f0ece4] flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/admin/vendor-bills")}
              className="text-xs font-semibold text-[#342921] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Vendor Bills</span>
              <ArrowRight size={13} />
            </button>
            <span className="text-xs text-[#716B63]">₹ 2,64,800</span>
          </div>
        </div>

        {/* 3. MASTER DATA & SYSTEM CARD */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs hover:border-[#cfc6b6] transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#f0ece4]">
              <div
                onClick={() => navigate("/admin/users")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#faf8f4] text-[#342921] border border-[#e7e3da] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#211D19] group-hover:text-[#342921] transition">
                    System Control
                  </h2>
                  <span className="text-xs text-[#716B63]">Access & Configuration</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="bg-[#342921] text-white hover:bg-[#251d17] text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>User</span>
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#716B63]">Master Users</span>
                <span className="font-semibold text-[#211D19]">4 active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#716B63]">System Contacts</span>
                <span className="font-semibold text-[#211D19]">58 contacts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#716B63]">Product Catalog</span>
                <span className="font-semibold text-[#211D19]">42 items</span>
              </div>

              <div className="w-full bg-[#f0ece4] h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: "95%" }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#f0ece4] flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/admin/budgets")}
              className="text-xs font-semibold text-[#342921] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Budget Reports</span>
              <ArrowRight size={13} />
            </button>
            <span className="text-xs text-[#716B63]">Live Budgets</span>
          </div>
        </div>
      </div>

      {/* ================= RECENT ACTIVITY SECTION ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e7e3da]">
          <div>
            <h3 className="text-base font-bold text-[#211D19] tracking-tight">
              Recent Enterprise Transactions
            </h3>
            <p className="text-xs text-[#716B63]">
              Audit trail and recent accounting activity logs
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/reports")}
            className="text-xs font-semibold text-[#342921] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Ledger</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="divide-y divide-[#f0ece4]">
          <div className="flex items-center justify-between py-3.5 hover:bg-[#faf8f4]/60 px-2 rounded-xl transition">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                SO
              </div>
              <div>
                <p className="text-sm font-semibold text-[#211D19]">
                  Sales Invoice #INV-1024 • Open Wood Furnishings
                </p>
                <p className="text-xs text-[#716B63]">Tax invoice generated and ledger synced</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-700">+ ₹24,500</span>
              <span className="block text-[11px] text-[#716B63]">Paid via Bank</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3.5 hover:bg-[#faf8f4]/60 px-2 rounded-xl transition">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs">
                PO
              </div>
              <div>
                <p className="text-sm font-semibold text-[#211D19]">
                  Vendor Bill #BILL-2041 • Joey Wills Timber Depot
                </p>
                <p className="text-xs text-[#716B63]">Raw wood materials consignment received</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#342921]">- ₹18,200</span>
              <span className="block text-[11px] text-amber-800 font-medium">Pending clearance</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3.5 hover:bg-[#faf8f4]/60 px-2 rounded-xl transition">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center font-bold text-xs">
                GL
              </div>
              <div>
                <p className="text-sm font-semibold text-[#211D19]">
                  Journal Entry #JE/2026/048 • Quarterly Depreciation
                </p>
                <p className="text-xs text-[#716B63]">Machinery and tools depreciation entry</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#211D19]">₹ 45,000</span>
              <span className="block text-[11px] text-emerald-700 font-medium">Balanced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;