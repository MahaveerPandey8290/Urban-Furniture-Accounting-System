import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "../components/layout/AdminLayout";
import AccountantLayout from "../components/layout/AccountantLayout";
import Dashboard from "../pages/admin/Dashboard";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// Accountant / Invoicing User Module Pages
import AccountantDashboard from "../pages/invoicing_user/Dashboard";
import SalesOrders from "../pages/invoicing_user/SalesOrders";
import SaleInvoices from "../pages/invoicing_user/SaleInvoices";
import Invoices from "../pages/invoicing_user/Invoices";
import Bills from "../pages/invoicing_user/Bills";

import PurchaseOrders from "../pages/invoicing_user/PurchaseOrders";

import Contacts from "../pages/invoicing_user/Contacts";
import Products from "../pages/invoicing_user/Products";
import ChartOfAccounts from "../pages/invoicing_user/ChartOfAccounts";
import Journals from "../pages/invoicing_user/Journals";
import JournalEntries from "../pages/invoicing_user/JournalEntries";

import BalanceSheet from "../pages/invoicing_user/BalanceSheet";
import ProfitAndLoss from "../pages/invoicing_user/ProfitAndLoss";
import BudgetReport from "../pages/invoicing_user/BudgetReport";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth Pages */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Section */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
        </Route>

        {/* Accountant / Invoicing User Section */}
        <Route path="/invoicing_user" element={<AccountantLayout />}>
          <Route index element={<AccountantDashboard />} />

          {/* Sales */}
          <Route path="sales-orders" element={<SalesOrders />} />
          <Route path="sale-invoices" element={<SaleInvoices />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="bills" element={<Bills />} />
          <Route path="customer-bills" element={<Bills />} />
          <Route path="sales-bills" element={<Bills />} />
          <Route path="sales" element={<Bills />} />

          {/* Purchase */}
          <Route path="purchase-orders" element={<PurchaseOrders />} />

          {/* Account */}
          <Route path="contacts" element={<Contacts />} />
          <Route path="products" element={<Products />} />
          <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="journals" element={<Journals />} />
          <Route path="journal-entries" element={<JournalEntries />} />

          {/* Report */}
          <Route path="balance-sheet" element={<BalanceSheet />} />
          <Route path="profit-and-loss" element={<ProfitAndLoss />} />
          <Route path="budget-reports" element={<BudgetReport />} />
          <Route path="reports" element={<BudgetReport />} />
        </Route>

        {/* Hyphenated alias support */}
        <Route path="/invoicing-user" element={<AccountantLayout />}>
          <Route index element={<AccountantDashboard />} />
          <Route path="sales-orders" element={<SalesOrders />} />
          <Route path="sale-invoices" element={<SaleInvoices />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="bills" element={<Bills />} />
          <Route path="customer-bills" element={<Bills />} />
          <Route path="sales-bills" element={<Bills />} />
          <Route path="sales" element={<Bills />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="products" element={<Products />} />
          <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="journals" element={<Journals />} />
          <Route path="journal-entries" element={<JournalEntries />} />
          <Route path="balance-sheet" element={<BalanceSheet />} />
          <Route path="profit-and-loss" element={<ProfitAndLoss />} />
          <Route path="budget-reports" element={<BudgetReport />} />
          <Route path="reports" element={<BudgetReport />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;