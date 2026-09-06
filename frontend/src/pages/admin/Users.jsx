import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  X,
  CheckCircle,
  Key,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

function Users() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempPasswordModal, setTempPasswordModal] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    loginId: "",
    email: "",
    userType: "ADMINISTRATOR",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      // /api/users returns { data: [...] }
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: "",
      loginId: "",
      email: "",
      userType: "ADMINISTRATOR",
    });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.loginId.trim() || !formData.email.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    // Mirror backend loginId validation (Zod schema)
    const loginIdRegex = /^[a-zA-Z0-9_]+$/;
    if (formData.loginId.trim().length < 6) {
      setError("Login ID must be at least 6 characters.");
      return;
    }
    if (formData.loginId.trim().length > 12) {
      setError("Login ID must be at most 12 characters.");
      return;
    }
    if (!loginIdRegex.test(formData.loginId.trim())) {
      setError("Login ID may only contain letters, numbers, and underscores (no @ or special characters).");
      return;
    }

    try {
      const res = await api.post("/users", {
        name: formData.name.trim(),
        loginId: formData.loginId.trim(),
        email: formData.email.trim(),
        userType: formData.userType,
      });

      closeModal();
      fetchUsers();

      if (res.data?.tempPassword) {
        setTempPasswordModal({
          loginId: formData.loginId,
          tempPassword: res.data.tempPassword,
        });
      }
    } catch (err) {
      // Surface 422 field errors
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors && Array.isArray(fieldErrors)) {
        const msgs = fieldErrors.map((e) => e.message || e).join(", ");
        setError(msgs);
      } else {
        setError(err.response?.data?.message || "Failed to create user.");
      }
    }
  };


  const handleApprove = async (id) => {
    try {
      const res = await api.patch(`/users/${id}/approve`);
      fetchUsers();
      if (res.data?.tempPassword) {
        setTempPasswordModal({
          loginId: `User #${id}`,
          tempPassword: res.data.tempPassword,
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve user.");
    }
  };

  const handleToggleSuspend = async (user) => {
    const isSuspended = user.status === "SUSPENDED";
    const endpoint = isSuspended ? `/users/${user.id}/reactivate` : `/users/${user.id}/suspend`;
    const actionText = isSuspended ? "reactivate" : "suspend";

    if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;

    try {
      await api.patch(endpoint);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${actionText} user.`);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.loginId || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#716B63]">Master Data</p>
            <h1 className="mt-1 text-3xl font-semibold text-[#30261F]">Users</h1>
            <p className="mt-2 text-sm text-[#716B63]">
              Manage users who access the accounting system from PostgreSQL.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-[#403329] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#30261F] cursor-pointer"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        {/* TEMP PASSWORD POPUP */}
        {tempPasswordModal && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <Key className="text-green-700 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900">
                  Temporary Password Generated for {tempPasswordModal.loginId}
                </h3>
                <p className="mt-1 text-xs text-green-800">
                  Please copy and share this password immediately. It will NOT be shown again:
                </p>
                <div className="mt-2 inline-block rounded-lg bg-white px-4 py-2 font-mono text-sm font-bold text-green-950 border border-green-300">
                  {tempPasswordModal.tempPassword}
                </div>
              </div>
              <button
                onClick={() => setTempPasswordModal(null)}
                className="text-green-700 hover:text-green-900 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* USERS TABLE */}
        <div className="overflow-hidden rounded-xl border border-[#DDD7CE] bg-[#FBFAF7]">

          {/* SEARCH */}
          <div className="flex items-center justify-between border-b border-[#DDD7CE] p-5">
            <div className="flex h-11 w-[360px] items-center gap-3 rounded-lg border border-[#DDD7CE] bg-white px-4">
              <Search size={18} className="text-[#716B63]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, login ID, or email..."
                className="w-full bg-transparent text-sm text-[#211D19] outline-none placeholder:text-[#716B63]"
              />
            </div>
          </div>

          {/* TABLE CONTENT */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#DDD7CE] bg-[#F5F2EC] text-xs font-semibold uppercase tracking-wider text-[#716B63]">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Login ID</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#716B63]">
                      Loading users from database...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#716B63]">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#E8E3DB] transition hover:bg-[#F5F2EC]"
                    >
                      {/* USER */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9E2D6] text-sm font-medium text-[#403329]">
                            {(user.name || user.loginId || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#30261F]">{user.name}</p>
                            <p className="mt-1 text-xs text-[#716B63]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* LOGIN ID */}
                      <td className="px-6 py-5 text-sm text-[#403329] font-mono">
                        {user.loginId}
                      </td>

                      {/* ROLE */}
                      <td className="px-6 py-5">
                        <span className="rounded-full bg-[#E9E2D6] px-3 py-1.5 text-xs font-medium text-[#403329]">
                          {user.role}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 text-xs font-medium ${
                            user.status === "ACTIVE"
                              ? "text-[#56705A]"
                              : user.status === "PENDING"
                              ? "text-amber-700"
                              : "text-[#9A665A]"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              user.status === "ACTIVE"
                                ? "bg-[#56705A]"
                                : user.status === "PENDING"
                                ? "bg-amber-500"
                                : "bg-[#9A665A]"
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {user.status === "PENDING" && (
                            <button
                              onClick={() => handleApprove(user.id)}
                              title="Approve User"
                              className="rounded-lg p-2 text-green-700 hover:bg-green-100 transition cursor-pointer"
                            >
                              <CheckCircle size={17} />
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleSuspend(user)}
                            title={user.status === "SUSPENDED" ? "Reactivate User" : "Suspend User"}
                            className="rounded-lg p-2 text-[#716B63] transition hover:bg-[#E9E2D6] hover:text-[#30261F] cursor-pointer"
                          >
                            {user.status === "SUSPENDED" ? (
                              <UserCheck size={17} />
                            ) : (
                              <UserX size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#DDD7CE] bg-[#FBFAF7] p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#DDD7CE] pb-5">
              <h3 className="text-xl font-semibold text-[#30261F]">Add User</h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-[#716B63] hover:bg-[#E9E2D6] hover:text-[#30261F] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* NAME */}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#30261F]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Patel"
                  className="h-10 w-full rounded-lg border border-[#DDD7CE] bg-white px-3 text-sm outline-none focus:border-[#403329]"
                  required
                />
              </div>

              {/* LOGIN ID */}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#30261F]">Login ID</label>
                <input
                  type="text"
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleChange}
                  placeholder="e.g. ramesh123"
                  className="h-10 w-full rounded-lg border border-[#DDD7CE] bg-white px-3 text-sm outline-none focus:border-[#403329]"
                  required
                />
                <p className="mt-1 text-[11px] text-[#716B63]">
                  6–12 characters. Letters, numbers and underscores only (no @, no spaces).
                </p>
              </div>


              {/* EMAIL */}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#30261F]">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. ramesh@example.com"
                  className="h-10 w-full rounded-lg border border-[#DDD7CE] bg-white px-3 text-sm outline-none focus:border-[#403329]"
                  required
                />
              </div>

              {/* USER TYPE */}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#30261F]">User Type / Role</label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-[#DDD7CE] bg-white px-3 text-sm outline-none focus:border-[#403329]"
                >
                  <option value="ADMINISTRATOR">Administrator (ADMIN)</option>
                  <option value="ACCOUNTANT">Accountant (ACCOUNTANT)</option>
                  <option value="CUSTOMER">Customer (CONTACT)</option>
                  <option value="VENDOR">Vendor (CONTACT)</option>
                </select>
                <p className="mt-1 text-[11px] text-[#716B63]">
                  A temporary one-time password will be automatically generated and displayed after creation.
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-[#DDD7CE] pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-[#DDD7CE] px-4 py-2 text-xs font-medium text-[#403329] hover:bg-[#E9E2D6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#403329] px-5 py-2 text-xs font-medium text-white hover:bg-[#30261F] cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Users;
