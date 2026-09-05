import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  FilePlus,
  X,
  Calendar,
  User,
  ShoppingBag,
  PieChart,
  Ban,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";

function SalesOrderForm({
  initialData,
  nextSoNumber,
  customers = [],
  products = [],
  budgets = [],
  onConfirm,
  onCreateInvoice,
  onCancelOrder,
  onNew,
  onBack,
}) {
  const isConfirmed = initialData?.status === "Confirmed" || initialData?.status === "Invoiced";
  const isInvoiced = initialData?.status === "Invoiced";
  const isCancelled = initialData?.status === "Cancelled";

  // Form Header State
  const [soNumber, setSoNumber] = useState(() => {
    if (initialData?.soNumber) return initialData.soNumber;
    return nextSoNumber || "SO00001";
  });

  const [customerId, setCustomerId] = useState(() => initialData?.customerId || "");
  const [soDate, setSoDate] = useState(() => {
    if (initialData?.soDate) return initialData.soDate;
    return new Date().toISOString().split("T")[0];
  });
  const [status, setStatus] = useState(() => initialData?.status || "Draft");

  // Search filter for customers
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Lines State
  const [items, setItems] = useState(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((it, idx) => ({
        id: it.id || `so-item-${idx}-${Date.now()}`,
        productId: it.productId || "",
        productName: it.productName || "",
        budgetId: it.budgetId || (budgets[0]?.id || "ba-1"),
        budgetName: it.budgetName || (budgets[0]?.name || "Project 1"),
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      }));
    }
    // Default 1 line
    const firstProd = products[0];
    const firstBgt = budgets[0];
    return [
      {
        id: `so-item-1-${Date.now()}`,
        productId: firstProd?.id || "",
        productName: firstProd?.productName || "",
        budgetId: firstBgt?.id || "ba-1",
        budgetName: firstBgt?.name || "Project 1",
        quantity: 1,
        unitPrice: Number(firstProd?.salesPrice) || 0,
        total: Number(firstProd?.salesPrice) || 0,
      },
    ];
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setSoNumber(initialData.soNumber || nextSoNumber || "SO00001");
      setCustomerId(initialData.customerId || "");
      setSoDate(initialData.soDate || new Date().toISOString().split("T")[0]);
      setStatus(initialData.status || "Draft");
      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((it, idx) => ({
            id: it.id || `so-item-${idx}-${Date.now()}`,
            productId: it.productId || "",
            productName: it.productName || "",
            budgetId: it.budgetId || "",
            budgetName: it.budgetName || "",
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
          }))
        );
      }
    } else if (nextSoNumber) {
      setSoNumber(nextSoNumber);
    }
  }, [initialData, nextSoNumber]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === customerId) || null;
  }, [customers, customerId]);

  // Filtered customer list for search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    );
  }, [customers, customerSearch]);

  // Compute grand total
  const grandTotal = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  }, [items]);

  // Non-blocking Budget validation check (Requirement 15)
  const budgetWarning = useMemo(() => {
    try {
      const stored = localStorage.getItem("urbanFurniture_budgets");
      const budgetList = stored ? JSON.parse(stored) : [];

      for (const it of items) {
        const lineTotal = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
        if (lineTotal <= 0) continue;

        const matched = budgetList.find(
          (b) =>
            b.id === it.budgetId ||
            b.name?.toLowerCase() === it.budgetName?.toLowerCase() ||
            b.analyticAccount?.toLowerCase() === it.budgetName?.toLowerCase()
        );

        if (matched) {
          const remaining = Math.max(0, (Number(matched.committedAmount) || 0) - (Number(matched.achievedAmount) || 0));
          if (remaining > 0 && lineTotal > remaining) {
            return {
              lineName: it.budgetName || matched.name,
              amount: lineTotal,
              remaining,
            };
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  }, [items]);

  // Handle line item change
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
          target.unitPrice = Number(selectedProd.salesPrice) || 0;
          target.total = (Number(target.quantity) || 1) * target.unitPrice;
        } else {
          target.productName = "";
          target.unitPrice = 0;
          target.total = 0;
        }
      } else if (field === "budgetId") {
        target.budgetId = value;
        const selectedBgt = budgets.find((b) => b.id === value);
        if (selectedBgt) {
          target.budgetName = selectedBgt.name;
        }
      } else if (field === "quantity") {
        const qty = Math.max(0, Number(value) || 0);
        target.quantity = qty;
        target.total = qty * (Number(target.unitPrice) || 0);
      } else if (field === "unitPrice") {
        const price = Math.max(0, Number(value) || 0);
        target.unitPrice = price;
        target.total = (Number(target.quantity) || 0) * price;
      }

      updated[index] = target;
      return updated;
    });

    if (errors[`item_${index}_${field}`] || errors.general) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`item_${index}_${field}`];
        delete copy.general;
        return copy;
      });
    }
  };

  // Add line
  const handleAddLine = () => {
    if (isConfirmed || isCancelled) return;
    const defaultProd = products[0];
    const defaultBgt = budgets[0];

    setItems((prev) => [
      ...prev,
      {
        id: `so-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: defaultProd?.id || "",
        productName: defaultProd?.productName || "",
        budgetId: defaultBgt?.id || "",
        budgetName: defaultBgt?.name || "",
        quantity: 1,
        unitPrice: Number(defaultProd?.salesPrice) || 0,
        total: Number(defaultProd?.salesPrice) || 0,
      },
    ]);
  };

  // Remove line
  const handleRemoveLine = (index) => {
    if (isConfirmed || isCancelled) return;
    if (items.length <= 1) {
      setErrors((prev) => ({ ...prev, general: "Sales order must have at least one product line." }));
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!customerId) {
      newErrors.customerId = "Customer selection is required from Contact Master";
    }

    if (!soDate) {
      newErrors.soDate = "Sales Order Date is required";
    }

    if (!items || items.length === 0) {
      newErrors.general = "At least one product line item is required";
    } else {
      items.forEach((it, idx) => {
        if (!it.productId) {
          newErrors[`item_${idx}_productId`] = "Please select a product";
        }
        if (Number(it.quantity) <= 0) {
          newErrors[`item_${idx}_quantity`] = "Quantity must be > 0";
        }
        if (it.unitPrice === undefined || it.unitPrice === null || Number(it.unitPrice) < 0) {
          newErrors[`item_${idx}_unitPrice`] = "Price cannot be negative";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Prepare current SO data
  const getOrderData = (newStatus = status) => {
    return {
      id: initialData?.id || `so-${Date.now()}`,
      soNumber,
      customerId,
      customerName: selectedCustomer?.name || initialData?.customerName || "Customer",
      soDate,
      status: newStatus,
      total: grandTotal,
      invoiceId: initialData?.invoiceId || null,
      items: items.map((it) => ({
        ...it,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
    };
  };

  // Confirm action
  const handleConfirmClick = () => {
    if (!validate()) return;
    const confirmedOrder = getOrderData("Confirmed");
    setStatus("Confirmed");
    onConfirm(confirmedOrder);
  };

  // Create Invoice action
  const handleCreateInvoiceClick = () => {
    if (!isConfirmed) {
      if (!validate()) return;
    }
    const orderData = getOrderData(isConfirmed ? status : "Confirmed");
    onCreateInvoice(orderData);
  };

  // Cancel action
  const handleCancelClick = () => {
    if (onCancelOrder && initialData?.id) {
      onCancelOrder(initialData.id);
    }
    setStatus("Cancelled");
  };

  const getStatusBadge = () => {
    switch (status) {
      case "Invoiced":
        return {
          style: "bg-[#eaf5f0] text-[#2c634c] border-[#cde7dc]",
          icon: <CheckCircle size={13} className="mr-1 inline" />,
          label: "Invoiced",
        };
      case "Confirmed":
        return {
          style: "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]",
          icon: <CheckCircle size={13} className="mr-1 inline" />,
          label: "Confirmed",
        };
      case "Cancelled":
        return {
          style: "bg-rose-50 text-rose-800 border-rose-200",
          icon: <Ban size={13} className="mr-1 inline" />,
          label: "Cancelled",
        };
      default:
        return {
          style: "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]",
          icon: <AlertCircle size={13} className="mr-1 inline" />,
          label: "Draft",
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="w-full space-y-6">
      {/* ================= TOP ACTION BAR ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. New */}
          <button
            type="button"
            onClick={onNew}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm font-medium text-[#211D19] hover:bg-[#f3efe7] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
            title="Create a fresh Sales Order"
          >
            <Plus size={15} />
            <span>New</span>
          </button>

          {/* 2. Confirm (Active only when Draft) */}
          {!isConfirmed && !isCancelled && (
            <button
              type="button"
              onClick={handleConfirmClick}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
              title="Confirm this Sales Order"
            >
              <CheckCircle size={15} />
              <span>Confirm</span>
            </button>
          )}

          {/* 3. Create Invoice (Active only when Confirmed) */}
          <button
            type="button"
            onClick={handleCreateInvoiceClick}
            disabled={!isConfirmed || isCancelled}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg text-sm font-medium transition shadow-xs ${
              isConfirmed && !isCancelled
                ? "bg-[#3e5335] text-white hover:bg-[#2e3e27] cursor-pointer"
                : "border border-[#cfc6b6] bg-[#faf8f4] text-[#a89f91] cursor-not-allowed opacity-60"
            }`}
            title={
              isConfirmed
                ? "Generate Customer Invoice from this Sales Order"
                : "Confirm the Sales Order before creating an invoice"
            }
          >
            <FilePlus size={15} />
            <span>Create Invoice</span>
            {isInvoiced && <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded ml-1">✓ Done</span>}
          </button>
        </div>

        {/* Right Side: [ Cancel ] [ Back ] */}
        <div className="flex items-center gap-2.5">
          {!isCancelled && (
            <button
              type="button"
              onClick={handleCancelClick}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#8e392e] hover:bg-red-50/50 hover:border-red-200 transition cursor-pointer shadow-xs"
              title="Cancel this order"
            >
              <X size={15} />
              <span>Cancel</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#6e6357] hover:text-[#24201a] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
            title="Return to Sales Orders List"
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errors.general && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* ================= MAIN SALES ORDER CARD ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Header Title & Status */}
        <div className="pb-5 mb-6 border-b border-[#f0ece4] flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-[#211D19] tracking-tight">
                Sales Order
              </h2>
              <span className="text-sm font-semibold text-[#716B63]">
                #{soNumber}
              </span>
            </div>
            <p className="text-xs text-[#716B63] mt-1">
              Select customer from Contact Master, add product line items, and confirm to generate Customer Invoice.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badge.style}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          </div>
        </div>

        {/* Form Fields: SO Number, Customer, SO Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* 1. SO Number (Strictly Read-Only / Auto Generated Sequence) */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] uppercase tracking-wider mb-2">
              SO Number <span className="text-xs normal-case text-[#a89f91]">(Auto-generated)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={soNumber}
                readOnly
                disabled
                className="w-full px-3.5 py-2.5 bg-[#faf8f4] border border-[#e7e3da] rounded-xl text-sm font-bold text-[#342921] cursor-not-allowed select-all"
                title="SO numbers follow strict sequence SO00001, SO00002..."
              />
            </div>
          </div>

          {/* 2. Customer Name (Searchable dropdown from Contact Master) */}
          <div className="relative">
            <label className="block text-xs font-semibold text-[#716B63] uppercase tracking-wider mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div
                onClick={() => !isConfirmed && !isCancelled && setIsCustomerDropdownOpen((prev) => !prev)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm flex items-center justify-between cursor-pointer transition ${
                  isConfirmed || isCancelled
                    ? "bg-[#faf8f4] border-[#e7e3da] cursor-default"
                    : errors.customerId
                    ? "border-rose-400 bg-rose-50/40"
                    : "bg-white border-[#e7e3da] hover:border-[#342921] focus:ring-2 focus:ring-[#342921]/15"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <User size={15} className="text-[#a89f91] shrink-0" />
                  <span className={selectedCustomer ? "font-medium text-[#211D19]" : "text-[#a89f91]"}>
                    {selectedCustomer ? selectedCustomer.name : "Select Customer..."}
                  </span>
                </div>
                {!isConfirmed && !isCancelled && (
                  <span className="text-xs text-[#a89f91]">▼</span>
                )}
              </div>

              {/* Customer Searchable Dropdown Menu */}
              {isCustomerDropdownOpen && !isConfirmed && !isCancelled && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-[#e7e3da] rounded-xl shadow-xl p-2 animate-in fade-in-50 duration-150">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer by name or email..."
                    className="w-full px-3 py-1.5 text-xs border border-[#e7e3da] rounded-lg mb-2 focus:outline-none focus:border-[#342921]"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-[#f5f2eb]">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-xs text-center text-[#716B63]">
                        No customers found matching &quot;{customerSearch}&quot;
                      </div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setCustomerId(c.id);
                            setIsCustomerDropdownOpen(false);
                            setCustomerSearch("");
                            if (errors.customerId) {
                              setErrors((prev) => {
                                const copy = { ...prev };
                                delete copy.customerId;
                                return copy;
                              });
                            }
                          }}
                          className={`p-2.5 text-xs rounded-lg cursor-pointer flex items-center justify-between transition hover:bg-[#faf8f4] ${
                            c.id === customerId ? "bg-[#f5f1ea] font-semibold text-[#342921]" : "text-[#211D19]"
                          }`}
                        >
                          <div>
                            <span className="block font-medium">{c.name}</span>
                            {c.email && <span className="text-[11px] text-[#716B63]">{c.email}</span>}
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f4ede4] text-[#342921]">
                            {c.type || "Customer"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.customerId && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.customerId}</p>
            )}
          </div>

          {/* 3. SO Date */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] uppercase tracking-wider mb-2">
              SO Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={soDate}
                disabled={isConfirmed || isCancelled}
                onChange={(e) => {
                  setSoDate(e.target.value);
                  if (errors.soDate) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.soDate;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition ${
                  isConfirmed || isCancelled
                    ? "bg-[#faf8f4] border-[#e7e3da] cursor-default"
                    : errors.soDate
                    ? "border-rose-400 bg-rose-50/40"
                    : "bg-white border-[#e7e3da] focus:border-[#342921] focus:ring-2 focus:ring-[#342921]/15"
                }`}
              />
            </div>
            {errors.soDate && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.soDate}</p>
            )}
          </div>
        </div>

        {/* ================= LINE ITEMS TABLE ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211D19] uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#716B63]" />
              <span>Sales Order Line Items</span>
            </h3>
            {!isConfirmed && !isCancelled && (
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#342921] text-white hover:bg-[#231b15] transition cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Add Line</span>
              </button>
            )}
          </div>

          <div className="border border-[#e7e3da] rounded-xl overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#faf8f4] border-b border-[#e7e3da] text-[11px] font-semibold text-[#716B63] uppercase tracking-wider select-none">
                    <th className="py-3 px-3 w-12 text-center">Sr. No.</th>
                    <th className="py-3 px-3.5 min-w-[200px]">Product</th>
                    <th className="py-3 px-3 min-w-[160px]">Budget Analytics</th>
                    <th className="py-3 px-3 w-28 text-right">Quantity</th>
                    <th className="py-3 px-3 w-32 text-right">Unit Price</th>
                    <th className="py-3 px-4 w-36 text-right">Total</th>
                    {!isConfirmed && !isCancelled && (
                      <th className="py-3 px-2 w-10 text-center"></th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0ece4] text-xs">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#a89f91]">
                        No product lines in this order. Click &quot;Add Line&quot; to begin.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-[#faf8f4]/60 transition">
                        {/* 1. Sr. No. */}
                        <td className="py-3 px-3 text-center text-[#716B63] font-semibold">
                          {index + 1}
                        </td>

                        {/* 2. Product */}
                        <td className="py-2 px-3.5">
                          {isConfirmed || isCancelled ? (
                            <span className="font-semibold text-[#211D19]">{item.productName || "-"}</span>
                          ) : (
                            <div>
                              <select
                                value={item.productId}
                                onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                                className={`w-full px-2.5 py-1.5 text-xs font-medium border rounded-lg bg-white transition cursor-pointer ${
                                  errors[`item_${index}_productId`]
                                    ? "border-rose-400 bg-rose-50/30"
                                    : "border-[#e7e3da] focus:border-[#342921]"
                                }`}
                              >
                                <option value="">Select Product...</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.productName} ({formatCurrency(p.salesPrice)})
                                  </option>
                                ))}
                              </select>
                              {errors[`item_${index}_productId`] && (
                                <p className="text-[10px] text-rose-600 mt-0.5">
                                  {errors[`item_${index}_productId`]}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 3. Budget Analytics */}
                        <td className="py-2 px-3">
                          {isConfirmed || isCancelled ? (
                            <span className="inline-flex items-center gap-1 text-[#4a3b2f] bg-[#f5f1ea] px-2 py-0.5 rounded font-medium">
                              <PieChart size={11} className="text-[#8c7e72]" />
                              <span>{item.budgetName || "General"}</span>
                            </span>
                          ) : (
                            <select
                              value={item.budgetId}
                              onChange={(e) => handleItemChange(index, "budgetId", e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-medium border border-[#e7e3da] rounded-lg bg-white focus:border-[#342921] transition cursor-pointer"
                            >
                              {budgets.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* 4. Quantity */}
                        <td className="py-2 px-3 text-right">
                          {isConfirmed || isCancelled ? (
                            <span className="font-semibold text-[#211D19]">{item.quantity}</span>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className={`w-20 px-2.5 py-1.5 text-xs text-right font-medium border rounded-lg bg-white transition ${
                                errors[`item_${index}_quantity`]
                                  ? "border-rose-400 bg-rose-50/30"
                                  : "border-[#e7e3da] focus:border-[#342921]"
                              }`}
                            />
                          )}
                        </td>

                        {/* 5. Unit Price */}
                        <td className="py-2 px-3 text-right">
                          {isConfirmed || isCancelled ? (
                            <span className="font-semibold text-[#211D19]">
                              {formatCurrency(item.unitPrice)}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                              className={`w-24 px-2.5 py-1.5 text-xs text-right font-medium border rounded-lg bg-white transition ${
                                errors[`item_${index}_unitPrice`]
                                  ? "border-rose-400 bg-rose-50/30"
                                  : "border-[#e7e3da] focus:border-[#342921]"
                              }`}
                            />
                          )}
                        </td>

                        {/* 6. Line Total */}
                        <td className="py-3 px-4 text-right font-bold text-[#211D19] whitespace-nowrap">
                          {formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}
                        </td>

                        {/* 7. Remove Line Button */}
                        {!isConfirmed && !isCancelled && (
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(index)}
                              className="p-1 rounded text-[#a89f91] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete line"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Grand Total Summary Row */}
            <div className="p-4 bg-[#faf8f4] border-t border-[#e7e3da] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#716B63]">
                Total Line Items: <span className="font-bold text-[#211D19]">{items.length}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase font-bold text-[#716B63] tracking-wider">
                  Grand Total:
                </span>
                <span className="text-2xl font-extrabold text-[#211D19] tracking-tight">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* ================= BUDGET / WARNING INFORMATION (Requirement 15) ================= */}
          {budgetWarning && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900 text-sm">Exceeds Approved Budget</p>
                <p className="mt-0.5 text-amber-800">
                  The entered amount is higher than the remaining budget amount for this budget line ({budgetWarning.lineName}). Consider adjusting the value or revising the budget.
                </p>
                <p className="mt-1 text-[11px] text-amber-700 font-medium">
                  (Non-blocking warning: Sales Order confirmation is permitted)
                </p>
              </div>
            </div>
          )}

          {/* ================= RELATED DOCUMENTS ================= */}
          {initialData?.invoiceId && (
            <div className="p-4 bg-[#faf8f4] border border-[#e7e3da] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#716B63]">
                <span className="font-semibold text-[#211D19]">Linked Customer Invoice:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#eaf5f0] text-[#2c634c] font-semibold border border-[#cde7dc]">
                  Invoiced
                </span>
              </div>
              <button
                type="button"
                onClick={() => onCreateInvoice(initialData)}
                className="text-xs font-semibold text-[#342921] hover:underline cursor-pointer"
              >
                Open Customer Invoice →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesOrderForm;
