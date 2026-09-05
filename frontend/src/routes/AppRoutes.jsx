import { Routes, Route } from "react-router-dom";

import AdminLayout from "../components/layout/AdminLayout";

import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Contacts from "../pages/admin/Contacts";
import Products from "../pages/admin/Products";
import ChartOfAccounts from "../pages/admin/ChartOfAccounts";

function AppRoutes() {
  return (
    <Routes>

      <Route path="/admin" element={<AdminLayout />}>

        <Route index element={<Dashboard />} />

        <Route path="users" element={<Users />} />

        <Route path="contacts" element={<Contacts />} />

        <Route path="products" element={<Products />} />

        <Route path="accounts" element={<ChartOfAccounts />} />
        
      </Route>

    </Routes>
  );
}

export default AppRoutes;