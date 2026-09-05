import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";
import loginFurniture from "../../assets/login-furniture.png";

function AccountantLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/login");
  };

  const sidebarStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(36, 30, 24, 0.92), rgba(30, 24, 18, 0.88), rgba(20, 16, 12, 0.94)), url(${loginFurniture})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex text-[#24201a] overflow-x-hidden w-full max-w-[100vw]">

      {/* ================= FIXED DESKTOP SIDEBAR ================= */}
      <aside
        className="hidden md:flex flex-col justify-between fixed left-0 top-0 bottom-0 w-[270px] bg-[#241e18] text-white overflow-y-auto border-r border-[#1a1511] z-30 px-4 py-6"
        style={sidebarStyle}
      >
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
        style={sidebarStyle}
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
      <div className="flex-1 min-w-0 max-w-full md:ml-[270px] min-h-screen flex flex-col">

        {/* Top Header Bar - Slightly Darker Rich Wood Finish */}
        <header className="sticky top-0 z-20 h-16 bg-gradient-to-r from-[#2a1a0f] via-[#382315] to-[#26170d] border-b border-[#432a1a] px-4 sm:px-8 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.22)] text-[#f7f1ea]">
          {/* Mobile hamburger button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl border border-[#482d1b] bg-[#362113] text-white hover:bg-[#482d1b] flex items-center justify-center cursor-pointer transition shadow-xs"
              title="Open Navigation"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Right: User Information & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-[#482d1b] bg-[#362113]/95 text-left shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#482d1b] text-white flex items-center justify-center font-medium text-xs border border-white/25 shadow-xs">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden sm:flex items-center pr-1">
                <span className="text-sm font-semibold text-white leading-tight">
                  Accountant
                </span>
              </div>
            </div>

            {/* Logout icon inside box without text */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl border border-[#482d1b] bg-[#362113] text-white hover:bg-[#482d1b] hover:border-[#5a3922] transition cursor-pointer shadow-xs flex items-center justify-center group"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </header>

        {/* Workspace content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
        {/* Brand Header: URBAN COMPANY in big bold typography without logo or yellow box */}
        <div
          onClick={() => {
            navigate("/invoicing_user");
            onNavigate();
          }}
          className="pb-5 mb-5 border-b border-white/15 cursor-pointer select-none group"
        >
          <h1 className="text-[28px] font-black tracking-[4px] text-white leading-none">
            URBAN
          </h1>
          <h1 className="text-[28px] font-black tracking-[4px] text-white leading-none mt-1.5">
            COMPANY
          </h1>
        </div>

        {/* Navigation List with Increased Font Size */}
        <nav className="space-y-5">

          {/* 1. Dashboard */}
          <div>
            <NavLink
              to="/invoicing_user"
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[16px] font-semibold transition ${
                  isActive
                    ? "bg-[#3e3228] text-white shadow-xs border-l-4 border-amber-400"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <LayoutDashboard size={20} className="text-[#d4c5b5]" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* 2. SALES */}
          <div className="space-y-2">
            <NavLink
              to="/invoicing_user/bills"
              onClick={onNavigate}
              className={({ isActive }) =>
                `px-3 text-[13px] font-bold tracking-[2px] uppercase flex items-center justify-between cursor-pointer transition ${
                  isActive || isCurrent("/invoicing_user/sales") || isCurrent("/invoicing_user/bills")
                    ? "text-amber-200"
                    : "text-[#d8cbbf] hover:text-white"
                }`
              }
            >
              <span>SALES</span>
            </NavLink>
            <div className="space-y-1 pl-1">
              <NavLink
                to="/invoicing_user/sales-orders"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Sales Order</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/sale-invoices"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive || isCurrent("/invoicing_user/invoices")
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Sale Invoice</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/customer-bills"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive || isCurrent("/invoicing_user/invoices")
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Customer Invoices</span>
              </NavLink>
            </div>
          </div>

          {/* 3. PURCHASE */}
          <div className="space-y-2">
            <div className="px-3 text-[13px] font-bold text-[#d8cbbf] tracking-[2px] uppercase">
              PURCHASE
            </div>
            <div className="space-y-1 pl-1">
              <NavLink
                to="/invoicing_user/purchase-orders"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Purchase Order</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/bills"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive || isCurrent("/invoicing_user/vendor-bills")
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Vendor Bills</span>
              </NavLink>
            </div>
          </div>

          {/* 4. ACCOUNT */}
          <div className="space-y-2">
            <div className="px-3 text-[13px] font-bold text-[#d8cbbf] tracking-[2px] uppercase">
              ACCOUNT
            </div>
            <div className="space-y-1 pl-1">
              <NavLink
                to="/invoicing_user/contacts"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Contact</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/products"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Product</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/chart-of-accounts"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Chart of Account</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/journals"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Journals</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/journal-entries"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Journal Entries</span>
              </NavLink>
            </div>
          </div>

          {/* 5. REPORT */}
          <div className="space-y-2">
            <div className="px-3 text-[13px] font-bold text-[#d8cbbf] tracking-[2px] uppercase">
              REPORT
            </div>
            <div className="space-y-1 pl-1">
              <NavLink
                to="/invoicing_user/balance-sheet"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Balance Sheet</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/profit-and-loss"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Profit and Loss</span>
              </NavLink>

              <NavLink
                to="/invoicing_user/budget-reports"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive || isCurrent("/invoicing_user/reports")
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Budget Reports</span>
              </NavLink>
            </div>
          </div>

        </nav>
      </div>

      {/* Sidebar Bottom: Sign Out with larger font */}
      <div className="pt-4 mt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[16px] font-semibold text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default AccountantLayout;
