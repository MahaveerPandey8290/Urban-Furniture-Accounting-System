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
  DollarSign
} from "lucide-react";
import {
  getCustomerInvoices,
  saveCustomerInvoices,
  getInvoicePayments,
  saveInvoicePayments,
  createAutomaticInvoiceJournalEntry,
  createAutomaticPaymentJournalEntry,
} from "./salesService";
import CustomerInvoiceList from "./CustomerInvoiceList";
import CustomerInvoiceForm from "./CustomerInvoiceForm";
import InvoicePaymentModal from "./InvoicePaymentModal";
import PrintableInvoiceModal from "./PrintableInvoiceModal";

function CustomerInvoicesMaster({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isBills =
    mode === "bills" ||
    location.pathname.includes("bills") ||
    location.pathname.endsWith("/sales");
  const entityTitle = isBills ? "Customer Bills" : "Customer Invoices";
  const entitySingular = isBills ? "Customer Bill" : "Customer Invoice";

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "form"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | Not Paid | Partial | Paid

  // Modals state
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [printModalInvoice, setPrintModalInvoice] = useState(null);

  // Load invoices and payments on mount
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
      const matchSearch =
        !searchTerm ||
        inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.soNumber?.toLowerCase().includes(searchTerm.toLowerCase());

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
  };

  const handleConfirmInvoice = (invoiceData) => {
    // 1. Create automatic balanced Journal Entry
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
  };

  // Traceability Handlers
  const handleOpenSO = (soRef) => {
    navigate(`/invoicing_user/sales-orders?soId=${soRef}`);
  };

  const handleOpenBudget = (budgetId) => {
    navigate(`/invoicing_user/budget-reports`);
  };

  const handleOpenPrint = (inv) => {
    setPrintModalInvoice(inv);
  };

  return (
    <div className="space-y-6">

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
            <p className="text-sm text-[#716B63] mt-2">
              {isBills
                ? "Generate customer bills from confirmed Sales Orders, record payments, and sync with accounting."
                : "Generate invoices from confirmed Sales Orders, record payments, and sync with accounting."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewInvoice}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              <span>New {entitySingular}</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Cards when in List view */}
      {viewMode === "list" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Invoices / Bills */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7e3da] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#716B63] uppercase tracking-wider">
                Total {isBills ? "Bills" : "Invoices"}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#faf8f4] text-[#716B63] flex items-center justify-center">
                <FileText size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#211D19] mt-2">
              {metrics.totalInvoices}
            </p>
            <p className="text-xs text-[#716B63] mt-1">
              Sales billing documents
            </p>
          </div>

          {/* Invoiced Amount */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7e3da] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#716B63] uppercase tracking-wider">
                Invoiced Total
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#faf8f4] text-[#342921] flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#211D19] mt-2">
              Rs. {metrics.totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-[#716B63] mt-1">
              Gross sales receivables
            </p>
          </div>

          {/* Outstanding Due */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7e3da] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8e392e] uppercase tracking-wider">
                Outstanding
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#fbf0ee] text-[#8e392e] flex items-center justify-center">
                <AlertCircle size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#8e392e] mt-2">
              Rs. {metrics.totalOutstanding.toLocaleString()}
            </p>
            <p className="text-xs text-[#716B63] mt-1">
              Pending collections
            </p>
          </div>

          {/* Total Collected */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7e3da] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#3e5335] uppercase tracking-wider">
                Collected
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#eef3e8] text-[#3e5335] flex items-center justify-center">
                <CheckCircle size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#3e5335] mt-2">
              Rs. {metrics.totalPaid.toLocaleString()}
            </p>
            <p className="text-xs text-[#716B63] mt-1">
              Cash & Bank received
            </p>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR (List view) */}
      {viewMode === "list" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e7e3da] shadow-xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-3 text-[#a89f91] pointer-events-none"
            />
            <input
              type="text"
              placeholder={`Search by ${isBills ? "Bill" : "Invoice"} No, Customer, SO...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm text-[#211D19] placeholder-[#a89f91] focus:bg-white focus:outline-none focus:border-[#342921]"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["ALL", "Not Paid", "Partial", "Paid"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-[#342921] text-white shadow-xs"
                    : "bg-[#faf8f4] text-[#716B63] hover:bg-[#f0ece4]"
                }`}
              >
                {st === "ALL" ? `All ${isBills ? "Bills" : "Invoices"}` : st}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT */}
      {viewMode === "list" ? (
        <CustomerInvoiceList
          invoices={filteredInvoices}
          onSelectInvoice={handleSelectInvoice}
          onNewInvoice={handleNewInvoice}
          isBills={isBills}
        />
      ) : (
        <CustomerInvoiceForm
          invoice={selectedInvoice}
          onSave={handleSaveInvoice}
          onConfirm={handleConfirmInvoice}
          onOpenPayment={handleOpenPayment}
          onOpenSO={handleOpenSO}
          onOpenBudget={handleOpenBudget}
          onBack={handleBackToList}
          onNew={handleNewInvoice}
          onOpenPrint={handleOpenPrint}
          isBills={isBills}
        />
      )}

      {/* PAYMENT MODAL */}
      {paymentModalInvoice && (
        <InvoicePaymentModal
          invoice={paymentModalInvoice}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setPaymentModalInvoice(null)}
          onOpenPrint={() => {
            setPrintModalInvoice(paymentModalInvoice);
            setPaymentModalInvoice(null);
          }}
        />
      )}

      {/* PRINTABLE PREVIEW MODAL */}
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
