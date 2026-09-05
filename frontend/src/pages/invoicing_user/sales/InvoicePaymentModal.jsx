import { useState } from "react";
import { X, CheckCircle, Printer, Send, ChevronDown } from "lucide-react";

function InvoicePaymentModal({
  invoice,
  onConfirmPayment,
  onClose,
  onOpenPrint,
}) {
  const outstanding = Math.max(
    0,
    (Number(invoice.total) || 0) - (Number(invoice.paidAmount) || 0)
  );

  const [paymentType, setPaymentType] = useState("Receive"); // Send | Receive
  const [partner, setPartner] = useState(invoice.customerName || "");
  const [amount, setAmount] = useState(outstanding);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentVia, setPaymentVia] = useState("Cash"); // Cash | Bank
  const [note, setNote] = useState(`Payment received against ${invoice.invoiceNo || "Invoice"}`);
  const [error, setError] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const handleConfirm = (e) => {
    if (e) e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid payment amount greater than zero.");
      return;
    }

    if (numAmount > outstanding) {
      setError(`Payment cannot exceed outstanding balance of Rs. ${outstanding.toLocaleString()}`);
      return;
    }

    onConfirmPayment({
      id: "pay-" + Date.now(),
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      partnerId: invoice.customerId,
      partnerName: partner,
      amount: numAmount,
      date,
      paymentType,
      paymentVia,
      note,
      status: "Confirm", // Confirm | Draft | Cancelled
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#e7e3da] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Modal Header & Top Buttons as per wireframe */}
        {/* Wireframe: Invoice Payment | [ Confirm ] [ Cancel ] */}
        <div className="p-5 sm:p-6 border-b border-[#f0ece4] flex items-center justify-between bg-[#faf8f4]">
          <div>
            <h3 className="text-lg font-semibold text-[#211D19]">Invoice Payment</h3>
            <p className="text-sm text-[#716B63] mt-1">
              Receiving payment for {invoice.invoiceNo} • Outstanding: Rs. {outstanding.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4.5 py-2 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2 rounded-lg border border-[#e7e3da] bg-white text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Status Area shown in wireframe: Draft | Confirm | Cancelled */}
        <div className="px-6 py-2.5 bg-[#f4efe8] border-b border-[#e7e3da] flex items-center justify-between text-xs font-medium text-[#716B63]">
          <span>Payment Lifecycle:</span>
          <div className="flex items-center gap-3">
            <span className="text-[#a89f91]">Draft</span>
            <span>→</span>
            <span className="text-[#3e5335] font-semibold flex items-center gap-1">
              <CheckCircle size={14} /> Confirm
            </span>
            <span>→</span>
            <span className="text-[#a89f91]">Cancelled</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">

          {error && (
            <div className="p-3.5 rounded-lg bg-[#fbf0ee] border border-[#f0d4d0] text-[#8e392e] text-xs">
              {error}
            </div>
          )}

          {/* 1. Payment Type: ( ) Send  (●) Receive */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Payment Type
            </label>
            <div className="flex items-center gap-5 text-sm text-[#211D19]">
              <label className="flex items-center gap-2 cursor-pointer opacity-60">
                <input
                  type="radio"
                  name="paymentType"
                  value="Send"
                  disabled
                  checked={paymentType === "Send"}
                  onChange={() => setPaymentType("Send")}
                  className="accent-[#342921]"
                />
                <span>Send</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#342921]">
                <input
                  type="radio"
                  name="paymentType"
                  value="Receive"
                  checked={paymentType === "Receive"}
                  onChange={() => setPaymentType("Receive")}
                  className="accent-[#342921]"
                />
                <span>Receive (Customer Payment)</span>
              </label>
            </div>
          </div>

          {/* 2. Partner (Customer) */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Partner
            </label>
            <input
              type="text"
              readOnly
              value={partner}
              className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-sm font-medium text-[#211D19] outline-none"
            />
          </div>

          {/* 3. Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                Amount (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={outstanding}
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-white text-sm font-bold text-[#211D19] outline-none focus:border-[#342921] transition"
              />
              <span className="text-xs text-[#716B63] mt-1 block">
                Max outstanding: Rs. {outstanding.toLocaleString()}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#211D19] mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
              />
            </div>
          </div>

          {/* 4. Payment Via: Cash / Bank */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Payment Via <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentVia}
              onChange={(e) => setPaymentVia(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition cursor-pointer"
            >
              <option value="Cash">Cash (Cash A/c)</option>
              <option value="Bank">Bank (Bank A/c)</option>
            </select>
          </div>

          {/* 5. Note */}
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received via cheque/UPI/cash"
              className="w-full h-10 px-3.5 rounded-lg border border-[#e7e3da] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921] transition"
            />
          </div>

          {/* 6. Wireframe Options Control: [ Options ▼ ] -> Print, Send */}
          <div className="pt-3 border-t border-[#f0ece4] flex items-center justify-between">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e7e3da] bg-[#faf8f4] text-xs font-medium text-[#342921] hover:bg-[#f3efe7] transition cursor-pointer"
              >
                <span>Options</span>
                <ChevronDown size={14} />
              </button>

              {showOptionsMenu && (
                <div className="absolute bottom-full mb-1 left-0 z-20 bg-white border border-[#e7e3da] rounded-xl shadow-lg p-1.5 min-w-[140px] animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onOpenPrint();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#211D19] hover:bg-[#faf8f4] rounded-lg transition text-left cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      alert(`Payment receipt for ${invoice.invoiceNo} prepared for dispatch to ${partner}.`);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#211D19] hover:bg-[#faf8f4] rounded-lg transition text-left cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Send Receipt</span>
                  </button>
                </div>
              )}
            </div>

            <span className="text-xs text-[#716B63]">
              Automatic Journal Entry will be created upon confirmation
            </span>
          </div>

        </form>

      </div>
    </div>
  );
}

export default InvoicePaymentModal;
