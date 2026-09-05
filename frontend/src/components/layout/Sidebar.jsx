import { NavLink } from "react-router-dom";
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
  ChevronRight,
} from "lucide-react";

function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex min-h-12 items-center justify-between rounded-lg px-4 text-sm transition ${
      isActive
        ? "bg-[#E9E2D6] text-[#30261F]"
        : "text-white/80 hover:bg-[#403329] hover:text-white"
    }`;

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col overflow-y-auto bg-[#30261F] px-[18px] py-[35px] text-white">

      {/* Logo */}
      <div className="mb-10 px-[18px]">
        <h2 className="text-[22px] font-medium leading-tight tracking-[4px]">
          URBAN
        </h2>

        <h2 className="text-[22px] font-medium leading-tight tracking-[4px]">
          FURNITURE
        </h2>

        <p className="mt-2 text-[9px] tracking-[1.5px] text-white/60">
          ACCOUNTING SYSTEM
        </p>
      </div>

      <nav className="flex flex-col gap-1">

        {/* Dashboard */}
        <NavLink to="/admin" end className={linkClass}>
          <div className="flex items-center gap-4">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </div>
        </NavLink>


        {/* Master Data */}
        <div className="mb-2 mt-6 px-4 text-[10px] tracking-[1.5px] text-white/45">
          MASTER DATA
        </div>

        <NavLink to="/admin/users" className={linkClass}>
          <div className="flex items-center gap-4">
            <Users size={19} />
            <span>Users</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

        <NavLink to="/admin/contacts" className={linkClass}>
          <div className="flex items-center gap-4">
            <Users size={19} />
            <span>Contacts</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

        <NavLink to="/admin/products" className={linkClass}>
          <div className="flex items-center gap-4">
            <Package size={19} />
            <span>Products</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

        <NavLink to="/admin/accounts" className={linkClass}>
          <div className="flex items-center gap-4">
            <BarChart3 size={19} />
            <span>Chart of Accounts</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

        <NavLink to="/admin/journals" className={linkClass}>
          <div className="flex items-center gap-4">
            <BookOpen size={19} />
            <span>Journals</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>


        {/* Transactions */}
        <div className="mb-2 mt-6 px-4 text-[10px] tracking-[1.5px] text-white/45">
          TRANSACTIONS
        </div>

        <NavLink to="/admin/purchase-orders" className={linkClass}>
          <div className="flex items-center gap-4">
            <ShoppingCart size={19} />
            <span>Purchase Orders</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

        <NavLink to="/admin/vendor-bills" className={linkClass}>
          <div className="flex items-center gap-4">
            <Receipt size={19} />
            <span>Vendor Bills</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

        <NavLink to="/admin/sales-orders" className={linkClass}>
          <div className="flex items-center gap-4">
            <FileText size={19} />
            <span>Sales Orders</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

        <NavLink to="/admin/invoices" className={linkClass}>
          <div className="flex items-center gap-4">
            <FileText size={19} />
            <span>Customer Invoices</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

        <NavLink to="/admin/payments" className={linkClass}>
          <div className="flex items-center gap-4">
            <IndianRupee size={19} />
            <span>Payments</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>


        {/* Finance */}
        <div className="mb-2 mt-6 px-4 text-[10px] tracking-[1.5px] text-white/45">
          FINANCE
        </div>

        <NavLink to="/admin/budgets" className={linkClass}>
          <div className="flex items-center gap-4">
            <WalletCards size={19} />
            <span>Budgets</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

        <NavLink to="/admin/reports" className={linkClass}>
          <div className="flex items-center gap-4">
            <BarChart3 size={19} />
            <span>Reports</span>
          </div>

          <ChevronRight size={16} />
        </NavLink>

      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 pt-10">
        <div className="border-t border-white/10 pt-5">
          <p className="text-[11px] text-white/40">
            © 2026 Urban Furniture
          </p>

          <p className="mt-1 text-[10px] text-white/25">
            Accounting System
          </p>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;