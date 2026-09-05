import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, ArrowLeft, Search, X } from "lucide-react";
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
} from "./salesService";

function SalesOrdersMaster() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const soIdParam = searchParams.get("soId");

  // Master Data
  const [customers] = useState(() => getCustomers());
  const [products] = useState(() => getProducts());
  const [budgets] = useState(() => getBudgetProjects());

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
  const { toastMessage, showToast } = useToast();

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
  };

  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView("list");
      setEditingOrder(null);
      setSearchParams({});
    } else {
      navigate("/invoicing_user");
    }
  };

  const handleConfirmOrder = (confirmedSO) => {
    let updated;
    if (confirmedSO.id) {
      updated = orders.map((o) => (o.id === confirmedSO.id ? confirmedSO : o));
    } else {
      const newSO = {
        ...confirmedSO,
        id: "so-" + Date.now(),
      };
      updated = [newSO, ...orders];
    }
    setOrders(updated);
    setEditingOrder(confirmedSO);
    showToast(`Sales Order "${confirmedSO.soNumber}" confirmed successfully!`);
  };

  // Create Invoice from Sales Order
  const handleCreateInvoice = (so) => {
    // 1. Ensure SO is confirmed
    const confirmedSO = {
      ...so,
      id: so.id || ("so-" + Date.now()),
      status: "Invoiced",
    };

    // 2. Build Customer Invoice automatically carrying over data from SO:
    // "Invoice Created from SO fetch: Customer Name, Product, Price, Quantity"
    const newInvoiceNo = "INV/2026/" + String(Date.now()).slice(-3);
    const today = new Date().toISOString().split("T")[0];
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const newInvoice = {
      id: "inv-" + Date.now(),
      invoiceNo: newInvoiceNo,
      soId: confirmedSO.id,
      soNumber: confirmedSO.soNumber,
      customerId: confirmedSO.customerId,
      customerName: confirmedSO.customerName,
      invoiceRef: "REF-" + confirmedSO.soNumber,
      invoiceDate: today,
      dueDate: due,
      status: "Not Paid",
      confirmationStatus: "Draft",
      total: confirmedSO.total,
      paidAmount: 0,
      outstandingAmount: confirmedSO.total,
      items: confirmedSO.items.map((it, idx) => ({
        id: "inv-item-" + idx + "-" + Date.now(),
        productId: it.productId,
        productName: it.productName,
        accountId: "coa-5", // Default Sales Income A/c
        accountName: "Sales Income A/c",
        budgetId: it.budgetId,
        budgetName: it.budgetName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total,
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
    const currentInvoices = getCustomerInvoices();
    const updatedInvoices = [newInvoice, ...currentInvoices];
    saveCustomerInvoices(updatedInvoices);

    showToast(`Invoice ${newInvoiceNo} generated from Sales Order ${confirmedSO.soNumber}!`);

    // Navigate to Customer Invoice screen with the new invoice opened
    navigate(`/invoicing_user/sale-invoices?invoiceId=${newInvoice.id}`);
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const noMatch = o.soNumber?.toLowerCase().includes(query);
      const custMatch = o.customerName?.toLowerCase().includes(query);
      const statusMatch = o.status?.toLowerCase().includes(query);
      return noMatch || custMatch || statusMatch;
    });
  }, [orders, searchQuery]);

  return (
    <div className="w-full space-y-6">

      {/* Header breadcrumb & title */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#716B63] mb-1">
          <span>Sales</span>
          <span>/</span>
          <span className="text-[#211D19] font-medium">Sales Order</span>
        </div>
        <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
          {currentView === "form"
            ? editingOrder
              ? `Sales Order: ${editingOrder.soNumber}`
              : "New Sales Order"
            : "Sales Orders"}
        </h1>
      </div>

      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* ================= VIEW 1: LIST VIEW ================= */}
      {currentView === "list" && (
        <>
          {/* Top Action Bar */}
          <div className="bg-white border border-[#e7e3da] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <button
                type="button"
                onClick={handleNewOrder}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
              >
                <Plus size={15} />
                <span>New</span>
              </button>

              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#716B63]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by SO No, Customer..."
                  className="w-full h-10 pl-9 pr-8 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a89f91] hover:text-[#211D19] text-xs cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#6e6357] hover:text-[#24201a] hover:bg-[#faf8f4] hover:border-[#cfc6b6] transition cursor-pointer shadow-xs self-end sm:self-auto"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          </div>

          <SalesOrderList
            orders={filteredOrders}
            onSelectOrder={handleSelectOrder}
            onNewOrder={handleNewOrder}
          />
        </>
      )}

      {/* ================= VIEW 2: FORM VIEW ================= */}
      {currentView === "form" && (
        <SalesOrderForm
          initialData={editingOrder}
          customers={customers}
          products={products}
          budgets={budgets}
          onConfirm={handleConfirmOrder}
          onCreateInvoice={handleCreateInvoice}
          onNew={handleNewOrder}
          onBack={handleBack}
        />
      )}

    </div>
  );
}

export default SalesOrdersMaster;
