import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VendorBillList from "./purchase/VendorBillList";
import VendorBillForm from "./purchase/VendorBillForm";
import Toast, { useToast } from "../../components/common/Toast";
import {
  getVendorBills,
  saveVendorBills,
  getVendorPayments,
  saveVendorPayments,
  createVendorBillJournalEntry,
  createVendorPaymentJournalEntry,
} from "../../utils/storage";

function Bills() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toastMessage, showToast } = useToast();

  // Load bills from storage
  const [bills, setBills] = useState(() => getVendorBills());
  const [payments, setPayments] = useState(() => getVendorPayments());

  // Views: 'list' (default) | 'kanban' | 'form'
  const [currentView, setCurrentView] = useState("list");
  const [previousBrowseView, setPreviousBrowseView] = useState("list");

  // Selected bill for editing in form view
  const [selectedBill, setSelectedBill] = useState(null);

  // Sync with URL query params
  useEffect(() => {
    const billNumber = searchParams.get("billNumber");
    const action = searchParams.get("action");

    if (action === "new") {
      setSelectedBill(null);
      setCurrentView("form");
    } else if (billNumber) {
      const match = bills.find(
        (b) =>
          b.billNumber?.toLowerCase() === billNumber.toLowerCase() ||
          b.id === billNumber
      );
      if (match) {
        setSelectedBill(match);
        setCurrentView("form");
      }
    }
  }, [searchParams, bills]);

  // Persist bills
  const persistBills = (updatedList) => {
    setBills(updatedList);
    saveVendorBills(updatedList);
  };

  // Switch between List and Kanban
  const handleViewChange = (newView) => {
    setCurrentView(newView);
    setPreviousBrowseView(newView);
  };

  // New bill
  const handleNewBill = () => {
    setSelectedBill(null);
    setCurrentView("form");
    setSearchParams({ action: "new" });
  };

  // Open existing bill
  const handleSelectBill = (bill) => {
    setSelectedBill(bill);
    setCurrentView("form");
    setSearchParams({ billNumber: bill.billNumber });
  };

  // Back button
  const handleBack = () => {
    if (currentView === "form") {
      setCurrentView(previousBrowseView);
      setSelectedBill(null);
      setSearchParams({});
    } else {
      const isPathAdmin = window.location.pathname.startsWith("/admin");
      navigate(isPathAdmin ? "/admin" : "/invoicing_user");
    }
  };

  // Save Draft
  const handleSaveBill = (billData) => {
    let updated;
    const exists = bills.some((b) => b.id === billData.id);

    if (exists) {
      updated = bills.map((b) => (b.id === billData.id ? billData : b));
    } else {
      updated = [billData, ...bills];
    }

    persistBills(updated);
    setSelectedBill(billData);
    showToast("Vendor Bill draft saved successfully!");
  };

  // Confirm Vendor Bill & Create Automatic Journal Entry
  const handleConfirmBill = (billData) => {
    try {
      // 1. Post automatic balanced Journal Entry
      createVendorBillJournalEntry(billData);

      // 2. Update Bill Status
      const confirmedData = {
        ...billData,
        confirmationStatus: "Confirmed",
        status:
          Number(billData.paidAmount) >= Number(billData.total)
            ? "Paid"
            : Number(billData.paidAmount) > 0
            ? "Partial"
            : "Not Paid",
      };

      let updated;
      const exists = bills.some((b) => b.id === billData.id);

      if (exists) {
        updated = bills.map((b) => (b.id === billData.id ? confirmedData : b));
      } else {
        updated = [confirmedData, ...bills];
      }

      persistBills(updated);
      setSelectedBill(confirmedData);
      showToast(
        `Vendor Bill ${confirmedData.billNumber} Confirmed! Journal Entry posted automatically.`
      );
    } catch (e) {
      console.error("Error confirming vendor bill:", e);
      showToast(e.message || "Failed to confirm vendor bill", "error");
    }
  };

  // Cancel Bill
  const handleCancelBill = () => {
    if (!selectedBill) return;
    const cancelled = { ...selectedBill, status: "Cancelled" };
    const updated = bills.map((b) => (b.id === selectedBill.id ? cancelled : b));
    persistBills(updated);
    setSelectedBill(cancelled);
    showToast(`Vendor Bill ${selectedBill.billNumber} Cancelled.`);
  };

  // Record Payment & Create Automatic Payment Journal Entry
  const handleRecordPayment = (paymentData, billData) => {
    try {
      // 1. Save payment record
      const updatedPayments = [paymentData, ...payments];
      setPayments(updatedPayments);
      saveVendorPayments(updatedPayments);

      // 2. Post automatic payment Journal Entry (Dr Creditors, Cr Bank/Cash)
      createVendorPaymentJournalEntry(paymentData, billData);

      // 3. Update Bill Paid Amount, Amount Due, Payment Status
      const newPaid = (Number(billData.paidAmount) || 0) + Number(paymentData.amount);
      const newDue = Math.max(0, Number(billData.total) - newPaid);
      const newStatus = newDue === 0 ? "Paid" : "Partial";

      const updatedBill = {
        ...billData,
        paidAmount: newPaid,
        amountDue: newDue,
        status: newStatus,
        paymentStatus: newStatus,
      };

      const updatedBills = bills.map((b) => (b.id === billData.id ? updatedBill : b));
      persistBills(updatedBills);
      setSelectedBill(updatedBill);

      showToast(
        `Payment of Rs. ${Number(paymentData.amount).toLocaleString()} recorded! Status: ${newStatus}. Journal entry posted.`
      );
    } catch (e) {
      console.error("Error recording payment:", e);
      showToast(e.message || "Failed to record payment", "error");
    }
  };

  // Navigate to linked PO
  const handleOpenPO = (poNum) => {
    const isPathAdmin = window.location.pathname.startsWith("/admin");
    navigate(
      isPathAdmin
        ? `/admin/purchase-orders?poNumber=${poNum}`
        : `/invoicing_user/purchase-orders?poNumber=${poNum}`
    );
  };

  // Delete Vendor Bill
  const handleDeleteBill = (billId) => {
    if (window.confirm("Are you sure you want to delete this vendor bill?")) {
      const updated = bills.filter((b) => b.id !== billId);
      persistBills(updated);
      showToast("Vendor bill deleted successfully");
    }
  };

  return (
    <div className="w-full">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {currentView === "form" ? (
        <VendorBillForm
          initialData={selectedBill}
          onSave={handleSaveBill}
          onConfirm={handleConfirmBill}
          onRecordPayment={handleRecordPayment}
          onNew={handleNewBill}
          onCancel={handleCancelBill}
          onBack={handleBack}
          onOpenPO={handleOpenPO}
        />
      ) : (
        <VendorBillList
          bills={bills}
          currentView={currentView}
          onViewChange={handleViewChange}
          onNewBill={handleNewBill}
          onSelectBill={handleSelectBill}
          onEditBill={handleSelectBill}
          onDeleteBill={handleDeleteBill}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default Bills;
