import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ArrowLeft } from "lucide-react";
import ProductList from "./ProductList";
import ProductKanban from "./ProductKanban";
import ProductForm from "./ProductForm";
import Toast, { useToast } from "../../../components/common/Toast";
import ViewToggle from "../../../components/common/ViewToggle";
import api from "../../../services/api";

function ProductMaster() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rawCategories, setRawCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/products?limit=100"),
        api.get("/product-categories").catch(() => ({ data: { items: [] } })),
      ]);

      const catList = catRes.data?.items || [];
      setRawCategories(catList);
      const catNames = catList.map((c) => c.name);
      setCategories(catNames.length > 0 ? catNames : ["Raw Material", "Round Table", "Modular Furniture", "Beds"]);

      const mapped = (prodRes.data?.items || []).map((p) => ({
        id: p.id,
        productName: p.name,
        productType: p.type === "GOODS" ? "Goods" : p.type === "SERVICE" ? "Service" : "Combo",
        category: p.category?.name || "General",
        categoryId: p.categoryId,
        salesPrice: Number(p.salesPrice) || 0,
        cost: Number(p.cost) || 0,
        image: p.imageUrl || null,
      }));
      setProducts(mapped);
    } catch (err) {
      console.error("Failed to load products:", err);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
  const handleSaveProduct = async (formData) => {
    // Look up categoryId
    const matchedCategory = rawCategories.find(
      (c) => c.name.toLowerCase() === (formData.category || "").toLowerCase()
    );

    const payload = {
      name: formData.productName,
      type: formData.productType === "Service" ? "SERVICE" : formData.productType === "Combo" ? "COMBO" : "GOODS",
      categoryId: matchedCategory ? matchedCategory.id : (rawCategories[0]?.id || undefined),
      salesPrice: Number(formData.salesPrice) || 0,
      cost: Number(formData.cost) || 0,
    };

    try {
      if (formData.id && typeof formData.id === "number") {
        await api.put(`/products/${formData.id}`, payload);
        showToast("Product updated successfully");
      } else {
        await api.post("/products", payload);
        showToast("Product created successfully");
      }
      await fetchData();
      setCurrentView(previousBrowseView);
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to save product:", err);
      showToast(err.response?.data?.message || "Failed to save product", "error");
    }
  };

  // Add category on the fly
  const handleAddCategory = async (newCat) => {
    if (!categories.includes(newCat)) {
      try {
        const res = await api.post("/product-categories", { name: newCat }).catch(() => null);
        if (res?.data?.data) {
          setRawCategories((prev) => [...prev, res.data.data]);
        }
        setCategories((prev) => [...prev, newCat]);
        showToast(`Category "${newCat}" created`);
      } catch {
        setCategories((prev) => [...prev, newCat]);
        showToast(`Category "${newCat}" added`);
      }
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
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${productId}`);
        showToast("Product deleted successfully");
        await fetchData();
      } catch (err) {
        console.error("Failed to delete product:", err);
        showToast(err.response?.data?.message || "Failed to delete product", "error");
      }
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
