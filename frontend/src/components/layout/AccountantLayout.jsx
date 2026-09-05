import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";

function AccountantLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex text-[#24201a]">

      {/* ================= FIXED DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col justify-between fixed left-0 top-0 bottom-0 w-[270px] bg-[#241e18] text-white overflow-y-auto border-r border-[#1a1511] z-30 px-4 py-6">
        <SidebarContent onNavigate={() => {}} onLogout={handleLogout} />
      </aside>

      {/* ================= MOBILE DRAWER BACKDROP ================= */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
        />
      )}

      {/* ================= MOBILE SLIDE-OVER SIDEBAR ================= */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[280px] bg-[#241e18] text-white z-50 transform transition-transform duration-200 ease-in-out md:hidden flex flex-col justify-between px-4 py-6 overflow-y-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
          <span className="text-xs font-semibold text-amber-100/90 tracking-wider uppercase">
            Navigation Menu
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-white/70 hover:text-white p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent
          onNavigate={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </div>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 md:ml-[270px] min-h-screen flex flex-col">

        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#e7e3da] px-4 sm:px-8 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Mobile hamburger button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-[#24201a] cursor-pointer"
              title="Open Navigation"
            >
              <Menu size={18} />
            </button>

            {/* Context breadcrumb / info */}
            <div className="flex items-center gap-2 text-sm text-[#7a7065]">
              <span className="font-semibold text-[#24201a]">Urban Furniture</span>
              <span className="text-[#bbb3a7]">/</span>
              <span>Accounting System</span>
            </div>
          </div>

          {/* Right: User Information & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-left">
              <div className="w-8 h-8 rounded-full bg-[#342921] text-white flex items-center justify-center font-medium text-xs">
                <User size={14} />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold text-[#24201a] leading-tight">
                  Accountant
                </span>
                <span className="text-xs text-[#7a7065] leading-tight">
                  Invoicing User
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e7e3da] text-sm font-medium text-[#6e6357] hover:text-[#24201a] hover:bg-[#f3efe7] transition cursor-pointer"
              title="Logout"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Workspace content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

/* ================= REUSABLE SIDEBAR CONTENT ================= */

function SidebarContent({ onNavigate, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-full justify-between">

      <div>
        {/* Brand Header */}
        <div
          onClick={() => {
            navigate("/invoicing_user");
            onNavigate();
          }}
          className="pb-5 mb-4 border-b border-white/10 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3a2f26] border border-[#524438] text-amber-100 flex items-center justify-center text-lg font-light shadow-xs group-hover:bg-[#4a3c31] transition">
              ♧
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-white leading-tight">
                URBAN FURNITURE
              </h2>
              <p className="text-[8.5px] font-medium tracking-[0.18em] text-[#a49688] leading-tight mt-0.5">
                ACCOUNTING SYSTEM
              </p>
            </div>
          </div>

          <div className="mt-2.5">
            <span className="text-[9.5px] tracking-wider font-semibold text-amber-200/90 bg-amber-950/60 border border-amber-500/25 px-2 py-0.5 rounded">
              INVOICING USER
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-4 text-sm font-medium">

          {/* 1. Dashboard */}
          <div>
            <NavLink
              to="/invoicing_user"
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium transition ${
                  isActive
                    ? "bg-[#3e3228] text-white font-semibold shadow-xs border-l-2 border-amber-300"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <LayoutDashboard size={17} className="text-[#a49688]" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* 2. SALES */}
          <div className="space-y-1">
            <NavLink
              to="/invoicing_user/bills"
              onClick={onNavigate}
              className={({ isActive }) =>
                `px-3 text-[10px] font-semibold tracking-[1.5px] uppercase flex items-center justify-between cursor-pointer transition ${
                  isActive || isCurrent("/invoicing_user/sales") || isCurrent("/invoicing_user/bills")
                    ? "text-amber-200"
                    : "text-[#8f8274] hover:text-white"
                }`
              }
            >
              <span>SALES</span>
            </NavLink>
            <div className="space-y-0.5 pl-1">
              <NavLink
                to="/invoicing_user/sales-orders"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Sales Order</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/sale-invoices"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive || isCurrent("/invoicing_user/invoices")
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Sale Invoice</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/bills"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive || isCurrent("/invoicing_user/customer-bills")
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Bills</span>
              </NavLink>
            </div>
          </div>

          {/* 3. PURCHASE */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-semibold text-[#8f8274] tracking-[1.5px] uppercase">
              PURCHASE
            </div>
            <div className="space-y-0.5 pl-1">
              <NavLink
                to="/invoicing_user/purchase-orders"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Purchase Order</span>
              </NavLink>
            </div>
          </div>

          {/* 4. ACCOUNT */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-semibold text-[#8f8274] tracking-[1.5px] uppercase">
              ACCOUNT
            </div>
            <div className="space-y-0.5 pl-1">
              <NavLink
                to="/invoicing_user/contacts"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Contact</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/products"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Product</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/chart-of-accounts"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Chart of Account</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/journals"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Journals</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/journal-entries"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Journal Entries</span>
              </NavLink>
            </div>
          </div>

          {/* 5. REPORT */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-semibold text-[#8f8274] tracking-[1.5px] uppercase">
              REPORT
            </div>
            <div className="space-y-0.5 pl-1">
              <NavLink
                to="/invoicing_user/balance-sheet"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Balance Sheet</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/profit-and-loss"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Profit and Loss</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/budget-reports"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive || isCurrent("/invoicing_user/reports")
                      ? "bg-[#3e3228] text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                <span>Budget Report</span>
              </NavLink>
            </div>
          </div>

        </nav>
      </div>

      {/* Sidebar Bottom: Sign Out */}
      <div className="pt-4 mt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
}

export default AccountantLayout;
