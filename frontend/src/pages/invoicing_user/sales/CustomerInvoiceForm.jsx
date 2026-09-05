import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Plus,
  Trash2,
  CreditCard,
  FileText,
  PieChart,
  Calendar,
  AlertCircle,
  Clock,
  Printer,
  Send,
  User,
  ShoppingBag,
  BookOpen,
  DollarSign,
  Ban,
} from "lucide-react";
import {
  getCustomers,
  getProducts,
  getBudgetProjects,
} from "./salesService";
import { getChartOfAccounts } from "../accounts/ChartOfAccountsMaster";
import { formatCurrency, formatDate } from "../../../utils/formatters";

function CustomerInvoiceForm({
  invoice,
  nextInvoiceNo,
  payments = [],
  onSave,
  onConfirm,
  onOpenPayment,
  onOpenSO,
  onOpenBudget,
  onBack,
  onNew,
  onOpenPrint,
  onCancelInvoice,
  isBills = false,
}) {
  const formTitle = isBills ? "Customer Bill" : "Customer Invoice";

  // Master options
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Customer dropdown search
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Load masters on mount
  useEffect(() => {
    setCustomers(getCustomers());
    setProducts(getProducts());
    setBudgets(getBudgetProjects());
    setAccounts(getChartOfAccounts());
  }, []);

  // Default sales income account from Chart of Accounts
  const defaultSalesAccount = useMemo(() => {
    const coa = accounts.length > 0 ? accounts : getChartOfAccounts();
    return (
      coa.find((a) => a.accountName?.toLowerCase().includes("sales")) ||
      coa.find((a) => a.type === "INCOME") || {
        id: "coa-5",
        accountName: "Sales Income A/c",
      }
    );
  }, [accounts]);

  // Form State
  const [invoiceNo, setInvoiceNo] = useState(() => {
    if (invoice?.invoiceNo) return invoice.invoiceNo;
    return nextInvoiceNo || `INV/${new Date().getFullYear()}/00001`;
  });

  const [customerId, setCustomerId] = useState(() => invoice?.customerId || "");
  const [customerName, setCustomerName] = useState(() => invoice?.customerName || "");
  const [invoiceRef, setInvoiceRef] = useState(() => invoice?.invoiceRef || "");
  const [invoiceDate, setInvoiceDate] = useState(
    () => invoice?.invoiceDate || new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(() => {
    if (invoice?.dueDate) return invoice.dueDate;
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });

  const [confirmationStatus, setConfirmationStatus] = useState(
    () => invoice?.confirmationStatus || "Draft" // Draft | Confirmed | Cancelled
  );
  const [status, setStatus] = useState(() => invoice?.status || "Not Paid"); // Not Paid | Partial | Paid
  const [soId, setSoId] = useState(() => invoice?.soId || null);
  const [soNumber, setSoNumber] = useState(() => invoice?.soNumber || "");
  const [paidAmount, setPaidAmount] = useState(() => Number(invoice?.paidAmount) || 0);

  // Line items state
  const [items, setItems] = useState(() => {
    if (invoice?.items && invoice.items.length > 0) {
      return invoice.items.map((item, idx) => ({
        ...item,
        id: item.id || `inv-item-${Date.now()}-${idx}`,
        accountId: item.accountId || defaultSalesAccount.id,
        accountName: item.accountName || defaultSalesAccount.accountName,
        budgetId: item.budgetId || (budgets[0]?.id || "ba-1"),
        budgetName: item.budgetName || (budgets[0]?.name || "Project 1"),
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
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

  const [errors, setErrors] = useState({});
  const [sendToast, setSendToast] = useState(null);

  // Keep items and values updated if invoice prop changes
  useEffect(() => {
    if (invoice) {
      setInvoiceNo(invoice.invoiceNo || nextInvoiceNo || `INV/${new Date().getFullYear()}/00001`);
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
        setItems(
          invoice.items.map((item, idx) => ({
            ...item,
            id: item.id || `inv-item-${Date.now()}-${idx}`,
            accountId: item.accountId || defaultSalesAccount.id,
            accountName: item.accountName || defaultSalesAccount.accountName,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
          }))
        );
      }
    } else if (nextInvoiceNo) {
      setInvoiceNo(nextInvoiceNo);
    }
  }, [invoice, nextInvoiceNo, defaultSalesAccount]);

  const isConfirmed = confirmationStatus === "Confirmed";
  const isCancelled = confirmationStatus === "Cancelled";

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

  // Live calculation of grand total & outstanding
  const grandTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  }, [items]);

  const outstandingAmount = Math.max(0, grandTotal - paidAmount);

  // Line item change handlers
  const handleItemChange = (index, field, value) => {
    if (isConfirmed || isCancelled) return;

    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };

      if (field === "productId") {
        const selectedProd = products.find((p) => p.id === value);
        current.productId = value;
        current.productName = selectedProd ? selectedProd.productName : "";
        if (selectedProd) {
          current.unitPrice = Number(selectedProd.salesPrice) || 0;
        } else {
          current.unitPrice = 0;
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

  const handleAddItem = () => {
    if (isConfirmed || isCancelled) return;
    const defaultProd = products[0];
    const defaultBgt = budgets[0];

    setItems((prev) => [
      ...prev,
      {
        id: `inv-item-${Date.now()}-${prev.length}`,
        productId: defaultProd?.id || "",
        productName: defaultProd?.productName || "",
        accountId: defaultSalesAccount.id,
        accountName: defaultSalesAccount.accountName,
        budgetId: defaultBgt?.id || "ba-1",
        budgetName: defaultBgt?.name || "Project 1",
        quantity: 1,
        unitPrice: Number(defaultProd?.salesPrice) || 0,
        total: Number(defaultProd?.salesPrice) || 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (isConfirmed || isCancelled) return;
    if (items.length <= 1) {
      setErrors((prev) => ({ ...prev, general: "An invoice must contain at least one line item." }));
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation function
  const validateInvoice = () => {
    const newErrors = {};

    if (!customerId) {
      newErrors.customerId = "Customer selection is required from Contact Master.";
    }
    if (!invoiceDate) {
      newErrors.invoiceDate = "Please select an Invoice Date.";
    }
    if (!dueDate) {
      newErrors.dueDate = "Please select a Due Date.";
    }
    if (!items || items.length === 0) {
      newErrors.general = "Invoice must have at least one product line item.";
    } else {
      items.forEach((item, i) => {
        if (!item.productId) {
          newErrors[`item_${i}_productId`] = "Please select a product.";
        }
        if (!item.quantity || Number(item.quantity) <= 0) {
          newErrors[`item_${i}_quantity`] = "Quantity must be greater than zero.";
        }
        if (item.unitPrice === undefined || item.unitPrice === null || Number(item.unitPrice) < 0) {
          newErrors[`item_${i}_unitPrice`] = "Unit price cannot be negative.";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildInvoiceData = (confirmed = isConfirmed) => {
    return {
      id: invoice?.id || `inv-${Date.now()}`,
      invoiceNo,
      soId,
      soNumber,
      customerId,
      customerName: selectedCustomer?.name || customerName || "Customer",
      invoiceRef,
      invoiceDate,
      dueDate,
      status, // Not Paid | Partial | Paid
      confirmationStatus: confirmed ? "Confirmed" : confirmationStatus,
      total: grandTotal,
      paidAmount,
      outstandingAmount,
      items: items.map((it) => ({
        ...it,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      })),
    };
  };

  // Handle Confirm
  const handleConfirmClick = () => {
    if (!validateInvoice()) return;
    const invoiceData = buildInvoiceData(true);
    setConfirmationStatus("Confirmed");
    onConfirm(invoiceData);
  };

  // Handle Cancel
  const handleCancelClick = () => {
    if (onCancelInvoice && invoice?.id) {
      onCancelInvoice(invoice.id);
    }
    setConfirmationStatus("Cancelled");
  };

  // Handle Send
  const handleSendInvoice = () => {
    const cust = selectedCustomer?.email || "customer@example.com";
    setSendToast(`Invoice ${invoiceNo} sent successfully to ${cust}!`);
    setTimeout(() => setSendToast(null), 4000);
  };

  // Payment status badge
  const getPaymentStatusBadge = () => {
    switch (status) {
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

  const getConfirmationBadge = () => {
    switch (confirmationStatus) {
      case "Confirmed":
        return {
          bg: "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]",
          icon: <CheckCircle size={12} className="mr-1 inline" />,
          label: "Confirmed",
        };
      case "Cancelled":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          icon: <Ban size={12} className="mr-1 inline" />,
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]",
          icon: <AlertCircle size={12} className="mr-1 inline" />,
          label: "Draft",
        };
    }
  };

  const paymentBadge = getPaymentStatusBadge();
  const confirmBadge = getConfirmationBadge();

  return (
    <div className="space-y-6">
      {/* Send Notification simulation banner */}
      {sendToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{sendToast}</span>
          </div>
          <button type="button" onClick={() => setSendToast(null)} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* TOP ACTION BAR AS PER WIREFRAME:
          Left: [ New ] [ Confirm ] [ Pay ] [ Print ] [ Send ]
          Right: [ SO ] [ Budget ] [ Cancel ] [ Back ]
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e7e3da] shadow-xs">
        {/* Left Side Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. New */}
          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
            title="Create a new invoice"
          >
            <Plus size={16} />
            <span>New</span>
          </button>

          {/* 2. Confirm (Creates automatic balanced Journal Entry in Sales Journal) */}
          {!isConfirmed && !isCancelled && (
            <button
              type="button"
              onClick={handleConfirmClick}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#543b2b] text-white hover:bg-[#432f22] text-sm font-medium transition cursor-pointer shadow-xs"
              title="Confirm Invoice and create automatic Journal Entry"
            >
              <CheckCircle size={16} />
              <span>Confirm</span>
            </button>
          )}

          {/* 3. Pay (Opens Payment Modal) */}
          <button
            type="button"
            onClick={() => onOpenPayment(buildInvoiceData(isConfirmed))}
            disabled={!isConfirmed || status === "Paid" || isCancelled}
            className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-sm font-medium transition shadow-xs ${
              !isConfirmed || status === "Paid" || isCancelled
                ? "bg-[#f5f2eb] text-[#a89f91] border border-[#e7e3da] cursor-not-allowed opacity-60"
                : "bg-[#3e5335] text-white hover:bg-[#304129] cursor-pointer"
            }`}
            title={
              !isConfirmed
                ? "Invoice must be Confirmed before recording payment"
                : status === "Paid"
                ? "Invoice is fully paid"
                : "Record payment received against this invoice"
            }
          >
            <CreditCard size={16} />
            <span>Pay</span>
            {status === "Paid" && <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded ml-1">✓ Paid</span>}
          </button>

          {/* 4. Print action */}
          {onOpenPrint && (
            <button
              type="button"
              onClick={() => onOpenPrint(buildInvoiceData(isConfirmed))}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
              title="Print Tax Invoice Document"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}

          {/* 5. Send action */}
          <button
            type="button"
            onClick={handleSendInvoice}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
            title="Send Invoice to Customer Email"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        {/* Right Side Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 6. SO Button: Shown if invoice was created from an SO; opens original Sales Order */}
          {(soId || soNumber) ? (
            <button
              type="button"
              onClick={() => onOpenSO(soId || soNumber)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#c4b5a5] bg-[#faf8f4] text-sm font-semibold text-[#342921] hover:bg-[#f0ece4] transition cursor-pointer shadow-xs"
              title={`Open source Sales Order ${soNumber || ""}`}
            >
              <FileText size={15} />
              <span>SO</span>
              {soNumber && <span className="text-xs bg-[#e9dfd4] px-1.5 py-0.5 rounded ml-0.5">{soNumber}</span>}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[#e7e3da] text-xs font-medium text-[#a89f91] cursor-not-allowed opacity-50"
              title="Created manually without a Sales Order"
            >
              <FileText size={14} />
              <span>SO (None)</span>
            </button>
          )}

          {/* 7. Budget Button: Opens Budget Analytics report for the associated project */}
          <button
            type="button"
            onClick={() => onOpenBudget(items[0]?.budgetId || items[0]?.budgetName || "ba-1")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm font-semibold text-[#342921] hover:bg-[#f0ece4] transition cursor-pointer shadow-xs"
            title={`Open Budget Report for ${items[0]?.budgetName || "Project"}`}
          >
            <PieChart size={15} />
            <span>Budget</span>
          </button>

          {/* 8. Cancel button */}
          {!isCancelled && (
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#8e392e] hover:bg-red-50/50 hover:border-red-200 transition cursor-pointer"
              title="Cancel Invoice"
            >
              Cancel
            </button>
          )}

          {/* 9. Back button */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
            title="Return to Customer Invoices List"
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

      {/* ================= MAIN INVOICE CARD ================= */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Header Title & Status Badges */}
        <div className="pb-5 mb-6 border-b border-[#f0ece4] flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-semibold text-[#211D19] tracking-tight">
                {formTitle}
              </h2>
              <span className="text-sm font-bold text-[#342921]">
                #{invoiceNo}
              </span>
            </div>
            <p className="text-xs text-[#716B63] mt-1">
              Confirming automatically creates balanced accounting entries in the Sales Journal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${confirmBadge.bg}`}
            >
              {confirmBadge.icon}
              <span>{confirmBadge.label}</span>
            </span>

            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${paymentBadge.bg}`}
            >
              {paymentBadge.icon}
              <span>{paymentBadge.label}</span>
            </span>
          </div>
        </div>

        {/* Invoice Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* 1. Invoice Number (Strictly Read-Only Sequence) */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] uppercase tracking-wider mb-2">
              Invoice Number <span className="text-xs normal-case text-[#a89f91]">(Auto-generated)</span>
            </label>
            <input
              type="text"
              value={invoiceNo}
              readOnly
              disabled
              className="w-full px-3.5 py-2.5 bg-[#faf8f4] border border-[#e7e3da] rounded-xl text-sm font-bold text-[#342921] cursor-not-allowed select-all"
            />
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
                    : "bg-white border-[#e7e3da] hover:border-[#342921]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <User size={15} className="text-[#a89f91] shrink-0" />
                  <span className={selectedCustomer || customerName ? "font-medium text-[#211D19]" : "text-[#a89f91]"}>
                    {selectedCustomer?.name || customerName || "Select Customer..."}
                  </span>
                </div>
                {!isConfirmed && !isCancelled && (
                  <span className="text-xs text-[#a89f91]">▼</span>
                )}
              </div>

              {/* Customer Dropdown */}
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
                            setCustomerName(c.name);
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

          {/* 3. Invoice Reference */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] uppercase tracking-wider mb-2">
              Invoice Reference
            </label>
            <input
              type="text"
              value={invoiceRef}
              disabled={isConfirmed || isCancelled}
              onChange={(e) => setInvoiceRef(e.target.value)}
              placeholder="e.g. PO-REF-2026-001"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition ${
                isConfirmed || isCancelled
                  ? "bg-[#faf8f4] border-[#e7e3da] cursor-default"
                  : "bg-white border-[#e7e3da] focus:border-[#342921]"
              }`}
            />
          </div>

          {/* 4. Dates: Invoice Date & Due Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#716B63] uppercase tracking-wider mb-2">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={invoiceDate}
                disabled={isConfirmed || isCancelled}
                onChange={(e) => {
                  setInvoiceDate(e.target.value);
                  if (errors.invoiceDate) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.invoiceDate;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-2.5 py-2.5 border rounded-xl text-xs transition ${
                  isConfirmed || isCancelled
                    ? "bg-[#faf8f4] border-[#e7e3da] cursor-default"
                    : errors.invoiceDate
                    ? "border-rose-400 bg-rose-50/40"
                    : "bg-white border-[#e7e3da] focus:border-[#342921]"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#716B63] uppercase tracking-wider mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                disabled={isConfirmed || isCancelled}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.dueDate;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-2.5 py-2.5 border rounded-xl text-xs transition ${
                  isConfirmed || isCancelled
                    ? "bg-[#faf8f4] border-[#e7e3da] cursor-default"
                    : errors.dueDate
                    ? "border-rose-400 bg-rose-50/40"
                    : "bg-white border-[#e7e3da] focus:border-[#342921]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ================= LINE ITEMS TABLE ================= */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#211D19] uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#716B63]" />
              <span>Customer Invoice Line Items</span>
            </h3>
            {!isConfirmed && !isCancelled && (
              <button
                type="button"
                onClick={handleAddItem}
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
                    <th className="py-3 px-3.5 min-w-[180px]">Product</th>
                    <th className="py-3 px-3 min-w-[180px]">Chart of Accounts</th>
                    <th className="py-3 px-3 min-w-[150px]">Budget Analytics</th>
                    <th className="py-3 px-3 w-24 text-right">Quantity</th>
                    <th className="py-3 px-3 w-28 text-right">Unit Price</th>
                    <th className="py-3 px-4 w-32 text-right">Total</th>
                    {!isConfirmed && !isCancelled && (
                      <th className="py-3 px-2 w-10 text-center"></th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0ece4] text-xs">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#a89f91]">
                        No product line items. Click &quot;Add Line&quot; to begin.
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

                        {/* 3. Chart of Accounts (Default: Sales Income A/c) */}
                        <td className="py-2 px-3">
                          {isConfirmed || isCancelled ? (
                            <span className="inline-flex items-center gap-1 text-[#211D19] font-medium">
                              <BookOpen size={11} className="text-[#8c7e72]" />
                              <span>{item.accountName || defaultSalesAccount.accountName}</span>
                            </span>
                          ) : (
                            <select
                              value={item.accountId || defaultSalesAccount.id}
                              onChange={(e) => handleItemChange(index, "accountId", e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-medium border border-[#e7e3da] rounded-lg bg-white focus:border-[#342921] transition cursor-pointer"
                            >
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.accountName} ({a.displayType || a.type})
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        {/* 4. Budget Analytics */}
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

                        {/* 5. Quantity */}
                        <td className="py-2 px-3 text-right">
                          {isConfirmed || isCancelled ? (
                            <span className="font-semibold text-[#211D19]">{item.quantity}</span>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className={`w-16 px-2 py-1.5 text-xs text-right font-medium border rounded-lg bg-white transition ${
                                errors[`item_${index}_quantity`]
                                  ? "border-rose-400 bg-rose-50/30"
                                  : "border-[#e7e3da] focus:border-[#342921]"
                              }`}
                            />
                          )}
                        </td>

                        {/* 6. Unit Price */}
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
                              className={`w-24 px-2 py-1.5 text-xs text-right font-medium border rounded-lg bg-white transition ${
                                errors[`item_${index}_unitPrice`]
                                  ? "border-rose-400 bg-rose-50/30"
                                  : "border-[#e7e3da] focus:border-[#342921]"
                              }`}
                            />
                          )}
                        </td>

                        {/* 7. Total */}
                        <td className="py-3 px-4 text-right font-bold text-[#211D19] whitespace-nowrap">
                          {formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}
                        </td>

                        {/* 8. Remove Line */}
                        {!isConfirmed && !isCancelled && (
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
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

            {/* Financial Summary Breakdown */}
            <div className="p-5 bg-[#faf8f4] border-t border-[#e7e3da] grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs uppercase font-semibold text-[#716B63] block">
                  Total Paid:
                </span>
                <span className="text-lg font-bold text-emerald-700">
                  {formatCurrency(paidAmount)}
                </span>
              </div>

              <div>
                <span className="text-xs uppercase font-semibold text-[#716B63] block">
                  Amount Due:
                </span>
                <span className={`text-lg font-bold ${outstandingAmount > 0 ? "text-amber-800" : "text-emerald-700"}`}>
                  {formatCurrency(outstandingAmount)}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-xs uppercase font-bold text-[#716B63] block">
                  Grand Total:
                </span>
                <span className="text-2xl font-extrabold text-[#211D19] tracking-tight">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PAYMENT HISTORY LEDGER ================= */}
        {payments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#f0ece4]">
            <h3 className="text-sm font-bold text-[#211D19] uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-700" />
              <span>Payment History ({payments.length})</span>
            </h3>
            <div className="border border-[#e7e3da] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf8f4] border-b border-[#e7e3da] text-[11px] font-semibold text-[#716B63] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Payment Reference</th>
                    <th className="py-2.5 px-4">Payment Method</th>
                    <th className="py-2.5 px-4 text-right">Amount Paid</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f2eb]">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#faf8f4]/60 transition">
                      <td className="py-2.5 px-4 font-medium text-[#716B63] whitespace-nowrap">
                        {formatDate(p.date)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#342921] whitespace-nowrap">
                        {p.note || p.id}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-[#211D19]">
                          {p.paymentVia || "Cash"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerInvoiceForm;
