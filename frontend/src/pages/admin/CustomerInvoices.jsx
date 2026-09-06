import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Calendar,
  ChevronDown,
  Eye,
  FileText,
  Plus,
  Search,
  Wallet,
  X,
} from "lucide-react";
import api from "../../services/api";

const bankAccounts = [
  "HDFC Bank A/c",
  "SBI Bank A/c",
  "ICICI Bank A/c",
];

function CustomerInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customersList, setCustomersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [taxesList, setTaxesList] = useState([]);
  const [accountsList, setAccountsList] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedBank, setSelectedBank] = useState("");
  const [error, setError] = useState("");

  const fetchInvoicesData = async () => {
    setLoading(true);
    try {
      const [invRes, cRes, pRes, tRes, aRes] = await Promise.all([
        api.get("/invoices?type=CUSTOMER_INVOICE"),
        api.get("/contacts?type=CUSTOMER&limit=100").catch(() => ({ data: { items: [] } })),
        api.get("/products?limit=100").catch(() => ({ data: { items: [] } })),
        api.get("/taxes").catch(() => ({ data: { items: [] } })),
        api.get("/accounts").catch(() => ({ data: { items: [] } })),
      ]);

      // invoices returns a direct array; contacts/products/taxes/accounts return { items: [] }
      const mapped = (Array.isArray(invRes.data) ? invRes.data : []).map((inv) => ({
        id: inv.id,
        invoiceNo: inv.number,
        customer: inv.partner?.name || "Customer",
        partnerId: inv.partnerId,
        invoiceDate: new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        dueDate: new Date(inv.dueDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        salesOrder: inv.sourceOrderId ? `SO-${inv.sourceOrderId}` : "-",
        reference: inv.reference || "-",
        status: inv.paymentStatus === "PAID" ? "Paid" : inv.paymentStatus === "PARTIAL" ? "Partial" : "Not Paid",
        rawStatus: inv.status,
        total: Number(inv.grandTotal) || 0,
        paid: (Number(inv.paidViaCash) || 0) + (Number(inv.paidViaBank) || 0),
        paymentMethod: Number(inv.paidViaBank) > 0 ? "Bank" : "Cash",
        bankAccount: "",
        items: (inv.lines || []).map((l) => ({
          product: l.product?.name || "Product",
          account: l.account?.name || "Sales Income A/c",
          quantity: Number(l.quantity) || 1,
          unitPrice: Number(l.unitPrice) || 0,
          total: Number(l.lineTotal) || 0,
        })),
      }));

      setInvoices(mapped);
      setCustomersList(cRes.data.items || []);
      setProductsList(pRes.data.items || []);
      setTaxesList(tRes.data.items || []);
      setAccountsList(aRes.data.items || []);
    } catch {
      // Error toasted by api.js interceptor
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchInvoicesData();
  }, []);

  const customers = useMemo(() => {
    return [...new Set(invoices.map((invoice) => invoice.customer))];
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (invoice.invoiceNo || "").toLowerCase().includes(searchText) ||
        (invoice.customer || "").toLowerCase().includes(searchText) ||
        (invoice.salesOrder || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || invoice.status === statusFilter;

      const matchesCustomer =
        customerFilter === "All" ||
        invoice.customer === customerFilter;

      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [invoices, search, statusFilter, customerFilter]);

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const getDueAmount = (invoice) => {
    return Math.max(invoice.total - invoice.paid, 0);
  };

  const getStatusClass = (status) => {
    if (status === "Paid") {
      return "status-paid";
    }

    if (status === "Partial") {
      return "status-partial";
    }

    return "status-unpaid";
  };

  const handleConfirmInvoice = async (invoiceId) => {
    try {
      await api.patch(`/invoices/${invoiceId}/confirm`);
      await fetchInvoicesData();
      if (selectedInvoice) {
        setSelectedInvoice((prev) => ({ ...prev, rawStatus: "CONFIRMED" }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm invoice.");
    }
  };

  const openInvoice = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const closeInvoice = () => {
    setSelectedInvoice(null);
  };

  const openPayment = (invoice) => {
    setSelectedInvoice(invoice);

    const due = getDueAmount(invoice);

    setPaymentAmount(due.toString());
    setPaymentMethod("Cash");
    setSelectedBank("");

    setShowPayment(true);
  };

  const closePayment = () => {
    setShowPayment(false);
    setPaymentAmount("");
    setPaymentMethod("Cash");
    setSelectedBank("");
  };

  const handlePayment = async () => {
    if (!selectedInvoice) return;

    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const due = getDueAmount(selectedInvoice);

    if (amount > due) {
      alert(`Maximum amount you can receive is ${formatCurrency(due)}.`);
      return;
    }

    if (paymentMethod === "Bank" && !selectedBank) {
      alert("Please select a bank account.");
      return;
    }

    try {
      // Find cash or bank journal
      const jourRes = await api.get("/journals").catch(() => ({ data: { items: [] } }));
      const jList = jourRes.data?.items || [];
      const targetJournal = jList.find((j) => j.type === (paymentMethod === "Bank" ? "BANK" : "CASH")) || jList[0];

      const pRes = await api.post("/payments", {
        paymentType: "RECEIVE",
        partnerId: Number(selectedInvoice.partnerId),
        invoiceId: Number(selectedInvoice.id),
        paymentDate: new Date().toISOString(),
        amount: Number(amount),
        paymentMethod: paymentMethod === "Bank" ? "BANK" : "CASH",
        journalId: targetJournal?.id || 1,
        note: `Payment for invoice ${selectedInvoice.invoiceNo}`,
      });

      const paymentId = pRes.data?.id;
      if (paymentId) {
        await api.patch(`/payments/${paymentId}/confirm`, {}, {
          headers: {
            "Idempotency-Key": `cust-inv-pay-${paymentId}-${Date.now()}`,
          },
        });
      }

      await fetchInvoicesData();
      closePayment();
      closeInvoice();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process payment.");
    }
  };

  return (
    <div className="customer-invoices-page">
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Transactions</span>
            <span>/</span>
            <strong>Customer Invoices</strong>
          </div>

          <h1>Customer Invoices</h1>

          <p>
            Manage customer invoices and receive payments through Cash or Bank.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowNewInvoice(true)}
        >
          <Plus size={18} />
          New Invoice
        </button>
      </div>

      {/* FILTER BAR */}

      <div className="filter-card">
        <div className="search-box">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search invoice, customer or sales order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="select-box">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Not Paid">Not Paid</option>
          </select>

          <ChevronDown size={17} />
        </div>

        <div className="select-box">
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="All">All Customers</option>

            {customers.map((customer) => (
              <option key={customer} value={customer}>
                {customer}
              </option>
            ))}
          </select>

          <ChevronDown size={17} />
        </div>

        <button
          className="back-button"
          onClick={() => {
            setSearch("");
            setStatusFilter("All");
            setCustomerFilter("All");
          }}
        >
          Clear
        </button>
      </div>

      {/* INVOICE TABLE */}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>INVOICE NO.</th>
              <th>CUSTOMER</th>
              <th>INVOICE DATE</th>
              <th>DUE DATE</th>
              <th>SALES ORDER</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DUE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-state">
                  No customer invoices found.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <div className="invoice-number">
                      <FileText size={17} />
                      <strong>{invoice.invoiceNo}</strong>
                    </div>
                  </td>

                  <td>{invoice.customer}</td>

                  <td>{invoice.invoiceDate}</td>

                  <td>{invoice.dueDate}</td>

                  <td>{invoice.salesOrder}</td>

                  <td className="amount">
                    {formatCurrency(invoice.total)}
                  </td>

                  <td className="paid-amount">
                    {formatCurrency(invoice.paid)}
                  </td>

                  <td className="due-amount">
                    {formatCurrency(getDueAmount(invoice))}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${getStatusClass(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button"
                        title="View Invoice"
                        onClick={() => openInvoice(invoice)}
                      >
                        <Eye size={17} />
                      </button>

                      {getDueAmount(invoice) > 0 && (
                        <button
                          className="pay-button"
                          onClick={() => openPayment(invoice)}
                        >
                          <Wallet size={16} />
                          Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* INVOICE DETAILS MODAL */}

      {selectedInvoice && !showPayment && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <div>
                <div className="small-label">CUSTOMER INVOICE</div>

                <h2>{selectedInvoice.invoiceNo}</h2>
              </div>

              <button
                className="close-button"
                onClick={closeInvoice}
              >
                <X size={20} />
              </button>
            </div>

            {/* CUSTOMER INFORMATION */}

            <div className="invoice-info-grid">
              <div>
                <span>Customer</span>
                <strong>{selectedInvoice.customer}</strong>
              </div>

              <div>
                <span>Invoice Date</span>
                <strong>{selectedInvoice.invoiceDate}</strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>{selectedInvoice.dueDate}</strong>
              </div>

              <div>
                <span>Sales Order</span>
                <strong>{selectedInvoice.salesOrder}</strong>
              </div>

              <div>
                <span>Invoice Reference</span>
                <strong>{selectedInvoice.reference}</strong>
              </div>

              <div>
                <span>Status</span>

                <span
                  className={`status-badge ${getStatusClass(
                    selectedInvoice.status
                  )}`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            {/* PRODUCT TABLE */}

            <div className="section-title">
              Invoice Items
            </div>

            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>CHART OF ACCOUNT</th>
                    <th>QTY</th>
                    <th>UNIT PRICE</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product}</td>

                      <td>{item.account}</td>

                      <td>{item.quantity}</td>

                      <td>{formatCurrency(item.unitPrice)}</td>

                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAYMENT SUMMARY */}

            <div className="payment-summary">
              <div>
                <span>Total Invoice Amount</span>
                <strong>
                  {formatCurrency(selectedInvoice.total)}
                </strong>
              </div>

              <div>
                <span>Total Received</span>
                <strong className="green-text">
                  {formatCurrency(selectedInvoice.paid)}
                </strong>
              </div>

              <div>
                <span>Amount Due</span>
                <strong className="red-text">
                  {formatCurrency(getDueAmount(selectedInvoice))}
                </strong>
              </div>
            </div>

            {/* PAYMENT DETAILS */}

            {selectedInvoice.paid > 0 && (
              <div className="payment-details">
                <div className="section-title">
                  Payment Details
                </div>

                <div className="payment-detail-row">
                  <span>Payment Method</span>

                  <strong>
                    {selectedInvoice.paymentMethod || "N/A"}
                  </strong>
                </div>

                {selectedInvoice.paymentMethod === "Bank" && (
                  <div className="payment-detail-row">
                    <span>Bank Account</span>

                    <strong>
                      {selectedInvoice.bankAccount}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* MODAL FOOTER */}

            <div className="modal-footer">
              <button
                className="back-button"
                onClick={closeInvoice}
              >
                <ArrowLeft size={17} />
                Back
              </button>

              {selectedInvoice.rawStatus === "DRAFT" && (
                <button
                  className="primary-button"
                  style={{ backgroundColor: "#1e5e3a" }}
                  onClick={() => handleConfirmInvoice(selectedInvoice.id)}
                >
                  <FileText size={17} />
                  Confirm Invoice
                </button>
              )}

              {getDueAmount(selectedInvoice) > 0 && selectedInvoice.rawStatus !== "DRAFT" && (
                <button
                  className="primary-button"
                  onClick={() => openPayment(selectedInvoice)}
                >
                  <Wallet size={17} />
                  Receive Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}

      {showPayment && selectedInvoice && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <div>
                <div className="small-label">
                  RECEIVE PAYMENT
                </div>

                <h2>{selectedInvoice.invoiceNo}</h2>
              </div>

              <button
                className="close-button"
                onClick={closePayment}
              >
                <X size={20} />
              </button>
            </div>

            <div className="payment-customer">
              <span>Customer</span>

              <strong>{selectedInvoice.customer}</strong>
            </div>

            <div className="payment-amount-grid">
              <div>
                <span>Invoice Total</span>

                <strong>
                  {formatCurrency(selectedInvoice.total)}
                </strong>
              </div>

              <div>
                <span>Already Paid</span>

                <strong className="green-text">
                  {formatCurrency(selectedInvoice.paid)}
                </strong>
              </div>

              <div>
                <span>Amount Due</span>

                <strong className="red-text">
                  {formatCurrency(getDueAmount(selectedInvoice))}
                </strong>
              </div>
            </div>

            <div className="form-group">
              <label>Amount Received</label>

              <div className="amount-input">
                <span>₹</span>

                <input
                  type="number"
                  min="1"
                  max={getDueAmount(selectedInvoice)}
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(e.target.value)
                  }
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method</label>

              <div className="payment-methods">
                <button
                  type="button"
                  className={
                    paymentMethod === "Cash"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() => {
                    setPaymentMethod("Cash");
                    setSelectedBank("");
                  }}
                >
                  <Banknote size={21} />

                  <div>
                    <strong>Cash</strong>
                    <span>Received in Cash A/c</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "Bank"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() => setPaymentMethod("Bank")}
                >
                  <Wallet size={21} />

                  <div>
                    <strong>Bank</strong>
                    <span>Received in Bank A/c</span>
                  </div>
                </button>
              </div>
            </div>

            {paymentMethod === "Bank" && (
              <div className="form-group">
                <label>Bank Account</label>

                <div className="select-box full-width">
                  <select
                    value={selectedBank}
                    onChange={(e) =>
                      setSelectedBank(e.target.value)
                    }
                  >
                    <option value="">
                      Select Bank Account
                    </option>

                    {bankAccounts.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={17} />
                </div>
              </div>
            )}

            <div className="payment-note">
              <strong>Accounting Entry</strong>

              <p>
                {paymentMethod === "Cash"
                  ? "Cash A/c will be debited and Customer/Debtor A/c will be credited."
                  : "Selected Bank A/c will be debited and Customer/Debtor A/c will be credited."}
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="back-button"
                onClick={closePayment}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handlePayment}
              >
                Receive Payment
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW INVOICE MODAL */}

      {showNewInvoice && (
        <div className="modal-overlay">
          <div className="new-invoice-modal">
            <div className="modal-header">
              <div>
                <div className="small-label">
                  CUSTOMER INVOICE
                </div>

                <h2>New Customer Invoice</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowNewInvoice(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="new-invoice-content">
              <div className="form-group">
                <label>Generate Invoice From</label>

                <div className="source-card">
                  <FileText size={24} />

                  <div>
                    <strong>Sales Order</strong>

                    <span>
                      Generate customer invoice from a
                      confirmed Sales Order.
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Select Sales Order</label>

                <div className="select-box full-width">
                  <select>
                    <option value="">
                      Select Sales Order
                    </option>

                    <option>SO/2026/015 - Mr. Rahul</option>
                    <option>SO/2026/014 - ABC Furniture Ltd.</option>
                    <option>SO/2026/013 - XYZ Interiors</option>
                  </select>

                  <ChevronDown size={17} />
                </div>
              </div>

              <div className="new-invoice-info">
                <strong>Invoice flow</strong>

                <p>
                  Confirmed Sales Order → Customer Invoice →
                  Receive Payment → Cash / Bank → Journal Entry
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="back-button"
                onClick={() => setShowNewInvoice(false)}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  alert(
                    "Invoice generation from Sales Order will be connected to your Sales Order data/API."
                  );
                }}
              >
                Generate Invoice
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGE CSS */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .customer-invoices-page {
          min-height: 100vh;
          background: #f7f5f1;
          padding: 32px;
          color: #171717;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          border-bottom: 1px solid #ded8cf;
          padding-bottom: 26px;
          margin-bottom: 30px;
        }

        .breadcrumb {
          display: flex;
          gap: 9px;
          color: #766e65;
          font-size: 15px;
          margin-bottom: 10px;
        }

        .breadcrumb strong {
          color: #171717;
          font-weight: 500;
        }

        .page-header h1 {
          font-size: 34px;
          margin: 0;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .page-header p {
          color: #766e65;
          margin: 8px 0 0;
          font-size: 15px;
        }

        button {
          font-family: inherit;
          cursor: pointer;
        }

        .primary-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #352820;
          color: white;
          border: none;
          border-radius: 9px;
          padding: 13px 19px;
          font-size: 15px;
          font-weight: 500;
          transition: 0.2s;
        }

        .primary-button:hover {
          background: #241a15;
        }

        .filter-card {
          background: white;
          border: 1px solid #e3ddd4;
          border-radius: 18px;
          padding: 18px;
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 28px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          height: 48px;
          border: 1px solid #d8d0c6;
          border-radius: 9px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          gap: 10px;
          color: #786f66;
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 15px;
          color: #222;
        }

        .search-box input::placeholder {
          color: #9b938a;
        }

        .select-box {
          height: 48px;
          min-width: 175px;
          border: 1px solid #d8d0c6;
          border-radius: 9px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          position: relative;
          background: white;
        }

        .select-box select {
          appearance: none;
          border: none;
          outline: none;
          width: 100%;
          height: 100%;
          background: transparent;
          font-size: 14px;
          padding-right: 25px;
          color: #292522;
          cursor: pointer;
        }

        .select-box svg {
          position: absolute;
          right: 12px;
          pointer-events: none;
        }

        .full-width {
          width: 100%;
        }

        .back-button {
          height: 48px;
          border: 1px solid #ddd5cb;
          background: white;
          border-radius: 9px;
          padding: 0 18px;
          color: #514a44;
          font-size: 14px;
        }

        .back-button:hover {
          background: #f7f4ef;
        }

        .table-card {
          background: white;
          border: 1px solid #e2dbd2;
          border-radius: 18px;
          overflow-x: auto;
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #faf8f5;
          color: #6e655c;
          font-size: 13px;
          letter-spacing: 0.5px;
          font-weight: 600;
          text-align: left;
          padding: 18px 15px;
          border-bottom: 1px solid #e7e0d8;
          white-space: nowrap;
        }

        td {
          padding: 18px 15px;
          border-bottom: 1px solid #eee9e3;
          font-size: 14px;
          white-space: nowrap;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr:hover {
          background: #fcfbf9;
        }

        .invoice-number {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #352820;
        }

        .amount {
          font-weight: 600;
        }

        .paid-amount {
          color: #2e7154;
          font-weight: 500;
        }

        .due-amount {
          color: #b54b3d;
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 11px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-paid {
          background: #e7f2e9;
          color: #327044;
          border: 1px solid #cfe2d2;
        }

        .status-partial {
          background: #fff3df;
          color: #9a671e;
          border: 1px solid #f0d8aa;
        }

        .status-unpaid {
          background: #fcebea;
          color: #a4453c;
          border: 1px solid #f0cdca;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .icon-button {
          width: 36px;
          height: 36px;
          border: 1px solid #ded6cd;
          border-radius: 8px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #514941;
        }

        .icon-button:hover {
          background: #f5f1eb;
        }

        .pay-button {
          height: 36px;
          padding: 0 11px;
          border: none;
          border-radius: 8px;
          background: #352820;
          color: white;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
        }

        .empty-state {
          text-align: center;
          padding: 60px !important;
          color: #8b8279;
        }

        /* MODAL */

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(24, 19, 15, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 25px;
          z-index: 1000;
        }

        .details-modal,
        .payment-modal,
        .new-invoice-modal {
          width: min(1050px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          background: #f8f6f2;
          border-radius: 18px;
          border: 1px solid #ded7ce;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .payment-modal {
          width: min(620px, 100%);
        }

        .new-invoice-modal {
          width: min(650px, 100%);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 25px 28px;
          border-bottom: 1px solid #dfd8cf;
          background: white;
        }

        .small-label {
          font-size: 12px;
          color: #8a8178;
          letter-spacing: 1px;
          font-weight: 600;
          margin-bottom: 7px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 25px;
        }

        .close-button {
          width: 38px;
          height: 38px;
          border: 1px solid #ded6cc;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .invoice-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          margin: 22px 28px;
          border: 1px solid #ded7ce;
          border-radius: 12px;
          overflow: hidden;
          background: #ded7ce;
        }

        .invoice-info-grid > div {
          background: white;
          padding: 17px;
          min-height: 80px;
        }

        .invoice-info-grid span:first-child,
        .payment-amount-grid span,
        .payment-customer span {
          display: block;
          color: #80766d;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .invoice-info-grid strong {
          font-size: 15px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin: 25px 28px 12px;
        }

        .items-table {
          margin: 0 28px;
          border: 1px solid #ded7ce;
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }

        .items-table th {
          padding: 14px;
        }

        .items-table td {
          padding: 14px;
        }

        .payment-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin: 22px 28px;
        }

        .payment-summary > div {
          background: white;
          border: 1px solid #e0d9d0;
          border-radius: 12px;
          padding: 18px;
        }

        .payment-summary span {
          display: block;
          color: #80776e;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .payment-summary strong {
          font-size: 20px;
        }

        .green-text {
          color: #36724e !important;
        }

        .red-text {
          color: #b04a40 !important;
        }

        .payment-details {
          background: white;
          border: 1px solid #e0d9d0;
          border-radius: 12px;
          margin: 0 28px 20px;
          padding: 2px 20px 15px;
        }

        .payment-details .section-title {
          margin-left: 0;
          margin-right: 0;
        }

        .payment-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 11px 0;
          border-top: 1px solid #eee8e0;
          font-size: 14px;
        }

        .payment-detail-row span {
          color: #81786f;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px 28px;
          border-top: 1px solid #ded7ce;
          background: white;
        }

        /* PAYMENT */

        .payment-customer {
          margin: 22px 28px 0;
          background: white;
          border: 1px solid #ded7ce;
          border-radius: 12px;
          padding: 18px;
        }

        .payment-customer strong {
          font-size: 17px;
        }

        .payment-amount-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 15px 28px 22px;
        }

        .payment-amount-grid > div {
          background: white;
          border: 1px solid #ded7ce;
          border-radius: 10px;
          padding: 15px;
        }

        .payment-amount-grid strong {
          font-size: 17px;
        }

        .form-group {
          margin: 0 28px 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 9px;
        }

        .amount-input {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #d7cfc6;
          border-radius: 9px;
          height: 48px;
          padding: 0 14px;
        }

        .amount-input span {
          font-size: 17px;
          font-weight: 600;
          margin-right: 8px;
        }

        .amount-input input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 16px;
        }

        .payment-methods {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 13px;
          text-align: left;
          padding: 15px;
          border: 1px solid #d9d1c8;
          background: white;
          border-radius: 10px;
          color: #403831;
        }

        .payment-method.active {
          border: 2px solid #352820;
          background: #faf7f2;
        }

        .payment-method strong {
          display: block;
          margin-bottom: 4px;
        }

        .payment-method span {
          display: block;
          font-size: 12px;
          color: #827970;
        }

        .payment-note {
          margin: 0 28px 22px;
          background: #f0ece5;
          border: 1px solid #ddd5cb;
          border-radius: 10px;
          padding: 14px 16px;
        }

        .payment-note strong {
          font-size: 13px;
        }

        .payment-note p {
          margin: 6px 0 0;
          color: #6d655e;
          font-size: 13px;
          line-height: 1.5;
        }

        /* NEW INVOICE */

        .new-invoice-content {
          padding: 25px 0 5px;
        }

        .source-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: white;
          border: 1px solid #ded7ce;
          border-radius: 11px;
          padding: 17px;
        }

        .source-card strong {
          display: block;
          margin-bottom: 5px;
        }

        .source-card span {
          color: #81786f;
          font-size: 13px;
        }

        .new-invoice-info {
          margin: 5px 28px 20px;
          padding: 15px;
          background: #f0ece5;
          border: 1px solid #ddd5cb;
          border-radius: 10px;
        }

        .new-invoice-info strong {
          font-size: 13px;
        }

        .new-invoice-info p {
          margin: 7px 0 0;
          color: #706860;
          font-size: 13px;
          line-height: 1.5;
        }

        @media (max-width: 1000px) {
          .customer-invoices-page {
            padding: 20px;
          }

          .page-header {
            align-items: flex-start;
            gap: 20px;
          }

          .filter-card {
            flex-wrap: wrap;
          }

          .search-box {
            width: 100%;
            flex-basis: 100%;
          }

          .invoice-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .customer-invoices-page {
            padding: 14px;
          }

          .page-header {
            flex-direction: column;
          }

          .filter-card {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box,
          .select-box {
            min-width: 100%;
          }

          .invoice-info-grid,
          .payment-summary,
          .payment-amount-grid,
          .payment-methods {
            grid-template-columns: 1fr;
          }

          .invoice-info-grid,
          .items-table,
          .payment-summary {
            margin-left: 15px;
            margin-right: 15px;
          }

          .form-group,
          .payment-customer,
          .payment-note {
            margin-left: 15px;
            margin-right: 15px;
          }

          .modal-header,
          .modal-footer {
            padding-left: 15px;
            padding-right: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default CustomerInvoices;