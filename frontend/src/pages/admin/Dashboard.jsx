function Dashboard() {
    return (
      <div className="w-full">
  
        {/* ================= HEADER ================= */}
  
        <div className="mb-8 flex items-center justify-between">
  
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-text">
              Good Morning, Admin
            </h1>
  
            <p className="mt-2 text-sm text-text-light">
              Here's an overview of your accounting system.
            </p>
          </div>
  
          <button className="rounded-lg bg-brown px-5 py-3 text-sm font-medium text-white transition hover:bg-brown-light">
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
              ₹ 4,82,500
            </h2>
  
            <p className="mt-2 text-xs text-[#63795F]">
              ↑ 12.5% from last month
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
              ₹ 2,64,800
            </h2>
  
            <p className="mt-2 text-xs text-[#9A665A]">
              ↑ 8.2% from last month
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
              ₹ 1,28,450
            </h2>
  
            <p className="mt-2 text-xs text-text-light">
              18 invoices pending
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
              ₹ 2,17,700
            </h2>
  
            <p className="mt-2 text-xs text-[#63795F]">
              ↑ 15.4% from last month
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
                  Latest accounting activities
                </p>
              </div>
  
              <button className="text-sm font-medium text-brown hover:underline">
                View all →
              </button>
  
            </div>
  
  
            <div className="divide-y divide-border">
  
              {/* Transaction 1 */}
  
              <div className="flex items-center gap-4 py-4">
  
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige font-semibold text-brown">
                  S
                </div>
  
                <div className="min-w-0 flex-1">
  
                  <p className="truncate text-sm font-medium text-text">
                    Sales Invoice #INV-1024
                  </p>
  
                  <p className="mt-1 text-xs text-text-light">
                    Today, 10:42 AM
                  </p>
  
                </div>
  
                <span className="text-sm font-semibold text-[#63795F]">
                  + ₹24,500
                </span>
  
              </div>
  
  
              {/* Transaction 2 */}
  
              <div className="flex items-center gap-4 py-4">
  
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige font-semibold text-brown">
                  P
                </div>
  
                <div className="min-w-0 flex-1">
  
                  <p className="truncate text-sm font-medium text-text">
                    Purchase Bill #BILL-845
                  </p>
  
                  <p className="mt-1 text-xs text-text-light">
                    Today, 09:15 AM
                  </p>
  
                </div>
  
                <span className="text-sm font-semibold text-[#9A665A]">
                  - ₹18,200
                </span>
  
              </div>
  
  
              {/* Transaction 3 */}
  
              <div className="flex items-center gap-4 py-4">
  
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige font-semibold text-brown">
                  ₹
                </div>
  
                <div className="min-w-0 flex-1">
  
                  <p className="truncate text-sm font-medium text-text">
                    Payment Received
                  </p>
  
                  <p className="mt-1 text-xs text-text-light">
                    Yesterday, 04:32 PM
                  </p>
  
                </div>
  
                <span className="text-sm font-semibold text-[#63795F]">
                  + ₹12,000
                </span>
  
              </div>
  
  
              {/* Transaction 4 */}
  
              <div className="flex items-center gap-4 py-4">
  
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige font-semibold text-brown">
                  P
                </div>
  
                <div className="min-w-0 flex-1">
  
                  <p className="truncate text-sm font-medium text-text">
                    Purchase Order #PO-452
                  </p>
  
                  <p className="mt-1 text-xs text-text-light">
                    Yesterday, 02:18 PM
                  </p>
  
                </div>
  
                <span className="text-sm font-semibold text-[#9A665A]">
                  - ₹32,500
                </span>
  
              </div>
  
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