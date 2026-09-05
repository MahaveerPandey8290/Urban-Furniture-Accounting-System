import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PurchaseOrderList from "./purchase/PurchaseOrderList";
import PurchaseOrderForm from "./purchase/PurchaseOrderForm";
import Toast, { useToast } from "../../components/common/Toast";
import {
  getPurchaseOrders,
  savePurchaseOrders,
  getVendorBills,
  saveVendorBills,
  getNextBillNumber,
  getAccounts,
} from "../../utils/storage";

function PurchaseOrders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toastMessage, showToast } = useToast();

  // Load PO list
  const [purchaseOrders, setPurchaseOrders] = useState(() => getPurchaseOrders());

  // View state: 'list' (default) | 'kanban' | 'form'
  const [currentView, setCurrentView] = useState("list");
  // Track previous browse view ('list' or 'kanban') so Back returns to it
  const [previousBrowseView, setPreviousBrowseView] = useState("list");

  // Active PO for editing in Form View (null for new)
  const [selectedPO, setSelectedPO] = useState(null);

  // Sync with URL params
  useEffect(() => {
    const poNumber = searchParams.get("poNumber");
    const action = searchParams.get("action");

    if (action === "new") {
      setSelectedPO(null);
      setCurrentView("form");
    } else if (poNumber) {
      const match = purchaseOrders.find(
        (p) => p.poNumber?.toLowerCase() === poNumber.toLowerCase() || p.id === poNumber
      );
      if (match) {
        setSelectedPO(match);
        setCurrentView("form");
      }
    }
  }, [searchParams, purchaseOrders]);

  // Persist POs to storage
  const persistOrders = (updatedList) => {
    setPurchaseOrders(updatedList);
    savePurchaseOrders(updatedList);
  };

  // Switch between List and Kanban
  const handleViewChange = (newView) => {
    setCurrentView(newView);
    setPreviousBrowseView(newView);
  };

  // Open Form for New Purchase Order
  const handleNewPO = () => {
    setSelectedPO(null);
    setCurrentView("form");
    setSearchParams({ action: "new" });
  };

  // Select PO to open in detail/edit mode
  const handleSelectPO = (po) => {
    setSelectedPO(po);
    setCurrentView("form");
    setSearchParams({ poNumber: po.poNumber });
  };

  // Back button handler
  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView(previousBrowseView);
      setSelectedPO(null);
      setSearchParams({});
    } else {
      const isPathAdmin = window.location.pathname.startsWith("/admin");
      navigate(isPathAdmin ? "/admin" : "/invoicing_user");
    }
  };

  // Save Purchase Order (Draft)
  const handleSavePO = (poData) => {
    let updated;
    const exists = purchaseOrders.some((p) => p.id === poData.id);

    if (exists) {
      updated = purchaseOrders.map((p) => (p.id === poData.id ? poData : p));
    } else {
      updated = [poData, ...purchaseOrders];
    }

    persistOrders(updated);
    setSelectedPO(poData);
    showToast("Purchase Order draft saved successfully!");
  };

  // Confirm Purchase Order
  const handleConfirmPO = (poData) => {
    const confirmedData = { ...poData, status: "Confirmed" };
    let updated;
    const exists = purchaseOrders.some((p) => p.id === poData.id);

    if (exists) {
      updated = purchaseOrders.map((p) => (p.id === poData.id ? confirmedData : p));
    } else {
      updated = [confirmedData, ...purchaseOrders];
    }

    persistOrders(updated);
    setSelectedPO(confirmedData);
    showToast(`Purchase Order ${confirmedData.poNumber} Confirmed! Ready for billing.`);
  };

  // Cancel Purchase Order
  const handleCancelPO = () => {
    if (!selectedPO) return;
    const cancelled = { ...selectedPO, status: "Cancelled" };
    const updated = purchaseOrders.map((p) => (p.id === selectedPO.id ? cancelled : p));
    persistOrders(updated);
    setSelectedPO(cancelled);
    showToast(`Purchase Order ${selectedPO.poNumber} Cancelled.`);
  };

  // Convert Purchase Order to Vendor Bill ("Create Bill")
  const handleCreateBill = (po) => {
    const activePO = po || selectedPO;
    if (!activePO) return;

    // Check if a bill is already created for this PO
    const bills = getVendorBills();
    let targetBill = bills.find((b) => b.poNumber === activePO.poNumber || b.poId === activePO.id);

    if (!targetBill) {
      // Create new Vendor Bill inheriting all data from Purchase Order
      const accounts = getAccounts();
      const defaultPurchaseAcc = accounts.find(
        (a) => a.accountName?.toLowerCase().includes("purchase")
      ) || { id: "coa-2", accountName: "Purchases Expense A/c" };

      const billNumber = getNextBillNumber();
      const todayStr = new Date().toISOString().split("T")[0];
      const due = new Date();
      due.setDate(due.getDate() + 14);
      const dueDateStr = due.toISOString().split("T")[0];

      targetBill = {
        id: `bill-${Date.now()}`,
        billNumber,
        poId: activePO.id,
        poNumber: activePO.poNumber,
        vendorId: activePO.vendorId,
        vendorName: activePO.vendorName,
        billRef: `REF-${String(Date.now()).slice(-4)}`,
        billDate: todayStr,
        dueDate: dueDateStr,
        status: "Draft",
        confirmationStatus: "Draft",
        total: activePO.total,
        paidAmount: 0,
        amountDue: activePO.total,
        paymentStatus: "Not Paid",
        items: (activePO.items || []).map((it, idx) => ({
          id: `bill-item-${Date.now()}-${idx + 1}`,
          productId: it.productId,
          productName: it.productName,
          accountId: defaultPurchaseAcc.id,
          accountName: defaultPurchaseAcc.accountName,
          budgetId: it.budgetId,
          budgetName: it.budgetName,
          analyticAccount: it.analyticAccount,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
        })),
      };

      // Save new bill
      const updatedBills = [targetBill, ...bills];
      saveVendorBills(updatedBills);

      // Link bill to this PO
      const updatedPO = {
        ...activePO,
        billId: targetBill.id,
        billNumber: targetBill.billNumber,
      };
      const updatedPOs = purchaseOrders.map((p) => (p.id === activePO.id ? updatedPO : p));
      persistOrders(updatedPOs);
      setSelectedPO(updatedPO);
    }

    // Navigate to Vendor Bills with this bill open in form view!
    const isPathAdmin = window.location.pathname.startsWith("/admin");
    navigate(
      isPathAdmin
        ? `/admin/vendor-bills?billNumber=${targetBill.billNumber}`
        : `/invoicing_user/bills?billNumber=${targetBill.billNumber}`
    );
  };

  // Delete Purchase Order
  const handleDeletePO = (poId) => {
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      const updated = purchaseOrders.filter((p) => p.id !== poId);
      persistOrders(updated);
      showToast("Purchase order deleted successfully");
    }
  };

  return (
    <div className="w-full">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {currentView === "form" ? (
        <PurchaseOrderForm
          initialData={selectedPO}
          onSave={handleSavePO}
          onConfirm={handleConfirmPO}
          onCreateBill={handleCreateBill}
          onNew={handleNewPO}
          onCancel={handleCancelPO}
          onBack={handleBack}
        />
      ) : (
        <PurchaseOrderList
          purchaseOrders={purchaseOrders}
          currentView={currentView}
          onViewChange={handleViewChange}
          onNewPO={handleNewPO}
          onSelectPO={handleSelectPO}
          onEditPO={handleSelectPO}
          onDeletePO={handleDeletePO}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default PurchaseOrders;
