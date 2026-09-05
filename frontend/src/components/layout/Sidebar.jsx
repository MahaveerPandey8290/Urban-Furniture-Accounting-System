import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[280px] overflow-y-auto bg-brown-dark px-[18px] py-[35px] text-white">

      {/* Logo */}
      <div className="mb-11 px-[18px]">

        <h2 className="text-[22px] font-medium tracking-[4px] leading-tight">
          URBAN
        </h2>

        <h2 className="text-[22px] font-medium tracking-[4px] leading-tight">
          FURNITURE
        </h2>

        <p className="mt-2 text-[9px] tracking-[1.5px] opacity-65">
          ACCOUNTING SYSTEM
        </p>

      </div>


      {/* Navigation */}
      <nav className="flex flex-col gap-1">


        {/* Dashboard */}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm transition ${
              isActive
                ? "bg-beige text-brown-dark"
                : "text-white/80 hover:bg-brown-light hover:text-white"
            }`
          }
        >
          <span className="w-[22px] text-center text-lg">
            ⌂
          </span>

          Dashboard
        </NavLink>


        {/* Master Data */}
        <div className="mb-2 mt-6 px-[18px] text-[10px] tracking-[1.5px] text-white/45">
          MASTER DATA
        </div>


        <NavLink
          to="/admin/contacts"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">◉</span>
          Contacts
        </NavLink>


        <NavLink
          to="/admin/products"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">▣</span>
          Products
        </NavLink>


        <NavLink
          to="/admin/accounts"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">▤</span>
          Chart of Accounts
        </NavLink>


        <NavLink
          to="/admin/journals"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">≡</span>
          Journals
        </NavLink>


        {/* Transactions */}
        <div className="mb-2 mt-6 px-[18px] text-[10px] tracking-[1.5px] text-white/45">
          TRANSACTIONS
        </div>


        <NavLink
          to="/admin/purchase-orders"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">◫</span>
          Purchase Orders
        </NavLink>


        <NavLink
          to="/admin/vendor-bills"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">▤</span>
          Vendor Bills
        </NavLink>


        <NavLink
          to="/admin/sales-orders"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">◫</span>
          Sales Orders
        </NavLink>


        <NavLink
          to="/admin/invoices"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">▤</span>
          Customer Invoices
        </NavLink>


        <NavLink
          to="/admin/payments"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">₹</span>
          Payments
        </NavLink>


        {/* Finance */}
        <div className="mb-2 mt-6 px-[18px] text-[10px] tracking-[1.5px] text-white/45">
          FINANCE
        </div>


        <NavLink
          to="/admin/budgets"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">▥</span>
          Budgets
        </NavLink>


        <NavLink
          to="/admin/reports"
          className="flex min-h-12 items-center gap-[15px] rounded-lg px-[18px] text-sm text-white/80 transition hover:bg-brown-light hover:text-white"
        >
          <span className="w-[22px] text-center">▥</span>
          Reports
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;