import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// Admin layout and pages
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminContacts from "../pages/admin/Contacts";
import AdminProducts from "../pages/admin/Products";
import AdminChartOfAccounts from "../pages/admin/ChartOfAccounts";
import AdminJournals from "../pages/admin/Journals";
import AdminPurchaseOrders from "../pages/admin/PurchaseOrders";
import AdminVendorBills from "../pages/admin/VendorBills";
import AdminSalesOrders from "../pages/admin/SalesOrders";
import AdminPayments from "../pages/admin/Payments";
import AdminBudgets from "../pages/admin/Budgets";
import AdminReports from "../pages/admin/Reports";
import AdminCustomerInvoices from "../pages/admin/CustomerInvoices";

// Accountant layout and pages
import AccountantLayout from "../components/layout/AccountantLayout";
import AccountantDashboard from "../pages/invoicing_user/Dashboard";
import AccountantSalesOrders from "../pages/invoicing_user/SalesOrders";
import SaleInvoices from "../pages/invoicing_user/SaleInvoices";
import Invoices from "../pages/invoicing_user/Invoices";
import Bills from "../pages/invoicing_user/Bills";
import AccountantPurchaseOrders from "../pages/invoicing_user/PurchaseOrders";
import AccountantContacts from "../pages/invoicing_user/Contacts";
import AccountantProducts from "../pages/invoicing_user/Products";
import AccountantChartOfAccounts from "../pages/invoicing_user/ChartOfAccounts";
import AccountantJournals from "../pages/invoicing_user/Journals";
import JournalEntries from "../pages/invoicing_user/JournalEntries";
import BalanceSheet from "../pages/invoicing_user/BalanceSheet";
import ProfitAndLoss from "../pages/invoicing_user/ProfitAndLoss";
import BudgetReport from "../pages/invoicing_user/BudgetReport";

function AppRoutes() {
  return (
    <Routes>

      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Admin panel — requires ADMIN role */}
      <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="accounts" element={<AdminChartOfAccounts />} />
          <Route path="journals" element={<AdminJournals />} />
          <Route path="purchase-orders" element={<AdminPurchaseOrders />} />
          <Route path="vendor-bills" element={<AdminVendorBills />} />
          <Route path="sales-orders" element={<AdminSalesOrders />} />
          <Route path="invoices" element={<AdminCustomerInvoices />} />
          <Route path="customer-invoices" element={<AdminCustomerInvoices />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="budgets" element={<AdminBudgets />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Accountant / Invoicing User panel — requires ACCOUNTANT or CONTACT role */}
      <Route element={<ProtectedRoute roles={["ACCOUNTANT", "CONTACT"]} />}>
        <Route path="/invoicing_user" element={<AccountantLayout />}>
          <Route index element={<AccountantDashboard />} />
          <Route path="sales-orders" element={<AccountantSalesOrders />} />
          <Route path="sale-invoices" element={<SaleInvoices />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="sales" element={<SaleInvoices />} />
          <Route path="purchase-orders" element={<AccountantPurchaseOrders />} />
          <Route path="bills" element={<Bills />} />
          <Route path="vendor-bills" element={<Bills />} />
          <Route path="contacts" element={<AccountantContacts />} />
          <Route path="products" element={<AccountantProducts />} />
          <Route path="chart-of-accounts" element={<AccountantChartOfAccounts />} />
          <Route path="journals" element={<AccountantJournals />} />
          <Route path="journal-entries" element={<JournalEntries />} />
          <Route path="balance-sheet" element={<BalanceSheet />} />
          <Route path="profit-and-loss" element={<ProfitAndLoss />} />
          <Route path="budget-reports" element={<BudgetReport />} />
          <Route path="reports" element={<BudgetReport />} />
        </Route>

        {/* Hyphenated alias /invoicing-user */}
        <Route path="/invoicing-user" element={<AccountantLayout />}>
          <Route index element={<AccountantDashboard />} />
          <Route path="sales-orders" element={<AccountantSalesOrders />} />
          <Route path="sale-invoices" element={<SaleInvoices />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="sales" element={<SaleInvoices />} />
          <Route path="purchase-orders" element={<AccountantPurchaseOrders />} />
          <Route path="bills" element={<Bills />} />
          <Route path="vendor-bills" element={<Bills />} />
          <Route path="contacts" element={<AccountantContacts />} />
          <Route path="products" element={<AccountantProducts />} />
          <Route path="chart-of-accounts" element={<AccountantChartOfAccounts />} />
          <Route path="journals" element={<AccountantJournals />} />
          <Route path="journal-entries" element={<JournalEntries />} />
          <Route path="balance-sheet" element={<BalanceSheet />} />
          <Route path="profit-and-loss" element={<ProfitAndLoss />} />
          <Route path="budget-reports" element={<BudgetReport />} />
          <Route path="reports" element={<BudgetReport />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default AppRoutes;
