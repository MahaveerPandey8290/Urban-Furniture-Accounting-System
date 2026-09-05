import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ArrowLeft } from "lucide-react";
import ProductList from "./ProductList";
import ProductKanban from "./ProductKanban";
import ProductForm from "./ProductForm";
import Toast, { useToast } from "../../../components/common/Toast";
import ViewToggle from "../../../components/common/ViewToggle";

const STORAGE_KEY_PRODUCTS = "urban_furniture_products_master";
const STORAGE_KEY_CATEGORIES = "urban_furniture_categories_master";

const INITIAL_CATEGORIES = [
  "Raw Material",
  "Round Table",
  "Modular Furniture",
  "Beds",
];

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    productName: "Teak Hardwood Logs",
    productType: "Goods",
    category: "Raw Material",
    salesPrice: 25000,
    cost: 15000,
    image: null,
  },
  {
    id: "prod-2",
    productName: "Solid Oak Round Dining Table",
    productType: "Goods",
    category: "Round Table",
    salesPrice: 32000,
    cost: 19000,
    image: null,
  },
  {
    id: "prod-3",
    productName: "Modular Office Workstation 4-Pod",
    productType: "Goods",
    category: "Modular Furniture",
    salesPrice: 48000,
    cost: 28000,
    image: null,
  },
  {
    id: "prod-4",
    productName: "King Size Storage Bed",
    productType: "Goods",
    category: "Beds",
    salesPrice: 42000,
    cost: 26000,
    image: null,
  },
];

function ProductMaster() {
  const navigate = useNavigate();

  // Load products from localStorage or fallback to mock
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasLegacy = parsed.some((p) => p.category === "Electronics" || p.category === "Office");
          if (hasLegacy) {
            return INITIAL_PRODUCTS;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load products from storage:", e);
    }
    return INITIAL_PRODUCTS;
  });

  // Load categories from localStorage or fallback
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed.includes("Electronics") || parsed.includes("Office")) {
            return INITIAL_CATEGORIES;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load categories from storage:", e);
    }
    return INITIAL_CATEGORIES;
  });

  // Views: 'list' (default) | 'kanban' | 'form'
  const [currentView, setCurrentView] = useState("list");
  const [previousBrowseView, setPreviousBrowseView] = useState("list");

  // Selected product when editing in form view (null for new)
  const [editingProduct, setEditingProduct] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Checkbox selection in table view
  const [selectedIds, setSelectedIds] = useState([]);
  const { toastMessage, showToast } = useToast();

  // Persist products
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to storage:", e);
    }
  }, [products]);

  // Persist categories
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to save categories to storage:", e);
    }
  }, [categories]);

  // Switch to Form View for creating a new product
  const handleNewProduct = () => {
    if (currentView !== "form") {
      setPreviousBrowseView(currentView);
    }
    setEditingProduct(null);
    setCurrentView("form");
  };

  // Switch to Form View for editing an existing product
  const handleSelectProduct = (product) => {
    if (currentView !== "form") {
      setPreviousBrowseView(currentView);
    }
    setEditingProduct(product);
    setCurrentView("form");
  };

  // Back button handler
  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView(previousBrowseView);
      setEditingProduct(null);
    } else {
      navigate("/invoicing_user");
    }
  };

  // Save product (from Confirm button)
  const handleSaveProduct = (formData) => {
    if (formData.id) {
      // Update existing
      setProducts((prev) =>
        prev.map((p) => (p.id === formData.id ? { ...formData } : p))
      );
      showToast("Product updated successfully");
    } else {
      // Create new
      const newProduct = {
        ...formData,
        id: "prod-" + Date.now(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast("Product created successfully");
    }

    // Return to previous browse view
    setCurrentView(previousBrowseView);
    setEditingProduct(null);
  };

  // Add category on the fly
  const handleAddCategory = (newCat) => {
    if (!categories.includes(newCat)) {
      setCategories((prev) => [...prev, newCat]);
      showToast(`Category "${newCat}" created`);
    }
  };

  // Real-time filtering by product name, category, and type
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const nameMatch = p.productName?.toLowerCase().includes(query);
      const categoryMatch = p.category?.toLowerCase().includes(query);
      const typeMatch = p.productType?.toLowerCase().includes(query);
      return nameMatch || categoryMatch || typeMatch;
    });
  }, [products, searchQuery]);

  // Checkbox selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredProducts.map((p) => p.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Delete product
  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setSelectedIds((prev) => prev.filter((id) => id !== productId));
      showToast("Product deleted successfully");
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Header breadcrumb & title */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-2 text-sm text-[#716B63] mb-1">
          <span>Account</span>
          <span>/</span>
          <span className="text-[#211D19] font-medium">Product</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
          {currentView === "form"
            ? editingProduct
              ? editingProduct.productName || "Product Master"
              : "New Product"
            : "Product Master"}
        </h1>
      </div>

      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* ================= VIEW 1 & 2: LIST / KANBAN ================= */}
      {currentView !== "form" && (
        <>
          {/* Top Action Bar: [ New ]    [ Search ]                         [ Back ] */}
          {/* On right side: [ List View ] [ Kanban View ] */}
          <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Left side: [ New ]  [ Search ] */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <button
                type="button"
                onClick={handleNewProduct}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
              >
                <Plus size={16} />
                <span>New</span>
              </button>

              {/* Search Field */}
              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716B63]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product, category, type..."
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
                />
              </div>
            </div>

            {/* Right side: [ List View ] [ Kanban View ]  [ Back ] */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">

              {/* View Switch Controls */}
              <ViewToggle currentView={currentView} onChange={setCurrentView} />

              {/* Back Button */}
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

            </div>

          </div>

          {/* List or Kanban Component */}
          {currentView === "list" ? (
            <ProductList
              products={filteredProducts}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onSelectProduct={handleSelectProduct}
              onEditProduct={handleSelectProduct}
              onDeleteProduct={handleDeleteProduct}
              onNewProduct={handleNewProduct}
            />
          ) : (
            <ProductKanban
              products={filteredProducts}
              onSelectProduct={handleSelectProduct}
              onEditProduct={handleSelectProduct}
              onDeleteProduct={handleDeleteProduct}
              onNewProduct={handleNewProduct}
            />
          )}
        </>
      )}

      {/* ================= VIEW 3: PRODUCT MASTER FORM VIEW ================= */}
      {currentView === "form" && (
        <ProductForm
          initialData={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onNew={handleNewProduct}
          onBack={handleBack}
          onAddCategory={handleAddCategory}
        />
      )}

    </div>
  );
}

export default ProductMaster;
