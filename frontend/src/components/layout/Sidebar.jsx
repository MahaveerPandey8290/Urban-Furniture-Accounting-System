import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>URBAN</h2>
        <h2>FURNITURE</h2>
        <p>ACCOUNTING SYSTEM</p>
      </div>

      <nav className="sidebar-nav">

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span>⌂</span>
          Dashboard
        </NavLink>

        <div className="nav-section">
          MASTER DATA
        </div>

        <NavLink to="/admin/contacts" className="nav-item">
          <span>◉</span>
          Contacts
        </NavLink>

        <NavLink to="/admin/products" className="nav-item">
          <span>▣</span>
          Products
        </NavLink>

        <NavLink to="/admin/accounts" className="nav-item">
          <span>▤</span>
          Chart of Accounts
        </NavLink>

        <NavLink to="/admin/journals" className="nav-item">
          <span>≡</span>
          Journals
        </NavLink>

        <div className="nav-section">
          TRANSACTIONS
        </div>

        <NavLink to="/admin/purchase-orders" className="nav-item">
          <span>◫</span>
          Purchase Orders
        </NavLink>

        <NavLink to="/admin/vendor-bills" className="nav-item">
          <span>▤</span>
          Vendor Bills
        </NavLink>

        <NavLink to="/admin/sales-orders" className="nav-item">
          <span>◫</span>
          Sales Orders
        </NavLink>

        <NavLink to="/admin/invoices" className="nav-item">
          <span>▤</span>
          Customer Invoices
        </NavLink>

        <NavLink to="/admin/payments" className="nav-item">
          <span>₹</span>
          Payments
        </NavLink>

        <div className="nav-section">
          FINANCE
        </div>

        <NavLink to="/admin/budgets" className="nav-item">
          <span>▥</span>
          Budgets
        </NavLink>

        <NavLink to="/admin/reports" className="nav-item">
          <span>▥</span>
          Reports
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;