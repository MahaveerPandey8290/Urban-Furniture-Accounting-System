import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  FilePlus,
  AlertTriangle,
  ShoppingBag,
  Calendar,
  User,
  PieChart,
  X,
  FileCheck,
  AlertCircle,
  Info,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import {
  getVendors,
  getProducts,
  getBudgets,
  getNextPONumber,
  calculateBudgetUtilization,
} from "../../../utils/storage";

function PurchaseOrderForm({
  initialData,
  onSave,
  onConfirm,
  onCreateBill,
  onNew,
  onCancel,
  onBack,
}) {
  const isEditing = Boolean(initialData?.id);
  const isConfirmed = initialData?.status === "Confirmed";
  const isCancelled = initialData?.status === "Cancelled";
  const isDraft = !initialData?.status || initialData?.status === "Draft";
  const hasBill = Boolean(initialData?.billId || initialData?.billNumber);

  // Master lists
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    setVendors(getVendors());
    setProducts(getProducts());
    setBudgets(getBudgets());
  }, []);

  // Form State
  const [poNumber, setPoNumber] = useState(() => {
    if (initialData?.poNumber) return initialData.poNumber;
    return getNextPONumber();
  });

  const [vendorId, setVendorId] = useState(() => initialData?.vendorId || "");
  const [vendorName, setVendorName] = useState(() => initialData?.vendorName || "");
  const [poDate, setPoDate] = useState(() => {
    if (initialData?.poDate) return initialData.poDate;
    return new Date().toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState(() => initialData?.notes || "");

  // Line items state
  const [items, setItems] = useState(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((it, idx) => ({
        id: it.id || `po-item-${idx + 1}`,
        productId: it.productId || "",
        productName: it.productName || "",
        budgetId: it.budgetId || "",
        budgetName: it.budgetName || "",
        analyticAccount: it.analyticAccount || "",
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      }));
    }

    // Default 1 line
    return [
      {
        id: "po-item-1",
        productId: "",
        productName: "",
        budgetId: "",
        budgetName: "",
        analyticAccount: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ];
  });

  // Errors & Validation state
  const [errors, setErrors] = useState({});
  // Budget warning modal state
  const [budgetWarning, setBudgetWarning] = useState(null); // { budgetName, remaining, requestedAmount }
  const [budgetWarningAcknowledged, setBudgetWarningAcknowledged] = useState(false);

  // Initialize defaults once masters load if creating new
  useEffect(() => {
    if (!initialData && products.length > 0 && budgets.length > 0) {
      setItems((prev) =>
        prev.map((item, idx) => {
          if (idx === 0 && !item.productId) {
            const firstProd = products[0];
            const firstBudget = budgets[0];
            const price = Number(firstProd.cost || firstProd.salesPrice) || 0;
            return {
              ...item,
              productId: firstProd.id,
              productName: firstProd.productName,
              budgetId: firstBudget.id,
              budgetName: firstBudget.budgetName,
              analyticAccount: firstBudget.analyticAccountName,
              quantity: 1,
              unitPrice: price,
              total: price,
            };
          }
          return item;
        })
      );
    }
  }, [products, budgets, initialData]);

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setPoNumber(initialData.poNumber || "");
      setVendorId(initialData.vendorId || "");
      setVendorName(initialData.vendorName || "");
      setPoDate(initialData.poDate || new Date().toISOString().split("T")[0]);
      setNotes(initialData.notes || "");
      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((it, idx) => ({
            id: it.id || `po-item-${idx + 1}`,
            productId: it.productId || "",
            productName: it.productName || "",
            budgetId: it.budgetId || "",
            budgetName: it.budgetName || "",
            analyticAccount: it.analyticAccount || "",
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
          }))
        );
      }
    }
  }, [initialData]);

  // Handle vendor select
  const handleVendorSelect = (e) => {
    const vId = e.target.value;
    setVendorId(vId);
    const selected = vendors.find((v) => v.id === vId);
    setVendorName(selected ? selected.name : "");
    if (errors.vendor) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.vendor;
        return copy;
      });
    }
  };

  // Compute Grand Total
  const grandTotal = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  }, [items]);

  // Handle Line Item field changes
  const handleItemChange = (index, field, value) => {
    if (isConfirmed || isCancelled) return;

    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === "productId") {
        target.productId = value;
        const selectedProd = products.find((p) => p.id === value);
        if (selectedProd) {
          target.productName = selectedProd.productName;
          // Auto-fetch purchase cost from Product Master
          const cost = Number(selectedProd.cost || selectedProd.salesPrice) || 0;
          target.unitPrice = cost;
          target.total = (Number(target.quantity) || 1) * cost;
        }
      } else if (field === "budgetId") {
        target.budgetId = value;
        const selectedBgt = budgets.find((b) => b.id === value);
        if (selectedBgt) {
          target.budgetName = selectedBgt.budgetName;
          target.analyticAccount = selectedBgt.analyticAccountName;
        }
      } else if (field === "quantity") {
        const qty = Math.max(0, Number(value));
        target.quantity = qty;
        target.total = qty * (Number(target.unitPrice) || 0);
      } else if (field === "unitPrice") {
        const price = Math.max(0, Number(value));
        target.unitPrice = price;
        target.total = (Number(target.quantity) || 0) * price;
      }

      updated[index] = target;
      return updated;
    });

    // Clear line error
    if (errors[`item_${index}_${field}`] || errors.items) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`item_${index}_${field}`];
        delete copy.items;
        return copy;
      });
    }
  };

  // Add line item
  const handleAddItem = () => {
    if (isConfirmed || isCancelled) return;
    const defaultProd = products.length > 0 ? products[0] : null;
    const defaultBudget = budgets.length > 0 ? budgets[0] : null;
    const cost = defaultProd ? Number(defaultProd.cost || defaultProd.salesPrice) || 0 : 0;

    setItems((prev) => [
      ...prev,
      {
        id: `po-item-${Date.now()}-${prev.length + 1}`,
        productId: defaultProd ? defaultProd.id : "",
        productName: defaultProd ? defaultProd.productName : "",
        budgetId: defaultBudget ? defaultBudget.id : "",
        budgetName: defaultBudget ? defaultBudget.budgetName : "",
        analyticAccount: defaultBudget ? defaultBudget.analyticAccountName : "",
        quantity: 1,
        unitPrice: cost,
        total: cost,
      },
    ]);
  };

  // Remove line item
  const handleRemoveItem = (index) => {
    if (isConfirmed || isCancelled) return;
    if (items.length <= 1) {
      setErrors((prev) => ({
        ...prev,
        items: "A purchase order must contain at least one product row.",
      }));
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Validate form fields
  const validateForm = () => {
    const errs = {};

    if (!vendorId || !vendorName) {
      errs.vendor = "Please select a vendor from Contact Master.";
    }

    if (!poDate) {
      errs.poDate = "PO Date is required.";
    }

    if (!items || items.length === 0) {
      errs.items = "Please add at least one product line item.";
    } else {
      items.forEach((it, idx) => {
        if (!it.productId) {
          errs[`item_${idx}_productId`] = "Select a product";
        }
        if (!it.quantity || it.quantity <= 0) {
          errs[`item_${idx}_quantity`] = "Qty > 0";
        }
        if (it.unitPrice === undefined || it.unitPrice < 0) {
          errs[`item_${idx}_unitPrice`] = "Price ≥ 0";
        }
        if (!it.budgetId) {
          errs[`item_${idx}_budgetId`] = "Select budget";
        }
      });
    }

    if (grandTotal <= 0) {
      errs.total = "Total purchase order amount must be greater than zero.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Check budget limits for all items
  const checkBudgetExceeded = () => {
    // Group line item totals by budgetId
    const budgetTotals = {};
    items.forEach((it) => {
      if (it.budgetId) {
        budgetTotals[it.budgetId] = (budgetTotals[it.budgetId] || 0) + (Number(it.total) || 0);
      }
    });

    for (const bId of Object.keys(budgetTotals)) {
      const { remaining, allocated } = calculateBudgetUtilization(bId);
      const requested = budgetTotals[bId];
      // If this PO was already confirmed, don't count its own previous items
      if (requested > remaining && allocated > 0) {
        const b = budgets.find((item) => item.id === bId);
        return {
          budgetId: bId,
          budgetName: b?.budgetName || "Selected Budget Line",
          allocated,
          remaining,
          requestedAmount: requested,
        };
      }
    }
    return null;
  };

  // Handle Confirm Click
  const handleConfirmClick = () => {
    if (!validateForm()) return;

    // Check if budget exceeded, unless user already acknowledged the warning
    if (!budgetWarningAcknowledged) {
      const exceeded = checkBudgetExceeded();
      if (exceeded) {
        setBudgetWarning(exceeded);
        return;
      }
    }

    // Process Confirmation
    const poPayload = {
      id: initialData?.id || `po-${Date.now()}`,
      poNumber,
      vendorId,
      vendorName,
      poDate,
      status: "Confirmed",
      billId: initialData?.billId || null,
      billNumber: initialData?.billNumber || null,
      total: grandTotal,
      notes,
      items: items.map((it, idx) => ({
        ...it,
        id: it.id || `po-item-${idx + 1}`,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
    };

    onConfirm(poPayload);
  };

  // Acknowledge warning and proceed with confirmation
  const handleProceedExceededBudget = () => {
    setBudgetWarningAcknowledged(true);
    setBudgetWarning(null);

    const poPayload = {
      id: initialData?.id || `po-${Date.now()}`,
      poNumber,
      vendorId,
      vendorName,
      poDate,
      status: "Confirmed",
      billId: initialData?.billId || null,
      billNumber: initialData?.billNumber || null,
      total: grandTotal,
      notes,
      items: items.map((it, idx) => ({
        ...it,
        id: it.id || `po-item-${idx + 1}`,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
    };

    onConfirm(poPayload);
  };

  // Handle Save as Draft
  const handleSaveDraft = () => {
    if (!validateForm()) return;

    const poPayload = {
      id: initialData?.id || `po-${Date.now()}`,
      poNumber,
      vendorId,
      vendorName,
      poDate,
      status: "Draft",
      billId: initialData?.billId || null,
      billNumber: initialData?.billNumber || null,
      total: grandTotal,
      notes,
      items: items.map((it, idx) => ({
        ...it,
        id: it.id || `po-item-${idx + 1}`,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
    };

    onSave(poPayload);
  };

  return (
    <div className="w-full space-y-6">
      {/* ================= TOP ACTION BAR ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Back & Document Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-[#6e6357] hover:text-[#211D19] hover:bg-[#f0ece4] transition cursor-pointer"
            title="Back to List"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#211D19]">
                {poNumber || "New Purchase Order"}
              </h2>
              {/* Status Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isConfirmed
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isCancelled
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {initialData?.status || "Draft"}
              </span>
            </div>
            <p className="text-xs text-[#716B63] mt-0.5">
              Procurement & Vendor Purchase Order Form
            </p>
          </div>
        </div>

        {/* Right Buttons: New, Confirm, Create Bill, Cancel, Back */}
        <div className="flex flex-wrap items-center gap-2">
          {/* New Button */}
          <button
            type="button"
            onClick={onNew}
            className="px-3.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-sm font-medium text-[#6e6357] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
          >
            <Plus size={14} className="inline mr-1" />
            New
          </button>

          {/* Confirm Button (Enabled if Draft) */}
          {isDraft && (
            <button
              type="button"
              onClick={handleConfirmClick}
              className="px-4.5 py-2 rounded-xl bg-[#342921] text-white text-sm font-semibold hover:bg-[#231b15] shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle size={15} />
              <span>Confirm</span>
            </button>
          )}

          {/* Save Draft (if Draft) */}
          {isDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-xl border border-[#cfc6b6] bg-[#faf8f4] text-sm font-medium text-[#4a3b2f] hover:bg-[#f0ece4] transition cursor-pointer"
            >
              Save Draft
            </button>
          )}

          {/* Create Bill Button (Enabled when Confirmed) */}
          {isConfirmed && (
            <button
              type="button"
              onClick={() => onCreateBill(initialData || { poNumber, vendorId, vendorName, items, total: grandTotal })}
              className="px-4.5 py-2 rounded-xl bg-[#3e5335] text-white text-sm font-semibold hover:bg-[#2e3e27] shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <FilePlus size={15} />
              <span>{hasBill ? "View / Create Bill" : "Create Bill"}</span>
            </button>
          )}

          {/* Cancel Button */}
          {!isCancelled && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-xl border border-[#e7e3da] text-sm font-medium text-rose-700 hover:bg-rose-50 transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-sm font-medium text-[#6e6357] hover:text-[#211D19] transition cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      {/* Linked Vendor Bill Notice if already billed */}
      {hasBill && (
        <div className="bg-[#eef4eb] border border-[#cbe1c6] rounded-xl p-3.5 flex items-center justify-between text-xs text-[#2b4122]">
          <div className="flex items-center gap-2">
            <FileCheck size={16} className="text-[#3e5335]" />
            <span>
              This Purchase Order is converted to Vendor Bill:{" "}
              <strong>{initialData?.billNumber}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onCreateBill(initialData)}
            className="text-xs font-semibold text-[#3e5335] underline hover:text-[#211D19]"
          >
            Open Vendor Bill →
          </button>
        </div>
      )}

      {/* ================= PURCHASE ORDER HEADER FIELDS ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs space-y-5">
        <h3 className="text-xs uppercase font-bold text-[#8f8274] tracking-wider pb-2 border-b border-[#f0ece4]">
          Purchase Order Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. PO Number (Auto-generated, Readonly) */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
              PO Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={poNumber}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-sm font-semibold text-[#211D19] cursor-not-allowed focus:outline-hidden"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium bg-[#e7e3da] text-[#523e2b] px-2 py-0.5 rounded">
                Auto
              </span>
            </div>
            <p className="text-[11px] text-[#998d7f] mt-1">
              Automatically generated sequence number
            </p>
          </div>

          {/* 2. Vendor (Contact Master Dropdown) */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
              Vendor <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={vendorId}
                onChange={handleVendorSelect}
                disabled={isConfirmed || isCancelled}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#211D19] bg-white transition focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                  errors.vendor ? "border-rose-400 bg-rose-50/20" : "border-[#e7e3da]"
                } ${isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : "cursor-pointer"}`}
              >
                <option value="">-- Select Vendor from Contact Master --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.city ? `(${v.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
            {errors.vendor ? (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.vendor}
              </p>
            ) : (
              <p className="text-[11px] text-[#998d7f] mt-1">
                Selected from Contact Master records
              </p>
            )}
          </div>

          {/* 3. PO Date */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
              PO Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={poDate}
                onChange={(e) => {
                  setPoDate(e.target.value);
                  if (errors.poDate) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.poDate;
                      return copy;
                    });
                  }
                }}
                disabled={isConfirmed || isCancelled}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#211D19] bg-white transition focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                  errors.poDate ? "border-rose-400 bg-rose-50/20" : "border-[#e7e3da]"
                } ${isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""}`}
              />
            </div>
            {errors.poDate && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.poDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ================= PURCHASE ORDER LINE ITEMS ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ece4]">
          <div>
            <h3 className="text-base font-semibold text-[#211D19]">
              Purchase Order Line Items
            </h3>
            <p className="text-xs text-[#716B63] mt-0.5">
              Specify procurement products, quantities, purchase costs, and budget markers
            </p>
          </div>

          {!isConfirmed && !isCancelled && (
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#cfc6b6] bg-[#faf8f4] text-xs font-semibold text-[#342921] hover:bg-[#f0ece4] transition cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span>+ Add Product</span>
            </button>
          )}
        </div>

        {errors.items && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{errors.items}</span>
          </div>
        )}

        {/* Dynamic Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-[11px] font-semibold text-[#716B63] uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">Sr. No.</th>
                <th className="py-3 px-3 font-semibold w-1/4">Product</th>
                <th className="py-3 px-3 font-semibold w-1/4">Budget Analytics</th>
                <th className="py-3 px-3 font-semibold w-24 text-right">Quantity</th>
                <th className="py-3 px-3 font-semibold w-32 text-right">Unit Price</th>
                <th className="py-3 px-3 font-semibold w-32 text-right">Total</th>
                {!isConfirmed && !isCancelled && (
                  <th className="py-3 px-3 w-12 text-center">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4] text-sm">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#faf8f4]/50 transition">
                  {/* Sr. No. */}
                  <td className="py-3 px-3 text-center text-xs font-medium text-[#716B63]">
                    {index + 1}
                  </td>

                  {/* Product (from Product Master) */}
                  <td className="py-3 px-3">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      disabled={isConfirmed || isCancelled}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs text-[#211D19] bg-white transition focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                        errors[`item_${index}_productId`]
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-[#e7e3da]"
                      } ${isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""}`}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.productName} (Cost: ₹{p.cost || p.salesPrice})
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Budget Analytics (from Analytic / Budget Data) */}
                  <td className="py-3 px-3">
                    <select
                      value={item.budgetId}
                      onChange={(e) => handleItemChange(index, "budgetId", e.target.value)}
                      disabled={isConfirmed || isCancelled}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs text-[#211D19] bg-white transition focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                        errors[`item_${index}_budgetId`]
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-[#e7e3da]"
                      } ${isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""}`}
                    >
                      <option value="">-- Select Budget / Analytic Account --</option>
                      {budgets.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.budgetName} ({b.analyticAccountName})
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 text-right">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      disabled={isConfirmed || isCancelled}
                      className={`w-20 text-right px-2.5 py-1.5 rounded-lg border text-xs text-[#211D19] bg-white transition focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                        errors[`item_${index}_quantity`]
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-[#e7e3da]"
                      } ${isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""}`}
                    />
                  </td>

                  {/* Unit Price */}
                  <td className="py-3 px-3 text-right">
                    <div className="relative inline-block w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#998d7f]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        disabled={isConfirmed || isCancelled}
                        className={`w-full pl-6 pr-2.5 py-1.5 text-right rounded-lg border text-xs text-[#211D19] bg-white transition focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                          errors[`item_${index}_unitPrice`]
                            ? "border-rose-400 bg-rose-50/20"
                            : "border-[#e7e3da]"
                        } ${isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""}`}
                      />
                    </div>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-3 text-right font-semibold text-[#211D19]">
                    {formatCurrency(item.total)}
                  </td>

                  {/* Action */}
                  {!isConfirmed && !isCancelled && (
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-[#998d7f] hover:text-rose-600 transition p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                        title="Remove Line"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Total Summary */}
        <div className="pt-4 border-t border-[#e7e3da] flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
          <div className="text-xs text-[#716B63]">
            <span>Line Items Count: <strong>{items.length}</strong></span>
          </div>

          <div className="bg-[#faf8f4] border border-[#e7e3da] rounded-xl px-5 py-3 text-right min-w-[220px]">
            <span className="text-xs uppercase font-semibold text-[#716B63] block">
              Total Procurement Amount
            </span>
            <span className="text-2xl font-bold text-[#211D19] mt-0.5 block">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ================= NOTES SECTION ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 shadow-2xs">
        <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
          Terms & Procurement Notes
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isConfirmed || isCancelled}
          placeholder="Enter delivery instructions, terms, or vendor references..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-white text-sm text-[#211D19] placeholder-[#998d7f] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15"
        />
      </div>

      {/* ================= BUDGET EXCEEDED WARNING MODAL ================= */}
      {budgetWarning && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-amber-300 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* Warning Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#211D19]">
                  Exceeded Approved Budget
                </h3>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  Warning: Purchase order amount exceeds budget allocation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBudgetWarning(null)}
                className="text-[#998d7f] hover:text-[#211D19] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Warning Message text exactly per PDF prompt */}
            <div className="bg-[#faf8f4] border border-[#e7e3da] rounded-xl p-3.5 text-xs text-[#523e2b] leading-relaxed">
              <p className="font-medium text-[#211D19]">
                The entered amount is higher than the remaining budget amount for this budget line.
                Please consider adjusting the value or revise the budget.
              </p>

              <div className="mt-3 pt-3 border-t border-[#e7e3da] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#716B63]">Budget Line:</span>
                  <strong className="text-[#211D19]">{budgetWarning.budgetName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716B63]">Allocated Budget:</span>
                  <span>{formatCurrency(budgetWarning.allocated)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716B63]">Remaining Approved:</span>
                  <span className="text-amber-700 font-semibold">
                    {formatCurrency(budgetWarning.remaining)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716B63]">PO Order Amount:</span>
                  <span className="text-rose-700 font-bold">
                    {formatCurrency(budgetWarning.requestedAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBudgetWarning(null)}
                className="px-4 py-2 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#6e6357] hover:bg-[#faf8f4] transition cursor-pointer"
              >
                Adjust Values
              </button>
              <button
                type="button"
                onClick={handleProceedExceededBudget}
                className="px-4.5 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition cursor-pointer shadow-xs"
              >
                Confirm Anyway (Acknowledge)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrderForm;
