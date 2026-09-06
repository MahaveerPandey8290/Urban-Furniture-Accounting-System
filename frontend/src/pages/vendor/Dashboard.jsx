import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CreditCard, ArrowRight } from "lucide-react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import { useAuth } from "../../context/AuthContext";

function VendorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poCount, setPoCount] = useState(0);
  const [pendingPayment, setPendingPayment] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorStats = async () => {
      setLoading(true);
      try {
        const [poRes, billRes] = await Promise.all([
          api.get("/purchase-orders?limit=100").catch(() => ({ data: [] })),
          api.get("/invoices?documentType=VENDOR_BILL&limit=100").catch(() => ({ data: [] })),
        ]);

        const pos = Array.isArray(poRes.data) ? poRes.data : [];
        const bills = Array.isArray(billRes.data) ? billRes.data : [];

        const pendingOrders = pos.filter((p) => p.status !== "CANCELLED" && p.status !== "Cancelled");
        setPoCount(pendingOrders.length);

        const totalPending = bills.reduce((sum, b) => sum + Number(b.amountDue || 0), 0);
        setPendingPayment(totalPending);
      } catch (err) {
        console.error("Failed to load vendor dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorStats();
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#e7e3da]">
        <div>
          <h2 className="text-2xl font-bold text-[#211D19]">
            Welcome back, {user?.contact?.name || user?.name || "Vendor"}
          </h2>
          <p className="text-sm text-[#716B63] mt-1">Here is a summary of your account activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
        {/* ----------------- 1. PO CARD ----------------- */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_30px_rgba(45,35,27,0.1)] hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-[#f0ece4]">
              <div className="w-10 h-10 rounded-xl bg-[#f5f2eb] text-[#342921] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                <FileText size={19} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition">
                  Purchase Orders
                </h2>
                <span className="text-xs text-[#716B63]">Orders from Urban Furniture</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-bold text-[#211D19]">
                {loading ? "..." : poCount}
              </p>
              <p className="text-sm text-[#716B63] mt-1">Pending fulfillment</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/vendor/purchase-orders")}
            className="mt-6 pt-3.5 border-t border-[#f0ece4] text-sm font-medium text-[#4a3b2f] hover:text-[#221c16] flex items-center justify-between cursor-pointer w-full transition hover:underline"
          >
            <span>View purchase orders</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* ----------------- 2. BILLS CARD ----------------- */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_30px_rgba(45,35,27,0.1)] hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-[#f0ece4]">
              <div className="w-10 h-10 rounded-xl bg-[#f5f2eb] text-[#342921] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                <CreditCard size={19} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition">
                  My Bills
                </h2>
                <span className="text-xs text-[#716B63]">Submitted invoices</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-bold text-[#211D19]">
                {loading ? "..." : formatCurrency(pendingPayment)}
              </p>
              <p className="text-sm text-[#716B63] mt-1">Pending payment to you</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/vendor/bills")}
            className="mt-6 pt-3.5 border-t border-[#f0ece4] text-sm font-medium text-[#4a3b2f] hover:text-[#221c16] flex items-center justify-between cursor-pointer w-full transition hover:underline"
          >
            <span>View submitted bills</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VendorDashboard;
