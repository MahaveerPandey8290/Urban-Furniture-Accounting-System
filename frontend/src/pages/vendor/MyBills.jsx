import { useState, useEffect } from "react";
import api from "../../services/api";

function MyBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [newBill, setNewBill] = useState({ amount: "", reference: "" });
  const [viewModal, setViewModal] = useState(null);
  const [payModal, setPayModal] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices?documentType=VENDOR_BILL&limit=100");
      const raw = Array.isArray(res.data) ? res.data : [];
      const mapped = raw.map((b) => ({
        id: b.id,
        billNumber: b.number,
        partnerId: b.partnerId,
        vendorName: b.partner?.name || "Vendor",
        date: b.invoiceDate ? new Date(b.invoiceDate).toLocaleDateString("en-IN") : "-",
        dueDate: b.dueDate ? new Date(b.dueDate).toLocaleDateString("en-IN") : "-",
        reference: b.reference || "-",
        total: Number(b.grandTotal || 0),
        amountDue: Number(b.amountDue || 0),
        paidAmount: Number(b.paidViaCash || 0) + Number(b.paidViaBank || 0),
        status: b.status === "CONFIRMED" ? "Confirmed" : b.status === "CANCELLED" ? "Cancelled" : "Draft",
        paymentStatus: b.paymentStatus === "PAID" ? "Paid" : b.paymentStatus === "PARTIAL" ? "Partial" : "Not Paid",
        items: (b.lines || []).map((line) => ({
          productName: line.product?.name || "Item",
          quantity: Number(line.quantity || 1),
          unitPrice: Number(line.unitPrice || 0),
          total: Number(line.lineTotal || 0),
        })),
      }));
      setBills(mapped);
    } catch (e) {
      console.error("Failed to load vendor bills:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      await api.post("/payments", {
        type: "SEND",
        method: "BANK",
        contactId: payModal.partnerId,
        journalId: 3,
        amount: String(payModal.amountDue),
        paymentDate: new Date().toISOString().split("T")[0],
        invoiceIds: [payModal.id],
      }).catch((err) => {
        console.warn("Direct payment registration:", err.message);
      });
      await fetchBills();
      setPayModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await api.post("/invoices", {
        documentType: "VENDOR_BILL",
        contactId: 1,
        journalId: 2,
        invoiceDate: new Date().toISOString().split("T")[0],
        reference: newBill.reference || "Vendor Upload",
        lines: [
          {
            description: newBill.reference || "Materials & Supplies",
            quantity: "1",
            unitPrice: String(newBill.amount),
            accountId: 6,
          },
        ],
      }).catch((err) => {
        console.warn("Bill creation via API:", err.message);
      });
      await fetchBills();
      setUploadModal(false);
      setNewBill({ amount: "", reference: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#e7e3da]">
        <div>
          <h2 className="text-2xl font-bold text-[#211D19]">My Bills</h2>
          <p className="text-sm text-[#716B63] mt-1">View bills you have submitted to us.</p>
        </div>
        <button
          onClick={() => setUploadModal(true)}
          className="bg-[#342921] text-white hover:bg-[#231b15] text-sm font-medium px-4 py-2 rounded-lg shadow-sm cursor-pointer transition"
        >
          Upload Bill
        </button>
      </div>

      <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#f0ece4] bg-[#faf8f4] text-[#716B63] font-semibold">
                <th className="py-3.5 px-4">Bill #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4 text-right">Total (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2eb]">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#716B63]">
                    No bills found.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#faf8f4] transition">
                    <td className="py-3.5 px-4 font-semibold text-[#211D19]">{bill.billNumber}</td>
                    <td className="py-3.5 px-4 text-[#38332c]">{bill.date}</td>
                    <td className="py-3.5 px-4 text-[#38332c]">{bill.reference || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#211D19]">
                      {Number(bill.total).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        bill.status === 'Confirmed' ? 'bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]' :
                        bill.status === 'Cancelled' ? 'bg-[#fce8e8] text-[#c62828] border-[#f4c7c7]' :
                        'bg-[#fcf5e8] text-[#7a5933] border-[#ebd8bc]'
                      }`}>
                        {bill.status || 'Draft'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        bill.paymentStatus === 'Paid' ? 'bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]' :
                        bill.paymentStatus === 'Partial' ? 'bg-[#fcf5e8] text-[#7a5933] border-[#ebd8bc]' :
                        'bg-[#fce8e8] text-[#c62828] border-[#f4c7c7]'
                      }`}>
                        {bill.paymentStatus || 'Not Paid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewModal(bill)}
                          className="text-[#342921] hover:text-[#231b15] bg-[#f5f2eb] hover:bg-[#e7e3da] text-xs px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
                        >
                          View
                        </button>
                        {bill.amountDue > 0 ? (
                          <button
                            onClick={() => setPayModal(bill)}
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
              You are paying <strong>₹ {Number(payModal.amountDue).toLocaleString("en-IN")}</strong> for bill {payModal.billNumber}.
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
                <h3 className="text-2xl font-bold text-[#211D19]">Bill {viewModal.billNumber}</h3>
                <p className="text-sm text-[#716B63]">Date: {viewModal.date || viewModal.billDate}</p>
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
                <p className="text-[#716B63]">Vendor:</p>
                <p className="font-medium text-[#211D19]">{viewModal.vendorName || "Vendor (You)"}</p>
              </div>
              <div className="text-right">
                <p className="text-[#716B63]">Reference:</p>
                <p className="font-medium text-[#211D19]">{viewModal.billRef || viewModal.reference || '-'}</p>
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
                  {(viewModal.items || []).length > 0 ? (viewModal.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 text-[#211D19]">{item.productName || item.description}</td>
                      <td className="py-2.5 px-4 text-right text-[#716B63]">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right text-[#716B63]">{Number(item.unitPrice).toLocaleString("en-IN")}</td>
                      <td className="py-2.5 px-4 text-right font-medium text-[#211D19]">{Number(item.total).toLocaleString("en-IN")}</td>
                    </tr>
                  ))) : (
                    <tr>
                      <td colSpan="4" className="py-2.5 px-4 text-center text-[#716B63]">No items detailed. Total Bill Amount: ₹{Number(viewModal.total).toLocaleString("en-IN")}</td>
                    </tr>
                  )}
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

      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#e7e3da] shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-[#211D19] mb-4">Upload New Bill</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  value={newBill.reference}
                  onChange={(e) => setNewBill({ ...newBill, reference: e.target.value })}
                  placeholder="e.g. Supplies March 2026"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#cfc6b6] bg-white text-sm text-[#211D19] outline-none focus:border-[#342921]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#211D19] mb-1">
                  File Upload
                </label>
                <input
                  type="file"
                  className="w-full text-sm text-[#716B63] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f5f2eb] file:text-[#342921] hover:file:bg-[#ebe6dc] cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#716B63] hover:text-[#211D19] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] cursor-pointer"
                >
                  Submit Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBills;
