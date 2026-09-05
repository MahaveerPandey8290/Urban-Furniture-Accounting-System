import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  CreditCard,
  FileText,
  Calendar,
  User,
  ShoppingBag,
  Clock,
  Ban,
  ExternalLink,
  AlertCircle,
  Building,
  DollarSign,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import {
  getVendors,
  getProducts,
  getBudgets,
  getAccounts,
  getNextBillNumber,
} from "../../../utils/storage";
import VendorPaymentModal from "./VendorPaymentModal";

function VendorBillForm({
  initialData,
  onSave,
  onConfirm,
  onRecordPayment,
  onNew,
  onCancel,
  onBack,
  onOpenPO,
}) {
  const isEditing = Boolean(initialData?.id);
  const isConfirmed = initialData?.confirmationStatus === "Confirmed" || initialData?.status === "Confirmed" || initialData?.status === "Paid" || initialData?.status === "Partial" || initialData?.status === "Not Paid";
  const isCancelled = initialData?.status === "Cancelled";
  const isDraft = !isConfirmed && !isCancelled;

  // Master lists
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    setVendors(getVendors());
    setProducts(getProducts());
    setBudgets(getBudgets());
    setAccounts(getAccounts());
  }, []);

  // Default Purchase Expense Account
  const defaultPurchaseAccount = useMemo(() => {
    return (
      accounts.find((a) => a.accountName?.toLowerCase().includes("purchase")) || {
        id: "coa-2",
        accountName: "Purchases Expense A/c",
      }
    );
  }, [accounts]);

  // Form State
  const [billNumber, setBillNumber] = useState(() => {
    if (initialData?.billNumber) return initialData.billNumber;
    return getNextBillNumber();
  });

  const [poId, setPoId] = useState(() => initialData?.poId || null);
  const [poNumber, setPoNumber] = useState(() => initialData?.poNumber || "");
  const [vendorId, setVendorId] = useState(() => initialData?.vendorId || "");
  const [vendorName, setVendorName] = useState(() => initialData?.vendorName || "");
  const [billRef, setBillRef] = useState(() => initialData?.billRef || `REF-${String(Date.now()).slice(-4)}`);
  const [billDate, setBillDate] = useState(() => {
    if (initialData?.billDate) return initialData.billDate;
    return new Date().toISOString().split("T")[0];
  });
  const [dueDate, setDueDate] = useState(() => {
    if (initialData?.dueDate) return initialData.dueDate;
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  const [paidAmount, setPaidAmount] = useState(Number(initialData?.paidAmount) || 0);

  // Line items state
  const [items, setItems] = useState(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((it, idx) => ({
        id: it.id || `bill-item-${idx + 1}`,
        productId: it.productId || "",
        productName: it.productName || "",
        accountId: it.accountId || "coa-2",
        accountName: it.accountName || "Purchases Expense A/c",
        budgetId: it.budgetId || "",
        budgetName: it.budgetName || "",
        analyticAccount: it.analyticAccount || "",
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      }));
    }

    return [
      {
        id: "bill-item-1",
        productId: "",
        productName: "",
        accountId: "coa-2",
        accountName: "Purchases Expense A/c",
        budgetId: "",
        budgetName: "",
        analyticAccount: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ];
  });

  const [errors, setErrors] = useState({});
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Sync initialData changes
  useEffect(() => {
    if (initialData) {
      setBillNumber(initialData.billNumber || "");
      setPoId(initialData.poId || null);
      setPoNumber(initialData.poNumber || "");
      setVendorId(initialData.vendorId || "");
      setVendorName(initialData.vendorName || "");
      setBillRef(initialData.billRef || "");
      setBillDate(initialData.billDate || new Date().toISOString().split("T")[0]);
      setDueDate(initialData.dueDate || "");
      setPaidAmount(Number(initialData.paidAmount) || 0);

      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((it, idx) => ({
            id: it.id || `bill-item-${idx + 1}`,
            productId: it.productId || "",
            productName: it.productName || "",
            accountId: it.accountId || defaultPurchaseAccount.id,
            accountName: it.accountName || defaultPurchaseAccount.accountName,
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
  }, [initialData, defaultPurchaseAccount]);

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

  // Grand total
  const billTotal = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  }, [items]);

  // Amount Due
  const amountDue = Math.max(0, billTotal - paidAmount);

  // Payment status calculation per Section 10
  const paymentStatus = useMemo(() => {
    if (isCancelled) return "Cancelled";
    if (isDraft) return "Draft";
    if (paidAmount === 0) return "Not Paid";
    if (amountDue === 0 || paidAmount >= billTotal) return "Paid";
    return "Partial";
  }, [isCancelled, isDraft, paidAmount, amountDue, billTotal]);

  // Line item change
  const handleItemChange = (index, field, value) => {
    if (isConfirmed || isCancelled) return;

    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === "productId") {
        target.productId = value;
        const p = products.find((prod) => prod.id === value);
        if (p) {
          target.productName = p.productName;
          const cost = Number(p.cost || p.salesPrice) || 0;
          target.unitPrice = cost;
          target.total = (Number(target.quantity) || 1) * cost;
        }
      } else if (field === "accountId") {
        target.accountId = value;
        const acc = accounts.find((a) => a.id === value);
        if (acc) target.accountName = acc.accountName;
      } else if (field === "budgetId") {
        target.budgetId = value;
        const b = budgets.find((bgt) => bgt.id === value);
        if (b) {
          target.budgetName = b.budgetName;
          target.analyticAccount = b.analyticAccountName;
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
        id: `bill-item-${Date.now()}-${prev.length + 1}`,
        productId: defaultProd ? defaultProd.id : "",
        productName: defaultProd ? defaultProd.productName : "",
        accountId: defaultPurchaseAccount.id,
        accountName: defaultPurchaseAccount.accountName,
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
        items: "A vendor bill must contain at least one product row.",
      }));
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Validate form
  const validateForm = () => {
    const errs = {};

    if (!vendorId || !vendorName) {
      errs.vendor = "Please select a vendor from Contact Master.";
    }

    if (!billDate) {
      errs.billDate = "Bill date is required.";
    }

    if (!dueDate) {
      errs.dueDate = "Due date is required.";
    }

    if (!items || items.length === 0) {
      errs.items = "Please include at least one product line item.";
    } else {
      items.forEach((it, idx) => {
        if (!it.productId) {
          errs[`item_${idx}_productId`] = "Select product";
        }
        if (!it.quantity || it.quantity <= 0) {
          errs[`item_${idx}_quantity`] = "Qty > 0";
        }
        if (it.unitPrice === undefined || it.unitPrice < 0) {
          errs[`item_${idx}_unitPrice`] = "Price ≥ 0";
        }
        if (!it.accountId) {
          errs[`item_${idx}_accountId`] = "Select account";
        }
      });
    }

    if (billTotal <= 0) {
      errs.total = "Total bill amount must be greater than zero.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Confirm Vendor Bill
  const handleConfirmClick = () => {
    if (!validateForm()) return;

    const payload = {
      id: initialData?.id || `bill-${Date.now()}`,
      billNumber,
      poId,
      poNumber,
      vendorId,
      vendorName,
      billRef,
      billDate,
      dueDate,
      status: paidAmount >= billTotal ? "Paid" : paidAmount > 0 ? "Partial" : "Not Paid",
      confirmationStatus: "Confirmed",
      total: billTotal,
      paidAmount,
      amountDue,
      paymentStatus: paidAmount >= billTotal ? "Paid" : paidAmount > 0 ? "Partial" : "Not Paid",
      items: items.map((it, idx) => ({
        ...it,
        id: it.id || `bill-item-${idx + 1}`,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
    };

    onConfirm(payload);
  };

  // Save Draft
  const handleSaveDraft = () => {
    if (!validateForm()) return;

    const payload = {
      id: initialData?.id || `bill-${Date.now()}`,
      billNumber,
      poId,
      poNumber,
      vendorId,
      vendorName,
      billRef,
      billDate,
      dueDate,
      status: "Draft",
      confirmationStatus: "Draft",
      total: billTotal,
      paidAmount,
      amountDue,
      paymentStatus: "Not Paid",
      items: items.map((it, idx) => ({
        ...it,
        id: it.id || `bill-item-${idx + 1}`,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
    };

    onSave(payload);
  };

  // Process payment confirmation from modal
  const handleConfirmPayment = (paymentData) => {
    setPaymentModalOpen(false);
    onRecordPayment(paymentData, {
      ...initialData,
      id: initialData?.id || `bill-${Date.now()}`,
      billNumber,
      vendorId,
      vendorName,
      total: billTotal,
      paidAmount,
      amountDue,
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* ================= TOP ACTION BAR ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Back & Doc Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-[#6e6357] hover:text-[#211D19] hover:bg-[#f0ece4] transition cursor-pointer"
            title="Back to Bills"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#211D19]">
                {billNumber || "New Vendor Bill"}
              </h2>
              {/* Payment status badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  paymentStatus === "Paid"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : paymentStatus === "Partial"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : paymentStatus === "Not Paid"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : paymentStatus === "Cancelled"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-stone-100 text-stone-700 border border-stone-200"
                }`}
              >
                {paymentStatus}
              </span>
            </div>

            {/* Original Purchase Order Reference */}
            {poNumber ? (
              <div className="flex items-center gap-1.5 text-xs text-[#716B63] mt-0.5">
                <span>Original PO Reference:</span>
                <button
                  type="button"
                  onClick={() => onOpenPO && onOpenPO(poNumber)}
                  className="font-semibold text-[#342921] underline hover:text-[#523e2b] flex items-center gap-0.5"
                >
                  <ShoppingBag size={12} />
                  <span>{poNumber}</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#716B63] mt-0.5">
                Vendor Procurement Invoice & Payable Record
              </p>
            )}
          </div>
        </div>

        {/* Right Header Buttons: New, Confirm, Pay, Cancel, Back */}
        <div className="flex flex-wrap items-center gap-2">
          {/* New */}
          <button
            type="button"
            onClick={onNew}
            className="px-3.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-sm font-medium text-[#6e6357] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
          >
            <Plus size={14} className="inline mr-1" />
            New
          </button>

          {/* Confirm Button (If Draft) */}
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

          {/* Save Draft (If Draft) */}
          {isDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-xl border border-[#cfc6b6] bg-[#faf8f4] text-sm font-medium text-[#4a3b2f] hover:bg-[#f0ece4] transition cursor-pointer"
            >
              Save Draft
            </button>
          )}

          {/* Pay Button (Active when Confirmed and Amount Due > 0) */}
          {isConfirmed && !isCancelled && amountDue > 0 && (
            <button
              type="button"
              onClick={() => setPaymentModalOpen(true)}
              className="px-4.5 py-2 rounded-xl bg-[#3e5335] text-white text-sm font-semibold hover:bg-[#2e3e27] shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard size={15} />
              <span>Pay</span>
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

      {/* ================= BILL PAYMENT STATUS SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Bill Total */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 shadow-2xs">
          <span className="text-xs uppercase font-semibold text-[#716B63] block tracking-wider">
            Bill Total
          </span>
          <div className="text-2xl font-bold text-[#211D19] mt-1">
            {formatCurrency(billTotal)}
          </div>
          <span className="text-[11px] text-[#998d7f] mt-0.5 block">
            Procurement invoice value
          </span>
        </div>

        {/* Card 2: Paid Amount */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 shadow-2xs">
          <span className="text-xs uppercase font-semibold text-emerald-800 block tracking-wider">
            Paid Amount
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {formatCurrency(paidAmount)}
          </div>
          <span className="text-[11px] text-[#998d7f] mt-0.5 block">
            Disbursed via Bank / Cash
          </span>
        </div>

        {/* Card 3: Amount Due */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 shadow-2xs">
          <span className="text-xs uppercase font-semibold text-amber-800 block tracking-wider">
            Amount Due
          </span>
          <div
            className={`text-2xl font-bold mt-1 ${
              amountDue > 0 ? "text-amber-800" : "text-emerald-700"
            }`}
          >
            {formatCurrency(amountDue)}
          </div>
          <span className="text-[11px] text-[#998d7f] mt-0.5 block">
            {amountDue === 0 ? "Fully Settled" : "Outstanding balance"}
          </span>
        </div>
      </div>

      {/* ================= BILL HEADER FIELDS ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs space-y-5">
        <h3 className="text-xs uppercase font-bold text-[#8f8274] tracking-wider pb-2 border-b border-[#f0ece4]">
          Vendor Bill Header
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Vendor Bill No. */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
              Vendor Bill No.
            </label>
            <div className="relative">
              <input
                type="text"
                value={billNumber}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-sm font-semibold text-[#211D19] cursor-not-allowed focus:outline-hidden"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium bg-[#e7e3da] text-[#523e2b] px-2 py-0.5 rounded">
                Auto
              </span>
            </div>
            <p className="text-[11px] text-[#998d7f] mt-1">
              Example: Bill/2026/0001
            </p>
          </div>

          {/* 2. Vendor Name */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
              Vendor Name <span className="text-rose-500">*</span>
            </label>
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
            {errors.vendor ? (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.vendor}
              </p>
            ) : (
              <p className="text-[11px] text-[#998d7f] mt-1">
                {poNumber ? `Inherited from PO ${poNumber}` : "From Contact Master"}
              </p>
            )}
          </div>

          {/* 3. Bill Reference */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
              Bill Reference
            </label>
            <input
              type="text"
              value={billRef}
              onChange={(e) => setBillRef(e.target.value)}
              disabled={isConfirmed || isCancelled}
              placeholder="e.g. ABC-26-001"
              className={`w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-white text-sm text-[#211D19] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""
              }`}
            />
            <p className="text-[11px] text-[#998d7f] mt-1">
              Alphanumeric vendor invoice reference
            </p>
          </div>

          {/* 4. Bill Date & Due Date */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
              Bill Date & Due Date <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                disabled={isConfirmed || isCancelled}
                className="w-full px-2.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-xs text-[#211D19]"
                title="Bill Date"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isConfirmed || isCancelled}
                className="w-full px-2.5 py-2 rounded-xl border border-[#e7e3da] bg-white text-xs text-[#211D19]"
                title="Due Date"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#998d7f] mt-1 px-1">
              <span>Date</span>
              <span>Due</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= VENDOR BILL LINE ITEMS ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ece4]">
          <div>
            <h3 className="text-base font-semibold text-[#211D19]">
              Vendor Bill Line Items
            </h3>
            <p className="text-xs text-[#716B63] mt-0.5">
              Classify items under Chart of Accounts (Purchases Expense A/c) and Budget Analytics
            </p>
          </div>

          {!isConfirmed && !isCancelled && (
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#cfc6b6] bg-[#faf8f4] text-xs font-semibold text-[#342921] hover:bg-[#f0ece4] transition cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span>+ Add Line</span>
            </button>
          )}
        </div>

        {errors.items && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{errors.items}</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-[11px] font-semibold text-[#716B63] uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">Sr.</th>
                <th className="py-3 px-3 font-semibold w-1/5">Product</th>
                <th className="py-3 px-3 font-semibold w-1/5">Chart of Account</th>
                <th className="py-3 px-3 font-semibold w-1/5">Budget Analytics</th>
                <th className="py-3 px-3 font-semibold w-20 text-right">Qty</th>
                <th className="py-3 px-3 font-semibold w-28 text-right">Unit Price</th>
                <th className="py-3 px-3 font-semibold w-28 text-right">Total</th>
                {!isConfirmed && !isCancelled && (
                  <th className="py-3 px-3 w-10 text-center">Action</th>
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

                  {/* Product */}
                  <td className="py-3 px-3">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      disabled={isConfirmed || isCancelled}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs text-[#211D19] bg-white transition focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                        isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.productName}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Chart of Account */}
                  <td className="py-3 px-3">
                    <select
                      value={item.accountId}
                      onChange={(e) => handleItemChange(index, "accountId", e.target.value)}
                      disabled={isConfirmed || isCancelled}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs text-[#211D19] bg-white transition focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                        isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""
                      }`}
                    >
                      {accounts
                        .filter(
                          (a) =>
                            a.type === "EXPENSE" ||
                            a.classification === "Expenses" ||
                            a.accountName?.toLowerCase().includes("purchase") ||
                            a.accountName?.toLowerCase().includes("expense")
                        )
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.accountName}
                          </option>
                        ))}
                    </select>
                  </td>

                  {/* Budget Analytics */}
                  <td className="py-3 px-3">
                    <select
                      value={item.budgetId}
                      onChange={(e) => handleItemChange(index, "budgetId", e.target.value)}
                      disabled={isConfirmed || isCancelled}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs text-[#211D19] bg-white transition focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15 ${
                        isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">-- Select Budget / Analytic --</option>
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
                      className={`w-16 text-right px-2 py-1.5 rounded-lg border text-xs text-[#211D19] bg-white ${
                        isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""
                      }`}
                    />
                  </td>

                  {/* Unit Price */}
                  <td className="py-3 px-3 text-right">
                    <div className="relative inline-block w-24">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#998d7f]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        disabled={isConfirmed || isCancelled}
                        className={`w-full pl-5 pr-2 py-1.5 text-right rounded-lg border text-xs text-[#211D19] bg-white ${
                          isConfirmed || isCancelled ? "bg-[#faf8f4] cursor-not-allowed" : ""
                        }`}
                      />
                    </div>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-3 text-right font-semibold text-[#211D19]">
                    {formatCurrency(item.total)}
                  </td>

                  {/* Remove */}
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

        {/* Bottom Total */}
        <div className="pt-4 border-t border-[#e7e3da] flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
          <div className="text-xs text-[#716B63]">
            Default Debit Account:{" "}
            <strong className="text-[#211D19] font-medium">Purchases Expense A/c</strong> • Default Credit Account:{" "}
            <strong className="text-[#211D19] font-medium">Creditors A/c</strong>
          </div>

          <div className="bg-[#faf8f4] border border-[#e7e3da] rounded-xl px-6 py-3 text-right min-w-[220px]">
            <span className="text-xs uppercase font-semibold text-[#716B63] block">
              Bill Total
            </span>
            <span className="text-2xl font-bold text-[#211D19] mt-0.5 block">
              {formatCurrency(billTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ================= PAYMENT MODAL ================= */}
      {paymentModalOpen && (
        <VendorPaymentModal
          bill={{
            id: initialData?.id,
            billNumber,
            vendorId,
            vendorName,
            total: billTotal,
            paidAmount,
            amountDue,
          }}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setPaymentModalOpen(false)}
        />
      )}
    </div>
  );
}

export default VendorBillForm;
