import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

function Users() {
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      loginId: "rahul123",
      email: "rahul@urbanfurniture.com",
      role: "Customer",
      status: "Active",
    },
    {
      id: 2,
      name: "Priya Verma",
      loginId: "priya123",
      email: "priya@urbanfurniture.com",
      role: "Administrator",
      status: "Active",
    },
    {
      id: 3,
      name: "Amit Kumar",
      loginId: "amit1234",
      email: "amit@urbanfurniture.com",
      role: "Vendor",
      status: "Inactive",
    },
    {
      id: 4,
      name: "Neha Singh",
      loginId: "neha123",
      email: "neha@urbanfurniture.com",
      role: "Customer",
      status: "Active",
    },
  ]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit mode
  const [editingUser, setEditingUser] = useState(null);

  // Error message
  const [error, setError] = useState("");

  // Form
  const [formData, setFormData] = useState({
    name: "",
    loginId: "",
    email: "",
    role: "Customer",
    password: "",
    confirmPassword: "",
  });

  // Search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.loginId.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  // Open Add User modal
  const openAddModal = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      loginId: "",
      email: "",
      role: "Customer",
      password: "",
      confirmPassword: "",
    });

    setError("");
    setIsModalOpen(true);
  };

  // Open Edit User modal
  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      loginId: user.loginId,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    });

    setError("");
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError("");
  };

  // Form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // Validate form
  const validateForm = () => {
    const loginId = formData.loginId.trim();
    const email = formData.email.trim().toLowerCase();

    // Login ID length
    if (loginId.length < 6 || loginId.length > 12) {
      return "Login ID must be between 6 and 12 characters.";
    }

    // Login ID uniqueness
    const duplicateLoginId = users.some(
      (user) =>
        user.loginId.toLowerCase() === loginId.toLowerCase() &&
        user.id !== editingUser?.id
    );

    if (duplicateLoginId) {
      return "This Login ID already exists.";
    }

    // Email uniqueness
    const duplicateEmail = users.some(
      (user) =>
        user.email.toLowerCase() === email &&
        user.id !== editingUser?.id
    );

    if (duplicateEmail) {
      return "This email address already exists.";
    }

    // Password validation
    // During editing, password can be left empty.
    if (!editingUser || formData.password) {
      if (formData.password.length <= 8) {
        return "Password must contain more than 8 characters.";
      }

      if (!/[a-z]/.test(formData.password)) {
        return "Password must contain at least one lowercase letter.";
      }

      if (!/[A-Z]/.test(formData.password)) {
        return "Password must contain at least one uppercase letter.";
      }

      if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/';+=`~]/.test(formData.password)) {
        return "Password must contain at least one special character.";
      }

      if (formData.password !== formData.confirmPassword) {
        return "Passwords do not match.";
      }
    }

    return "";
  };

  // Add / Edit user
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: formData.name,
                loginId: formData.loginId,
                email: formData.email,
                role: formData.role,
              }
            : user
        )
      );
    } else {
      const newUser = {
        id: Date.now(),
        name: formData.name,
        loginId: formData.loginId,
        email: formData.email,
        role: formData.role,
        status: "Active",
      };

      setUsers([...users, newUser]);
    }

    closeModal();
  };

  // Activate / Deactivate
  const toggleStatus = (id) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                user.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : user
      )
    );
  };

  // Delete
  const deleteUser = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (confirmed) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <>
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e7e3da]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#211D19] tracking-tight">
              Users Management
            </h1>
            <p className="mt-0.5 text-sm text-[#716B63]">
              Manage user credentials, permissions, and roles accessing the accounting system.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#342921] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#251d17] shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>

        {/* USERS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-[#e7e3da] bg-white shadow-2xs">
          {/* SEARCH */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e7e3da] p-4 sm:p-5 bg-[#faf8f4]/60">
            <div className="flex h-10 w-full sm:w-[320px] items-center gap-2.5 rounded-xl border border-[#cfc6b6] bg-white px-3.5 shadow-2xs focus-within:border-[#342921] transition">
              <Search
                size={16}
                className="text-[#716B63]"
              />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-[#211D19] outline-none placeholder:text-[#9B958D]"
              />
            </div>

            <p className="text-xs font-semibold text-[#716B63]">
              Showing {filteredUsers.length} users
            </p>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e7e3da] bg-[#faf8f4]/80 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#716B63]">
                    User
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#716B63]">
                    Login ID
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#716B63]">
                    Role
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#716B63]">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#716B63]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-[#e7e3da] transition hover:bg-[#faf8f4]"
                  >

                    {/* USER */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7e3da] text-xs font-bold text-[#342921]">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#211D19]">
                            {user.name}
                          </p>
                          <p className="text-xs text-[#716B63]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* LOGIN ID */}
                    <td className="px-6 py-4 text-sm font-medium text-[#342921]">
                      {user.loginId}
                    </td>

                    {/* ROLE */}
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-[#f4f1ea] border border-[#e7e3da] px-3 py-1 text-xs font-semibold text-[#342921]">
                        {user.role}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                          className="rounded-lg p-2 text-[#716B63] transition hover:bg-[#f4f1ea] hover:text-[#211D19] cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => toggleStatus(user.id)}
                          title={
                            user.status === "Active"
                              ? "Deactivate user"
                              : "Activate user"
                          }
                          className="rounded-lg p-2 text-[#716B63] transition hover:bg-[#f4f1ea] hover:text-[#211D19] cursor-pointer"
                        >
                          {user.status === "Active" ? (
                            <UserX size={15} />
                          ) : (
                            <UserCheck size={15} />
                          )}
                        </button>

                        <button
                          onClick={() => deleteUser(user.id)}
                          title="Delete user"
                          className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY */}
          {filteredUsers.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold text-[#211D19]">
                No users found
              </p>
              <p className="mt-1 text-sm text-[#716B63]">
                Try searching with a different name or email.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* ================= ADD / EDIT USER MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl bg-white border border-[#e7e3da] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#e7e3da] px-6 py-5 bg-[#faf8f4]/60">
              <div>
                <h2 className="text-xl font-bold text-[#211D19]">
                  {editingUser ? "Edit User" : "Add User"}
                </h2>
                <p className="mt-0.5 text-xs text-[#716B63]">
                  {editingUser
                    ? "Update user information and access role."
                    : "Create a new user account with credentials."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-[#716B63] transition hover:bg-[#f4f1ea] hover:text-[#211D19] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {/* FULL NAME */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#211D19]">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className="h-10 w-full rounded-xl border border-[#cfc6b6] bg-white px-3.5 text-sm text-[#211D19] outline-none transition focus:border-[#342921]"
                />
              </div>

              {/* LOGIN ID */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#211D19]">
                  Login ID
                </label>
                <input
                  type="text"
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleChange}
                  placeholder="Enter login ID"
                  minLength={6}
                  maxLength={12}
                  required
                  className="h-10 w-full rounded-xl border border-[#cfc6b6] bg-white px-3.5 text-sm text-[#211D19] outline-none transition focus:border-[#342921]"
                />
                <p className="mt-1 text-[11px] text-[#716B63]">
                  Login ID must be between 6–12 characters.
                </p>
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#211D19]">
                  Email ID
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  className="h-10 w-full rounded-xl border border-[#cfc6b6] bg-white px-3.5 text-sm text-[#211D19] outline-none transition focus:border-[#342921]"
                />
              </div>

              {/* ROLE */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#211D19]">
                  Role
                </label>
                <div className="flex flex-wrap gap-5">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#211D19]">
                    <input
                      type="radio"
                      name="role"
                      value="Administrator"
                      checked={formData.role === "Administrator"}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#342921]"
                    />
                    Administrator
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#211D19]">
                    <input
                      type="radio"
                      name="role"
                      value="Customer"
                      checked={formData.role === "Customer"}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#342921]"
                    />
                    Customer
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#211D19]">
                    <input
                      type="radio"
                      name="role"
                      value="Vendor"
                      checked={formData.role === "Vendor"}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#342921]"
                    />
                    Vendor
                  </label>
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#211D19]">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    editingUser
                      ? "Enter new password (leave blank to keep current)"
                      : "Enter password"
                  }
                  required={!editingUser}
                  className="h-10 w-full rounded-xl border border-[#cfc6b6] bg-white px-3.5 text-sm text-[#211D19] outline-none transition focus:border-[#342921]"
                />
                <p className="mt-1 text-[11px] text-[#716B63]">
                  More than 8 characters with uppercase, lowercase and special character.
                </p>
              </div>

              {/* RE-ENTER PASSWORD */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#211D19]">
                  Re-enter Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required={!editingUser}
                  className="h-10 w-full rounded-xl border border-[#cfc6b6] bg-white px-3.5 text-sm text-[#211D19] outline-none transition focus:border-[#342921]"
                />
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-[#e7e3da] pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#cfc6b6] px-4 py-2 text-sm font-semibold text-[#716B63] transition hover:bg-[#f7f6f2] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#342921] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#251d17] shadow-xs cursor-pointer"
                >
                  {editingUser ? "Save Changes" : "Create User"}
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