import { Routes, Route } from "react-router-dom";

// =====================================================
// ADMIN
// =====================================================

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

// =====================================================
// AUTHENTICATION
// =====================================================

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// =====================================================
// ACCOUNTANT / INVOICING USER
// =====================================================

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

      {/* =================================================
          AUTHENTICATION
      ================================================= */}

      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />


      {/* =================================================
          ADMIN PANEL
      ================================================= */}

      <Route path="/admin" element={<AdminLayout />}>
        {/* Dashboard */}
        <Route index element={<AdminDashboard />} />

        {/* Users */}
        <Route path="users" element={<AdminUsers />} />

        {/* Contacts */}
        <Route path="contacts" element={<AdminContacts />} />

        {/* Products */}
        <Route path="products" element={<AdminProducts />} />

        {/* Chart of Accounts */}
        <Route path="accounts" element={<AdminChartOfAccounts />} />

        {/* Journals */}
        <Route path="journals" element={<AdminJournals />} />

        {/* Purchase Orders */}
        <Route path="purchase-orders" element={<AdminPurchaseOrders />} />

        {/* Vendor Bills */}
        <Route path="vendor-bills" element={<AdminVendorBills />} />

        {/* Sales Orders */}
        <Route path="sales-orders" element={<AdminSalesOrders />} />

        {/* Payments */}
        <Route path="payments" element={<AdminPayments />} />

        {/* Budgets */}
        <Route path="budgets" element={<AdminBudgets />} />

        {/* Reports */}
        <Route path="reports" element={<AdminReports />} />

        {/* Customer Invoices */}
        <Route path="customer-invoices" element={<AdminCustomerInvoices />} />
        <Route path="invoices" element={<AdminCustomerInvoices />} />
      </Route>


      {/* =================================================
          ACCOUNTANT / INVOICING USER PANEL
      ================================================= */}

      <Route path="/invoicing_user" element={<AccountantLayout />}>
        {/* Dashboard */}
        <Route index element={<AccountantDashboard />} />

        {/* Sales */}
        <Route path="sales-orders" element={<AccountantSalesOrders />} />
        <Route path="sale-invoices" element={<SaleInvoices />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="customer-bills" element={<SaleInvoices />} />
        <Route path="sales-bills" element={<SaleInvoices />} />
        <Route path="sales" element={<SaleInvoices />} />

        {/* Purchase */}
        <Route path="purchase-orders" element={<AccountantPurchaseOrders />} />
        <Route path="bills" element={<Bills />} />
        <Route path="vendor-bills" element={<Bills />} />

        {/* Account */}
        <Route path="contacts" element={<AccountantContacts />} />
        <Route path="products" element={<AccountantProducts />} />
        <Route path="chart-of-accounts" element={<AccountantChartOfAccounts />} />
        <Route path="journals" element={<AccountantJournals />} />
        <Route path="journal-entries" element={<JournalEntries />} />

        {/* Reports */}
        <Route path="balance-sheet" element={<BalanceSheet />} />
        <Route path="profit-and-loss" element={<ProfitAndLoss />} />
        <Route path="budget-reports" element={<BudgetReport />} />
        <Route path="reports" element={<BudgetReport />} />
      </Route>


      {/* =================================================
          HYPHENATED ALIAS: /invoicing-user
      ================================================= */}

      <Route path="/invoicing-user" element={<AccountantLayout />}>
        <Route index element={<AccountantDashboard />} />
        <Route path="sales-orders" element={<AccountantSalesOrders />} />
        <Route path="sale-invoices" element={<SaleInvoices />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="customer-bills" element={<SaleInvoices />} />
        <Route path="sales-bills" element={<SaleInvoices />} />
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

    </Routes>
  );
}

export default AppRoutes;