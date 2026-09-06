import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  BookOpen,
  ShoppingCart,
  Receipt,
  FileText,
  IndianRupee,
  WalletCards,
  LogOut,
} from "lucide-react";
import loginFurniture from "../../assets/login-furniture.png";

export function AdminSidebarContent({ onNavigate, onLogout }) {
  const navigate = useNavigate();

  const handleNav = () => {
    if (onNavigate) onNavigate();
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[16px] font-semibold transition ${
      isActive
        ? "bg-[#3e3228] text-white shadow-xs border-l-4 border-amber-400"
        : "text-white/85 hover:bg-white/10 hover:text-white"
    }`;

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-[15.5px] transition ${
      isActive
        ? "bg-[#3e3228] text-white font-semibold shadow-xs"
        : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
    }`;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header: URBAN FURNITURE in big bold typography */}
        <div
          onClick={() => {
            navigate("/admin");
            handleNav();
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

        {/* Navigation List with Increased Font Size */}
        <nav className="space-y-4">
          {/* 1. Dashboard */}
          <div>
            <NavLink to="/admin" end onClick={handleNav} className={linkClass}>
              <LayoutDashboard size={20} className="text-[#d4c5b5]" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* 2. MASTER DATA */}
          <div className="space-y-1.5">
            <span className="px-3 text-[13px] font-bold tracking-[2px] uppercase text-[#d8cbbf] block">
              MASTER DATA
            </span>
            <div className="space-y-1 pl-1">
              <NavLink to="/admin/users" onClick={handleNav} className={subLinkClass}>
                <Users size={18} className="text-[#d4c5b5]" />
                <span>Users</span>
              </NavLink>

              <NavLink to="/admin/contacts" onClick={handleNav} className={subLinkClass}>
                <Users size={18} className="text-[#d4c5b5]" />
                <span>Contacts</span>
              </NavLink>

              <NavLink to="/admin/products" onClick={handleNav} className={subLinkClass}>
                <Package size={18} className="text-[#d4c5b5]" />
                <span>Products</span>
              </NavLink>

              <NavLink to="/admin/accounts" onClick={handleNav} className={subLinkClass}>
                <BarChart3 size={18} className="text-[#d4c5b5]" />
                <span>Chart of Accounts</span>
              </NavLink>

              <NavLink to="/admin/journals" onClick={handleNav} className={subLinkClass}>
                <BookOpen size={18} className="text-[#d4c5b5]" />
                <span>Journals</span>
              </NavLink>
            </div>
          </div>

          {/* 3. PURCHASES */}
          <div className="space-y-1.5">
            <span className="px-3 text-[13px] font-bold tracking-[2px] uppercase text-[#d8cbbf] block">
              PURCHASES
            </span>
            <div className="space-y-1 pl-1">
              <NavLink to="/admin/purchase-orders" onClick={handleNav} className={subLinkClass}>
                <ShoppingCart size={18} className="text-[#d4c5b5]" />
                <span>Purchase Orders</span>
              </NavLink>

              <NavLink to="/admin/vendor-bills" onClick={handleNav} className={subLinkClass}>
                <Receipt size={18} className="text-[#d4c5b5]" />
                <span>Vendor Bills</span>
              </NavLink>
            </div>
          </div>

          {/* 4. SALES */}
          <div className="space-y-1.5">
            <span className="px-3 text-[13px] font-bold tracking-[2px] uppercase text-[#d8cbbf] block">
              SALES
            </span>
            <div className="space-y-1 pl-1">
              <NavLink to="/admin/sales-orders" onClick={handleNav} className={subLinkClass}>
                <FileText size={18} className="text-[#d4c5b5]" />
                <span>Sales Orders</span>
              </NavLink>

              <NavLink to="/admin/customer-invoices" onClick={handleNav} className={subLinkClass}>
                <FileText size={18} className="text-[#d4c5b5]" />
                <span>Customer Invoices</span>
              </NavLink>
            </div>
          </div>

          {/* 5. FINANCE & REPORTS */}
          <div className="space-y-1.5">
            <span className="px-3 text-[13px] font-bold tracking-[2px] uppercase text-[#d8cbbf] block">
              FINANCE & REPORTS
            </span>
            <div className="space-y-1 pl-1">
              <NavLink to="/admin/payments" onClick={handleNav} className={subLinkClass}>
                <IndianRupee size={18} className="text-[#d4c5b5]" />
                <span>Payments</span>
              </NavLink>

              <NavLink to="/admin/budgets" onClick={handleNav} className={subLinkClass}>
                <WalletCards size={18} className="text-[#d4c5b5]" />
                <span>Budgets</span>
              </NavLink>
            </div>
          </div>

          {/* 6. REPORT */}
          <div className="space-y-1.5">
            <span className="px-3 text-[13px] font-bold tracking-[2px] uppercase text-[#d8cbbf] block">
              REPORT
            </span>
            <div className="space-y-1 pl-1">
              <NavLink to="/admin/balance-sheet" onClick={handleNav} className={subLinkClass}>
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Balance Sheet</span>
              </NavLink>

              <NavLink to="/admin/profit-and-loss" onClick={handleNav} className={subLinkClass}>
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Profit and Loss</span>
              </NavLink>

              <NavLink to="/admin/budget-reports" onClick={handleNav} className={subLinkClass}>
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>Budget Reports</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      {/* Sidebar Bottom: Sign Out with larger font */}
      <div className="pt-5 mt-6 border-t border-white/15">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#342921]/90 hover:bg-[#251d17] text-white text-[15.5px] font-semibold transition cursor-pointer border border-white/10 shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="text-amber-200 group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </div>
          <span className="text-xs text-white/50 font-normal">Admin</span>
        </button>
      </div>
    </div>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside
      className="flex h-full w-[270px] flex-col overflow-y-auto bg-[#241e18] px-4 py-6 text-white border-r border-[#1a1511]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(36, 30, 24, 0.92), rgba(30, 24, 18, 0.88), rgba(20, 16, 12, 0.94)), url(${loginFurniture})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <AdminSidebarContent onNavigate={() => {}} onLogout={() => navigate("/login")} />
    </aside>
  );
}

export default Sidebar;