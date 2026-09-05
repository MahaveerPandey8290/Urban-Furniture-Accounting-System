import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, X, ArrowLeft } from "lucide-react";
import Toast, { useToast } from "../../../components/common/Toast";
import SalesOrderList from "./SalesOrderList";
import SalesOrderForm from "./SalesOrderForm";
import {
  getSalesOrders,
  saveSalesOrders,
  getCustomers,
  getProducts,
  getBudgetProjects,
  getCustomerInvoices,
  saveCustomerInvoices,
  generateNextSONumber,
  generateNextInvoiceNumber,
} from "./salesService";
import { getChartOfAccounts } from "../accounts/ChartOfAccountsMaster";

function SalesOrdersMaster() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const soIdParam = searchParams.get("soId");

  // Master Data
  const [customers, setCustomers] = useState(() => getCustomers());
  const [products, setProducts] = useState(() => getProducts());
  const [budgets, setBudgets] = useState(() => getBudgetProjects());

  // Reload master data whenever view switches or mounts
  useEffect(() => {
    setCustomers(getCustomers());
    setProducts(getProducts());
    setBudgets(getBudgetProjects());
  }, []);

  // Sales Orders state
  const [orders, setOrders] = useState(() => getSalesOrders());

  // Views: 'list' (default) | 'form'
  const [currentView, setCurrentView] = useState(() => (soIdParam ? "form" : "list"));
  const [editingOrder, setEditingOrder] = useState(() => {
    if (soIdParam) {
      const all = getSalesOrders();
      return all.find((o) => o.id === soIdParam || o.soNumber === soIdParam) || null;
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | Draft | Confirmed | Invoiced | Cancelled
  const { toastMessage, showToast } = useToast();

  // Next sequential SO Number
  const nextSoNumber = useMemo(() => {
    return generateNextSONumber(orders);
  }, [orders]);

  // Sync with soIdParam
  useEffect(() => {
    if (soIdParam) {
      const found = orders.find((o) => o.id === soIdParam || o.soNumber === soIdParam);
      if (found) {
        setEditingOrder(found);
        setCurrentView("form");
      }
    }
  }, [soIdParam, orders]);

  // Persist orders
  useEffect(() => {
    saveSalesOrders(orders);
  }, [orders]);

  const handleNewOrder = () => {
    setEditingOrder(null);
    setCurrentView("form");
    setSearchParams({});
  };

  const handleSelectOrder = (so) => {
    setEditingOrder(so);
    setCurrentView("form");
    setSearchParams({ soId: so.id });
  };

  const handleDeleteOrder = (soId) => {
    if (window.confirm("Are you sure you want to delete this sales order?")) {
      const updated = orders.filter((o) => o.id !== soId);
      setOrders(updated);
      saveSalesOrders(updated);
      showToast("Sales order deleted successfully!");
    }
  };

  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView("list");
      setEditingOrder(null);
      setSearchParams({});
    } else {
      const isPathAdmin = window.location.pathname.startsWith("/admin");
      navigate(isPathAdmin ? "/admin" : "/invoicing_user");
    }
  };

  const handleConfirmOrder = (confirmedSO) => {
    let updated;
    const exists = orders.some((o) => o.id === confirmedSO.id);
    if (exists) {
      updated = orders.map((o) => (o.id === confirmedSO.id ? confirmedSO : o));
    } else {
      updated = [confirmedSO, ...orders];
    }
    setOrders(updated);
    saveSalesOrders(updated);
    setEditingOrder(confirmedSO);
    showToast(`Sales Order "${confirmedSO.soNumber}" confirmed successfully!`);
  };

  const handleCancelOrder = (id) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status: "Cancelled" } : o));
    setOrders(updated);
    saveSalesOrders(updated);
    if (editingOrder?.id === id) {
      setEditingOrder((prev) => ({ ...prev, status: "Cancelled" }));
    }
    showToast("Sales Order cancelled.");
  };

  // Create Invoice from Sales Order
  const handleCreateInvoice = (so) => {
    // 1. Ensure SO is confirmed
    const confirmedSO = {
      ...so,
      id: so.id || `so-${Date.now()}`,
      status: "Invoiced",
    };

    // 2. Build Customer Invoice automatically carrying over data from SO:
    // Sequential invoice numbering: INV/2026/00001, INV/2026/00002...
    const currentInvoices = getCustomerInvoices();
    const newInvoiceNo = generateNextInvoiceNumber(currentInvoices);

    const today = new Date().toISOString().split("T")[0];
    const due = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Resolve default Sales Income account from Chart of Accounts
    const accounts = getChartOfAccounts();
    const defaultSalesAcc = accounts.find(
      (a) => a.accountName?.toLowerCase().includes("sales")
    ) || { id: "coa-5", accountName: "Sales Income A/c" };

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: newInvoiceNo,
      soId: confirmedSO.id,
      soNumber: confirmedSO.soNumber,
      customerId: confirmedSO.customerId,
      customerName: confirmedSO.customerName,
      invoiceRef: `REF-${confirmedSO.soNumber}`,
      invoiceDate: today,
      dueDate: due,
      status: "Not Paid",
      confirmationStatus: "Draft",
      total: confirmedSO.total,
      paidAmount: 0,
      outstandingAmount: confirmedSO.total,
      items: confirmedSO.items.map((it, idx) => ({
        id: `inv-item-${idx}-${Date.now()}`,
        productId: it.productId,
        productName: it.productName,
        accountId: defaultSalesAcc.id,
        accountName: defaultSalesAcc.accountName,
        budgetId: it.budgetId,
        budgetName: it.budgetName,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: Number(it.total) || 0,
      })),
    };

    // Update SO with invoiceId and save
    confirmedSO.invoiceId = newInvoice.id;
    const updatedOrders = orders.some((o) => o.id === confirmedSO.id)
      ? orders.map((o) => (o.id === confirmedSO.id ? confirmedSO : o))
      : [confirmedSO, ...orders];
    setOrders(updatedOrders);
    saveSalesOrders(updatedOrders);

    // Save newly created Customer Invoice
    const updatedInvoices = [newInvoice, ...currentInvoices];
    saveCustomerInvoices(updatedInvoices);

    showToast(`Invoice ${newInvoiceNo} generated from Sales Order ${confirmedSO.soNumber}!`);

    // Navigate to Customer Invoice screen with the new invoice opened
    const isPathAdmin = window.location.pathname.startsWith("/admin");
    navigate(
      isPathAdmin
        ? `/admin/customer-invoices?invoiceId=${newInvoice.id}`
        : `/invoicing_user/sale-invoices?invoiceId=${newInvoice.id}`
    );
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !searchQuery.trim() ||
        o.soNumber?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const matchStatus =
        statusFilter === "ALL" || o.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="w-full space-y-6">
      {/* Header breadcrumb & title */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#716B63] mb-1">
          <span>Sales</span>
          <span>/</span>
          <span className="text-[#211D19] font-semibold">Sales Orders</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
          {currentView === "form"
            ? editingOrder
              ? `Sales Order: ${editingOrder.soNumber}`
              : `New Sales Order (${nextSoNumber})`
            : "Sales Orders"}
        </h1>
      </div>

      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* ================= VIEW 1: LIST VIEW ================= */}
      {currentView === "list" && (
        <>
          {/* Top Action & Search Bar */}
          <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const isPathAdmin = window.location.pathname.startsWith("/admin");
                  navigate(isPathAdmin ? "/admin" : "/invoicing_user");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-white text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] text-sm font-medium transition cursor-pointer shadow-xs"
                title="Back to Dashboard"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNewOrder}
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#342921] text-white text-sm font-semibold hover:bg-[#231b15] transition cursor-pointer shadow-xs"
              >
                <Plus size={16} />
                <span>New Sales Order</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89f91]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by SO# or Customer..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-xs font-medium focus:outline-hidden focus:border-[#342921] transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89f91] hover:text-[#211D19]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-xs font-medium text-[#211D19] focus:outline-hidden focus:border-[#342921] transition cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Invoiced">Invoiced</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Sales Orders List Table */}
          <SalesOrderList
            orders={filteredOrders}
            onSelectOrder={handleSelectOrder}
            onNewOrder={handleNewOrder}
            onEditOrder={handleSelectOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        </>
      )}

      {/* ================= VIEW 2: FORM VIEW ================= */}
      {currentView === "form" && (
        <SalesOrderForm
          initialData={editingOrder}
          nextSoNumber={nextSoNumber}
          customers={customers}
          products={products}
          budgets={budgets}
          onConfirm={handleConfirmOrder}
          onCreateInvoice={handleCreateInvoice}
          onCancelOrder={handleCancelOrder}
          onNew={handleNewOrder}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default SalesOrdersMaster;
