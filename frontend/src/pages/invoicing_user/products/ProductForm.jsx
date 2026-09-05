import { useState, useEffect, useRef } from "react";
import { Plus, Check, ArrowLeft, Upload, Trash2, Package, AlertCircle } from "lucide-react";
import CategoryModal from "./CategoryModal";

function ProductForm({
  initialData,
  categories = [],
  onSave,
  onNew,
  onBack,
  onAddCategory,
}) {
  const [formData, setFormData] = useState({
    id: null,
    productName: "",
    productType: "Goods",
    category: "",
    image: null,
    salesPrice: "",
    cost: "",
  });

  const [errors, setErrors] = useState({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Sync initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || null,
        productName: initialData.productName || "",
        productType: initialData.productType || "Goods",
        category: initialData.category || (categories[0] || ""),
        image: initialData.image || null,
        salesPrice: initialData.salesPrice !== undefined ? String(initialData.salesPrice) : "",
        cost: initialData.cost !== undefined ? String(initialData.cost) : "",
      });
    } else {
      setFormData({
        id: null,
        productName: "",
        productType: "Goods",
        category: categories[0] || "",
        image: null,
        salesPrice: "",
        cost: "",
      });
    }
    setErrors({});
  }, [initialData, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCategorySelectChange = (e) => {
    const val = e.target.value;
    if (val === "__CREATE_NEW__") {
      setIsCategoryModalOpen(true);
    } else {
      setFormData((prev) => ({ ...prev, category: val }));
      if (errors.category) {
        setErrors((prev) => ({ ...prev, category: null }));
      }
    }
  };

  const handleCategoryCreated = (newCat) => {
    onAddCategory(newCat);
    setFormData((prev) => ({ ...prev, category: newCat }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: null }));
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

    if (!formData.productName.trim()) {
      newErrors.productName = "Product Name is required";
    }

    if (!formData.productType) {
      newErrors.productType = "Product Type is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    // Sales Price validation
    if (!formData.salesPrice.trim()) {
      newErrors.salesPrice = "Sales Price is required";
    } else {
      const numSales = Number(formData.salesPrice);
      if (isNaN(numSales)) {
        newErrors.salesPrice = "Sales Price must be a valid number";
      } else if (numSales < 0) {
        newErrors.salesPrice = "Sales Price cannot be negative";
      }
    }

    // Cost validation
    if (!formData.cost.trim()) {
      newErrors.cost = "Cost is required";
    } else {
      const numCost = Number(formData.cost);
      if (isNaN(numCost)) {
        newErrors.cost = "Cost must be a valid number";
      } else if (numCost < 0) {
        newErrors.cost = "Cost cannot be negative";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      salesPrice: Number(formData.salesPrice),
      cost: Number(formData.cost),
    });
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

      {/* ================= MAIN PRODUCT MASTER FORM ================= */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#e7e3da] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left / Center Column: Form Inputs (8 cols) */}
          <div className="lg:col-span-8 space-y-5">

            {/* 1. Product Name */}
            <div>
              <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="e.g. Air Conditioner or Executive Ergonomic Chair"
                className={`w-full h-10 px-3.5 rounded-lg border ${
                  errors.productName ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
                } bg-white text-sm text-[#211D19] outline-none transition`}
              />
              {errors.productName && (
                <p className="text-xs text-red-600 mt-1">{errors.productName}</p>
              )}
            </div>

            {/* 2. Product Type & 3. Category (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  className={`w-full h-10 px-3.5 rounded-lg border ${
                    errors.productType ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
                  } bg-white text-sm text-[#211D19] outline-none transition cursor-pointer`}
                >
                  <option value="Goods">Goods</option>
                  <option value="Service">Service</option>
                  <option value="Combo">Combo</option>
                </select>
                {errors.productType && (
                  <p className="text-xs text-red-600 mt-1">{errors.productType}</p>
                )}
              </div>

              {/* Category (supports Many2one create on the fly) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[#211D19]">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-xs font-medium text-[#4a3b2f] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Create New</span>
                  </button>
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategorySelectChange}
                  className={`w-full h-10 px-3.5 rounded-lg border ${
                    errors.category ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
                  } bg-white text-sm text-[#211D19] outline-none transition cursor-pointer`}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__CREATE_NEW__" className="font-semibold text-[#342921]">
                    + Create New Category
                  </option>
                </select>
                {errors.category && (
                  <p className="text-xs text-red-600 mt-1">{errors.category}</p>
                )}
              </div>

            </div>

            {/* 5. Sales Price & 6. Cost (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

              {/* Sales Price */}
              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                  Sales Price (Rs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#716B63] select-none">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="salesPrice"
                    value={formData.salesPrice}
                    onChange={handleChange}
                    placeholder="100.00"
                    className={`w-full h-10 pl-11 pr-3.5 rounded-lg border ${
                      errors.salesPrice ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
                    } bg-white text-sm text-[#211D19] outline-none transition`}
                  />
                </div>
                {errors.salesPrice && (
                  <p className="text-xs text-red-600 mt-1">{errors.salesPrice}</p>
                )}
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                  Cost (Rs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#716B63] select-none">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="50.00"
                    className={`w-full h-10 pl-11 pr-3.5 rounded-lg border ${
                      errors.cost ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
                    } bg-white text-sm text-[#211D19] outline-none transition`}
                  />
                </div>
                {errors.cost && (
                  <p className="text-xs text-red-600 mt-1">{errors.cost}</p>
                )}
              </div>

            </div>

          </div>

          {/* Right Column: 4. Product Image Upload Area (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-[#faf8f4] border border-[#e7e3da] rounded-2xl p-6 text-center">
              <label className="block text-sm font-medium text-[#211D19] mb-3">
                Product Image
              </label>

              {/* Preview Box */}
              <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden bg-white border-2 border-dashed border-[#cfc6b6] flex items-center justify-center relative group">
                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      alt="Product Preview"
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
                      <Package size={22} />
                    </div>
                    <span className="text-xs text-[#716B63] block">No image uploaded</span>
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
                id="product-image-upload"
              />

              {/* Upload Button */}
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

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCreateCategory={handleCategoryCreated}
        existingCategories={categories}
      />

    </div>
  );
}

export default ProductForm;
