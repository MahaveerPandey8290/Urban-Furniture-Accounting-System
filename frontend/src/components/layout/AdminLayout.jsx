import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function AdminLayout() {
  return (
    <div className="admin-layout">

      <Sidebar />

      <div className="main-section">

        <Navbar />

        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;