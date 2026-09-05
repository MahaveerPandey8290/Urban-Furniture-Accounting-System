import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Plus,
  Trash2,
  ExternalLink,
  CreditCard,
  FileText,
  PieChart,
  Calendar,
  AlertCircle,
  Clock,
  Printer
} from "lucide-react";
import {
  getCustomers,
  getProducts,
  getBudgetProjects,
} from "./salesService";
import { getChartOfAccounts } from "../accounts/ChartOfAccountsMaster";

function CustomerInvoiceForm({
  invoice,
  onSave,
  onConfirm,
  onOpenPayment,
  onOpenSO,
  onOpenBudget,
  onBack,
  onNew,
  onOpenPrint,
  isBills = false,
}) {
  const isEditing = Boolean(invoice?.id);

  const formTitle = isBills ? "Customer Bill" : "Customer Invoice";
  const docNumberLabel = isBills ? "Customer Bill No." : "Customer Invoice No.";
  const refLabel = isBills ? "Bill Reference" : "Invoice Reference";
  const dateLabel = isBills ? "Bill Date" : "Invoice Date";
  const lineItemsTitle = isBills ? "Bill Line Items" : "Invoice Line Items";
  const saveButtonLabel = isBills ? "Save Bill Draft" : "Save Invoice Draft";

  // Master options
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Load masters on mount
  useEffect(() => {
    setCustomers(getCustomers());
    setProducts(getProducts());
    setBudgets(getBudgetProjects());

    const coa = getChartOfAccounts();
    // Default or filter for income/sales accounts
    setAccounts(coa);
  }, []);

  // Default sales income account
  const defaultSalesAccount = accounts.find(
    (a) => a.accountName?.toLowerCase().includes("sales")
  ) || { id: "coa-5", accountName: "Sales Income A/c" };

  // Form State
  const [invoiceNo, setInvoiceNo] = useState(
    invoice?.invoiceNo || `INV/${new Date().getFullYear()}/${String(Date.now()).slice(-3)}`
  );
  const [customerId, setCustomerId] = useState(invoice?.customerId || "");
  const [customerName, setCustomerName] = useState(invoice?.customerName || "");
  const [invoiceRef, setInvoiceRef] = useState(invoice?.invoiceRef || `REF-${String(Date.now()).slice(-4)}`);
  const [invoiceDate, setInvoiceDate] = useState(
    invoice?.invoiceDate || new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(() => {
    if (invoice?.dueDate) return invoice.dueDate;
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });

  const [confirmationStatus, setConfirmationStatus] = useState(
    invoice?.confirmationStatus || "Draft" // Draft | Confirmed
  );
  const [status, setStatus] = useState(invoice?.status || "Not Paid"); // Not Paid | Partial | Paid
  const [soId, setSoId] = useState(invoice?.soId || null);
  const [soNumber, setSoNumber] = useState(invoice?.soNumber || "");

  // Line items state
  const [items, setItems] = useState(() => {
    if (invoice?.items && invoice.items.length > 0) {
      return invoice.items.map((item, idx) => ({
        ...item,
        id: item.id || `inv-item-${Date.now()}-${idx}`,
        accountId: item.accountId || defaultSalesAccount.id,
        accountName: item.accountName || defaultSalesAccount.accountName,
      }));
    }
    return [
      {
        id: `inv-item-${Date.now()}-0`,
        productId: "",
        productName: "",
        accountId: defaultSalesAccount.id,
        accountName: defaultSalesAccount.accountName,
        budgetId: "ba-1",
        budgetName: "Project 1",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ];
  });

  const [paidAmount, setPaidAmount] = useState(Number(invoice?.paidAmount) || 0);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Keep items updated if invoice prop changes
  useEffect(() => {
    if (invoice) {
      setInvoiceNo(invoice.invoiceNo || "");
      setCustomerId(invoice.customerId || "");
      setCustomerName(invoice.customerName || "");
      setInvoiceRef(invoice.invoiceRef || "");
      setInvoiceDate(invoice.invoiceDate || new Date().toISOString().split("T")[0]);
      setDueDate(invoice.dueDate || "");
      setConfirmationStatus(invoice.confirmationStatus || "Draft");
      setStatus(invoice.status || "Not Paid");
      setSoId(invoice.soId || null);
      setSoNumber(invoice.soNumber || "");
      setPaidAmount(Number(invoice.paidAmount) || 0);

      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items);
      }
    }
  }, [invoice]);

  // Live calculation of grand total
  const grandTotal = items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  const outstandingAmount = Math.max(0, grandTotal - paidAmount);

  // Line item change handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const current = { ...updated[index] };

    if (field === "productId") {
      const selectedProd = products.find((p) => p.id === value);
      current.productId = value;
      current.productName = selectedProd ? selectedProd.productName : "";
      if (selectedProd) {
        current.unitPrice = Number(selectedProd.salesPrice) || 0;
      }
      current.total = (Number(current.quantity) || 0) * (Number(current.unitPrice) || 0);
    } else if (field === "accountId") {
      const selectedAcc = accounts.find((a) => a.id === value);
      current.accountId = value;
      current.accountName = selectedAcc ? selectedAcc.accountName : "";
    } else if (field === "budgetId") {
      const selectedBudget = budgets.find((b) => b.id === value);
      current.budgetId = value;
      current.budgetName = selectedBudget ? selectedBudget.name : "";
    } else if (field === "quantity") {
      const qty = Math.max(0, Number(value) || 0);
      current.quantity = qty;
      current.total = qty * (Number(current.unitPrice) || 0);
    } else if (field === "unitPrice") {
      const price = Math.max(0, Number(value) || 0);
      current.unitPrice = price;
      current.total = (Number(current.quantity) || 0) * price;
    }

    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `inv-item-${Date.now()}-${prev.length}`,
        productId: "",
        productName: "",
        accountId: defaultSalesAccount.id,
        accountName: defaultSalesAccount.accountName,
        budgetId: budgets[0]?.id || "ba-1",
        budgetName: budgets[0]?.name || "Project 1",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      setError("An invoice must contain at least one line item.");
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // Validation function
  const validateInvoice = () => {
    setError(null);
    if (!customerName || !customerId) {
      setError("Please specify a customer for this invoice.");
      return false;
    }
    if (!invoiceDate) {
      setError("Please select an Invoice Date.");
      return false;
    }
    if (!dueDate) {
      setError("Please select a Due Date.");
      return false;
    }
    if (items.length === 0) {
      setError("Invoice must have at least one product line item.");
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productName && !item.productId) {
        setError(`Line ${i + 1}: Please select a valid product.`);
        return false;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        setError(`Line ${i + 1}: Quantity must be greater than zero.`);
        return false;
      }
      if (item.unitPrice === undefined || item.unitPrice === null || Number(item.unitPrice) < 0) {
        setError(`Line ${i + 1}: Unit price cannot be negative.`);
        return false;
      }
    }

    return true;
  };

  const buildInvoiceData = (confirmed = false) => {
    return {
      id: invoice?.id || `inv-${Date.now()}`,
      invoiceNo,
      soId,
      soNumber,
      customerId,
      customerName,
      invoiceRef,
      invoiceDate,
      dueDate,
      status, // Not Paid | Partial | Paid
      confirmationStatus: confirmed ? "Confirmed" : confirmationStatus,
      total: grandTotal,
      paidAmount,
      outstandingAmount,
      items,
    };
  };

  // Handle Save Draft
  const handleSave = () => {
    if (!validateInvoice()) return;
    const invoiceData = buildInvoiceData(false);
    onSave(invoiceData);
    setSuccessMsg(`${formTitle} saved successfully.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Handle Confirm
  const handleConfirmClick = () => {
    if (!validateInvoice()) return;
    const invoiceData = buildInvoiceData(true);
    setConfirmationStatus("Confirmed");
    onConfirm(invoiceData);
    setSuccessMsg(`${formTitle} confirmed! Balanced Journal Entry created automatically in Sales Journal.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const isConfirmed = confirmationStatus === "Confirmed";

  // Payment status badge
  const getPaymentStatusBadge = (st) => {
    switch (st) {
      case "Paid":
        return {
          bg: "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]",
          icon: <CheckCircle size={12} className="mr-1 inline" />,
          label: "Paid",
        };
      case "Partial":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <Clock size={12} className="mr-1 inline" />,
          label: "Partial",
        };
      default:
        return {
          bg: "bg-[#fbf0ee] text-[#8e392e] border-[#f0d4d0]",
          icon: <AlertCircle size={12} className="mr-1 inline" />,
          label: "Not Paid",
        };
    }
  };

  const statusBadge = getPaymentStatusBadge(status);

  return (
    <div className="space-y-6">

      {/* TOP ACTION BAR AS PER WIREFRAME */}
      {/* Left side: [ New ] [ Confirm ] [ Pay ] */}
      {/* Right side: [ SO ] [ Budget ] [ Cancel ] [ Back ] */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e7e3da] shadow-xs">
        
        {/* Left Side Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
            title="Create a new invoice"
          >
            <Plus size={16} />
            <span>New</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isConfirmed}
            className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer shadow-xs ${
              isConfirmed
                ? "bg-[#eef3e8] text-[#3e5335] border border-[#d3dfca] cursor-default opacity-80"
                : "bg-[#543b2b] text-white hover:bg-[#432f22]"
            }`}
            title={isConfirmed ? "Invoice is already confirmed" : "Confirm Invoice and create automatic Journal Entry"}
          >
            <CheckCircle size={16} />
            <span>{isConfirmed ? "Confirmed" : "Confirm"}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPayment(buildInvoiceData(isConfirmed))}
            disabled={status === "Paid"}
            className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer shadow-xs ${
              status === "Paid"
                ? "bg-[#f5f2eb] text-[#a89f91] border border-[#e7e3da] cursor-not-allowed"
                : "bg-[#3e5335] text-white hover:bg-[#304129]"
            }`}
            title={status === "Paid" ? "Invoice is fully paid" : "Receive payment against invoice"}
          >
            <CreditCard size={16} />
            <span>Pay</span>
          </button>

          {/* Print Invoice preview button */}
          {onOpenPrint && (
            <button
              type="button"
              onClick={() => onOpenPrint(buildInvoiceData(isConfirmed))}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
              title="Print Customer Invoice"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}
        </div>

        {/* Right Side Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* SO Button: Opens original Sales Order */}
          <button
            type="button"
            onClick={() => {
              if (soId || soNumber) {
                onOpenSO(soId || soNumber);
              } else {
                setError("This invoice is not linked to a Sales Order.");
              }
            }}
            className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg border text-sm font-medium transition cursor-pointer ${
              soId || soNumber
                ? "border-[#c4b5a5] bg-[#faf8f4] text-[#342921] hover:bg-[#f0ece4]"
                : "border-[#e7e3da] text-[#a89f91] cursor-not-allowed opacity-60"
            }`}
            title={soId || soNumber ? `Open Sales Order ${soNumber || ""}` : "No Sales Order linked"}
          >
            <FileText size={16} />
            <span>SO</span>
            {soNumber && <span className="font-semibold ml-0.5">({soNumber})</span>}
          </button>

          {/* Budget Button: Opens Budget Analytics report */}
          <button
            type="button"
            onClick={() => onOpenBudget(items[0]?.budgetId || "ba-1")}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm font-medium text-[#342921] hover:bg-[#f0ece4] transition cursor-pointer"
            title="Open Budget Analytic Report used in this invoice"
          >
            <PieChart size={16} />
            <span>Budget</span>
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={onBack}
            className="px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
          >
            Cancel
          </button>

          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-[#fbf0ee] border border-[#f0d4d0] text-[#8e392e] text-sm p-4 rounded-xl flex items-center gap-2.5">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-[#eef3e8] border border-[#d3dfca] text-[#3e5335] text-sm p-4 rounded-xl flex items-center gap-2.5">
          <CheckCircle size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* CUSTOMER INVOICE CARD */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">

        {/* Form Title & Status Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#f0ece4] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#716B63]">
                TRANSACTION
              </span>
              {soNumber && (
                <span className="text-xs font-medium bg-[#f5f2eb] text-[#716B63] px-2.5 py-0.5 rounded border border-[#e7e3da]">
                  Generated from SO: <strong>{soNumber}</strong>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-[#211D19] mt-1">
              {formTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Confirmation state */}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                isConfirmed
                  ? "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]"
                  : "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]"
              }`}
            >
              {isConfirmed ? "Confirmed" : "Draft"}
            </span>

            {/* Payment status: Not Paid | Partial | Paid */}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.bg}`}
            >
              {statusBadge.icon}
              <span>{statusBadge.label}</span>
            </span>
          </div>
        </div>

        {/* CUSTOMER INVOICE HEADER FIELDS AS PER WIREFRAME */}
        {/* Wireframe columns: */}
        {/* Customer Invoice No. | Customer Name | Status */}
        {/* Invoice Reference    | Invoice Date  | Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Row 1, Col 1: Customer Invoice No. */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              {docNumberLabel}
            </label>
            <input
              type="text"
              value={invoiceNo}
              readOnly
              className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-[#211D19] text-sm font-mono font-semibold focus:outline-none cursor-default"
            />
          </div>

          {/* Row 1, Col 2: Customer Name (Fetched from SO, or from Contact Master) */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Customer Name <span className="text-red-500">*</span>
            </label>
            {soNumber || isConfirmed ? (
              <div className="w-full h-10 px-3.5 flex items-center rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-[#211D19] text-sm font-semibold">
                {customerName || "Customer"}
              </div>
            ) : (
              <select
                value={customerId}
                onChange={(e) => {
                  const sel = customers.find((c) => c.id === e.target.value);
                  setCustomerId(e.target.value);
                  setCustomerName(sel ? sel.name : "");
                }}
                className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-white text-[#211D19] text-sm focus:outline-none focus:border-[#342921]"
              >
                <option value="">-- Select Customer from Contact Master --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Row 1, Col 3: Status */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Payment Status
            </label>
            <div className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] flex items-center justify-between">
              <span className={`text-sm font-semibold ${
                status === "Paid" ? "text-[#3e5335]" : status === "Partial" ? "text-blue-800" : "text-[#8e392e]"
              }`}>
                {status}
              </span>
              <span className="text-xs text-[#716B63]">
                {outstandingAmount === 0 ? "Settled" : `Due: Rs. ${outstandingAmount.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Row 2, Col 1: Invoice Reference */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              {refLabel}
            </label>
            <input
              type="text"
              value={invoiceRef}
              onChange={(e) => setInvoiceRef(e.target.value)}
              placeholder="e.g. ABC-26-001"
              disabled={isConfirmed}
              className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-white text-[#211D19] text-sm focus:outline-none focus:border-[#342921] disabled:bg-[#faf8f4]"
            />
          </div>

          {/* Row 2, Col 2: Invoice Date */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              {dateLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                disabled={isConfirmed}
                className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-white text-[#211D19] text-sm focus:outline-none focus:border-[#342921] disabled:bg-[#faf8f4]"
              />
              <Calendar size={16} className="absolute right-3.5 top-3 text-[#a89f91] pointer-events-none" />
            </div>
          </div>

          {/* Row 2, Col 3: Due Date */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isConfirmed}
                className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-white text-[#211D19] text-sm focus:outline-none focus:border-[#342921] disabled:bg-[#faf8f4]"
              />
              <Calendar size={16} className="absolute right-3.5 top-3 text-[#a89f91] pointer-events-none" />
            </div>
          </div>

        </div>

        {/* CUSTOMER INVOICE LINE ITEMS TABLE AS PER WIREFRAME */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#716B63]">
              {lineItemsTitle}
            </h3>
            {!isConfirmed && (
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#342921] hover:bg-[#faf8f4] transition cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Line</span>
              </button>
            )}
          </div>

          <div className="border border-[#e7e3da] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-xs text-[#716B63] font-semibold uppercase tracking-wider select-none">
                    <th className="py-3.5 px-3 w-12 text-center">Sr.</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Product</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Chart of Accounts</th>
                    <th className="py-3.5 px-4 min-w-[140px]">Budget Analytics</th>
                    <th className="py-3.5 px-4 w-24 text-right">Qty</th>
                    <th className="py-3.5 px-4 w-32 text-right">Unit Price</th>
                    <th className="py-3.5 px-4 w-36 text-right">Total</th>
                    {!isConfirmed && <th className="py-3.5 px-3 w-10 text-center"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f2eb]">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-[#faf8f4] transition">
                      {/* 1. Sr. No. */}
                      <td className="py-3.5 px-3 text-center text-sm text-[#716B63] font-medium">
                        {index + 1}
                      </td>

                      {/* 2. Product */}
                      <td className="py-3.5 px-4">
                        {isConfirmed ? (
                          <span className="font-semibold text-sm text-[#211D19]">
                            {item.productName || "-"}
                          </span>
                        ) : (
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(index, "productId", e.target.value)
                            }
                            className="w-full h-10 px-3 rounded-lg border border-[#e7e3da] bg-white text-sm text-[#211D19] focus:outline-none focus:border-[#342921]"
                          >
                            <option value="">-- Select Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.productName} (Rs. {p.salesPrice})
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* 3. Chart of Accounts (Sales account to set by default) */}
                      <td className="py-3.5 px-4">
                        {isConfirmed ? (
                          <span className="text-sm text-[#211D19] font-medium">
                            {item.accountName || "Sales Income A/c"}
                          </span>
                        ) : (
                          <select
                            value={item.accountId || defaultSalesAccount.id}
                            onChange={(e) =>
                              handleItemChange(index, "accountId", e.target.value)
                            }
                            className="w-full h-10 px-3 rounded-lg border border-[#e7e3da] bg-white text-sm text-[#211D19] focus:outline-none focus:border-[#342921]"
                          >
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.accountName}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* 4. Budget Analytics */}
                      <td className="py-3.5 px-4">
                        {isConfirmed ? (
                          <span className="text-sm text-[#716B63] font-medium">
                            {item.budgetName || "Project 1"}
                          </span>
                        ) : (
                          <select
                            value={item.budgetId}
                            onChange={(e) =>
                              handleItemChange(index, "budgetId", e.target.value)
                            }
                            className="w-full h-10 px-3 rounded-lg border border-[#e7e3da] bg-white text-sm text-[#211D19] focus:outline-none focus:border-[#342921]"
                          >
                            {budgets.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* 5. Qty */}
                      <td className="py-3.5 px-4 text-right">
                        {isConfirmed ? (
                          <span className="text-sm font-medium text-[#211D19]">{item.quantity}</span>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, "quantity", e.target.value)
                            }
                            className="w-20 h-10 px-3 rounded-lg border border-[#e7e3da] bg-white text-sm text-right text-[#211D19] focus:outline-none focus:border-[#342921]"
                          />
                        )}
                      </td>

                      {/* 6. Unit Price */}
                      <td className="py-3.5 px-4 text-right">
                        {isConfirmed ? (
                          <span className="text-sm text-[#211D19]">
                            Rs. {(Number(item.unitPrice) || 0).toLocaleString()}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(index, "unitPrice", e.target.value)
                            }
                            className="w-28 h-10 px-3 rounded-lg border border-[#e7e3da] bg-white text-sm text-right text-[#211D19] focus:outline-none focus:border-[#342921]"
                          />
                        )}
                      </td>

                      {/* 7. Total (Unit Price × Quantity) */}
                      <td className="py-3.5 px-4 text-right text-sm font-semibold text-[#211D19]">
                        Rs. {(Number(item.total) || 0).toLocaleString()}
                      </td>

                      {/* Action (Delete) */}
                      {!isConfirmed && (
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-[#a89f91] hover:text-[#8e392e] transition p-1 cursor-pointer"
                            title="Remove Line Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* INVOICE TOTAL & PAYMENT SUMMARY AS PER WIREFRAME */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-[#f0ece4] gap-4">
          <div className="text-sm text-[#716B63] space-y-1.5">
            <p className="font-semibold text-[#211D19]">Accounting Entry Automation:</p>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3e5335]"></span>
              <span>Debit: Debtors A/c (Asset)</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3e5335]"></span>
              <span>Credit: Sales Income A/c (Income)</span>
            </p>
          </div>

          <div className="w-full sm:w-84 bg-[#faf8f4] p-5 rounded-2xl border border-[#ece7dd] space-y-3.5">
            {/* Grand Total */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#716B63] font-medium">Grand Total:</span>
              <span className="font-bold text-2xl text-[#211D19]">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-[#e7e3da] pt-3 space-y-2 text-sm">
              <div className="flex justify-between items-center text-[#716B63]">
                <span>Paid:</span>
                <span className="font-semibold text-[#3e5335]">
                  Rs. {paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-[#211D19]">
                <span>Outstanding:</span>
                <span className={outstandingAmount > 0 ? "text-[#8e392e]" : "text-[#3e5335]"}>
                  Rs. {outstandingAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Save Draft button if not confirmed */}
            {!isConfirmed && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full py-2.5 rounded-lg border border-[#c4b5a5] bg-white text-sm font-medium text-[#342921] hover:bg-[#f5f2eb] transition cursor-pointer"
                >
                  {saveButtonLabel}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default CustomerInvoiceForm;
