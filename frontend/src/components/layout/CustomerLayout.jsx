import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  CreditCard
} from "lucide-react";
import loginFurniture from "../../assets/login-furniture.png";

function CustomerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopSidebarOpen((prev) => !prev);
    }
  };

  const sidebarStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(36, 30, 24, 0.92), rgba(30, 24, 18, 0.88), rgba(20, 16, 12, 0.94)), url(${loginFurniture})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex text-[#24201a] overflow-x-hidden w-full max-w-[100vw] print:bg-white">
      {/* ================= FIXED DESKTOP SIDEBAR ================= */}
      <aside
        className={`hidden md:flex flex-col justify-between fixed left-0 top-0 bottom-0 w-[270px] bg-[#241e18] text-white overflow-y-auto border-r border-[#1a1511] z-30 px-4 py-6 transition-all duration-300 ease-in-out print:hidden ${
          desktopSidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 pointer-events-none"
        }`}
        style={sidebarStyle}
      >
        <SidebarContent onNavigate={() => {}} onLogout={handleLogout} />
      </aside>

      {/* ================= MOBILE DRAWER BACKDROP ================= */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs print:hidden"
        />
      )}

      {/* ================= MOBILE SLIDE-OVER SIDEBAR ================= */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[280px] bg-[#241e18] text-white z-50 transform transition-transform duration-200 ease-in-out md:hidden flex flex-col justify-between px-4 py-6 overflow-y-auto print:hidden ${
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
      <div
        className={`flex-1 min-w-0 max-w-full min-h-screen flex flex-col transition-all duration-300 ease-in-out print:m-0 print:p-0 ${
          desktopSidebarOpen ? "md:ml-[270px]" : "md:ml-0"
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-gradient-to-r from-[#2a1a0f] via-[#382315] to-[#26170d] border-b border-[#432a1a] px-4 sm:px-8 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.22)] text-[#f7f1ea] print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-xl border border-[#482d1b] bg-[#362113] text-white hover:bg-[#482d1b] hover:border-[#5a3922] flex items-center justify-center cursor-pointer transition shadow-xs group"
              title={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} className="group-hover:scale-105 transition-transform" />
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
                  Customer
                </span>
              </div>
            </div>
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

function SidebarContent({ onNavigate, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div
          onClick={() => {
            navigate("/customer");
            onNavigate();
          }}
          className="pb-5 mb-5 border-b border-white/15 cursor-pointer select-none group"
        >
          <h1 className="text-[28px] font-black tracking-[4px] text-white leading-none">
            URBAN
          </h1>
          <h1 className="text-[28px] font-black tracking-[4px] text-white leading-none mt-1.5">
            FURNITURE
          </h1>
        </div>

        <nav className="space-y-5">
          <div>
            <NavLink
              to="/customer"
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

          <div className="space-y-2">
            <div className="px-3 text-[13px] font-bold text-[#d8cbbf] tracking-[2px] uppercase">
              PORTAL
            </div>
            <div className="space-y-1 pl-1">
              <NavLink
                to="/customer/sales-orders"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <FileText size={18} className="text-[#d4c5b5]" />
                <span>My Sales Orders</span>
              </NavLink>

              <NavLink
                to="/customer/invoices"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15.5px] transition ${
                    isActive
                      ? "bg-[#3e3228] text-white font-semibold shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`
                }
              >
                <CreditCard size={18} className="text-[#d4c5b5]" />
                <span>My Invoices</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

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

export default CustomerLayout;
