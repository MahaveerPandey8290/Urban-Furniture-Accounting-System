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
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-[#716B63]">
              Master Data
            </p>

            <h1 className="mt-1 text-3xl font-semibold text-[#30261F]">
              Users
            </h1>

            <p className="mt-2 text-sm text-[#716B63]">
              Manage users who access the accounting system.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-[#403329] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#30261F]"
          >
            <Plus size={18} />
            Add User
          </button>

        </div>

        {/* USERS TABLE */}
        <div className="overflow-hidden rounded-xl border border-[#DDD7CE] bg-[#FBFAF7]">

          {/* SEARCH */}
          <div className="flex items-center justify-between border-b border-[#DDD7CE] p-5">

            <div className="flex h-11 w-[360px] items-center gap-3 rounded-lg border border-[#DDD7CE] bg-white px-4">

              <Search
                size={18}
                className="text-[#716B63]"
              />

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#9B958D]"
              />

            </div>

            <p className="text-sm text-[#716B63]">
              {filteredUsers.length} users
            </p>

          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-[#DDD7CE] text-left">

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-[#716B63]">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-[#716B63]">
                    Login ID
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-[#716B63]">
                    Role
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-[#716B63]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wide text-[#716B63]">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-[#E8E3DB] transition hover:bg-[#F5F2EC]"
                  >

                    {/* USER */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9E2D6] text-sm font-medium text-[#403329]">
                          {user.name.charAt(0)}
                        </div>

                        <div>

                          <p className="text-sm font-medium text-[#30261F]">
                            {user.name}
                          </p>

                          <p className="mt-1 text-xs text-[#716B63]">
                            {user.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* LOGIN ID */}
                    <td className="px-6 py-5 text-sm text-[#403329]">
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
                          user.status === "Active"
                            ? "text-[#56705A]"
                            : "text-[#9A665A]"
                        }`}
                      >

                        <span
                          className={`h-2 w-2 rounded-full ${
                            user.status === "Active"
                              ? "bg-[#56705A]"
                              : "bg-[#9A665A]"
                          }`}
                        />

                        {user.status}

                      </span>

                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                          className="rounded-lg p-2 text-[#716B63] transition hover:bg-[#E9E2D6] hover:text-[#30261F]"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => toggleStatus(user.id)}
                          title={
                            user.status === "Active"
                              ? "Deactivate user"
                              : "Activate user"
                          }
                          className="rounded-lg p-2 text-[#716B63] transition hover:bg-[#E9E2D6] hover:text-[#30261F]"
                        >
                          {user.status === "Active" ? (
                            <UserX size={17} />
                          ) : (
                            <UserCheck size={17} />
                          )}
                        </button>

                        <button
                          onClick={() => deleteUser(user.id)}
                          title="Delete user"
                          className="rounded-lg p-2 text-[#9A665A] transition hover:bg-[#F0DFDA]"
                        >
                          <Trash2 size={17} />
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

              <p className="text-sm font-medium text-[#30261F]">
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

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">

          <div className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-[#FBFAF7] shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#DDD7CE] px-7 py-6">

              <div>

                <h2 className="text-2xl font-semibold text-[#30261F]">
                  {editingUser ? "Edit User" : "Add User"}
                </h2>

                <p className="mt-1 text-sm text-[#716B63]">
                  {editingUser
                    ? "Update user information."
                    : "Create a new user."}
                </p>

              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-[#716B63] transition hover:bg-[#E9E2D6]"
              >
                <X size={21} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-7 py-6"
            >

              {/* FULL NAME */}
              <div>

                <label className="mb-2 block text-sm font-medium text-[#30261F]">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className="h-12 w-full rounded-lg border border-[#DDD7CE] bg-white px-4 text-sm outline-none transition focus:border-[#806A55]"
                />

              </div>

              {/* LOGIN ID */}
              <div>

                <label className="mb-2 block text-sm font-medium text-[#30261F]">
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
                  className="h-12 w-full rounded-lg border border-[#DDD7CE] bg-white px-4 text-sm outline-none transition focus:border-[#806A55]"
                />

                <p className="mt-1.5 text-xs text-[#8B837A]">
                  Login ID must be between 6–12 characters.
                </p>

              </div>

              {/* EMAIL */}
              <div>

                <label className="mb-2 block text-sm font-medium text-[#30261F]">
                  Email ID
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  className="h-12 w-full rounded-lg border border-[#DDD7CE] bg-white px-4 text-sm outline-none transition focus:border-[#806A55]"
                />

              </div>

              {/* ROLE */}
              <div>

                <label className="mb-3 block text-sm font-medium text-[#30261F]">
                  Role
                </label>

                <div className="flex flex-wrap gap-6">

                  {/* ADMINISTRATOR */}
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#403329]">

                    <input
                      type="radio"
                      name="role"
                      value="Administrator"
                      checked={formData.role === "Administrator"}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#403329]"
                    />

                    Administrator

                  </label>

                  {/* CUSTOMER */}
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#403329]">

                    <input
                      type="radio"
                      name="role"
                      value="Customer"
                      checked={formData.role === "Customer"}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#403329]"
                    />

                    Customer

                  </label>

                  {/* VENDOR */}
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#403329]">

                    <input
                      type="radio"
                      name="role"
                      value="Vendor"
                      checked={formData.role === "Vendor"}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#403329]"
                    />

                    Vendor

                  </label>

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <label className="mb-2 block text-sm font-medium text-[#30261F]">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    editingUser
                      ? "Enter new password"
                      : "Enter password"
                  }
                  required={!editingUser}
                  className="h-12 w-full rounded-lg border border-[#DDD7CE] bg-white px-4 text-sm outline-none transition focus:border-[#806A55]"
                />

                <p className="mt-1.5 text-xs text-[#8B837A]">
                  More than 8 characters with uppercase, lowercase and
                  special character.
                </p>

              </div>

              {/* RE-ENTER PASSWORD */}
              <div>

                <label className="mb-2 block text-sm font-medium text-[#30261F]">
                  Re-enter Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required={!editingUser}
                  className="h-12 w-full rounded-lg border border-[#DDD7CE] bg-white px-4 text-sm outline-none transition focus:border-[#806A55]"
                />

              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-lg border border-[#D8B9B0] bg-[#F7EDEA] px-4 py-3 text-sm text-[#8A4F43]">
                  {error}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-[#DDD7CE] pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-[#DDD7CE] px-5 py-2.5 text-sm font-medium text-[#403329] transition hover:bg-[#E9E2D6]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#403329] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#30261F]"
                >
                  {editingUser ? "Save Changes" : "Create"}
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