import { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  Eye,
  X,
  Wallet,
  Landmark,
  FileText,
  User,
  CalendarDays,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import api from "../../services/api";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [journals, setJournals] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [accountFilter, setAccountFilter] = useState("All");
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [error, setError] = useState("");

  const emptyForm = {
    type: "Received", // "Received" or "Paid"
    party: "",
    partnerId: "",
    documentType: "Invoice", // "Invoice" or "Bill"
    documentNo: "",
    invoiceId: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    account: "Cash",
    paymentMethod: "Cash",
    reference: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, invRes, jRes] = await Promise.all([
        api.get("/payments"),
        api.get("/invoices").catch(() => ({ data: [] })),
        api.get("/journals").catch(() => ({ data: { items: [] } })),
      ]);

      // payments and invoices return direct arrays; journals return { items: [] }
      const mapped = (Array.isArray(payRes.data) ? payRes.data : []).map((p) => ({
        id: p.id,
        paymentNo: p.number,
        date: new Date(p.paymentDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        type: p.paymentType === "RECEIVE" ? "Received" : "Paid",
        partyType: p.paymentType === "RECEIVE" ? "Customer" : "Vendor",
        party: p.partner?.name || "Partner",
        documentType: p.paymentType === "RECEIVE" ? "Invoice" : "Bill",
        documentNo: p.invoice?.number || `INV-${p.invoiceId}`,
        amount: Number(p.amount) || 0,
        account: p.paymentMethod === "BANK" ? "Bank" : "Cash",
        paymentMethod: p.paymentMethod,
        reference: p.idempotencyKey || "-",
        notes: p.note || "-",
        status: p.status === "CONFIRMED" ? "Completed" : p.status,
        rawStatus: p.status,
        invoiceId: p.invoiceId,
      }));

      setPayments(mapped);
      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
      setJournals(jRes.data.items || []);
    } catch {
      // Error toasted by api.js interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const searchText = search.toLowerCase();
      const matchesSearch =
        (payment.paymentNo || "").toLowerCase().includes(searchText) ||
        (payment.party || "").toLowerCase().includes(searchText) ||
        (payment.documentNo || "").toLowerCase().includes(searchText) ||
        (payment.reference || "").toLowerCase().includes(searchText);

      const matchesType =
        typeFilter === "All" || payment.type === typeFilter;

      const matchesAccount =
        accountFilter === "All" || payment.account === accountFilter;

      return matchesSearch && matchesType && matchesAccount;
    });
  }, [payments, search, typeFilter, accountFilter]);

  const totalReceived = payments
    .filter((payment) => payment.type === "Received")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalPaid = payments
    .filter((payment) => payment.type === "Paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const cashBalance = payments
    .filter((payment) => payment.account === "Cash")
    .reduce((sum, payment) => {
      return payment.type === "Received" ? sum + payment.amount : sum - payment.amount;
    }, 0);

  const bankBalance = payments
    .filter((payment) => payment.account === "Bank")
    .reduce((sum, payment) => {
      return payment.type === "Received" ? sum + payment.amount : sum - payment.amount;
    }, 0);

  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "type") {
        updated.documentType = value === "Received" ? "Invoice" : "Bill";
        updated.invoiceId = "";
        updated.documentNo = "";
        updated.party = "";
        updated.partnerId = "";
        updated.amount = "";
      }

      if (field === "account") {
        updated.paymentMethod = value === "Cash" ? "Cash" : "Online Transfer";
      }

      if (field === "invoiceId") {
        const inv = invoices.find((i) => String(i.id) === String(value));
        if (inv) {
          updated.partnerId = inv.partnerId;
          updated.party = inv.partner?.name || "";
          updated.documentNo = inv.number;
          updated.amount = String(inv.amountDue != null ? inv.amountDue : (inv.grandTotal || ""));
        }
      }

      if (field === "documentNo") {
        const inv = invoices.find((i) => i.number.toLowerCase() === value.trim().toLowerCase());
        if (inv) {
          updated.invoiceId = inv.id;
          updated.partnerId = inv.partnerId;
          if (!prev.party) updated.party = inv.partner?.name || "";
          if (!prev.amount) updated.amount = String(inv.amountDue != null ? inv.amountDue : (inv.grandTotal || ""));
        }
      }

      return updated;
    });
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setError("");

    let resolvedInvoiceId = form.invoiceId;
    let resolvedPartnerId = form.partnerId;

    if (!resolvedInvoiceId && form.documentNo) {
      const matched = invoices.find(
        (i) => i.number.toLowerCase() === form.documentNo.trim().toLowerCase()
      );
      if (matched) {
        resolvedInvoiceId = matched.id;
        resolvedPartnerId = matched.partnerId;
      }
    }

    if (!resolvedPartnerId && form.party) {
      // Find partner from existing invoices or fallback to contact search
      const matchedByPartner = invoices.find(
        (i) => i.partner?.name?.toLowerCase() === form.party.trim().toLowerCase()
      );
      if (matchedByPartner) {
        resolvedPartnerId = matchedByPartner.partnerId;
      }
    }

    if (!resolvedPartnerId) {
      // Auto-resolve or create contact if missing
      try {
        const contactRes = await api.get(`/contacts?search=${encodeURIComponent(form.party.trim())}`);
        const items = contactRes.data?.items || (Array.isArray(contactRes.data) ? contactRes.data : []);
        const found = items.find((c) => c.name.toLowerCase() === form.party.trim().toLowerCase()) || items[0];
        if (found) {
          resolvedPartnerId = found.id;
        } else {
          const createContactRes = await api.post("/contacts", {
            name: form.party.trim(),
            type: form.type === "Received" ? "CUSTOMER" : "VENDOR",
          });
          resolvedPartnerId = createContactRes.data?.id;
        }
      } catch {
        // Continue
      }
    }

    if (!resolvedPartnerId) {
      setError("Please specify a valid customer or vendor.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    const methodEnum = form.account === "Bank" ? "BANK" : "CASH";
    const targetJournal = journals.find((j) => j.type === methodEnum) || journals[0];

    try {
      await api.post("/payments", {
        type: form.type === "Paid" ? "SEND" : "RECEIVE",
        contactId: Number(resolvedPartnerId),
        invoiceIds: resolvedInvoiceId ? [Number(resolvedInvoiceId)] : undefined,
        paymentDate: form.date || new Date().toISOString().split("T")[0],
        amount: String(form.amount),
        method: methodEnum,
        journalId: Number(targetJournal?.id || (methodEnum === "BANK" ? 3 : 4)),
        narration: form.notes || undefined,
        reference: form.reference || undefined,
      });

      setShowNewPayment(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment.");
    }
  };

  const handleConfirmPayment = async (paymentId) => {
    try {
      const paymentObj = payments.find((p) => p.id === paymentId);
      const invoiceIds = paymentObj?.invoiceId ? [paymentObj.invoiceId] : [];
      await api.patch(
        `/payments/${paymentId}/confirm`,
        { invoiceIds },
        {
          headers: {
            "Idempotency-Key": `pay-confirm-${paymentId}-${Date.now()}`,
          },
        }
      );
      fetchData();
      if (selectedPayment) {
        setSelectedPayment((prev) => ({ ...prev, status: "Completed", rawStatus: "CONFIRMED" }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm payment.");
    }
  };


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}
      <div className="border-b border-[#e7e3da] pb-4">
        <div className="flex items-center gap-1.5 text-sm text-[#716B63] mb-1">
          <span>Transactions</span>
          <span>/</span>
          <span className="text-[#211D19] font-semibold">Payments</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#211D19] tracking-tight">
              Payments
            </h1>
            <p className="mt-1 text-sm text-[#716B63]">
              Payment register against customer invoices and vendor bills
            </p>
          </div>

          <button
            onClick={() => {
              setForm(emptyForm);
              setShowNewPayment(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#342921] px-4.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#251d17] shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>New Payment</span>
          </button>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Received */}
        <div className="rounded-2xl border border-[#e7e3da] bg-white p-5 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#716B63]">
                Total Received
              </p>
              <p className="mt-2 text-2xl font-bold text-[#211D19]">
                {formatCurrency(totalReceived)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <ArrowLeft
                size={18}
                className="rotate-[-45deg] text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Paid */}
        <div className="rounded-2xl border border-[#e7e3da] bg-white p-5 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#716B63]">
                Total Paid
              </p>
              <p className="mt-2 text-2xl font-bold text-[#211D19]">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
              <ArrowLeft
                size={18}
                className="rotate-[135deg] text-rose-700"
              />
            </div>
          </div>
        </div>

        {/* Cash */}
        <div className="rounded-2xl border border-[#e7e3da] bg-white p-5 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#716B63]">
                Cash Balance
              </p>
              <p className="mt-2 text-2xl font-bold text-[#211D19]">
                {formatCurrency(cashBalance)}
              </p>
            </div>
            <div className="rounded-xl bg-[#faf8f4] border border-[#e7e3da] p-3 text-[#342921]">
              <Wallet size={18} />
            </div>
          </div>
        </div>

        {/* Bank */}
        <div className="rounded-2xl border border-[#e7e3da] bg-white p-5 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#716B63]">
                Bank Balance
              </p>
              <p className="mt-2 text-2xl font-bold text-[#211D19]">
                {formatCurrency(bankBalance)}
              </p>
            </div>
            <div className="rounded-xl bg-[#faf8f4] border border-[#e7e3da] p-3 text-[#342921]">
              <Landmark size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          FILTER BAR
      ================================================= */}
      <div className="rounded-2xl border border-[#e7e3da] bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716B63]"
            />
            <input
              type="text"
              placeholder="Search payment, customer, vendor or invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#cfc6b6] bg-white py-2.5 pl-10 pr-4 text-sm text-[#211D19] outline-none transition focus:border-[#342921]"
            />
          </div>

          {/* Payment Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-xl border border-[#cfc6b6] bg-white px-3.5 text-sm text-[#211D19] outline-none transition focus:border-[#342921]"
          >
            <option value="All">All Payments</option>
            <option value="Received">Received</option>
            <option value="Paid">Paid</option>
          </select>

          {/* Account */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="h-10 rounded-xl border border-[#cfc6b6] bg-white px-3.5 text-sm text-[#211D19] outline-none transition focus:border-[#342921]"
          >
            <option value="All">All Accounts</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
          </select>
        </div>
      </div>

      {/* =================================================
          PAYMENT REGISTER
      ================================================= */}
      <div className="overflow-hidden rounded-2xl border border-[#e7e3da] bg-white shadow-2xs">
        <div className="border-b border-[#e7e3da] px-6 py-4 bg-[#faf8f4]/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#211D19]">
              Payment Register
            </h2>
            <p className="text-xs text-[#716B63]">
              Payments registered against invoices and bills
            </p>
          </div>
          <span className="text-xs font-semibold text-[#716B63]">
            Showing {filteredPayments.length} payments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-[#faf8f4]/80">
              <tr className="border-b border-[#e7e3da] text-left text-xs uppercase tracking-wider text-[#716B63] font-semibold">

                <th className="px-6 py-4">
                  Payment No.
                </th>

                <th className="px-6 py-4">
                  Date
                </th>

                <th className="px-6 py-4">
                  Type
                </th>

                <th className="px-6 py-4">
                  Party
                </th>

                <th className="px-6 py-4">
                  Against
                </th>

                <th className="px-6 py-4">
                  Account
                </th>

                <th className="px-6 py-4 text-right">
                  Amount
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4 text-center">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredPayments.length === 0 ? (

                <tr>

                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center text-sm text-[#766d65]"
                  >
                    No payments found.
                  </td>

                </tr>

              ) : (

                filteredPayments.map((payment) => (

                  <tr
                    key={payment.id}
                    className="border-b border-[#eee9e3] last:border-0 hover:bg-[#fcfaf7]"
                  >

                    {/* Payment No. */}

                    <td className="px-6 py-5">

                      <span className="font-semibold text-[#211914]">
                        {payment.paymentNo}
                      </span>

                    </td>


                    {/* Date */}

                    <td className="px-6 py-5 text-sm text-[#5f5750]">
                      {payment.date}
                    </td>


                    {/* Type */}

                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          payment.type === "Received"
                            ? "bg-[#edf5ea] text-[#387139]"
                            : "bg-[#f9ece8] text-[#a44935]"
                        }`}
                      >
                        {payment.type}
                      </span>

                    </td>


                    {/* Party */}

                    <td className="px-6 py-5">

                      <div>
                        <p className="font-medium text-[#211914]">
                          {payment.party}
                        </p>

                        <p className="mt-1 text-xs text-[#81776e]">
                          {payment.partyType}
                        </p>
                      </div>

                    </td>


                    {/* Against */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <FileText
                          size={17}
                          className="text-[#766d65]"
                        />

                        <div>

                          <p className="font-medium text-[#211914]">
                            {payment.documentNo}
                          </p>

                          <p className="text-xs text-[#81776e]">
                            {payment.documentType}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* Account */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        {payment.account === "Bank" ? (
                          <Landmark
                            size={17}
                            className="text-[#536b7b]"
                          />
                        ) : (
                          <Wallet
                            size={17}
                            className="text-[#66584d]"
                          />
                        )}

                        <span className="text-sm font-medium">
                          {payment.account}
                        </span>

                      </div>

                    </td>


                    {/* Amount */}

                    <td className="px-6 py-5 text-right">

                      <span
                        className={`font-semibold ${
                          payment.type === "Received"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {payment.type === "Received" ? "+" : "-"}
                        {formatCurrency(payment.amount)}
                      </span>

                    </td>


                    {/* Status */}

                    <td className="px-6 py-5">

                      <span className="inline-flex items-center gap-1.5 text-sm text-green-700">

                        <CheckCircle size={15} />

                        {payment.status}

                      </span>

                    </td>


                    {/* Action */}

                    <td className="px-6 py-5 text-center">

                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e7e3da] px-3 py-1.5 text-xs font-semibold text-[#514840] hover:bg-[#faf8f4] hover:text-[#211D19] transition cursor-pointer"
                      >
                        <Eye size={14} />
                        View
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          NEW PAYMENT MODAL
      ================================================= */}

      {showNewPayment && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white border border-[#e7e3da] shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-[#e7e3da] bg-[#faf8f4] px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-[#211D19]">
                  Register Payment
                </h2>

                <p className="mt-0.5 text-xs text-[#716B63]">
                  Register payment against a validated invoice or bill
                </p>

              </div>

              <button
                onClick={() => setShowNewPayment(false)}
                className="rounded-lg p-2 text-[#716B63] hover:bg-[#f4ede4] hover:text-[#211D19] transition cursor-pointer"
              >
                <X size={18} />
              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={handleSavePayment}
              className="space-y-5 p-6"
            >

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Payment Type */}

              <div>

                <label className="mb-2 block text-xs font-semibold text-[#211D19]">
                  Payment Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      handleFormChange("type", "Received")
                    }
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                      form.type === "Received"
                        ? "border-[#342921] bg-[#342921] text-white shadow-xs"
                        : "border-[#cfc6b6] bg-white text-[#716B63] hover:bg-[#faf8f4]"
                    }`}
                  >
                    Payment Received
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleFormChange("type", "Paid")
                    }
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                      form.type === "Paid"
                        ? "border-[#342921] bg-[#342921] text-white shadow-xs"
                        : "border-[#cfc6b6] bg-white text-[#716B63] hover:bg-[#faf8f4]"
                    }`}
                  >
                    Payment Paid
                  </button>

                </div>

              </div>


              {/* Party + Document */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#41372f]">
                    {form.type === "Received"
                      ? "Customer"
                      : "Vendor"}
                  </label>

                  <div className="relative">

                    <User
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#80776f]"
                    />

                    <input
                      type="text"
                      required
                      list="payment-party-list"
                      value={form.party}
                      onChange={(e) =>
                        handleFormChange(
                          "party",
                          e.target.value
                        )
                      }
                      placeholder={
                        form.type === "Received"
                          ? "Enter customer name"
                          : "Enter vendor name"
                      }
                      className="w-full rounded-lg border border-[#d8d0c8] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#5a4537]"
                    />
                    <datalist id="payment-party-list">
                      {invoices
                        .filter((inv) =>
                          form.type === "Received"
                            ? inv.documentType === "CUSTOMER_INVOICE"
                            : inv.documentType === "VENDOR_BILL"
                        )
                        .map((inv) => inv.partner?.name)
                        .filter(Boolean)
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map((name) => (
                          <option key={name} value={name} />
                        ))}
                    </datalist>

                  </div>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-[#41372f]">
                    Against
                  </label>

                  <select
                    value={form.documentType}
                    onChange={(e) =>
                      handleFormChange(
                        "documentType",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#d8d0c8] bg-white px-4 py-3 text-sm outline-none"
                  >

                    {form.type === "Received" ? (
                      <option value="Invoice">
                        Customer Invoice
                      </option>
                    ) : (
                      <option value="Bill">
                        Vendor Bill
                      </option>
                    )}

                  </select>

                </div>

              </div>


              {/* Document No + Date */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#41372f]">
                    {form.documentType === "Invoice"
                      ? "Invoice Number"
                      : "Bill Number"}
                  </label>

                  <div className="relative">

                    <FileText
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#80776f]"
                    />

                    <input
                      type="text"
                      required
                      list="payment-invoice-list"
                      value={form.documentNo}
                      onChange={(e) =>
                        handleFormChange(
                          "documentNo",
                          e.target.value
                        )
                      }
                      placeholder={
                        form.documentType === "Invoice"
                          ? "Select or type invoice #"
                          : "Select or type bill #"
                      }
                      className="w-full rounded-lg border border-[#d8d0c8] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#5a4537]"
                    />
                    <datalist id="payment-invoice-list">
                      {invoices
                        .filter((inv) =>
                          form.documentType === "Invoice"
                            ? inv.documentType === "CUSTOMER_INVOICE"
                            : inv.documentType === "VENDOR_BILL"
                        )
                        .map((inv) => (
                          <option
                            key={inv.id}
                            value={inv.number}
                            label={`${inv.partner?.name || ""} - Due ₹${inv.amountDue != null ? inv.amountDue : inv.grandTotal}`}
                          />
                        ))}
                    </datalist>

                  </div>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-[#41372f]">
                    Payment Date
                  </label>

                  <div className="relative">

                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#80776f]"
                    />

                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) =>
                        handleFormChange(
                          "date",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-[#d8d0c8] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#5a4537]"
                    />

                  </div>

                </div>

              </div>


              {/* Amount + Account */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#41372f]">
                    Payment Amount
                  </label>

                  <div className="relative">

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#766d65]">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="1"
                      required
                      value={form.amount}
                      onChange={(e) =>
                        handleFormChange(
                          "amount",
                          e.target.value
                        )
                      }
                      placeholder="Enter amount"
                      className="w-full rounded-lg border border-[#d8d0c8] py-3 pl-8 pr-4 text-sm outline-none focus:border-[#5a4537]"
                    />

                  </div>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-[#41372f]">
                    Payment Account
                  </label>

                  <select
                    value={form.account}
                    onChange={(e) =>
                      handleFormChange(
                        "account",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#d8d0c8] bg-white px-4 py-3 text-sm outline-none"
                  >

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="Bank">
                      Bank
                    </option>

                  </select>

                </div>

              </div>


              {/* Payment Method + Reference */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#41372f]">
                    Payment Method
                  </label>

                  <div className="relative">

                    <CreditCard
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#80776f]"
                    />

                    <select
                      value={form.paymentMethod}
                      onChange={(e) =>
                        handleFormChange(
                          "paymentMethod",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-[#d8d0c8] bg-white py-3 pl-10 pr-4 text-sm outline-none"
                    >

                      {form.account === "Cash" ? (
                        <option value="Cash">
                          Cash
                        </option>
                      ) : (
                        <>
                          <option value="Online Transfer">
                            Online Transfer
                          </option>

                          <option value="Cheque">
                            Cheque
                          </option>

                          <option value="Bank Transfer">
                            Bank Transfer
                          </option>
                        </>
                      )}

                    </select>

                  </div>

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium text-[#41372f]">
                    Reference No.
                  </label>

                  <input
                    type="text"
                    value={form.reference}
                    onChange={(e) =>
                      handleFormChange(
                        "reference",
                        e.target.value
                      )
                    }
                    placeholder="e.g. BANK-001"
                    className="w-full rounded-lg border border-[#d8d0c8] px-4 py-3 text-sm outline-none focus:border-[#5a4537]"
                  />

                </div>

              </div>


              {/* Notes */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#41372f]">
                  Notes
                </label>

                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(e) =>
                    handleFormChange(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Add any additional information..."
                  className="w-full resize-none rounded-lg border border-[#d8d0c8] px-4 py-3 text-sm outline-none focus:border-[#5a4537]"
                />

              </div>


              {/* Buttons */}

              <div className="flex justify-end gap-3 border-t border-[#e7e3da] pt-4">

                <button
                  type="button"
                  onClick={() => setShowNewPayment(false)}
                  className="rounded-xl border border-[#cfc6b6] px-4 py-2 text-sm font-semibold text-[#716B63] hover:bg-[#faf8f4] transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#342921] px-5 py-2 text-sm font-semibold text-white hover:bg-[#251d17] transition shadow-xs cursor-pointer"
                >
                  Register Payment
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          PAYMENT DETAILS MODAL
      ================================================= */}

      {selectedPayment && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-xl rounded-2xl bg-white border border-[#e7e3da] shadow-2xl overflow-hidden">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-[#e7e3da] bg-[#faf8f4] px-6 py-5">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-[#716B63]">
                  Payment Details
                </p>

                <h2 className="mt-0.5 text-xl font-bold text-[#211D19]">
                  {selectedPayment.paymentNo}
                </h2>

              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg p-2 text-[#716B63] hover:bg-[#f4ede4] hover:text-[#211D19] transition cursor-pointer"
              >
                <X size={18} />
              </button>

            </div>


            {/* Details */}

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

              <Detail
                label="Payment Type"
                value={selectedPayment.type}
              />

              <Detail
                label="Date"
                value={selectedPayment.date}
              />

              <Detail
                label="Party"
                value={`${selectedPayment.party} (${selectedPayment.partyType})`}
              />

              <Detail
                label="Against"
                value={`${selectedPayment.documentType} - ${selectedPayment.documentNo}`}
              />

              <Detail
                label="Payment Account"
                value={selectedPayment.account}
              />

              <Detail
                label="Payment Method"
                value={selectedPayment.paymentMethod}
              />

              <Detail
                label="Reference"
                value={selectedPayment.reference}
              />

              <Detail
                label="Status"
                value={selectedPayment.status}
              />

            </div>


            {/* Amount */}

            <div className="mx-6 rounded-xl bg-[#faf8f4] border border-[#e7e3da] p-4">

              <p className="text-xs uppercase tracking-wider font-semibold text-[#716B63]">
                Payment Amount
              </p>

              <p
                className={`mt-1 text-2xl font-bold ${
                  selectedPayment.type === "Received"
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {selectedPayment.type === "Received"
                  ? "+"
                  : "-"}
                {formatCurrency(selectedPayment.amount)}
              </p>

            </div>


            {/* Notes */}

            <div className="px-6 py-4">

              <p className="text-xs font-semibold text-[#716B63]">
                Notes
              </p>

              <p className="mt-1 text-sm text-[#211D19]">
                {selectedPayment.notes}
              </p>

            </div>


            <div className="flex justify-end border-t border-[#e7e3da] p-4 bg-[#faf8f4]/60">

              <button
                onClick={() => setSelectedPayment(null)}
                className="rounded-xl bg-[#342921] px-5 py-2 text-sm font-semibold text-white hover:bg-[#251d17] transition shadow-xs cursor-pointer"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// =====================================================
// DETAIL COMPONENT
// =====================================================

function Detail({ label, value }) {
  return (
    <div>

      <p className="text-xs uppercase tracking-wide text-[#8a8179]">
        {label}
      </p>

      <p className="mt-1 font-medium text-[#211914]">
        {value}
      </p>

    </div>
  );
}

export default Payments;