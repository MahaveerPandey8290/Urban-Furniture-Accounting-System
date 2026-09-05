import { useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Send,
  Calendar,
  User,
  CreditCard,
  Building,
  Coins,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatters";

function VendorPaymentModal({ bill, onConfirmPayment, onClose }) {
  const amountDue = Math.max(
    0,
    bill.amountDue !== undefined
      ? Number(bill.amountDue)
      : (Number(bill.total) || 0) - (Number(bill.paidAmount) || 0)
  );

  // Modal Form State
  const [paymentType] = useState("Send"); // Always "Send" for vendor bill payment
  const [partner, setPartner] = useState(bill.vendorName || "");
  const [amount, setAmount] = useState(amountDue);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentVia, setPaymentVia] = useState("Bank"); // "Bank" | "Cash"
  const [note, setNote] = useState(`Payment towards vendor bill ${bill.billNumber || ""}`);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const numAmount = Number(amount);

    // Validation rules
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid payment amount greater than zero.");
      return;
    }

    if (numAmount > amountDue) {
      setError("Payment amount cannot exceed the outstanding amount.");
      return;
    }

    // Prepare payment record
    const paymentPayload = {
      id: `pay-v-${Date.now()}`,
      paymentNumber: `PAY/${bill.billNumber}`,
      billId: bill.id,
      billNumber: bill.billNumber,
      partnerId: bill.vendorId,
      partnerName: partner,
      paymentType: "Send",
      amount: numAmount,
      date,
      paymentVia,
      note,
      status: "Confirmed",
    };

    onConfirmPayment(paymentPayload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#e7e3da] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#f0ece4] flex items-center justify-between bg-[#faf8f4]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#342921] text-white flex items-center justify-center shadow-xs">
                <Send size={15} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#211D19]">
                  Vendor Bill Payment
                </h3>
                <p className="text-xs text-[#716B63]">
                  Record outgoing disbursement against {bill.billNumber}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#998d7f] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bill Balance Summary Bar */}
        <div className="px-6 py-3 bg-[#f5f1ea] border-b border-[#e7e3da] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#716B63]">Bill Total:</span>{" "}
            <strong className="text-[#211D19]">{formatCurrency(bill.total)}</strong>
          </div>
          <div>
            <span className="text-[#716B63]">Already Paid:</span>{" "}
            <strong className="text-emerald-700">
              {formatCurrency(bill.paidAmount || 0)}
            </strong>
          </div>
          <div>
            <span className="text-[#716B63]">Amount Due:</span>{" "}
            <strong className="text-amber-800 font-bold">
              {formatCurrency(amountDue)}
            </strong>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. Payment Type & Partner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
                Payment Type
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-xs font-semibold text-[#342921] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Send (Money Paid to Vendor)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
                Partner (Vendor)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={partner}
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-[#faf8f4] text-xs font-semibold text-[#211D19] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 2. Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#998d7f]">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max={amountDue}
                  step="any"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#cfc6b6] bg-white text-sm font-bold text-[#211D19] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15"
                />
              </div>
              <p className="text-[10.5px] text-[#998d7f] mt-1">
                Outstanding balance: {formatCurrency(amountDue)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-white text-sm text-[#211D19] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15"
              />
            </div>
          </div>

          {/* 3. Payment Via (Cash or Bank) */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
              Payment Via <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentVia("Bank")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  paymentVia === "Bank"
                    ? "border-[#342921] bg-[#342921] text-white shadow-xs"
                    : "border-[#e7e3da] bg-white text-[#6e6357] hover:bg-[#faf8f4]"
                }`}
              >
                <Building size={16} />
                <span>Bank (Bank A/c)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentVia("Cash")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  paymentVia === "Cash"
                    ? "border-[#342921] bg-[#342921] text-white shadow-xs"
                    : "border-[#e7e3da] bg-white text-[#6e6357] hover:bg-[#faf8f4]"
                }`}
              >
                <Coins size={16} />
                <span>Cash (Cash A/c)</span>
              </button>
            </div>
          </div>

          {/* 4. Note */}
          <div>
            <label className="block text-xs font-semibold text-[#716B63] mb-1.5 uppercase tracking-wider">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid via NEFT / Cheque No. / Cash Voucher"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e7e3da] bg-white text-xs text-[#211D19] placeholder-[#998d7f] focus:outline-hidden focus:ring-2 focus:ring-[#342921]/15"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#f0ece4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-xl border border-[#e7e3da] bg-white text-xs font-semibold text-[#6e6357] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#342921] text-white text-xs font-semibold hover:bg-[#231b15] shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle size={15} />
              <span>Confirm Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VendorPaymentModal;
