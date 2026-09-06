import { useState, useEffect } from "react";
import { Plus, Search, Eye, FileDown, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../services/api";

function VendorBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    partnerId: "",
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    vendorGstin: "",
    billDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    purchaseOrder: "",
    gst: 18,
    status: "Unpaid",
  });

  const [items, setItems] = useState([
    {
      productId: "",
      name: "",
      quantity: 1,
      rate: 0,
    },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, vRes, pRes, tRes, aRes] = await Promise.all([
        api.get("/invoices?type=VENDOR_BILL"),
        api.get("/contacts?type=VENDOR&limit=100").catch(() => ({ data: { items: [] } })),
        api.get("/products?limit=100").catch(() => ({ data: { items: [] } })),
        api.get("/taxes").catch(() => ({ data: { items: [] } })),
        api.get("/accounts").catch(() => ({ data: { items: [] } })),
      ]);

      // invoices returns a direct array; contacts/products/taxes/accounts return { items: [] }
      const mapped = (Array.isArray(bRes.data) ? bRes.data : []).map((b) => ({
        id: b.id,
        billNo: b.number,
        billDate: new Date(b.invoiceDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        dueDate: new Date(b.dueDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        vendor: {
          name: b.partner?.name || "Vendor",
          address: b.partner?.street || b.partner?.city || "",
          phone: b.partner?.mobile || "",
          gstin: "",
        },
        purchaseOrder: b.sourceOrderId ? `PO-${b.sourceOrderId}` : "-",
        items: (b.lines || []).map((l) => ({
          name: l.product?.name || "Item",
          quantity: Number(l.quantity) || 1,
          rate: Number(l.unitPrice) || 0,
        })),
        gst: 18,
        status: b.paymentStatus === "PAID" ? "Paid" : b.status === "CONFIRMED" ? "Confirmed" : "Unpaid",
        rawStatus: b.status,
      }));

      setBills(mapped);
      setVendors(vRes.data.items || []);
      setProducts(pRes.data.items || []);
      setTaxes(tRes.data.items || []);
      setAccounts(aRes.data.items || []);
    } catch {
      // Error toasted by api.js interceptor
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const getItemAmount = (item) => {
    return Number(item.quantity || 0) * Number(item.rate || 0);
  };

  const getSubtotal = (billItems) => {
    return (billItems || []).reduce((total, item) => total + getItemAmount(item), 0);
  };

  const getGSTAmount = (subtotal, gstPercentage) => {
    return (subtotal * Number(gstPercentage || 0)) / 100;
  };

  const getGrandTotal = (bill) => {
    const subtotal = getSubtotal(bill.items);
    const gstAmount = getGSTAmount(subtotal, bill.gst);
    return subtotal + gstAmount;
  };

  const filteredBills = bills.filter(
    (bill) =>
      (bill.billNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (bill.vendor?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (bill.purchaseOrder || "").toLowerCase().includes(search.toLowerCase())
  );

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        name: "",
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    if (field === "productId") {
      const selectedProd = products.find((p) => String(p.id) === String(value));
      updatedItems[index].productId = value;
      updatedItems[index].name = selectedProd?.name || "";
      updatedItems[index].rate = selectedProd?.cost || 0;
    } else if (field === "name") {
      updatedItems[index][field] = value;
    } else {
      updatedItems[index][field] = Number(value);
    }
    setItems(updatedItems);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const vendorName = (formData.vendorName || "").trim();
    if (!formData.partnerId && !vendorName) {
      setError("Please enter or select a vendor.");
      return;
    }

    try {
      // 1. Resolve or create Vendor contact if needed
      let resolvedPartnerId = formData.partnerId ? Number(formData.partnerId) : null;
      if (!resolvedPartnerId && vendorName) {
        const existing = vendors.find(
          (v) => v.name.trim().toLowerCase() === vendorName.toLowerCase()
        );
        if (existing) {
          resolvedPartnerId = existing.id;
        } else {
          const contactRes = await api.post("/contacts", {
            name: vendorName,
            type: "VENDOR",
            street: formData.vendorAddress || undefined,
            mobile: formData.vendorPhone || undefined,
          });
          resolvedPartnerId = contactRes.data.id;
        }
      }

      if (!resolvedPartnerId) {
        setError("Please select or enter a valid vendor.");
        return;
      }

      // 2. Resolve products and build lines
      const defaultTaxId = taxes[0]?.id || 1;
      const defaultAccountId = accounts.find((a) => a.type === "EXPENSE")?.id || accounts[0]?.id || 6;

      const validLines = [];
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const itemName = (item.name || "").trim();
        let prodId = item.productId ? Number(item.productId) : null;

        if (!prodId && itemName) {
          const existingProd = products.find(
            (p) => p.name.trim().toLowerCase() === itemName.toLowerCase()
          );
          if (existingProd) {
            prodId = existingProd.id;
          } else {
            const prodRes = await api.post("/products", {
              name: itemName,
              type: "GOODS",
              cost: Number(item.rate) || 0,
              purchaseAccountId: defaultAccountId,
            });
            prodId = prodRes.data.id;
          }
        }

        validLines.push({
          sequence: idx,
          productId: prodId || (products[0]?.id || 1),
          accountId: defaultAccountId,
          quantity: String(Number(item.quantity) || 1),
          unitPrice: String(Number(item.rate) || 0),
          taxId: defaultTaxId,
          description: itemName || "Vendor bill item",
        });
      }

      const jourRes = await api.get("/journals").catch(() => ({ data: { items: [] } }));
      const jList = jourRes.data?.items || [];
      const purchJournal = jList.find((j) => j.type === "PURCHASE") || jList[0];

      await api.post("/invoices", {
        documentType: "VENDOR_BILL",
        contactId: Number(resolvedPartnerId),
        journalId: Number(purchJournal?.id || 2),
        invoiceDate: formData.billDate || new Date().toISOString().split("T")[0],
        dueDate: formData.dueDate || new Date().toISOString().split("T")[0],
        reference: formData.purchaseOrder || undefined,
        lines: validLines,
      });

      setShowForm(false);
      setFormData({
        partnerId: "",
        vendorName: "",
        vendorAddress: "",
        vendorPhone: "",
        vendorGstin: "",
        billDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        purchaseOrder: "",
        gst: 18,
        status: "Unpaid",
      });
      setItems([{ productId: "", name: "", quantity: 1, rate: 0 }]);
      fetchData();
    } catch (err) {
      console.error("Failed to create vendor bill:", err);
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.map((e) => e.message).join(", ")
          : null) ||
        "Failed to create vendor bill.";
      setError(msg);
    }
  };

  const handleConfirmBill = async (billId) => {
    try {
      await api.patch(`/invoices/${billId}/confirm`);
      fetchData();
      if (selectedBill) {
        setSelectedBill((prev) => ({ ...prev, status: "Confirmed", rawStatus: "CONFIRMED" }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm vendor bill.");
    }
  };



  // ==================================================
  // GENERATE PDF
  // ==================================================

  const generatePDF = (bill) => {
    const doc = new jsPDF();

    const pageWidth =
      doc.internal.pageSize.width;

    // ------------------------------------------------
    // COMPANY HEADER
    // ------------------------------------------------

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");

    doc.text(
      "URBAN FURNITURE",
      14,
      20
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      "Furniture & Home Solutions",
      14,
      27
    );

    doc.text(
      "Jaipur, Rajasthan, India",
      14,
      33
    );

    doc.text(
      "GSTIN: 08AAAAA0000A1Z5",
      14,
      39
    );

    // ------------------------------------------------
    // BILL TITLE
    // ------------------------------------------------

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");

    doc.text(
      "VENDOR BILL",
      pageWidth - 14,
      20,
      {
        align: "right",
      }
    );

    // ------------------------------------------------
    // BILL INFORMATION
    // ------------------------------------------------

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Bill No: ${bill.billNo}`,
      pageWidth - 14,
      28,
      {
        align: "right",
      }
    );

    doc.text(
      `Bill Date: ${bill.billDate}`,
      pageWidth - 14,
      34,
      {
        align: "right",
      }
    );

    doc.text(
      `Due Date: ${bill.dueDate || "-"}`,
      pageWidth - 14,
      40,
      {
        align: "right",
      }
    );

    // ------------------------------------------------
    // LINE
    // ------------------------------------------------

    doc.line(
      14,
      46,
      pageWidth - 14,
      46
    );

    // ------------------------------------------------
    // VENDOR INFORMATION
    // ------------------------------------------------

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    doc.text(
      "Bill From:",
      14,
      57
    );

    doc.setFont("helvetica", "normal");

    doc.text(
      bill.vendor.name,
      14,
      64
    );

    doc.text(
      bill.vendor.address || "-",
      14,
      70
    );

    doc.text(
      `Phone: ${
        bill.vendor.phone || "-"
      }`,
      14,
      76
    );

    doc.text(
      `GSTIN: ${
        bill.vendor.gstin || "-"
      }`,
      14,
      82
    );

    // ------------------------------------------------
    // PURCHASE ORDER
    // ------------------------------------------------

    doc.setFont("helvetica", "bold");

    doc.text(
      "Purchase Order:",
      pageWidth - 70,
      57
    );

    doc.setFont("helvetica", "normal");

    doc.text(
      bill.purchaseOrder || "-",
      pageWidth - 70,
      64
    );

    // ------------------------------------------------
    // ITEMS TABLE
    // ------------------------------------------------

    const tableRows =
      bill.items.map(
        (item, index) => [
          index + 1,
          item.name,
          item.quantity,
          `Rs. ${Number(
            item.rate
          ).toLocaleString("en-IN")}`,
          `Rs. ${getItemAmount(
            item
          ).toLocaleString("en-IN")}`,
        ]
      );

    autoTable(doc, {
      startY: 92,

      head: [
        [
          "#",
          "Item Description",
          "Quantity",
          "Rate",
          "Amount",
        ],
      ],

      body: tableRows,

      theme: "grid",

      styles: {
        fontSize: 10,
        cellPadding: 4,
      },

      headStyles: {
        fontStyle: "bold",
      },

      columnStyles: {
        0: {
          halign: "center",
          cellWidth: 12,
        },

        2: {
          halign: "center",
        },

        3: {
          halign: "right",
        },

        4: {
          halign: "right",
        },
      },
    });

    // ------------------------------------------------
    // TOTALS
    // ------------------------------------------------

    const subtotal =
      getSubtotal(bill.items);

    const gstAmount =
      getGSTAmount(
        subtotal,
        bill.gst
      );

    const grandTotal =
      subtotal + gstAmount;

    const finalY =
      doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);

    doc.text(
      "Subtotal:",
      pageWidth - 70,
      finalY
    );

    doc.text(
      `Rs. ${subtotal.toLocaleString(
        "en-IN"
      )}`,
      pageWidth - 14,
      finalY,
      {
        align: "right",
      }
    );

    doc.text(
      `GST (${bill.gst}%):`,
      pageWidth - 70,
      finalY + 7
    );

    doc.text(
      `Rs. ${gstAmount.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 2,
        }
      )}`,
      pageWidth - 14,
      finalY + 7,
      {
        align: "right",
      }
    );

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    doc.text(
      "Grand Total:",
      pageWidth - 70,
      finalY + 17
    );

    doc.text(
      `Rs. ${grandTotal.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 2,
        }
      )}`,
      pageWidth - 14,
      finalY + 17,
      {
        align: "right",
      }
    );

    // ------------------------------------------------
    // PAYMENT STATUS
    // ------------------------------------------------

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Payment Status: ${bill.status}`,
      14,
      finalY + 20
    );

    // ------------------------------------------------
    // FOOTER
    // ------------------------------------------------

    const pageHeight =
      doc.internal.pageSize.height;

    doc.line(
      14,
      pageHeight - 30,
      pageWidth - 14,
      pageHeight - 30
    );

    doc.setFontSize(9);

    doc.text(
      "Thank you for doing business with Urban Furniture.",
      14,
      pageHeight - 22
    );

    doc.text(
      "This is a computer-generated vendor bill.",
      14,
      pageHeight - 16
    );

    // ------------------------------------------------
    // SAVE PDF
    // ------------------------------------------------

    doc.save(
      `${bill.billNo}.pdf`
    );
  };

  // ==================================================
  // BILL DETAILS
  // ==================================================

  if (selectedBill) {
    const subtotal =
      getSubtotal(
        selectedBill.items
      );

    const gstAmount =
      getGSTAmount(
        subtotal,
        selectedBill.gst
      );

    const grandTotal =
      subtotal + gstAmount;

    return (
      <div className="min-h-screen bg-[#f8f6f2] p-6">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setSelectedBill(null)
              }
              className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft
                size={20}
              />
            </button>

            <div>

              <h1 className="text-2xl font-semibold text-[#49392f]">
                Vendor Bill
              </h1>

              <p className="text-sm text-gray-500">
                {selectedBill.billNo}
              </p>

            </div>

          </div>

          <div className="flex gap-3">
            {selectedBill.rawStatus === "DRAFT" && (
              <button
                onClick={() => handleConfirmBill(selectedBill.id)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition font-medium text-sm cursor-pointer"
              >
                Confirm Bill
              </button>
            )}

            <button
              onClick={() =>
                generatePDF(
                  selectedBill
                )
              }
              className="flex items-center gap-2 px-5 py-2.5 bg-[#49392f] text-white rounded-lg hover:bg-[#382c25]"
            >
              <FileDown
                size={18}
              />
              Generate PDF
            </button>

            <button
              onClick={() =>
                setSelectedBill(null)
              }
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg"
            >
              Back
            </button>

          </div>

        </div>

        {/* BILL */}

        <div className="bg-white border border-gray-200 rounded-xl p-8">

          {/* COMPANY + BILL */}

          <div className="flex justify-between border-b pb-6">

            <div>

              <h2 className="text-2xl font-bold text-[#49392f]">
                URBAN FURNITURE
              </h2>

              <p className="text-sm text-gray-500">
                Furniture & Home Solutions
              </p>

              <p className="text-sm text-gray-500">
                Jaipur, Rajasthan, India
              </p>

              <p className="text-sm text-gray-500">
                GSTIN: 08AAAAA0000A1Z5
              </p>

            </div>

            <div className="text-right">

              <h2 className="text-2xl font-bold text-[#49392f]">
                VENDOR BILL
              </h2>

              <p className="text-sm mt-2">
                Bill No:{" "}
                <strong>
                  {selectedBill.billNo}
                </strong>
              </p>

              <p className="text-sm">
                Bill Date:{" "}
                {selectedBill.billDate}
              </p>

              <p className="text-sm">
                Due Date:{" "}
                {selectedBill.dueDate ||
                  "-"}
              </p>

            </div>

          </div>

          {/* VENDOR */}

          <div className="grid grid-cols-2 gap-8 py-6">

            <div>

              <p className="text-sm text-gray-500 mb-2">
                Bill From
              </p>

              <h3 className="font-semibold text-lg">
                {selectedBill.vendor.name}
              </h3>

              <p className="text-sm text-gray-600">
                {selectedBill.vendor.address}
              </p>

              <p className="text-sm text-gray-600">
                Phone:{" "}
                {selectedBill.vendor.phone}
              </p>

              <p className="text-sm text-gray-600">
                GSTIN:{" "}
                {selectedBill.vendor.gstin}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500 mb-2">
                Purchase Order
              </p>

              <p className="font-semibold">
                {selectedBill.purchaseOrder ||
                  "-"}
              </p>

              <p className="text-sm text-gray-500 mt-4">
                Payment Status
              </p>

              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs ${
                  selectedBill.status ===
                  "Paid"
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {selectedBill.status}
              </span>

            </div>

          </div>

          {/* ITEMS */}

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-[#f7f5f1] border-y">

                  <th className="text-left px-4 py-3">
                    #
                  </th>

                  <th className="text-left px-4 py-3">
                    Item Description
                  </th>

                  <th className="text-center px-4 py-3">
                    Quantity
                  </th>

                  <th className="text-right px-4 py-3">
                    Rate
                  </th>

                  <th className="text-right px-4 py-3">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {selectedBill.items.map(
                  (item, index) => (

                    <tr
                      key={index}
                      className="border-b"
                    >

                      <td className="px-4 py-4">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {item.name}
                      </td>

                      <td className="px-4 py-4 text-center">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-4 text-right">
                        ₹
                        {Number(
                          item.rate
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-medium">
                        ₹
                        {getItemAmount(
                          item
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* TOTAL */}

          <div className="flex justify-end mt-6">

            <div className="w-80">

              <div className="flex justify-between py-2">
                <span>
                  Subtotal
                </span>

                <span>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span>
                  GST ({selectedBill.gst}%)
                </span>

                <span>
                  ₹
                  {gstAmount.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t pt-3 mt-2 text-lg font-bold">

                <span>
                  Grand Total
                </span>

                <span>
                  ₹
                  {grandTotal.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // NEW BILL FORM
  // ==================================================

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] p-6">

        <div className="flex items-center gap-3 mb-6">

          <button
            onClick={() =>
              setShowForm(false)
            }
            className="p-2.5 bg-white border border-gray-200 rounded-lg"
          >
            <ArrowLeft
              size={20}
            />
          </button>

          <div>

            <h1 className="text-2xl font-semibold text-[#49392f]">
              New Vendor Bill
            </h1>

            <p className="text-sm text-gray-500">
              Create a bill received from a vendor
            </p>

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* VENDOR INFORMATION */}

          <div className="bg-white border rounded-xl p-6">

            <h2 className="text-lg font-semibold mb-5">
              Vendor Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <input
                  list="bill-vendor-suggestions"
                  placeholder="Vendor Name"
                  value={formData.vendorName}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matchedVendor = vendors.find(
                      (v) => v.name.toLowerCase() === val.trim().toLowerCase()
                    );
                    if (matchedVendor) {
                      setFormData({
                        ...formData,
                        partnerId: matchedVendor.id,
                        vendorName: matchedVendor.name,
                        vendorAddress: matchedVendor.street || matchedVendor.city || formData.vendorAddress,
                        vendorPhone: matchedVendor.mobile || formData.vendorPhone,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        vendorName: val,
                      });
                    }
                  }}
                  className="input w-full"
                />
                <datalist id="bill-vendor-suggestions">
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.mobile ? `${v.mobile} - ` : ""}{v.email || ""}
                    </option>
                  ))}
                </datalist>
              </div>

              <input
                placeholder="Vendor Address"
                value={
                  formData.vendorAddress
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vendorAddress:
                      e.target.value,
                  })
                }
                className="input"
              />

              <input
                placeholder="Phone Number"
                value={
                  formData.vendorPhone
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vendorPhone:
                      e.target.value,
                  })
                }
                className="input"
              />

              <input
                placeholder="GSTIN"
                value={
                  formData.vendorGstin
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vendorGstin:
                      e.target.value,
                  })
                }
                className="input"
              />

            </div>

          </div>

          {/* BILL INFORMATION */}

          <div className="bg-white border rounded-xl p-6">

            <h2 className="text-lg font-semibold mb-5">
              Bill Information
            </h2>

            <div className="grid md:grid-cols-4 gap-5">

              <input
                type="date"
                value={
                  formData.billDate
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billDate:
                      e.target.value,
                  })
                }
                className="input"
              />

              <input
                type="date"
                value={
                  formData.dueDate
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dueDate:
                      e.target.value,
                  })
                }
                className="input"
              />

              <input
                placeholder="Purchase Order"
                value={
                  formData.purchaseOrder
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchaseOrder:
                      e.target.value,
                  })
                }
                className="input"
              />

              <select
                value={
                  formData.status
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status:
                      e.target.value,
                  })
                }
                className="input"
              >
                <option value="Unpaid">
                  Unpaid
                </option>

                <option value="Paid">
                  Paid
                </option>

                <option value="Partially Paid">
                  Partially Paid
                </option>
              </select>

            </div>

          </div>

          {/* ITEMS */}

          <div className="bg-white border rounded-xl p-6">

            <div className="flex justify-between mb-5">

              <h2 className="text-lg font-semibold">
                Items
              </h2>

              <button
                type="button"
                onClick={addItem}
                className="bg-[#49392f] text-white px-4 py-2 rounded-lg"
              >
                + Add Item
              </button>

            </div>

            {items.map(
              (item, index) => (

                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 mb-3"
                >

                  <input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    className="input col-span-5"
                  />

                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={
                      item.quantity
                    }
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                    className="input col-span-2"
                  />

                  <input
                    type="number"
                    min="0"
                    placeholder="Rate"
                    value={
                      item.rate
                    }
                    onChange={(e) =>
                      updateItem(
                        index,
                        "rate",
                        e.target.value
                      )
                    }
                    className="input col-span-2"
                  />

                  <div className="col-span-2 flex items-center px-3 font-medium">
                    ₹
                    {getItemAmount(
                      item
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        index
                      )
                    }
                    className="text-red-500"
                  >
                    Remove
                  </button>

                </div>

              )
            )}

            {/* GST */}

            <div className="flex justify-end mt-6">

              <div className="w-80">

                <div className="flex justify-between py-2">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {getSubtotal(
                      items
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="flex justify-between items-center py-2">

                  <span>
                    GST %
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      formData.gst
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gst:
                          e.target.value,
                      })
                    }
                    className="w-20 border rounded px-2 py-1"
                  />

                </div>

                <div className="flex justify-between border-t pt-3 font-bold text-lg">

                  <span>
                    Total
                  </span>

                  <span>
                    ₹
                    {(
                      getSubtotal(
                        items
                      ) +
                      getGSTAmount(
                        getSubtotal(
                          items
                        ),
                        formData.gst
                      )
                    ).toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>

                </div>

              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="px-5 py-2.5 border rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#49392f] text-white rounded-lg"
              >
                Create Vendor Bill
              </button>

            </div>

          </div>

        </form>

      </div>
    );
  }

  // ==================================================
  // BILL LIST
  // ==================================================

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-6">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>

          <h1 className="text-2xl font-semibold text-[#49392f]">
            Vendor Bills
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage bills received from vendors
          </p>

        </div>

        <button
          onClick={() =>
            setShowForm(true)
          }
          className="flex items-center gap-2 bg-[#49392f] text-white px-4 py-2.5 rounded-lg"
        >

          <Plus size={18} />

          New Vendor Bill

        </button>

      </div>

      {/* SEARCH */}

      <div className="bg-white border rounded-xl p-4 mb-5">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search bill number, vendor or purchase order..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none"
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl overflow-hidden">

        <table className="w-full">

          <thead>

            <tr className="bg-[#f7f5f1] border-b">

              <th className="text-left px-5 py-4">
                Bill No.
              </th>

              <th className="text-left px-5 py-4">
                Bill Date
              </th>

              <th className="text-left px-5 py-4">
                Vendor
              </th>

              <th className="text-left px-5 py-4">
                Purchase Order
              </th>

              <th className="text-right px-5 py-4">
                Amount
              </th>

              <th className="text-left px-5 py-4">
                Status
              </th>

              <th className="text-center px-5 py-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredBills.map(
              (bill) => {

                const total =
                  getGrandTotal(
                    bill
                  );

                return (

                  <tr
                    key={bill.id}
                    className="border-b hover:bg-[#faf9f7]"
                  >

                    <td className="px-5 py-4">

                      <button
                        onClick={() =>
                          setSelectedBill(
                            bill
                          )
                        }
                        className="font-medium text-[#49392f] hover:underline"
                      >
                        {bill.billNo}
                      </button>

                    </td>

                    <td className="px-5 py-4 text-sm">
                      {bill.billDate}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {bill.vendor.name}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {bill.purchaseOrder ||
                        "-"}
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      ₹
                      {total.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          bill.status ===
                          "Paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {bill.status}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            setSelectedBill(
                              bill
                            )
                          }
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="View Bill"
                        >
                          <Eye
                            size={17}
                          />
                        </button>

                        <button
                          onClick={() =>
                            generatePDF(
                              bill
                            )
                          }
                          className="p-2 border rounded-lg hover:bg-gray-50"
                          title="Generate PDF"
                        >
                          <FileDown
                            size={17}
                          />
                        </button>

                      </div>

                    </td>

                  </tr>

                );
              }
            )}

          </tbody>

        </table>

        {filteredBills.length ===
          0 && (
          <div className="text-center py-12 text-gray-500">
            No vendor bills found.
          </div>
        )}

      </div>

    </div>
  );
}

export default VendorBills;