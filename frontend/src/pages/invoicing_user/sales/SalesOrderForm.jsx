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
} from "lucide-react";

function SalesOrderForm({
  initialData,
  customers = [],
  products = [],
  budgets = [],
  onSave,
  onConfirm,
  onCreateInvoice,
  onNew,
  onBack,
}) {
  const isConfirmed = initialData?.status === "Confirmed" || initialData?.status === "Invoiced";
  const isInvoiced = initialData?.status === "Invoiced";

  // Form Header State
  const [soNumber, setSoNumber] = useState(() => {
    if (initialData?.soNumber) return initialData.soNumber;
    return "SO" + String(Date.now()).slice(-5);
  });

  const [customerId, setCustomerId] = useState(() => initialData?.customerId || "");
  const [soDate, setSoDate] = useState(() => {
    if (initialData?.soDate) return initialData.soDate;
    return new Date().toISOString().split("T")[0];
  });

  // Lines State
  const [items, setItems] = useState(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((it, idx) => ({
        id: it.id || "so-item-" + idx,
        productId: it.productId || "",
        productName: it.productName || "",
        budgetId: it.budgetId || (budgets.length > 0 ? budgets[0].id : ""),
        budgetName: it.budgetName || (budgets.length > 0 ? budgets[0].name : "Project 1"),
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: Number(it.total) || 0,
      }));
    }
    // Default 1 line
    return [
      {
        id: "so-item-1",
        productId: products.length > 0 ? products[0].id : "",
        productName: products.length > 0 ? products[0].productName : "",
        budgetId: budgets.length > 0 ? budgets[0].id : "ba-1",
        budgetName: budgets.length > 0 ? budgets[0].name : "Project 1",
        quantity: 1,
        unitPrice: products.length > 0 ? products[0].salesPrice || 0 : 0,
        total: products.length > 0 ? products[0].salesPrice || 0 : 0,
      },
    ];
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setSoNumber(initialData.soNumber || "");
      setCustomerId(initialData.customerId || "");
      setSoDate(initialData.soDate || new Date().toISOString().split("T")[0]);
      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((it, idx) => ({
            id: it.id || "so-item-" + idx,
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
    }
  }, [initialData]);

  // Compute grand total
  const grandTotal = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  }, [items]);

  // Handle line item change
  const handleItemChange = (index, field, value) => {
    if (isConfirmed) return;

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
        }
      } else if (field === "budgetId") {
        target.budgetId = value;
        const selectedBgt = budgets.find((b) => b.id === value);
        if (selectedBgt) {
          target.budgetName = selectedBgt.name;
        }
      } else if (field === "quantity") {
        const qty = Math.max(1, Number(value) || 1);
        target.quantity = qty;
        target.total = qty * (Number(target.unitPrice) || 0);
      } else if (field === "unitPrice") {
        const price = Math.max(0, Number(value) || 0);
        target.unitPrice = price;
        target.total = (Number(target.quantity) || 1) * price;
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
    if (isConfirmed) return;
    const defaultProd = products.length > 0 ? products[0] : null;
    const defaultBgt = budgets.length > 0 ? budgets[0] : null;

    setItems((prev) => [
      ...prev,
      {
        id: "so-item-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        productId: defaultProd ? defaultProd.id : "",
        productName: defaultProd ? defaultProd.productName : "",
        budgetId: defaultBgt ? defaultBgt.id : "",
        budgetName: defaultBgt ? defaultBgt.name : "",
        quantity: 1,
        unitPrice: defaultProd ? defaultProd.salesPrice || 0 : 0,
        total: defaultProd ? defaultProd.salesPrice || 0 : 0,
      },
    ]);
  };

  // Remove line
  const handleRemoveLine = (index) => {
    if (isConfirmed) return;
    if (items.length <= 1) {
      alert("Sales order must have at least one product line.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!customerId) {
      newErrors.customerId = "Customer selection is required";
    }

    if (!soDate) {
      newErrors.soDate = "Sales Order Date is required";
    }

    if (items.length === 0) {
      newErrors.general = "At least one product line is required";
    }

    items.forEach((it, idx) => {
      if (!it.productId) {
        newErrors[`item_${idx}_product`] = "Product is required";
      }
      if (Number(it.quantity) <= 0) {
        newErrors[`item_${idx}_quantity`] = "Quantity must be > 0";
      }
      if (Number(it.unitPrice) < 0) {
        newErrors[`item_${idx}_unitPrice`] = "Price cannot be negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Prepare current SO data
  const getOrderData = (status = initialData?.status || "Draft") => {
    const selectedCustomer = customers.find((c) => c.id === customerId);
    return {
      id: initialData?.id || null,
      soNumber,
      customerId,
      customerName: selectedCustomer ? selectedCustomer.name : initialData?.customerName || "",
      soDate,
      status,
      total: grandTotal,
      invoiceId: initialData?.invoiceId || null,
      items: items.map((it) => ({
        ...it,
        total: (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
      })),
    };
  };

  // Confirm action
  const handleConfirmClick = () => {
    if (!validate()) return;
    const confirmedOrder = getOrderData("Confirmed");
    onConfirm(confirmedOrder);
  };

  // Create Invoice action
  const handleCreateInvoiceClick = () => {
    if (!isConfirmed) {
      if (!validate()) return;
    }
    const currentOrder = getOrderData(isConfirmed ? initialData.status : "Confirmed");
    onCreateInvoice(currentOrder);
  };

  return (
    <div className="w-full space-y-6">

      {/* ================= TOP ACTION BAR ================= */}
      {/* Arrangement matching wireframe: [ New ] [ Confirm ] [ Create Invoice ] | RIGHT: [ Cancel ] [ Back ] */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onNew}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm font-medium text-[#211D19] hover:bg-[#f3efe7] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>New</span>
          </button>

          {!isConfirmed && (
            <button
              type="button"
              onClick={handleConfirmClick}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
            >
              <CheckCircle size={15} />
              <span>Confirm</span>
            </button>
          )}

          {/* Create Invoice button (Available when confirmed or invoiced) */}
          <button
            type="button"
            onClick={handleCreateInvoiceClick}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer shadow-xs ${
              isConfirmed
                ? "bg-[#342921] text-white hover:bg-[#231b15]"
                : "border border-[#cfc6b6] bg-[#faf8f4] text-[#716B63] hover:text-[#211D19] hover:bg-[#f3efe7]"
            }`}
            title="Create Customer Invoice from this Sales Order"
          >
            <FilePlus size={15} />
            <span>Create Invoice</span>
          </button>
        </div>

        {/* Right Side: [ Cancel ] [ Back ] */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#8e392e] hover:bg-red-50/50 hover:border-red-200 transition cursor-pointer shadow-xs"
          >
            <X size={15} />
            <span>Cancel</span>
          </button>

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
                {soNumber}
              </span>
            </div>
            <p className="text-sm text-[#716B63] mt-1">
              Customer sales order with Product Master & Budget Analytics linkage
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-medium border ${
                isInvoiced
                  ? "bg-[#eaf5f0] text-[#2c634c] border-[#cde7dc]"
                  : isConfirmed
                  ? "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]"
                  : "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]"
              }`}
            >
              {initialData?.status || "Draft"}
            </span>
          </div>
        </div>

        {/* Header Fields: SO No, Customer Name, SO Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          {/* 1. SO No. */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              SO No.
            </label>
            <input
              type="text"
              readOnly
              value={soNumber}
              className="w-full h-10 px-3.5 rounded-xl border border-[#cfc6b6] bg-[#faf8f4] text-sm font-semibold text-[#211D19] outline-none"
            />
          </div>

          {/* 2. Customer Name (from Contact Master) */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <select
              disabled={isConfirmed}
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                if (errors.customerId) setErrors((prev) => ({ ...prev, customerId: null }));
              }}
              className={`w-full h-10 px-3.5 rounded-xl border ${
                errors.customerId ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition cursor-pointer disabled:bg-[#faf8f4] disabled:text-[#716B63]`}
            >
              <option value="" disabled>
                Select Customer from Contact Master...
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-xs text-red-600 mt-1">{errors.customerId}</p>
            )}
          </div>

          {/* 3. SO Date */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              SO Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              disabled={isConfirmed}
              value={soDate}
              onChange={(e) => {
                setSoDate(e.target.value);
                if (errors.soDate) setErrors((prev) => ({ ...prev, soDate: null }));
              }}
              className={`w-full h-10 px-3.5 rounded-xl border ${
                errors.soDate ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition disabled:bg-[#faf8f4] disabled:text-[#716B63]`}
            />
            {errors.soDate && (
              <p className="text-xs text-red-600 mt-1">{errors.soDate}</p>
            )}
          </div>

        </div>

        {/* ================= LINE ITEMS TABLE ================= */}
        {/* Exactly based on wireframe: Sr. No. | Product | Budget Analytics | Qty | Unit Price | Total */}
        <div className="space-y-3">
          <div className="border border-[#e7e3da] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-xs text-[#716B63] font-semibold uppercase tracking-wider select-none">
                    <th className="py-3.5 px-3 w-12 text-center">SR. NO.</th>
                    <th className="py-3.5 px-4 w-[28%]">PRODUCT *</th>
                    <th className="py-3.5 px-4 w-[25%]">BUDGET ANALYTICS</th>
                    <th className="py-3.5 px-3 w-20 text-center">QTY</th>
                    <th className="py-3.5 px-4 w-28 text-right">UNIT PRICE</th>
                    <th className="py-3.5 px-4 w-32 text-right">TOTAL</th>
                    {!isConfirmed && <th className="py-3.5 px-3 w-10 text-center"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f2eb]">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#faf8f4]/60 transition">
                      {/* Sr. No. */}
                      <td className="py-3 px-3 text-center text-[#716B63] font-medium">
                        {index + 1}
                      </td>

                      {/* Product (Product Master) */}
                      <td className="py-2.5 px-4">
                        <select
                          disabled={isConfirmed}
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          className={`w-full h-10 px-3 rounded-lg border ${
                            errors[`item_${index}_product`]
                              ? "border-red-400 bg-red-50/20"
                              : "border-[#cfc6b6] bg-white"
                          } text-sm text-[#211D19] outline-none transition cursor-pointer disabled:bg-transparent disabled:border-none disabled:p-0 disabled:font-medium`}
                        >
                          <option value="">Select Product...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.productName} (Rs. {Number(p.salesPrice || 0).toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Budget Analytics (Many to One) */}
                      <td className="py-2.5 px-4">
                        <select
                          disabled={isConfirmed}
                          value={item.budgetId}
                          onChange={(e) => handleItemChange(index, "budgetId", e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none transition cursor-pointer disabled:bg-transparent disabled:border-none disabled:p-0 disabled:font-medium"
                        >
                          <option value="">Select Budget Project...</option>
                          {budgets.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Qty */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          disabled={isConfirmed}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-16 h-10 px-2 text-center rounded-lg border border-[#cfc6b6] bg-white text-sm font-semibold text-[#211D19] outline-none transition disabled:bg-transparent disabled:border-none disabled:p-0"
                        />
                      </td>

                      {/* Unit Price (Auto-populated from Product Master) */}
                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="number"
                          min="0"
                          disabled={isConfirmed}
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          className="w-24 h-10 px-2 text-right rounded-lg border border-[#cfc6b6] bg-white text-sm font-semibold text-[#211D19] outline-none transition disabled:bg-transparent disabled:border-none disabled:p-0"
                        />
                      </td>

                      {/* Total (Qty x Unit Price) */}
                      <td className="py-2.5 px-4 text-right font-semibold text-[#211D19] whitespace-nowrap">
                        Rs. {((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString()}
                      </td>

                      {/* Delete Action */}
                      {!isConfirmed && (
                        <td className="py-2.5 px-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(index)}
                            disabled={items.length <= 1}
                            className={`p-2 rounded-lg text-[#a89f91] transition ${
                              items.length <= 1
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            }`}
                            title="Remove line"
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

            {/* Add Line Button */}
            {!isConfirmed && (
              <div className="p-3.5 bg-[#faf8f4]/80 border-t border-[#e7e3da] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#cfc6b6] text-sm font-medium text-[#342921] hover:bg-[#f5f2eb] hover:border-[#342921] transition cursor-pointer shadow-2xs"
                >
                  <Plus size={15} />
                  <span>+ Add Line</span>
                </button>
                <span className="text-xs text-[#716B63]">
                  Unit Price × Quantity = Line Total
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Grand Total Area (as shown in wireframe: Total Rs. 6,000) */}
        <div className="mt-6 pt-5 border-t border-[#f0ece4] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#716B63]">
            {isConfirmed && (
              <span className="inline-flex items-center gap-1.5 text-[#3e5335] bg-[#eef3e8] px-3.5 py-1.5 rounded-full border border-[#d3dfca] text-xs font-medium">
                <CheckCircle size={15} />
                <span>Sales order is confirmed. Click "Create Invoice" to generate Customer Invoice.</span>
              </span>
            )}
          </div>

          <div className="bg-[#faf8f4] border border-[#e7e3da] rounded-xl px-6 py-3.5 flex items-center gap-6 self-end">
            <span className="text-xs font-semibold text-[#716B63] uppercase tracking-wider">
              Total
            </span>
            <span className="text-2xl font-bold text-[#211D19]">
              Rs. {grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default SalesOrderForm;
