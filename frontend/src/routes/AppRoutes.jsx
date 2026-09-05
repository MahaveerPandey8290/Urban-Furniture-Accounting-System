import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "../components/layout/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

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

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;