import { useState } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  Trash2,
} from "lucide-react";

function SalesOrders() {
  // ==================================================
  // SAMPLE SALES ORDERS
  // ==================================================

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNo: "SO/2026/001",
      date: "05 Sep 2026",

      customer: {
        name: "Rahul Sharma",
        phone: "9876543210",
        email: "rahul@gmail.com",
        address: "Jaipur, Rajasthan",
      },

      items: [
        {
          name: "Office Chair",
          quantity: 5,
          unitPrice: 4000,
          tax: 18,
        },
        {
          name: "Wooden Table",
          quantity: 2,
          unitPrice: 8000,
          tax: 18,
        },
      ],

      payment: {
        method: "Bank",
        bankName: "HDFC Bank",
        referenceNo: "TXN458921",
        dueDate: "",
      },

      status: "Confirmed",
    },

    {
      id: 2,
      orderNo: "SO/2026/002",
      date: "06 Sep 2026",

      customer: {
        name: "Priya Verma",
        phone: "9988776655",
        email: "priya@gmail.com",
        address: "Udaipur, Rajasthan",
      },

      items: [
        {
          name: "Dining Chair",
          quantity: 10,
          unitPrice: 2500,
          tax: 18,
        },
      ],

      payment: {
        method: "Cash",
        bankName: "",
        referenceNo: "",
        dueDate: "",
      },

      status: "Pending",
    },
  ]);

  // ==================================================
  // STATES
  // ==================================================

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    date: "",
    status: "Pending",

    paymentMethod: "Cash",
    bankName: "",
    referenceNo: "",
    dueDate: "",
  });

  const [items, setItems] = useState([
    {
      name: "",
      quantity: 1,
      unitPrice: 0,
      tax: 18,
    },
  ]);

  // ==================================================
  // CALCULATIONS
  // ==================================================

  const getItemSubtotal = (item) => {
    return (
      Number(item.quantity || 0) *
      Number(item.unitPrice || 0)
    );
  };

  const getItemTax = (item) => {
    const subtotal =
      getItemSubtotal(item);

    return (
      (subtotal *
        Number(item.tax || 0)) /
      100
    );
  };

  const getItemTotal = (item) => {
    return (
      getItemSubtotal(item) +
      getItemTax(item)
    );
  };

  const getSubtotal = (orderItems) => {
    return orderItems.reduce(
      (total, item) =>
        total + getItemSubtotal(item),
      0
    );
  };

  const getTotalTax = (orderItems) => {
    return orderItems.reduce(
      (total, item) =>
        total + getItemTax(item),
      0
    );
  };

  const getGrandTotal = (orderItems) => {
    return (
      getSubtotal(orderItems) +
      getTotalTax(orderItems)
    );
  };

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNo
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      order.customer.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ==================================================
  // ADD PRODUCT
  // ==================================================

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        quantity: 1,
        unitPrice: 0,
        tax: 18,
      },
    ]);
  };

  // ==================================================
  // REMOVE PRODUCT
  // ==================================================

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(
      items.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  // ==================================================
  // UPDATE PRODUCT
  // ==================================================

  const updateItem = (
    index,
    field,
    value
  ) => {
    const updatedItems = [...items];

    if (field === "name") {
      updatedItems[index][field] =
        value;
    } else {
      updatedItems[index][field] =
        Number(value);
    }

    setItems(updatedItems);
  };

  // ==================================================
  // UPDATE FORM
  // ==================================================

  const updateForm = (
    field,
    value
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // ==================================================
  // CREATE SALES ORDER
  // ==================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.customerName.trim()
    ) {
      alert(
        "Please enter customer name."
      );
      return;
    }

    // MOBILE NUMBER VALIDATION
    if (
      formData.customerPhone.length !==
      10
    ) {
      alert(
        "Please enter a valid 10 digit mobile number."
      );
      return;
    }

    if (!formData.date) {
      alert(
        "Please select order date."
      );
      return;
    }

    const validItems =
      items.filter(
        (item) =>
          item.name.trim() &&
          item.quantity > 0 &&
          item.unitPrice >= 0
      );

    if (validItems.length === 0) {
      alert(
        "Please add at least one product."
      );
      return;
    }

    // BANK VALIDATION

    if (
      formData.paymentMethod ===
        "Bank" &&
      !formData.bankName.trim()
    ) {
      alert(
        "Please enter bank name."
      );
      return;
    }

    // CREDIT VALIDATION

    if (
      formData.paymentMethod ===
        "Credit / Due" &&
      !formData.dueDate
    ) {
      alert(
        "Please select due date."
      );
      return;
    }

    const newOrder = {
      id: Date.now(),

      orderNo: `SO/2026/${String(
        orders.length + 1
      ).padStart(3, "0")}`,

      date: formData.date,

      customer: {
        name:
          formData.customerName,

        phone:
          formData.customerPhone,

        email:
          formData.customerEmail,

        address:
          formData.customerAddress,
      },

      items: validItems,

      payment: {
        method:
          formData.paymentMethod,

        bankName:
          formData.paymentMethod ===
          "Bank"
            ? formData.bankName
            : "",

        referenceNo:
          formData.paymentMethod ===
          "Bank"
            ? formData.referenceNo
            : "",

        dueDate:
          formData.paymentMethod ===
          "Credit / Due"
            ? formData.dueDate
            : "",
      },

      status: formData.status,
    };

    setOrders([
      ...orders,
      newOrder,
    ]);

    // RESET FORM

    setFormData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      date: "",
      status: "Pending",

      paymentMethod: "Cash",
      bankName: "",
      referenceNo: "",
      dueDate: "",
    });

    setItems([
      {
        name: "",
        quantity: 1,
        unitPrice: 0,
        tax: 18,
      },
    ]);

    setShowForm(false);
  };

  // ==================================================
  // DETAILS PAGE
  // ==================================================

  if (selectedOrder) {
    const subtotal =
      getSubtotal(
        selectedOrder.items
      );

    const totalTax =
      getTotalTax(
        selectedOrder.items
      );

    const grandTotal =
      getGrandTotal(
        selectedOrder.items
      );

    return (
      <div className="min-h-screen bg-[#f8f6f2] p-6">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setSelectedOrder(null)
              }
              className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </button>

            <div>

              <h1 className="text-2xl font-semibold text-[#49392f]">
                Sales Order Details
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Complete information about this sales order
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              setSelectedOrder(null)
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back
          </button>

        </div>

        {/* ORDER INFORMATION */}

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">

          <div className="flex items-start justify-between mb-6">

            <div>

              <p className="text-sm text-gray-500">
                Sales Order
              </p>

              <h2 className="text-2xl font-semibold text-[#49392f] mt-1">
                {selectedOrder.orderNo}
              </h2>

            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedOrder.status ===
                "Confirmed"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {selectedOrder.status}
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div>

              <p className="text-sm text-gray-500 mb-1">
                Customer
              </p>

              <p className="font-medium text-gray-800">
                {selectedOrder.customer.name}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500 mb-1">
                Order Date
              </p>

              <p className="font-medium text-gray-800">
                {selectedOrder.date}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500 mb-1">
                Order Total
              </p>

              <p className="font-semibold text-lg text-[#49392f]">
                ₹
                {grandTotal.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </p>

            </div>

          </div>

        </div>

        {/* CUSTOMER DETAILS */}

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">

          <h2 className="text-lg font-semibold text-[#49392f] mb-5">
            Customer Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div>

              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="font-medium mt-1">
                {selectedOrder.customer.name}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Mobile
              </p>

              <p className="font-medium mt-1">
                {selectedOrder.customer.phone}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="font-medium mt-1">
                {selectedOrder.customer.email ||
                  "-"}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Address
              </p>

              <p className="font-medium mt-1">
                {selectedOrder.customer.address ||
                  "-"}
              </p>

            </div>

          </div>

        </div>

        {/* PRODUCTS */}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">

          <div className="p-6 border-b border-gray-200">

            <h2 className="text-lg font-semibold text-[#49392f]">
              Products Sold
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-[#f7f5f1] border-b border-gray-200">

                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    #
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Product
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold">
                    Quantity
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold">
                    Unit Price
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold">
                    Tax
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {selectedOrder.items.map(
                  (item, index) => (

                    <tr
                      key={index}
                      className="border-b border-gray-100"
                    >

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {item.name}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {item.quantity}
                      </td>

                      <td className="px-6 py-4 text-right">
                        ₹
                        {Number(
                          item.unitPrice
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {item.tax}%
                      </td>

                      <td className="px-6 py-4 text-right font-medium">
                        ₹
                        {getItemTotal(
                          item
                        ).toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          <div className="flex justify-end p-6">

            <div className="w-full md:w-96">

              <div className="flex justify-between py-2 text-gray-600">

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

              <div className="flex justify-between py-2 text-gray-600">

                <span>
                  Total Tax
                </span>

                <span>
                  ₹
                  {totalTax.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>

              </div>

              <div className="flex justify-between border-t pt-4 mt-2">

                <span className="text-lg font-semibold">
                  Grand Total
                </span>

                <span className="text-2xl font-bold text-[#49392f]">
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

        {/* PAYMENT INFORMATION */}

        <div className="bg-white border border-gray-200 rounded-xl p-6">

          <h2 className="text-lg font-semibold text-[#49392f] mb-5">
            Payment Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div>

              <p className="text-sm text-gray-500">
                Payment Method
              </p>

              <p className="font-semibold mt-1 text-[#49392f]">
                {selectedOrder.payment.method}
              </p>

            </div>

            {selectedOrder.payment.method ===
              "Bank" && (
              <>
                <div>

                  <p className="text-sm text-gray-500">
                    Bank Name
                  </p>

                  <p className="font-medium mt-1">
                    {selectedOrder.payment.bankName ||
                      "-"}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Transaction / Reference No.
                  </p>

                  <p className="font-medium mt-1">
                    {selectedOrder.payment.referenceNo ||
                      "-"}
                  </p>

                </div>
              </>
            )}

            {selectedOrder.payment.method ===
              "Credit / Due" && (
              <div>

                <p className="text-sm text-gray-500">
                  Due Date
                </p>

                <p className="font-medium mt-1">
                  {selectedOrder.payment.dueDate ||
                    "-"}
                </p>

              </div>
            )}

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // NEW SALES ORDER FORM
  // ==================================================

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] p-6">

        {/* HEADER */}

        <div className="flex items-center gap-3 mb-6">

          <button
            onClick={() =>
              setShowForm(false)
            }
            className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>

            <h1 className="text-2xl font-semibold text-[#49392f]">
              New Sales Order
            </h1>

            <p className="text-sm text-gray-500">
              Create a new order for a customer
            </p>

          </div>

        </div>

        <form onSubmit={handleSubmit}>

          {/* CUSTOMER INFORMATION */}

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">

            <h2 className="text-lg font-semibold text-[#49392f] mb-5">
              Customer Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>

                <input
                  type="text"
                  value={
                    formData.customerName
                  }
                  onChange={(e) =>
                    updateForm(
                      "customerName",
                      e.target.value
                    )
                  }
                  placeholder="Enter customer name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                />

              </div>

              {/* MOBILE NUMBER */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  value={
                    formData.customerPhone
                  }
                  onChange={(e) => {

                    const value =
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                    updateForm(
                      "customerPhone",
                      value
                    );

                  }}
                  placeholder="Enter 10 digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:border-[#49392f] ${
                    formData.customerPhone.length > 0 &&
                    formData.customerPhone.length !== 10
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />

                {formData.customerPhone.length >
                  0 &&
                  formData.customerPhone.length <
                    10 && (
                    <p className="text-xs text-red-500 mt-1">
                      Mobile number must contain 10 digits.
                    </p>
                  )}

                {formData.customerPhone.length ===
                  10 && (
                  <p className="text-xs text-green-600 mt-1">
                    Valid mobile number
                  </p>
                )}

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={
                    formData.customerEmail
                  }
                  onChange={(e) =>
                    updateForm(
                      "customerEmail",
                      e.target.value
                    )
                  }
                  placeholder="Enter email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                />

              </div>

              {/* ORDER DATE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Date *
                </label>

                <input
                  type="date"
                  value={
                    formData.date
                  }
                  onChange={(e) =>
                    updateForm(
                      "date",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                />

              </div>

              {/* ADDRESS */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Address
                </label>

                <textarea
                  rows="3"
                  value={
                    formData.customerAddress
                  }
                  onChange={(e) =>
                    updateForm(
                      "customerAddress",
                      e.target.value
                    )
                  }
                  placeholder="Enter customer address"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                />

              </div>

              {/* STATUS */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>

                <select
                  value={
                    formData.status
                  }
                  onChange={(e) =>
                    updateForm(
                      "status",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white outline-none"
                >

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Confirmed">
                    Confirmed
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* PRODUCTS */}

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-lg font-semibold text-[#49392f]">
                  Products
                </h2>

                <p className="text-sm text-gray-500">
                  Add products sold to the customer
                </p>

              </div>

              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#49392f] text-white rounded-lg hover:bg-[#382c25]"
              >

                <Plus size={17} />

                Add Product

              </button>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-[#f7f5f1]">

                    <th className="text-left px-4 py-3 text-sm">
                      Product
                    </th>

                    <th className="text-center px-4 py-3 text-sm">
                      Quantity
                    </th>

                    <th className="text-right px-4 py-3 text-sm">
                      Unit Price
                    </th>

                    <th className="text-center px-4 py-3 text-sm">
                      Tax %
                    </th>

                    <th className="text-right px-4 py-3 text-sm">
                      Amount
                    </th>

                    <th></th>

                  </tr>

                </thead>

                <tbody>

                  {items.map(
                    (item, index) => (

                      <tr
                        key={index}
                        className="border-b border-gray-100"
                      >

                        <td className="px-4 py-3">

                          <input
                            type="text"
                            value={
                              item.name
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Product name"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
                          />

                        </td>

                        <td className="px-4 py-3">

                          <input
                            type="number"
                            min="1"
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
                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg outline-none"
                          />

                        </td>

                        <td className="px-4 py-3">

                          <input
                            type="number"
                            min="0"
                            value={
                              item.unitPrice
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "unitPrice",
                                e.target.value
                              )
                            }
                            className="w-32 px-3 py-2 border border-gray-200 rounded-lg outline-none"
                          />

                        </td>

                        <td className="px-4 py-3">

                          <select
                            value={
                              item.tax
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "tax",
                                e.target.value
                              )
                            }
                            className="w-24 px-2 py-2 border border-gray-200 rounded-lg bg-white"
                          >

                            <option value="0">
                              0%
                            </option>

                            <option value="5">
                              5%
                            </option>

                            <option value="12">
                              12%
                            </option>

                            <option value="18">
                              18%
                            </option>

                            <option value="28">
                              28%
                            </option>

                          </select>

                        </td>

                        <td className="px-4 py-3 text-right font-medium">

                          ₹
                          {getItemTotal(
                            item
                          ).toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}

                        </td>

                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >

                            <Trash2
                              size={17}
                            />

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* TOTALS */}

            <div className="flex justify-end mt-6">

              <div className="w-full md:w-96">

                <div className="flex justify-between py-2">

                  <span className="text-gray-600">
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

                <div className="flex justify-between py-2">

                  <span className="text-gray-600">
                    Total Tax
                  </span>

                  <span>
                    ₹
                    {getTotalTax(
                      items
                    ).toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>

                </div>

                <div className="flex justify-between border-t border-gray-200 pt-4 mt-2">

                  <span className="text-lg font-semibold">
                    Grand Total
                  </span>

                  <span className="text-2xl font-bold text-[#49392f]">
                    ₹
                    {getGrandTotal(
                      items
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

          </div>

          {/* PAYMENT INFORMATION */}

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">

            <h2 className="text-lg font-semibold text-[#49392f] mb-5">
              Payment Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* PAYMENT METHOD */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>

                <select
                  value={
                    formData.paymentMethod
                  }
                  onChange={(e) =>
                    updateForm(
                      "paymentMethod",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#49392f]"
                >

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="Bank">
                    Bank
                  </option>

                  <option value="Credit / Due">
                    Credit / Due
                  </option>

                </select>

              </div>

              {/* BANK */}

              {formData.paymentMethod ===
                "Bank" && (
                <>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>

                    <input
                      type="text"
                      value={
                        formData.bankName
                      }
                      onChange={(e) =>
                        updateForm(
                          "bankName",
                          e.target.value
                        )
                      }
                      placeholder="e.g. HDFC Bank"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction / Reference No.
                    </label>

                    <input
                      type="text"
                      value={
                        formData.referenceNo
                      }
                      onChange={(e) =>
                        updateForm(
                          "referenceNo",
                          e.target.value
                        )
                      }
                      placeholder="Enter transaction number"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                    />

                  </div>

                </>
              )}

              {/* CREDIT */}

              {formData.paymentMethod ===
                "Credit / Due" && (
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>

                  <input
                    type="date"
                    value={
                      formData.dueDate
                    }
                    onChange={(e) =>
                      updateForm(
                        "dueDate",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                  />

                </div>
              )}

            </div>

            {/* PAYMENT DESCRIPTION */}

            <div className="mt-5 p-4 rounded-lg bg-[#f7f5f1]">

              {formData.paymentMethod ===
                "Cash" && (
                <p className="text-sm text-gray-600">
                  Payment will be received in{" "}
                  <strong className="text-[#49392f]">
                    Cash
                  </strong>.
                </p>
              )}

              {formData.paymentMethod ===
                "Bank" && (
                <p className="text-sm text-gray-600">
                  Payment will be received
                  through{" "}
                  <strong className="text-[#49392f]">
                    Bank
                  </strong>.
                </p>
              )}

              {formData.paymentMethod ===
                "Credit / Due" && (
                <p className="text-sm text-gray-600">
                  Amount will remain{" "}
                  <strong className="text-[#49392f]">
                    Due
                  </strong>{" "}
                  until the customer pays.
                </p>
              )}

            </div>

          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() =>
                setShowForm(false)
              }
              className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#49392f] text-white rounded-lg hover:bg-[#382c25]"
            >
              Create Sales Order
            </button>

          </div>

        </form>

      </div>
    );
  }

  // ==================================================
  // SALES ORDER LIST
  // ==================================================

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-2xl font-semibold text-[#49392f]">
            Sales Orders
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage products sold to customers
          </p>

        </div>

        <button
          onClick={() =>
            setShowForm(true)
          }
          className="flex items-center gap-2 bg-[#49392f] text-white px-4 py-2.5 rounded-lg hover:bg-[#382c25]"
        >

          <Plus size={18} />

          New Sales Order

        </button>

      </div>

      {/* SEARCH */}

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">

        <div className="relative">

          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search by sales order number or customer..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-[#f7f5f1] border-b border-gray-200">

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Sales Order No.
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Date
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Customer
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Products
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold">
                  Total
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Payment
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredOrders.length > 0 ? (

                filteredOrders.map(
                  (order) => {

                    const total =
                      getGrandTotal(
                        order.items
                      );

                    return (

                      <tr
                        key={order.id}
                        className="border-b border-gray-100 hover:bg-[#faf9f7]"
                      >

                        {/* ORDER NUMBER */}

                        <td className="px-5 py-4">

                          <button
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                            className="font-medium text-[#49392f] hover:underline"
                          >
                            {order.orderNo}
                          </button>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {order.date}
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-medium">
                              {order.customer.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {order.customer.phone}
                            </p>

                          </div>

                        </td>

                        {/* PRODUCTS */}

                        <td className="px-5 py-4">

                          <div className="space-y-1">

                            {order.items.map(
                              (
                                item,
                                index
                              ) => (

                                <p
                                  key={index}
                                  className="text-sm text-gray-600"
                                >

                                  {item.name} ×{" "}
                                  {item.quantity}

                                </p>

                              )
                            )}

                          </div>

                        </td>

                        {/* TOTAL */}

                        <td className="px-5 py-4 text-right font-medium">

                          ₹
                          {total.toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}

                        </td>

                        {/* PAYMENT */}

                        <td className="px-5 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.payment
                                .method ===
                              "Cash"
                                ? "bg-green-50 text-green-700"
                                : order.payment
                                    .method ===
                                  "Bank"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {
                              order.payment
                                .method
                            }
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status ===
                              "Confirmed"
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {order.status}
                          </span>

                        </td>

                      </tr>

                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No sales orders found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default SalesOrders;