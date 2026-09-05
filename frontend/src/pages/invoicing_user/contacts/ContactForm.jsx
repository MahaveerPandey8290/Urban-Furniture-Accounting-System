import { useState, useEffect, useRef } from "react";
import { Plus, Check, ArrowLeft, Upload, Trash2, User, AlertCircle } from "lucide-react";

function ContactForm({ initialData, existingContacts = [], onSave, onNew, onBack }) {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    type: "Customer",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Sync initialData when editing or creating
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || null,
        name: initialData.name || "",
        type: initialData.type || "Customer",
        email: initialData.email || "",
        phone: initialData.phone || "",
        street: initialData.street || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "",
        pincode: initialData.pincode || "",
        image: initialData.image || null,
      });
    } else {
      setFormData({
        id: null,
        name: "",
        type: "Customer",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        image: null,
      });
    }
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image size must be under 5MB" }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData((prev) => ({ ...prev, image: uploadEvent.target.result }));
        setErrors((prev) => ({ ...prev, image: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Contact Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      } else {
        // Unique Email validation: check against existing contacts
        const isDuplicate = existingContacts.some(
          (c) =>
            c.id !== formData.id &&
            c.email?.toLowerCase().trim() === formData.email.toLowerCase().trim()
        );
        if (isDuplicate) {
          newErrors.email = "This email is already registered. Email must be unique.";
        }
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  return (
    <div className="w-full space-y-6">

      {/* ================= TOP ACTION BAR ================= */}
      {/* [ New ] [ Confirm ]                              [ Back ] */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Actions: New & Confirm */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNew}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm font-medium text-[#211D19] hover:bg-[#f3efe7] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            <span>New</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
          >
            <Check size={16} />
            <span>Confirm</span>
          </button>
        </div>

        {/* Right Action: Back */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* General error alert if any */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* ================= MAIN CONTACT MASTER FORM ================= */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#e7e3da] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Form Fields (8 cols) */}
          <div className="lg:col-span-8 space-y-5">

            {/* Contact Name & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Open Wood or Joey Wills"
                  className={`w-full h-10 px-3.5 rounded-lg border ${
                    errors.name ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
                  } bg-white text-sm text-[#211D19] outline-none transition`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-[#faf8f4] border border-[#cfc6b6] rounded-lg h-10">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: "Customer" }))}
                    className={`rounded-md text-sm font-medium transition cursor-pointer flex items-center justify-center ${
                      formData.type === "Customer"
                        ? "bg-[#342921] text-white shadow-xs"
                        : "text-[#716B63] hover:text-[#211D19]"
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: "Vendor" }))}
                    className={`rounded-md text-sm font-medium transition cursor-pointer flex items-center justify-center ${
                      formData.type === "Vendor"
                        ? "bg-[#342921] text-white shadow-xs"
                        : "text-[#716B63] hover:text-[#211D19]"
                    }`}
                  >
                    Vendor
                  </button>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#211D19]">
                  Email <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-medium text-[#716B63] bg-[#faf8f4] border border-[#e7e3da] px-2.5 py-0.5 rounded-md">
                  Unique Email
                </span>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. openwood21@example.com"
                className={`w-full h-10 px-3.5 rounded-lg border ${
                  errors.email ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
                } bg-white text-sm text-[#211D19] outline-none transition`}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-[#716B63]">Unique Email</p>
                {errors.email && (
                  <p className="text-xs text-red-600 font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9090909090"
                className={`w-full h-10 px-3.5 rounded-lg border ${
                  errors.phone ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
                } bg-white text-sm text-[#211D19] outline-none transition`}
              />
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address Section */}
            <div className="pt-4 border-t border-[#f0ece4] space-y-4">
              <h2 className="text-base font-semibold text-[#211D19] tracking-tight">
                Address
              </h2>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Street address, building, suite, or area"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
                  />
                </div>
              </div>

              {/* Country & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g. India"
                    className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 560103"
                    className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Image Upload Section (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-[#faf8f4] border border-[#e7e3da] rounded-2xl p-6 text-center">
              <label className="block text-sm font-medium text-[#211D19] mb-3">
                Upload Image
              </label>

              {/* Image Preview Box */}
              <div className="w-36 h-36 mx-auto rounded-2xl overflow-hidden bg-white border-2 border-dashed border-[#cfc6b6] flex items-center justify-center relative group">
                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      alt="Contact Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      title="Remove image"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-[#f5f2eb] text-[#716B63] mx-auto flex items-center justify-center mb-2">
                      <User size={22} />
                    </div>
                    <span className="text-xs text-[#716B63] block">No image selected</span>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="contact-image-upload"
              />

              {/* Upload Image Button */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
                >
                  <Upload size={16} />
                  <span>Upload Image</span>
                </button>
                <p className="text-xs text-[#716B63] mt-2">
                  JPG, PNG or WEBP (Max 5MB)
                </p>
              </div>

              {errors.image && (
                <p className="text-xs text-red-600 mt-2">{errors.image}</p>
              )}
            </div>
          </div>

        </div>
      </form>

    </div>
  );
}

export default ContactForm;
