import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalPurchases: 0,
    outstandingInvoices: 0,
    netProfit: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [plRes, invRes, poRes] = await Promise.all([
          api.get("/reports/profit-loss").catch(() => ({ data: {} })),
          api.get("/invoices?limit=10").catch(() => ({ data: [] })),
          api.get("/purchase-orders?limit=10").catch(() => ({ data: [] })),
        ]);

        // P&L returns { totalIncome, totalExpense, netProfit } directly
        const pl = plRes.data || {};
        // Invoices and POs return direct arrays
        const invoices = Array.isArray(invRes.data) ? invRes.data : [];
        const purchaseOrders = Array.isArray(poRes.data) ? poRes.data : [];

        const totalSales = Number(pl.totalIncome || 0);
        const totalPurchases = purchaseOrders.reduce(
          (sum, po) => sum + Number(po.grandTotal || 0),
          0
        );

        const outstanding = invoices
          .filter((inv) => inv.paymentStatus !== "PAID")
          .reduce((sum, inv) => sum + Number(inv.amountDue || inv.grandTotal || 0), 0);

        const netProfit = Number(pl.netProfit || 0);

        setMetrics({
          totalSales,
          totalPurchases,
          outstandingInvoices: outstanding,
          netProfit,
        });

        // Map recent transactions
        const txList = invoices.slice(0, 5).map((inv) => ({
          id: inv.id,
          title: `${inv.documentType === "VENDOR_BILL" ? "Purchase Bill" : "Sales Invoice"} #${inv.number}`,
          time: new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          amount: Number(inv.grandTotal || 0),
          isPositive: inv.documentType !== "VENDOR_BILL",
          letter: inv.documentType === "VENDOR_BILL" ? "P" : "S",
        }));

        setRecentTransactions(txList);
      } catch {
        // Silently fail — dashboard shows zeros for missing data
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  const formatCurrency = (val) => `₹ ${Number(val).toLocaleString("en-IN")}`;

  return (
    <div className="w-full">

      {/* ================= HEADER ================= */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text">
            Good Morning, {user?.name || "Admin"}
          </h1>

          <p className="mt-2 text-sm text-text-light">
            Here's an overview of your live accounting system from PostgreSQL.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/invoices")}
          className="rounded-lg bg-brown px-5 py-3 text-sm font-medium text-white transition hover:bg-brown-light cursor-pointer"
        >
          + New Transaction
        </button>

      </div>


      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {/* Sales */}

        <div className="rounded-xl border border-border bg-card p-6">

          <div className="flex items-center justify-between">

            <span className="text-sm text-text-light">
              Total Sales
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-beige text-brown">
              ↗
            </div>

          </div>

          <h2 className="mt-5 text-2xl font-semibold text-text">
            {formatCurrency(metrics.totalSales)}
          </h2>

          <p className="mt-2 text-xs text-[#63795F]">
            From active general ledger
          </p>

        </div>


        {/* Purchases */}

        <div className="rounded-xl border border-border bg-card p-6">

          <div className="flex items-center justify-between">

            <span className="text-sm text-text-light">
              Total Purchases
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-beige text-brown">
              ↙
            </div>

          </div>

          <h2 className="mt-5 text-2xl font-semibold text-text">
            {formatCurrency(metrics.totalPurchases)}
          </h2>

          <p className="mt-2 text-xs text-[#9A665A]">
            From purchase orders
          </p>

        </div>


        {/* Outstanding */}

        <div className="rounded-xl border border-border bg-card p-6">

          <div className="flex items-center justify-between">

            <span className="text-sm text-text-light">
              Outstanding Invoices
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-beige text-brown">
              ▤
            </div>

          </div>

          <h2 className="mt-5 text-2xl font-semibold text-text">
            {formatCurrency(metrics.outstandingInvoices)}
          </h2>

          <p className="mt-2 text-xs text-text-light">
            Pending receivable / payable
          </p>

        </div>


        {/* Profit */}

        <div className="rounded-xl border border-border bg-card p-6">

          <div className="flex items-center justify-between">

            <span className="text-sm text-text-light">
              Net Profit
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-beige text-brown">
              ◆
            </div>

          </div>

          <h2 className="mt-5 text-2xl font-semibold text-text">
            {formatCurrency(metrics.netProfit)}
          </h2>

          <p className="mt-2 text-xs text-[#63795F]">
            Net operating profit
          </p>

        </div>

      </div>


      {/* ================= CONTENT ================= */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">


        {/* Recent Transactions */}

        <div className="rounded-xl border border-border bg-card p-6">

          <div className="mb-5 flex items-start justify-between">

            <div>
              <h3 className="text-lg font-semibold text-text">
                Recent Transactions
              </h3>

              <p className="mt-1 text-xs text-text-light">
                Latest live activities from database
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/invoices")}
              className="text-sm font-medium text-brown hover:underline cursor-pointer"
            >
              View all →
            </button>

          </div>


          <div className="divide-y divide-border">

            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-light">
                No recent transactions recorded yet.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 py-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige font-semibold text-brown">
                    {tx.letter}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium text-text">
                      {tx.title}
                    </p>

                    <p className="mt-1 text-xs text-text-light">
                      {tx.time}
                    </p>

                  </div>

                  <span
                    className={`text-sm font-semibold ${
                      tx.isPositive ? "text-[#63795F]" : "text-[#9A665A]"
                    }`}
                  >
                    {tx.isPositive ? "+" : "-"} {formatCurrency(tx.amount)}
                  </span>

                </div>
              ))
            )}

          </div>

        </div>
  
  
          {/* Quick Actions */}
  
          <div className="rounded-xl border border-border bg-card p-6">
  
            <div className="mb-5">
  
              <h3 className="text-lg font-semibold text-text">
                Quick Actions
              </h3>
  
              <p className="mt-1 text-xs text-text-light">
                Frequently used actions
              </p>
  
            </div>
  
  
            <div className="flex flex-col gap-3">
  
              <button className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition hover:bg-beige">
  
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige text-lg text-brown">
                  +
                </div>
  
                <div>
                  <p className="text-sm font-medium text-text">
                    Create Invoice
                  </p>
  
                  <p className="mt-1 text-xs text-text-light">
                    Create a new customer invoice
                  </p>
                </div>
  
              </button>
  
  
              <button className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition hover:bg-beige">
  
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige text-lg text-brown">
                  +
                </div>
  
                <div>
                  <p className="text-sm font-medium text-text">
                    Create Purchase
                  </p>
  
                  <p className="mt-1 text-xs text-text-light">
                    Record a new purchase
                  </p>
                </div>
  
              </button>
  
  
              <button className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition hover:bg-beige">
  
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige text-lg text-brown">
                  ₹
                </div>
  
                <div>
                  <p className="text-sm font-medium text-text">
                    Record Payment
                  </p>
  
                  <p className="mt-1 text-xs text-text-light">
                    Record received or paid amount
                  </p>
                </div>
  
              </button>
  
  
              <button className="flex items-center gap-4 rounded-lg border border-border p-4 text-left transition hover:bg-beige">
  
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige text-lg text-brown">
                  ▥
                </div>
  
                <div>
                  <p className="text-sm font-medium text-text">
                    View Reports
                  </p>
  
                  <p className="mt-1 text-xs text-text-light">
                    Check financial reports
                  </p>
                </div>
  
              </button>
  
            </div>
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  export default Dashboard;