import { useState, useEffect } from "react";
import { getCustomerInvoices as getInvoices, saveCustomerInvoices as saveInvoices } from "../invoicing_user/sales/salesService";

function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [payModal, setPayModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);

  useEffect(() => {
    try {
      setInvoices(getInvoices());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handlePay = (e) => {
    e.preventDefault();
    try {
      const allInvoices = getInvoices();
      const idx = allInvoices.findIndex((i) => i.id === payModal.id);
      if (idx !== -1) {
        // mock payment
        allInvoices[idx].paymentStatus = "Paid";
        allInvoices[idx].amountDue = 0;
        allInvoices[idx].paidAmount = allInvoices[idx].total;
        saveInvoices(allInvoices);
        setInvoices(allInvoices);
      }
      setPayModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#e7e3da]">
        <div>
          <h2 className="text-2xl font-bold text-[#211D19]">My Invoices</h2>
          <p className="text-sm text-[#716B63] mt-1">View and pay your pending invoices.</p>
        </div>
      </div>

      <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#f0ece4] bg-[#faf8f4] text-[#716B63] font-semibold">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Total (₹)</th>
                <th className="py-3.5 px-4 text-right">Amount Due (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2eb]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#716B63]">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#faf8f4] transition">
                    <td className="py-3.5 px-4 font-semibold text-[#211D19]">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 text-[#38332c]">{inv.date}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#211D19]">
                      {Number(inv.total).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#c62828]">
                      {Number(inv.amountDue).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        inv.paymentStatus === 'Paid' ? 'bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]' :
                        inv.paymentStatus === 'Partial' ? 'bg-[#fcf5e8] text-[#7a5933] border-[#ebd8bc]' :
                        'bg-[#fce8e8] text-[#c62828] border-[#f4c7c7]'
                      }`}>
                        {inv.paymentStatus || 'Not Paid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewModal(inv)}
                          className="text-[#342921] hover:text-[#231b15] bg-[#f5f2eb] hover:bg-[#e7e3da] text-xs px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
                        >
                          View
                        </button>
                        {inv.amountDue > 0 ? (
                          <button
                            onClick={() => setPayModal(inv)}
                            className="bg-[#3e5335] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#2d3d26] transition shadow-sm cursor-pointer"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-[#716B63] text-xs">Fully Paid</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#e7e3da] shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-[#211D19] mb-4">Mock Payment Gateway</h3>
            <p className="text-sm text-[#716B63] mb-6">
              You are paying <strong>₹ {Number(payModal.amountDue).toLocaleString("en-IN")}</strong> for invoice {payModal.invoiceNumber}.
            </p>
            <form onSubmit={handlePay}>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPayModal(null)}
                  className="px-4 py-2 text-sm font-medium text-[#716B63] hover:text-[#211D19]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15]"
                >
                  Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#e7e3da] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[#211D19]">Invoice {viewModal.invoiceNumber || viewModal.invoiceNo}</h3>
                <p className="text-sm text-[#716B63]">Date: {viewModal.date || viewModal.invoiceDate}</p>
              </div>
              <button
                onClick={() => setViewModal(null)}
                className="text-[#716B63] hover:text-[#211D19] cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#716B63]">Billed To:</p>
                <p className="font-medium text-[#211D19]">{viewModal.customerName || "Customer"}</p>
              </div>
              <div className="text-right">
                <p className="text-[#716B63]">Reference:</p>
                <p className="font-medium text-[#211D19]">{viewModal.invoiceRef || viewModal.reference || '-'}</p>
              </div>
            </div>

            <div className="bg-[#f9f8f6] rounded-xl border border-[#e7e3da] overflow-hidden mb-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e7e3da] bg-[#f5f2eb] text-[#716B63]">
                    <th className="py-2.5 px-4 font-medium">Item</th>
                    <th className="py-2.5 px-4 font-medium text-right">Qty</th>
                    <th className="py-2.5 px-4 font-medium text-right">Price</th>
                    <th className="py-2.5 px-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e3da]">
                  {(viewModal.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 text-[#211D19]">{item.productName || item.description}</td>
                      <td className="py-2.5 px-4 text-right text-[#716B63]">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right text-[#716B63]">{Number(item.unitPrice).toLocaleString("en-IN")}</td>
                      <td className="py-2.5 px-4 text-right font-medium text-[#211D19]">{Number(item.total).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-[#e7e3da] p-4 flex justify-between items-center bg-white">
                <span className="font-semibold text-[#211D19]">Grand Total</span>
                <span className="font-bold text-lg text-[#211D19]">₹ {Number(viewModal.total).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg border border-[#cfc6b6] bg-white text-[#211D19] text-sm font-medium hover:bg-[#f5f2eb] cursor-pointer shadow-sm transition"
              >
                Print / Download PDF
              </button>
              {viewModal.amountDue > 0 && (
                <button
                  onClick={() => {
                    setPayModal(viewModal);
                    setViewModal(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#3e5335] text-white text-sm font-medium hover:bg-[#2d3d26] cursor-pointer shadow-sm transition"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyInvoices;
