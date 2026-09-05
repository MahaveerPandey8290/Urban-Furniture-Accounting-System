import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-cream">

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="ml-[280px] min-h-screen">

        {/* Navbar */}
        <Navbar />

        {/* Scrollable Content */}
        <main className="min-h-[calc(100vh-76px)] overflow-y-auto p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;