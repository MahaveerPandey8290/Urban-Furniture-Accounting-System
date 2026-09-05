import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  DollarSign,
  X,
  ArrowLeft,
} from "lucide-react";
import {
  getCustomerInvoices,
  saveCustomerInvoices,
  getInvoicePayments,
  saveInvoicePayments,
  generateNextInvoiceNumber,
  createAutomaticInvoiceJournalEntry,
  createAutomaticPaymentJournalEntry,
} from "./salesService";
import CustomerInvoiceList from "./CustomerInvoiceList";
import CustomerInvoiceForm from "./CustomerInvoiceForm";
import InvoicePaymentModal from "./InvoicePaymentModal";
import PrintableInvoiceModal from "./PrintableInvoiceModal";
import Toast, { useToast } from "../../../components/common/Toast";

function CustomerInvoicesMaster({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isBills =
    mode === "bills" ||
    location.pathname.includes("bills") ||
    location.pathname.endsWith("/sales");
  const entityTitle = isBills ? "Customer Bills" : "Customer Invoices";

  const [invoices, setInvoices] = useState(() => getCustomerInvoices());
  const [payments, setPayments] = useState(() => getInvoicePayments());
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "form"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | Not Paid | Partial | Paid

  // Modals state
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [printModalInvoice, setPrintModalInvoice] = useState(null);
  const { toastMessage, showToast } = useToast();

  // Next sequential invoice number
  const nextInvoiceNo = useMemo(() => {
    return generateNextInvoiceNumber(invoices);
  }, [invoices]);

  // Load invoices and payments on mount or route param change
  useEffect(() => {
    const invList = getCustomerInvoices();
    const payList = getInvoicePayments();
    setInvoices(invList);
    setPayments(payList);

    // Check if URL specifies an invoiceId
    const queryInvoiceId = searchParams.get("invoiceId");
    if (queryInvoiceId) {
      const match = invList.find((i) => i.id === queryInvoiceId || i.invoiceNo === queryInvoiceId);
      if (match) {
        setSelectedInvoice(match);
        setViewMode("form");
      }
    }
  }, [searchParams]);

  // Save changes to invoices
  const persistInvoices = (updatedList) => {
    setInvoices(updatedList);
    saveCustomerInvoices(updatedList);
  };

  // Save changes to payments
  const persistPayments = (updatedList) => {
    setPayments(updatedList);
    saveInvoicePayments(updatedList);
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const query = searchTerm.toLowerCase().trim();
      const matchSearch =
        !query ||
        inv.invoiceNo?.toLowerCase().includes(query) ||
        inv.customerName?.toLowerCase().includes(query) ||
        inv.invoiceRef?.toLowerCase().includes(query) ||
        inv.soNumber?.toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "ALL" || inv.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const totalPaid = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
    const totalOutstanding = Math.max(0, totalAmount - totalPaid);

    return { totalInvoices, totalAmount, totalPaid, totalOutstanding };
  }, [invoices]);

  // Handlers
  const handleSelectInvoice = (inv) => {
    setSelectedInvoice(inv);
    setViewMode("form");
    setSearchParams({ invoiceId: inv.id });
  };

  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setViewMode("form");
    setSearchParams({});
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedInvoice(null);
    setSearchParams({});
  };

  const handleSaveInvoice = (invoiceData) => {
    let updated;
    const exists = invoices.some((i) => i.id === invoiceData.id);
    if (exists) {
      updated = invoices.map((i) => (i.id === invoiceData.id ? invoiceData : i));
    } else {
      updated = [invoiceData, ...invoices];
    }
    persistInvoices(updated);
    setSelectedInvoice(invoiceData);
    showToast(`${entityTitle} draft saved successfully.`);
  };

  const handleConfirmInvoice = (invoiceData) => {
    // 1. Create automatic balanced Journal Entry in Sales Journal
    createAutomaticInvoiceJournalEntry(invoiceData);

    // 2. Persist invoice as Confirmed
    const confirmedData = {
      ...invoiceData,
      confirmationStatus: "Confirmed",
    };
    let updated;
    const exists = invoices.some((i) => i.id === confirmedData.id);
    if (exists) {
      updated = invoices.map((i) => (i.id === confirmedData.id ? confirmedData : i));
    } else {
      updated = [confirmedData, ...invoices];
    }
    persistInvoices(updated);
    setSelectedInvoice(confirmedData);
    showToast(`Invoice ${confirmedData.invoiceNo} confirmed! Balanced Journal Entry created in Sales Journal.`);
  };

  const handleCancelInvoice = (id) => {
    const updated = invoices.map((i) => (i.id === id ? { ...i, confirmationStatus: "Cancelled" } : o));
    persistInvoices(updated);
    if (selectedInvoice?.id === id) {
      setSelectedInvoice((prev) => ({ ...prev, confirmationStatus: "Cancelled" }));
    }
    showToast("Invoice cancelled.");
  };

  // Payment Handlers
  const handleOpenPayment = (inv) => {
    setPaymentModalInvoice(inv);
  };

  const handleConfirmPayment = (paymentData) => {
    if (!paymentModalInvoice) return;

    // 1. Create automatic balanced Journal Entry for Payment
    createAutomaticPaymentJournalEntry(paymentData, paymentModalInvoice);

    // 2. Save payment record
    const updatedPayments = [paymentData, ...payments];
    persistPayments(updatedPayments);

    // 3. Recalculate invoice status and balances
    const invoicePayments = updatedPayments.filter(
      (p) => p.invoiceId === paymentModalInvoice.id && p.status !== "Cancelled"
    );
    const totalPaid = invoicePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const invoiceTotal = Number(paymentModalInvoice.total) || 0;
    const outstanding = Math.max(0, invoiceTotal - totalPaid);

    let nextStatus = "Not Paid";
    if (totalPaid >= invoiceTotal) {
      nextStatus = "Paid";
    } else if (totalPaid > 0) {
      nextStatus = "Partial";
    }

    const updatedInvoice = {
      ...paymentModalInvoice,
      paidAmount: totalPaid,
      outstandingAmount: outstanding,
      status: nextStatus,
    };

    const updatedInvoicesList = invoices.map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );
    persistInvoices(updatedInvoicesList);
    setSelectedInvoice(updatedInvoice);
    setPaymentModalInvoice(null);
    showToast(`Payment of Rs. ${Number(paymentData.amount).toLocaleString()} recorded. Status: ${nextStatus}.`);
  };

  // Traceability Handlers
  const handleOpenSO = (soRef) => {
    navigate(`/invoicing_user/sales-orders?soId=${soRef}`);
  };

  const handleOpenBudget = (budgetRef) => {
    navigate(`/invoicing_user/budget-reports`, {
      state: {
        search: budgetRef,
        analyticAccount: budgetRef,
        budgetId: budgetRef,
      },
    });
  };

  const handleOpenPrint = (inv) => {
    setPrintModalInvoice(inv);
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} />

      {/* Module Title & Breadcrumbs when in List view */}
      {viewMode === "list" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#716B63]">
              <span>Sales</span>
              <span>/</span>
              <span className="font-semibold text-[#211D19]">{entityTitle}</span>
            </div>
            <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight mt-1">
              {entityTitle}
            </h1>
            <p className="text-sm text-[#716B63] mt-1">
              Generate customer invoices, record partial or full payments, and automatically synchronize journal entries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/invoicing_user")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-white text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] text-sm font-medium transition cursor-pointer shadow-xs"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNewInvoice}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#342921] text-white text-sm font-semibold hover:bg-[#231b15] transition cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              <span>New {isBills ? "Customer Bill" : "Customer Invoice"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW 1: LIST VIEW ================= */}
      {viewMode === "list" && (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#e7e3da] p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-[#716B63] text-xs font-semibold uppercase tracking-wider">
                <span>Total Invoices</span>
                <FileText size={16} />
              </div>
              <p className="text-2xl font-bold text-[#211D19] mt-2">
                {metrics.totalInvoices}
              </p>
            </div>

            <div className="bg-white border border-[#e7e3da] p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-[#716B63] text-xs font-semibold uppercase tracking-wider">
                <span>Total Receivables</span>
                <DollarSign size={16} />
              </div>
              <p className="text-2xl font-bold text-[#211D19] mt-2">
                Rs. {metrics.totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="bg-white border border-[#e7e3da] p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                <span>Total Paid</span>
                <CheckCircle size={16} />
              </div>
              <p className="text-2xl font-bold text-emerald-700 mt-2">
                Rs. {metrics.totalPaid.toLocaleString()}
              </p>
            </div>

            <div className="bg-white border border-[#e7e3da] p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-amber-800 text-xs font-semibold uppercase tracking-wider">
                <span>Total Outstanding</span>
                <Clock size={16} />
              </div>
              <p className="text-2xl font-bold text-amber-800 mt-2">
                Rs. {metrics.totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89f91]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by invoice number, customer, or SO#..."
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-xs font-medium text-[#211D19] focus:outline-hidden focus:border-[#342921] transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89f91] hover:text-[#211D19]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#716B63] uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-xs font-medium text-[#211D19] focus:outline-hidden focus:border-[#342921] transition cursor-pointer"
              >
                <option value="ALL">All Payments</option>
                <option value="Not Paid">Not Paid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          {/* List Table */}
          <CustomerInvoiceList
            invoices={filteredInvoices}
            onSelectInvoice={handleSelectInvoice}
            onNewInvoice={handleNewInvoice}
            isBills={isBills}
          />
        </>
      )}

      {/* ================= VIEW 2: FORM VIEW ================= */}
      {viewMode === "form" && (
        <CustomerInvoiceForm
          invoice={selectedInvoice}
          nextInvoiceNo={nextInvoiceNo}
          payments={payments.filter((p) => p.invoiceId === selectedInvoice?.id)}
          onSave={handleSaveInvoice}
          onConfirm={handleConfirmInvoice}
          onOpenPayment={handleOpenPayment}
          onOpenSO={handleOpenSO}
          onOpenBudget={handleOpenBudget}
          onBack={handleBackToList}
          onNew={handleNewInvoice}
          onOpenPrint={handleOpenPrint}
          onCancelInvoice={handleCancelInvoice}
          isBills={isBills}
        />
      )}

      {/* Payment Modal */}
      {paymentModalInvoice && (
        <InvoicePaymentModal
          invoice={paymentModalInvoice}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setPaymentModalInvoice(null)}
          onOpenPrint={handleOpenPrint}
        />
      )}

      {/* Printable Invoice Modal */}
      {printModalInvoice && (
        <PrintableInvoiceModal
          invoice={printModalInvoice}
          payments={payments.filter((p) => p.invoiceId === printModalInvoice.id)}
          onClose={() => setPrintModalInvoice(null)}
        />
      )}
    </div>
  );
}

export default CustomerInvoicesMaster;
