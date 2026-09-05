import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div>
      <h1>Urban Furniture Admin</h1>

      <Outlet />
    </div>
  );
}

export default AdminLayout;