import { useNavigate } from "react-router-dom";
import { FileText, CreditCard, ArrowRight } from "lucide-react";

function CustomerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#e7e3da]">
        <div>
          <h2 className="text-2xl font-bold text-[#211D19]">Welcome back, Customer</h2>
          <p className="text-sm text-[#716B63] mt-1">Here is a summary of your account activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
        {/* ----------------- 1. ORDERS CARD ----------------- */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_30px_rgba(45,35,27,0.1)] hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-[#f0ece4]">
              <div className="w-10 h-10 rounded-xl bg-[#f5f2eb] text-[#342921] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                <FileText size={19} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition">
                  My Orders
                </h2>
                <span className="text-xs text-[#716B63]">Your recent purchases</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-bold text-[#211D19]">3</p>
              <p className="text-sm text-[#716B63] mt-1">Active orders</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/customer/sales-orders")}
            className="mt-6 pt-3.5 border-t border-[#f0ece4] text-sm font-medium text-[#4a3b2f] hover:text-[#221c16] flex items-center justify-between cursor-pointer w-full transition hover:underline"
          >
            <span>View all orders</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* ----------------- 2. INVOICES CARD ----------------- */}
        <div className="bg-white border border-[#e7e3da] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_30px_rgba(45,35,27,0.1)] hover:-translate-y-1 hover:border-[#cfc6b6] transition-all duration-200 flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-[#f0ece4]">
              <div className="w-10 h-10 rounded-xl bg-[#f5f2eb] text-[#342921] flex items-center justify-center font-medium shadow-xs group-hover:scale-105 transition-transform">
                <CreditCard size={19} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition">
                  My Invoices
                </h2>
                <span className="text-xs text-[#716B63]">Billing & Payments</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-bold text-[#211D19]">₹ 45,000</p>
              <p className="text-sm text-[#716B63] mt-1">Total Outstanding</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/customer/invoices")}
            className="mt-6 pt-3.5 border-t border-[#f0ece4] text-sm font-medium text-[#4a3b2f] hover:text-[#221c16] flex items-center justify-between cursor-pointer w-full transition hover:underline"
          >
            <span>View invoices & pay</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
