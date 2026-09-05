import { useState } from "react";
import { Plus, Search, Eye, FileDown, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function VendorBills() {
  // --------------------------------------------------
  // SAMPLE VENDOR BILLS
  // --------------------------------------------------

  const [bills, setBills] = useState([
    {
      id: 1,
      billNo: "VB/2026/001",
      billDate: "05 Sep 2026",
      dueDate: "20 Sep 2026",

      vendor: {
        name: "ABC Furniture Supplier",
        address: "Industrial Area, Jaipur",
        phone: "9876543210",
        gstin: "08ABCDE1234F1Z5",
      },

      purchaseOrder: "PO/2026/001",

      items: [
        {
          name: "Wooden Chair",
          quantity: 20,
          rate: 1500,
        },
        {
          name: "Dining Table",
          quantity: 5,
          rate: 8000,
        },
      ],

      gst: 18,
      status: "Unpaid",
    },

    {
      id: 2,
      billNo: "VB/2026/002",
      billDate: "06 Sep 2026",
      dueDate: "21 Sep 2026",

      vendor: {
        name: "XYZ Wood Supplier",
        address: "Sitapura Industrial Area, Jaipur",
        phone: "9876501234",
        gstin: "08XYZAB5678C1Z2",
      },

      purchaseOrder: "PO/2026/002",

      items: [
        {
          name: "Wooden Sheet",
          quantity: 10,
          rate: 2500,
        },
      ],

      gst: 18,
      status: "Paid",
    },
  ]);

  // --------------------------------------------------
  // STATES
  // --------------------------------------------------

  const [search, setSearch] = useState("");

  const [selectedBill, setSelectedBill] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [formData, setFormData] = useState({
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    vendorGstin: "",
    billDate: "",
    dueDate: "",
    purchaseOrder: "",
    gst: 18,
    status: "Unpaid",
  });

  const [items, setItems] = useState([
    {
      name: "",
      quantity: 1,
      rate: 0,
    },
  ]);

  // --------------------------------------------------
  // CALCULATE ITEM AMOUNT
  // --------------------------------------------------

  const getItemAmount = (item) => {
    return (
      Number(item.quantity || 0) *
      Number(item.rate || 0)
    );
  };

  // --------------------------------------------------
  // CALCULATE SUBTOTAL
  // --------------------------------------------------

  const getSubtotal = (billItems) => {
    return billItems.reduce(
      (total, item) =>
        total + getItemAmount(item),
      0
    );
  };

  // --------------------------------------------------
  // CALCULATE GST
  // --------------------------------------------------

  const getGSTAmount = (
    subtotal,
    gstPercentage
  ) => {
    return (
      (subtotal *
        Number(gstPercentage || 0)) /
      100
    );
  };

  // --------------------------------------------------
  // CALCULATE GRAND TOTAL
  // --------------------------------------------------

  const getGrandTotal = (bill) => {
    const subtotal = getSubtotal(
      bill.items
    );

    const gstAmount = getGSTAmount(
      subtotal,
      bill.gst
    );

    return subtotal + gstAmount;
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredBills = bills.filter(
    (bill) =>
      bill.billNo
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      bill.vendor.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      bill.purchaseOrder
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ==================================================
  // ADD ITEM
  // ==================================================

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  // ==================================================
  // UPDATE ITEM
  // ==================================================

  const updateItem = (
    index,
    field,
    value
  ) => {
    const updatedItems = [...items];

    if (
      field === "name"
    ) {
      updatedItems[index][field] =
        value;
    } else {
      updatedItems[index][field] =
        Number(value);
    }

    setItems(updatedItems);
  };

  // ==================================================
  // REMOVE ITEM
  // ==================================================

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(
      items.filter(
        (_, i) => i !== index
      )
    );
  };

  // ==================================================
  // CREATE BILL
  // ==================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.vendorName.trim()
    ) {
      alert("Please enter vendor name.");
      return;
    }

    if (!formData.billDate) {
      alert("Please select bill date.");
      return;
    }

    const validItems =
      items.filter(
        (item) =>
          item.name.trim() &&
          item.quantity > 0 &&
          item.rate >= 0
      );

    if (validItems.length === 0) {
      alert(
        "Please add at least one item."
      );
      return;
    }

    const newBill = {
      id: Date.now(),

      billNo: `VB/2026/${String(
        bills.length + 1
      ).padStart(3, "0")}`,

      billDate:
        formData.billDate,

      dueDate:
        formData.dueDate,

      vendor: {
        name:
          formData.vendorName,

        address:
          formData.vendorAddress,

        phone:
          formData.vendorPhone,

        gstin:
          formData.vendorGstin,
      },

      purchaseOrder:
        formData.purchaseOrder,

      items: validItems,

      gst:
        Number(formData.gst),

      status:
        formData.status,
    };

    setBills([
      ...bills,
      newBill,
    ]);

    setFormData({
      vendorName: "",
      vendorAddress: "",
      vendorPhone: "",
      vendorGstin: "",
      billDate: "",
      dueDate: "",
      purchaseOrder: "",
      gst: 18,
      status: "Unpaid",
    });

    setItems([
      {
        name: "",
        quantity: 1,
        rate: 0,
      },
    ]);

    setShowForm(false);
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

          {/* VENDOR INFORMATION */}

          <div className="bg-white border rounded-xl p-6">

            <h2 className="text-lg font-semibold mb-5">
              Vendor Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <input
                placeholder="Vendor Name"
                value={
                  formData.vendorName
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vendorName:
                      e.target.value,
                  })
                }
                className="input"
              />

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