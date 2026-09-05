import { useState, useEffect } from "react";
import { getSalesOrders } from "../invoicing_user/sales/salesService";

function MySalesOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    try {
      const allOrders = getSalesOrders();
      // In a real app, we filter by the logged-in customer's ID.
      // For mock purposes, we will just show orders that have "customer" in name or show all if none.
      setOrders(allOrders);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#e7e3da]">
        <div>
          <h2 className="text-2xl font-bold text-[#211D19]">My Sales Orders</h2>
          <p className="text-sm text-[#716B63] mt-1">View your order history.</p>
        </div>
      </div>

      <div className="bg-white border border-[#e7e3da] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#f0ece4] bg-[#faf8f4] text-[#716B63] font-semibold">
                <th className="py-3.5 px-4">SO Number</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Total (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f2eb]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-[#716B63]">
                    No sales orders found.
                  </td>
                </tr>
              ) : (
                orders.map((so) => (
                  <tr key={so.id} className="hover:bg-[#faf8f4] transition">
                    <td className="py-3.5 px-4 font-semibold text-[#211D19]">{so.soNumber}</td>
                    <td className="py-3.5 px-4 text-[#38332c]">{so.date}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#211D19]">
                      {Number(so.total).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        so.status === 'Confirmed' ? 'bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]' :
                        so.status === 'Invoiced' ? 'bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]' :
                        so.status === 'Cancelled' ? 'bg-[#fce8e8] text-[#c62828] border-[#f4c7c7]' :
                        'bg-[#fcf5e8] text-[#7a5933] border-[#ebd8bc]'
                      }`}>
                        {so.status || 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MySalesOrders;
