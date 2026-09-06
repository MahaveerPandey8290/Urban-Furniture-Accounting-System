import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Grid2X2,
  List,
  Plus,
  Search,
  Upload,
  X,
  Pencil,
  Trash2,
  Key,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const emptyForm = {
  name: "",
  type: "CUSTOMER",
  email: "",
  mobile: "",
  street: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  image: "",
  createPortalCredentials: false,
  loginId: "",
  portalPassword: "",
};

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [tempPasswordModal, setTempPasswordModal] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/contacts?limit=100");
      // Backend returns { items: [...] }
      setContacts(res.data.items || []);
    } catch {
      // Error toasted by api.js interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    (contact.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (contact.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (contact.city || "").toLowerCase().includes(search.toLowerCase())
  );

  // -----------------------------
  // OPEN NEW CONTACT FORM
  // -----------------------------
  const handleNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  // -----------------------------
  // OPEN EDIT FORM
  // -----------------------------
  const handleEdit = (contact) => {
    setForm({
      name: contact.name || "",
      type: contact.type || "CUSTOMER",
      email: contact.email || "",
      mobile: contact.mobile || "",
      street: contact.street || "",
      city: contact.city || "",
      state: contact.state || "",
      country: contact.country || "India",
      pincode: contact.pincode || "",
      image: "",
      createPortalCredentials: false,
      loginId: "",
      portalPassword: "",
    });
    setEditingId(contact.id);
    setError("");
    setShowForm(true);
  };

  // -----------------------------
  // FORM INPUT CHANGE
  // -----------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  // -----------------------------
  // IMAGE UPLOAD
  // -----------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  // -----------------------------
  // SAVE CONTACT
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Please fill in contact name.");
      return;
    }

    if (!editingId && form.createPortalCredentials) {
      if (form.loginId && (form.loginId.length < 6 || form.loginId.length > 12)) {
        setError("Login ID must be between 6 and 12 characters.");
        return;
      }
      if (form.loginId && !/^[a-zA-Z0-9_]+$/.test(form.loginId)) {
        setError("Login ID may only contain letters, numbers, and underscores (no @ or special characters).");
        return;
      }
      if (form.portalPassword && form.portalPassword.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      type: form.type.toUpperCase(),
      email: form.email?.trim() || undefined,
      mobile: form.mobile?.trim() || undefined,
      street: form.street?.trim() || undefined,
      city: form.city?.trim() || undefined,
      state: form.state?.trim() || undefined,
      country: form.country?.trim() || undefined,
      pincode: form.pincode?.trim() || undefined,
    };

    if (!editingId && form.createPortalCredentials) {
      payload.createPortalCredentials = true;
      if (form.loginId?.trim()) payload.loginId = form.loginId.trim();
      if (form.portalPassword?.trim()) payload.portalPassword = form.portalPassword.trim();
    }

    try {
      if (editingId) {
        try {
          await api.put(`/contacts/${editingId}`, payload);
        } catch (putErr) {
          if (putErr.response?.status === 404 || putErr.response?.status === 405) {
            await api.patch(`/contacts/${editingId}`, payload);
          } else {
            throw putErr;
          }
        }
      } else {
        const res = await api.post("/contacts", payload);
        if (res.data?.tempPassword) {
          setTempPasswordModal({
            name: res.data.name || form.name,
            loginId: res.data.user?.loginId || payload.loginId || res.data.email,
            tempPassword: res.data.tempPassword,
            role: res.data.type || form.type,
          });
        }
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchContacts();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors && Array.isArray(fieldErrors)) {
        setError(fieldErrors.map((e) => e.message || e).join(", "));
      } else {
        setError(err.response?.data?.message || "Failed to save contact.");
      }
    }
  };

  // -----------------------------
  // ARCHIVE / DELETE CONTACT
  // -----------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to archive this contact?")) return;
    try {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to archive contact.");
    }
  };

  // -----------------------------
  // BACK
  // -----------------------------
  const handleBack = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="min-h-screen bg-[#f5f2ec] px-8 py-7 text-[#30261f]">

      {/* =========================
          FORM VIEW
      ========================== */}
      {showForm ? (
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-7 flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {editingId ? "Edit Contact" : "Contact Master"}
              </h1>

              <p className="mt-1 text-sm text-[#746b63]">
                {editingId
                  ? "Update contact information"
                  : "Create a new customer or vendor"}
              </p>
            </div>

            <button
              onClick={handleBack}
              className="flex items-center gap-2 rounded-lg border border-[#c9beb2] bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-[#eee8df]"
            >
              <ArrowLeft size={17} />
              Back
            </button>

          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#d8d0c6] bg-[#fffdf9] p-8 shadow-sm"
          >
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_220px]">

              {/* LEFT */}
              <div className="space-y-6">

                {/* Contact Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Contact Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter contact name"
                    className="w-full rounded-lg border border-[#cfc5ba] bg-white px-4 py-3 outline-none transition focus:border-[#5b4636]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full rounded-lg border border-[#cfc5ba] bg-white px-4 py-3 outline-none focus:border-[#5b4636]"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Mobile
                  </label>

                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    className="w-full rounded-lg border border-[#cfc5ba] bg-white px-4 py-3 outline-none focus:border-[#5b4636]"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="mb-3 block text-sm font-medium">
                    Type
                  </label>

                  <div className="flex gap-7">

                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="Customer"
                        checked={form.type === "Customer" || form.type === "CUSTOMER"}
                        onChange={() => setForm((prev) => ({ ...prev, type: "Customer" }))}
                        className="h-4 w-4 accent-[#5b4636]"
                      />

                      <span className="text-sm">
                        Customer
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="Vendor"
                        checked={form.type === "Vendor" || form.type === "VENDOR"}
                        onChange={() => setForm((prev) => ({ ...prev, type: "Vendor" }))}
                        className="h-4 w-4 accent-[#5b4636]"
                      />

                      <span className="text-sm">
                        Vendor
                      </span>
                    </label>

                  </div>
                </div>

                {/* Address */}
                <div>

                  <label className="mb-3 block text-sm font-medium">
                    Address
                  </label>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <input
                      type="text"
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      placeholder="Street"
                      className="rounded-lg border border-[#cfc5ba] bg-white px-4 py-3 outline-none focus:border-[#5b4636]"
                    />

                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="rounded-lg border border-[#cfc5ba] bg-white px-4 py-3 outline-none focus:border-[#5b4636]"
                    />

                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="rounded-lg border border-[#cfc5ba] bg-white px-4 py-3 outline-none focus:border-[#5b4636]"
                    />

                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="rounded-lg border border-[#cfc5ba] bg-white px-4 py-3 outline-none focus:border-[#5b4636]"
                    />

                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                      className="rounded-lg border border-[#cfc5ba] bg-white px-4 py-3 outline-none focus:border-[#5b4636]"
                    />

                  </div>

                </div>

                {/* PORTAL USER CREDENTIALS (NEW CONTACT ONLY) */}
                {!editingId && (
                  <div className="rounded-xl border border-[#d8d0c6] bg-[#f9f6f0] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#30261f]">
                          Create Portal User Account
                        </h4>
                        <p className="mt-0.5 text-xs text-[#746b63]">
                          Allow this {form.type === "Vendor" ? "vendor" : "customer"} to log into the portal
                        </p>
                      </div>

                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          name="createPortalCredentials"
                          checked={form.createPortalCredentials}
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-[#cfc5ba] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#4a392d] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>

                    {form.createPortalCredentials && (
                      <div className="mt-4 space-y-4 border-t border-[#e2dacd] pt-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#30261f]">
                            Login ID (Optional)
                          </label>
                          <input
                            type="text"
                            name="loginId"
                            value={form.loginId}
                            onChange={handleChange}
                            placeholder="e.g. acme_store (leave blank to auto-generate)"
                            className="w-full rounded-lg border border-[#cfc5ba] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#5b4636]"
                          />
                          <p className="mt-1 text-[11px] text-[#746b63]">
                            6–12 characters. Letters, numbers, and underscores only.
                          </p>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#30261f]">
                            Password (Optional)
                          </label>
                          <input
                            type="text"
                            name="portalPassword"
                            value={form.portalPassword}
                            onChange={handleChange}
                            placeholder="Leave blank to auto-generate secure temporary password"
                            className="w-full rounded-lg border border-[#cfc5ba] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#5b4636]"
                          />
                          <p className="mt-1 text-[11px] text-[#746b63]">
                            Minimum 8 characters. If blank, a temporary password will be shown after confirmation.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* RIGHT - IMAGE */}
              <div>

                <label className="mb-3 block text-sm font-medium">
                  Profile Image
                </label>

                <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#b9aea1] bg-[#f8f4ee] transition hover:bg-[#f0e9df]">

                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Contact"
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <Upload
                        size={28}
                        className="mb-3 text-[#6e6258]"
                      />

                      <span className="text-sm font-medium">
                        Upload Image
                      </span>

                      <span className="mt-1 text-xs text-[#8a8077]">
                        JPG, PNG
                      </span>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                </label>

              </div>

            </div>

            {/* BUTTONS */}
            <div className="mt-8 flex gap-3 border-t border-[#e0d8cf] pt-6">

              <button
                type="submit"
                className="rounded-lg bg-[#4a392d] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#3a2d24]"
              >
                {editingId ? "Update" : "Confirm"}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg border border-[#c9beb2] bg-white px-7 py-3 text-sm font-medium transition hover:bg-[#eee8df]"
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      ) : (
        /* =========================
           LIST / KANBAN VIEW
        ========================== */

        <div className="mx-auto max-w-[1400px]">

          {/* HEADER */}
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Contact Master
              </h1>

              <p className="mt-1 text-sm text-[#746b63]">
                Manage your customers and vendors
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={handleNew}
                className="flex items-center gap-2 rounded-lg bg-[#4a392d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3a2d24]"
              >
                <Plus size={17} />
                New
              </button>

            </div>

          </div>

          {/* TOOLBAR */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#d8d0c6] bg-[#fffdf9] p-3">

            {/* Search */}
            <div className="relative w-full max-w-md">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81776d]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full rounded-lg border border-[#d0c7bd] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#5b4636]"
              />

            </div>

            {/* View Buttons */}
            <div className="flex items-center rounded-lg border border-[#d0c7bd] bg-white p-1">

              <button
                onClick={() => setView("list")}
                className={`rounded-md p-2 transition ${
                  view === "list"
                    ? "bg-[#e8dfd4] text-[#4a392d]"
                    : "text-[#83786e] hover:bg-[#f3eee8]"
                }`}
                title="List View"
              >
                <List size={18} />
              </button>

              <button
                onClick={() => setView("kanban")}
                className={`rounded-md p-2 transition ${
                  view === "kanban"
                    ? "bg-[#e8dfd4] text-[#4a392d]"
                    : "text-[#83786e] hover:bg-[#f3eee8]"
                }`}
                title="Kanban View"
              >
                <Grid2X2 size={18} />
              </button>

            </div>

          </div>

          {/* =========================
              LIST VIEW
          ========================== */}

          {view === "list" && (
            <div className="overflow-hidden rounded-xl border border-[#d8d0c6] bg-[#fffdf9]">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px] border-collapse">

                  <thead>
                    <tr className="border-b border-[#d8d0c6] bg-[#f0ebe4] text-left text-xs uppercase tracking-wider text-[#6e6258]">

                      <th className="px-5 py-4">
                        Select
                      </th>

                      <th className="px-5 py-4">
                        Image
                      </th>

                      <th className="px-5 py-4">
                        Name
                      </th>

                      <th className="px-5 py-4">
                        Type
                      </th>

                      <th className="px-5 py-4">
                        Email
                      </th>

                      <th className="px-5 py-4">
                        Phone
                      </th>

                      <th className="px-5 py-4">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredContacts.map((contact) => (

                      <tr
                        key={contact.id}
                        onClick={() => handleEdit(contact)}
                        className="cursor-pointer border-b border-[#e5ded6] transition hover:bg-[#f7f3ed]"
                      >

                        <td
                          className="px-5 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[#5b4636]"
                          />
                        </td>

                        <td className="px-5 py-4">

                          {contact.image ? (
                            <img
                              src={contact.image}
                              alt=""
                              className="h-9 w-9 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e6ddd2] text-xs font-medium">
                              {contact.name.charAt(0)}
                            </div>
                          )}

                        </td>

                        <td className="px-5 py-4 text-sm font-medium">
                          {contact.name}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              contact.type === "Customer"
                                ? "bg-[#e4eee4] text-[#39533c]"
                                : "bg-[#eee3d9] text-[#684936]"
                            }`}
                          >
                            {contact.type}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-sm text-[#685f57]">
                          {contact.email}
                        </td>

                        <td className="px-5 py-4 text-sm text-[#685f57]">
                          {contact.mobile}
                        </td>

                        <td className="px-5 py-4">

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(contact);
                            }}
                            className="rounded-md p-2 text-[#665b52] transition hover:bg-[#e9e0d5]"
                          >
                            <Pencil size={16} />
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>
          )}

          {/* =========================
              KANBAN VIEW
          ========================== */}

          {view === "kanban" && (

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredContacts.map((contact) => (

                <div
                  key={contact.id}
                  onClick={() => handleEdit(contact)}
                  className="group cursor-pointer rounded-xl border border-[#d8d0c6] bg-[#fffdf9] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="flex items-center gap-4">

                    {/* IMAGE */}
                    {contact.image ? (
                      <img
                        src={contact.image}
                        alt={contact.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#e5ddd3] text-xl font-semibold text-[#57463a]">
                        {contact.name.charAt(0)}
                      </div>
                    )}

                    {/* DETAILS */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <h3 className="font-semibold">
                          {contact.name}
                        </h3>

                        <Pencil
                          size={15}
                          className="opacity-0 transition group-hover:opacity-100"
                        />

                      </div>

                      <p className="mt-1 truncate text-sm text-[#746b63]">
                        {contact.email}
                      </p>

                      <p className="mt-1 text-sm text-[#746b63]">
                        {contact.mobile}
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 border-t border-[#e4ddd5] pt-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        contact.type === "Customer"
                          ? "bg-[#e4eee4] text-[#39533c]"
                          : "bg-[#eee3d9] text-[#684936]"
                      }`}
                    >
                      {contact.type}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

          {/* NO RESULTS */}

          {filteredContacts.length === 0 && (

            <div className="rounded-xl border border-dashed border-[#cfc5ba] bg-[#fffdf9] py-16 text-center">

              <p className="text-lg font-medium">
                No contacts found
              </p>

              <p className="mt-1 text-sm text-[#81776d]">
                Try a different search or create a new contact.
              </p>

            </div>

          )}

        </div>
      )}

      {/* TEMPORARY PASSWORD / CREDENTIALS MODAL */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#d8d0c6] bg-[#fffdf9] p-7 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#e4ddd5] pb-4 text-[#39533c]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4eee4]">
                <CheckCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#30261f]">Portal Account Created</h3>
                <p className="text-xs text-[#746b63]">Credentials for {tempPasswordModal.name}</p>
              </div>
            </div>

            <div className="my-5 space-y-4 rounded-xl border border-[#e4ddd5] bg-[#f9f6f0] p-4 text-xs">
              <div>
                <span className="block font-medium text-[#746b63]">Role / Portal:</span>
                <span className="font-semibold text-[#30261f]">
                  {tempPasswordModal.role === "Vendor" ? "Vendor Portal (/vendor)" : "Customer Portal (/customer)"}
                </span>
              </div>

              <div>
                <span className="block font-medium text-[#746b63]">Login ID:</span>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-[#d8d0c6] bg-white px-3 py-2">
                  <span className="font-mono text-sm font-semibold text-[#30261f]">{tempPasswordModal.loginId}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(tempPasswordModal.loginId)}
                    className="text-[11px] font-medium text-[#4a392d] hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <span className="block font-medium text-[#746b63]">Temporary Password:</span>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-[#d8d0c6] bg-white px-3 py-2">
                  <span className="font-mono text-sm font-semibold text-[#30261f]">{tempPasswordModal.tempPassword}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(tempPasswordModal.tempPassword)}
                    className="text-[11px] font-medium text-[#4a392d] hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-800 flex items-start gap-2">
                <Key size={15} className="mt-0.5 shrink-0" />
                <span>
                  Please share these credentials securely with the contact. They will be prompted to change their password upon their first login.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setTempPasswordModal(null)}
                className="rounded-lg bg-[#4a392d] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#3a2d24] cursor-pointer"
              >
                I Have Saved the Credentials
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Contacts;