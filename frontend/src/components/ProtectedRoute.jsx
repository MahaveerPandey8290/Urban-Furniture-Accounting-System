import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute guards a set of nested routes.
 * - If the user is not authenticated, redirect to /login.
 * - If roles are specified, the user must have one of those roles.
 *   Otherwise redirect to /login.
 *
 * Usage in AppRoutes:
 *   <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
 *     <Route path="/admin" element={<AdminLayout />}>
 *       ...
 *     </Route>
 *   </Route>
 */
function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2]">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Wrong role: send to their correct dashboard
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/invoicing_user" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
