import { useState } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  Pencil,
  Trash2,
  LayoutList,
  Kanban,
  X,
  Upload,
  Package,
} from "lucide-react";

function Products() {
  // --------------------------------------------------
  // PRODUCT DATA
  // --------------------------------------------------

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Air Conditioner",
      type: "Goods",
      category: "Electronics",
      salesPrice: 25000,
      cost: 15000,
      image: "",
    },
    {
      id: 2,
      name: "Refrigerator",
      type: "Goods",
      category: "Electronics",
      salesPrice: 10000,
      cost: 7000,
      image: "",
    },
    {
      id: 3,
      name: "Office Chair",
      type: "Goods",
      category: "Furniture",
      salesPrice: 8500,
      cost: 5000,
      image: "",
    },
    {
      id: 4,
      name: "Wooden Table",
      type: "Goods",
      category: "Furniture",
      salesPrice: 15000,
      cost: 9000,
      image: "",
    },
  ]);

  // --------------------------------------------------
  // STATES
  // --------------------------------------------------

  const [view, setView] = useState("list");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [showCategoryInput, setShowCategoryInput] = useState(false);

  const [newCategory, setNewCategory] = useState("");

  const [categories, setCategories] = useState([
    "Electronics",
    "Furniture",
    "Office",
    "Home Appliances",
  ]);

  const [formData, setFormData] = useState({
    name: "",
    type: "Goods",
    category: "",
    salesPrice: "",
    cost: "",
    image: "",
  });

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText) ||
      product.type.toLowerCase().includes(searchText)
    );
  });

  // --------------------------------------------------
  // OPEN CREATE FORM
  // --------------------------------------------------

  const handleNew = () => {
    setEditingProduct(null);

    setFormData({
      name: "",
      type: "Goods",
      category: "",
      salesPrice: "",
      cost: "",
      image: "",
    });

    setShowForm(true);
  };

  // --------------------------------------------------
  // OPEN EDIT FORM
  // --------------------------------------------------

  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      type: product.type,
      category: product.category,
      salesPrice: product.salesPrice,
      cost: product.cost,
      image: product.image || "",
    });

    setShowForm(true);
  };

  // --------------------------------------------------
  // CLOSE FORM
  // --------------------------------------------------

  const handleBack = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // --------------------------------------------------
  // FORM INPUT
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // ADD CATEGORY
  // --------------------------------------------------

  const handleAddCategory = () => {
    const category = newCategory.trim();

    if (!category) return;

    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category]);
    }

    setFormData((prev) => ({
      ...prev,
      category,
    }));

    setNewCategory("");
    setShowCategoryInput(false);
  };

  // --------------------------------------------------
  // SAVE PRODUCT
  // --------------------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.category ||
      formData.salesPrice === "" ||
      formData.cost === ""
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                ...formData,
                salesPrice: Number(formData.salesPrice),
                cost: Number(formData.cost),
              }
            : product
        )
      );
    } else {
      const newProduct = {
        id: Date.now(),
        ...formData,
        salesPrice: Number(formData.salesPrice),
        cost: Number(formData.cost),
      };

      setProducts((prev) => [...prev, newProduct]);
    }

    handleBack();
  };

  // --------------------------------------------------
  // DELETE PRODUCT
  // --------------------------------------------------

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    setProducts((prev) =>
      prev.filter((product) => product.id !== id)
    );
  };

  // --------------------------------------------------
  // FORMAT PRICE
  // --------------------------------------------------

  const formatPrice = (price) => {
    return `₹ ${Number(price).toLocaleString("en-IN")}`;
  };

  // ==================================================
  // FORM VIEW
  // ==================================================

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#f5f1e9] px-8 py-8">

        {/* Form Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-semibold text-[#30261f]">
              {editingProduct ? "Edit Product" : "New Product"}
            </h1>

            <p className="mt-1 text-sm text-[#756a60]">
              {editingProduct
                ? "Update product information."
                : "Create a new product."}
            </p>
          </div>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg border border-[#cfc5b8] bg-[#faf8f4] px-5 py-3 text-sm font-medium text-[#403329] hover:bg-[#eee8de]"
          >
            <ArrowLeft size={18} />
            Back
          </button>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl rounded-2xl border border-[#ddd5ca] bg-[#faf8f4] p-8"
        >

          {/* Top Buttons */}
          <div className="mb-8 flex gap-3">

            <button
              type="submit"
              className="rounded-lg bg-[#403329] px-6 py-3 text-sm font-medium text-white hover:bg-[#59483a]"
            >
              {editingProduct ? "Update" : "Confirm"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-[#cfc5b8] px-6 py-3 text-sm font-medium text-[#403329] hover:bg-[#eee8de]"
            >
              Cancel
            </button>

          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[180px_1fr]">

            {/* IMAGE */}
            <div>

              <label className="mb-3 block text-sm font-medium text-[#403329]">
                Product Image
              </label>

              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#cfc5b8] bg-[#f5f1e9]">

                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Product"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center text-[#8a7d72]">
                    <Upload
                      size={28}
                      className="mx-auto mb-2"
                    />

                    <p className="text-xs">
                      Upload Image
                    </p>
                  </div>
                )}

              </div>

              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="Image URL"
                className="mt-3 w-40 rounded-lg border border-[#d8d0c5] bg-white px-3 py-2 text-xs outline-none focus:border-[#806b58]"
              />

            </div>

            {/* FIELDS */}
            <div className="space-y-6">

              {/* Product Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#403329]">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-[#d8d0c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#806b58]"
                  required
                />
              </div>

              {/* Product Type */}
              <div>
                <label className="mb-3 block text-sm font-medium text-[#403329]">
                  Product Type
                </label>

                <div className="flex gap-8">

                  {["Goods", "Service", "Combo"].map(
                    (type) => (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-2 text-sm text-[#403329]"
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={formData.type === type}
                          onChange={handleChange}
                          className="h-4 w-4 accent-[#403329]"
                        />

                        {type}
                      </label>
                    )
                  )}

                </div>
              </div>

              {/* Category */}
              <div>

                <label className="mb-2 block text-sm font-medium text-[#403329]">
                  Category
                </label>

                {!showCategoryInput ? (
                  <div className="flex gap-3">

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="flex-1 rounded-lg border border-[#d8d0c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#806b58]"
                      required
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        setShowCategoryInput(true)
                      }
                      className="flex items-center gap-1 rounded-lg bg-[#403329] px-4 py-3 text-sm text-white hover:bg-[#59483a]"
                    >
                      <Plus size={16} />
                      New
                    </button>

                  </div>
                ) : (
                  <div className="flex gap-3">

                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(e.target.value)
                      }
                      placeholder="Enter new category"
                      className="flex-1 rounded-lg border border-[#d8d0c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#806b58]"
                      autoFocus
                    />

                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="rounded-lg bg-[#403329] px-5 py-3 text-sm text-white"
                    >
                      Add
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowCategoryInput(false)
                      }
                      className="rounded-lg border border-[#cfc5b8] px-4 py-3 text-[#403329]"
                    >
                      <X size={18} />
                    </button>

                  </div>
                )}

              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#403329]">
                    Sales Price
                  </label>

                  <input
                    type="number"
                    name="salesPrice"
                    value={formData.salesPrice}
                    onChange={handleChange}
                    placeholder="₹ 0.00"
                    min="0"
                    className="w-full rounded-lg border border-[#d8d0c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#806b58]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#403329]">
                    Cost (Purchase Price)
                  </label>

                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="₹ 0.00"
                    min="0"
                    className="w-full rounded-lg border border-[#d8d0c5] bg-white px-4 py-3 text-sm outline-none focus:border-[#806b58]"
                    required
                  />
                </div>

              </div>

            </div>

          </div>

        </form>
      </div>
    );
  }

  // ==================================================
  // LIST / KANBAN VIEW
  // ==================================================

  return (
    <div className="min-h-screen bg-[#f5f1e9] px-8 py-8">

      {/* HEADER */}
      <div className="mb-7 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-semibold text-[#30261f]">
            Product Master
          </h1>

          <p className="mt-1 text-sm text-[#756a60]">
            Manage goods, services and combo products.
          </p>
        </div>

        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-lg bg-[#403329] px-5 py-3 text-sm font-medium text-white hover:bg-[#59483a]"
        >
          <Plus size={18} />
          New
        </button>

      </div>

      {/* TOOLBAR */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#ddd5ca] bg-[#faf8f4] p-4">

        {/* SEARCH */}
        <div className="relative w-full max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#82776d]"
          />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#d8d0c5] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#806b58]"
          />

        </div>

        {/* VIEW SWITCH */}
        <div className="flex rounded-lg border border-[#d8d0c5] bg-white p-1">

          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm ${
              view === "list"
                ? "bg-[#403329] text-white"
                : "text-[#665a50]"
            }`}
          >
            <LayoutList size={17} />
            List
          </button>

          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm ${
              view === "kanban"
                ? "bg-[#403329] text-white"
                : "text-[#665a50]"
            }`}
          >
            <Kanban size={17} />
            Kanban
          </button>

        </div>

      </div>

      {/* ==================================================
          LIST VIEW
      ================================================== */}

      {view === "list" && (
        <div className="overflow-hidden rounded-xl border border-[#ddd5ca] bg-[#faf8f4]">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>
                <tr className="border-b border-[#ddd5ca] bg-[#eee8de] text-left">

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#756a60]">
                    Select
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#756a60]">
                    Product
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#756a60]">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#756a60]">
                    Type
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#756a60]">
                    Sales Price
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#756a60]">
                    Cost
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#756a60]">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-[#e5ded4] last:border-b-0 hover:bg-[#f4efe7]"
                    >

                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#403329]"
                        />
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#e7dfd3]">

                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package
                                size={18}
                                className="text-[#655546]"
                              />
                            )}

                          </div>

                          <span className="font-medium text-[#30261f]">
                            {product.name}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4 text-sm text-[#51473f]">
                        {product.category}
                      </td>

                      <td className="px-5 py-4">

                        <span className="rounded-full bg-[#e8e0d5] px-3 py-1 text-xs font-medium text-[#554638]">
                          {product.type}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[#403329]">
                        {formatPrice(product.salesPrice)}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#51473f]">
                        {formatPrice(product.cost)}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-1">

                          <button
                            onClick={() => handleEdit(product)}
                            className="rounded-lg p-2 text-[#665548] hover:bg-[#e8dfd3]"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(product.id)
                            }
                            className="rounded-lg p-2 text-[#805b50] hover:bg-[#eee0db]"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-sm text-[#82776d]"
                    >
                      No products found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* ==================================================
          KANBAN VIEW
      ================================================== */}

      {view === "kanban" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-[#d9d0c5] bg-[#faf8f4] p-5 transition hover:shadow-md"
              >

                <div className="flex items-start gap-4">

                  {/* IMAGE */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e7dfd3]">

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package
                        size={26}
                        className="text-[#655546]"
                      />
                    )}

                  </div>

                  {/* INFO */}
                  <div className="min-w-0 flex-1">

                    <h3 className="truncate font-semibold text-[#30261f]">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#82776d]">
                      {product.category}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-[#e8e0d5] px-2.5 py-1 text-[11px] text-[#554638]">
                      {product.type}
                    </span>

                  </div>

                </div>

                {/* PRICE */}
                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-lg bg-[#eee8de] p-3">
                    <p className="text-xs text-[#82776d]">
                      Sales Price
                    </p>

                    <p className="mt-1 font-semibold text-[#403329]">
                      {formatPrice(product.salesPrice)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#eee8de] p-3">
                    <p className="text-xs text-[#82776d]">
                      Cost
                    </p>

                    <p className="mt-1 font-semibold text-[#403329]">
                      {formatPrice(product.cost)}
                    </p>
                  </div>

                </div>

                {/* ACTIONS */}
                <div className="mt-4 flex justify-end gap-2 border-t border-[#e2dad0] pt-4">

                  <button
                    onClick={() => handleEdit(product)}
                    className="rounded-lg border border-[#d1c7bb] px-4 py-2 text-xs text-[#554638] hover:bg-[#eee8de]"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(product.id)
                    }
                    className="rounded-lg border border-[#d8c2ba] px-4 py-2 text-xs text-[#805b50] hover:bg-[#eee0db]"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-[#ddd5ca] bg-[#faf8f4] py-16 text-center text-sm text-[#82776d]">
              No products found.
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default Products;