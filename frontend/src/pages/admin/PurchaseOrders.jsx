import { useState } from "react";
import {
  Plus,
  Search,
  ArrowLeft,
  Trash2,
} from "lucide-react";

function PurchaseOrders() {
  // --------------------------------------------------
  // PURCHASE ORDERS DATA
  // --------------------------------------------------

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNo: "PO/2026/001",
      date: "05 Sep 2026",
      vendor: "ABC Furniture Supplier",

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

      status: "Pending",
    },

    {
      id: 2,
      orderNo: "PO/2026/002",
      date: "06 Sep 2026",
      vendor: "XYZ Wood Supplier",

      items: [
        {
          name: "Wooden Sheet",
          quantity: 10,
          rate: 2500,
        },
      ],

      status: "Received",
    },
  ]);

  // --------------------------------------------------
  // STATES
  // --------------------------------------------------

  const [showForm, setShowForm] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    vendor: "",
    date: "",
    status: "Pending",
  });

  const [items, setItems] = useState([
    {
      name: "",
      quantity: 1,
      rate: 0,
    },
  ]);

  // --------------------------------------------------
  // ITEM TOTAL
  // --------------------------------------------------

  const getItemTotal = (item) => {
    return (
      Number(item.quantity || 0) *
      Number(item.rate || 0)
    );
  };

  // --------------------------------------------------
  // GRAND TOTAL
  // --------------------------------------------------

  const getGrandTotal = (orderItems) => {
    return orderItems.reduce(
      (total, item) =>
        total + getItemTotal(item),
      0
    );
  };

  // --------------------------------------------------
  // ADD ITEM
  // --------------------------------------------------

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

  // --------------------------------------------------
  // REMOVE ITEM
  // --------------------------------------------------

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(
      items.filter((_, i) => i !== index)
    );
  };

  // --------------------------------------------------
  // UPDATE ITEM
  // --------------------------------------------------

  const updateItem = (
    index,
    field,
    value
  ) => {
    const updatedItems = [...items];

    if (field === "name") {
      updatedItems[index][field] = value;
    } else {
      updatedItems[index][field] =
        Number(value);
    }

    setItems(updatedItems);
  };

  // --------------------------------------------------
  // CREATE PURCHASE
  // --------------------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.vendor.trim()) {
      alert("Please enter vendor name.");
      return;
    }

    if (!formData.date) {
      alert("Please select purchase date.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.name.trim() &&
        item.quantity > 0 &&
        item.rate >= 0
    );

    if (validItems.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    const newOrder = {
      id: Date.now(),

      orderNo: `PO/2026/${String(
        orders.length + 1
      ).padStart(3, "0")}`,

      date: formData.date,

      vendor: formData.vendor,

      items: validItems,

      status: formData.status,
    };

    setOrders([
      ...orders,
      newOrder,
    ]);

    // Reset form

    setFormData({
      vendor: "",
      date: "",
      status: "Pending",
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

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredOrders = orders.filter(
    (order) =>
      order.vendor
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      order.orderNo
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ==================================================
  // PURCHASE DETAILS PAGE
  // ==================================================

  if (selectedOrder) {
    const total = getGrandTotal(
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
                Purchase Details
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Complete information about this purchase
              </p>

            </div>

          </div>

          <button
            onClick={() =>
              setSelectedOrder(null)
            }
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back
          </button>

        </div>

        {/* PURCHASE INFORMATION */}

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">

          <div className="flex items-start justify-between mb-6">

            <div>

              <p className="text-sm text-gray-500 mb-1">
                Purchase Order
              </p>

              <h2 className="text-2xl font-semibold text-[#49392f]">
                {selectedOrder.orderNo}
              </h2>

            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedOrder.status ===
                "Received"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {selectedOrder.status}
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* VENDOR */}

            <div>

              <p className="text-sm text-gray-500 mb-1">
                Vendor / Supplier
              </p>

              <p className="text-base font-medium text-gray-800">
                {selectedOrder.vendor}
              </p>

            </div>

            {/* DATE */}

            <div>

              <p className="text-sm text-gray-500 mb-1">
                Purchase Date
              </p>

              <p className="text-base font-medium text-gray-800">
                {selectedOrder.date}
              </p>

            </div>

            {/* STATUS */}

            <div>

              <p className="text-sm text-gray-500 mb-1">
                Purchase Status
              </p>

              <p className="text-base font-medium text-gray-800">
                {selectedOrder.status}
              </p>

            </div>

          </div>

        </div>

        {/* ITEMS */}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          <div className="p-6 border-b border-gray-200">

            <h2 className="text-lg font-semibold text-[#49392f]">
              Purchased Items
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Items included in this purchase order
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-[#f7f5f1] border-b border-gray-200">

                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    #
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Item
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold">
                    Quantity
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold">
                    Rate
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

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {item.name}
                      </td>

                      <td className="px-6 py-4 text-center text-gray-600">
                        {item.quantity}
                      </td>

                      <td className="px-6 py-4 text-right text-gray-600">
                        ₹
                        {Number(
                          item.rate
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-gray-800">
                        ₹
                        {getItemTotal(
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

          <div className="flex justify-end p-6">

            <div className="w-full md:w-96">

              <div className="flex justify-between items-center border-t border-gray-200 pt-4">

                <span className="text-lg font-semibold text-gray-700">
                  Total Amount
                </span>

                <span className="text-2xl font-bold text-[#49392f]">
                  ₹
                  {total.toLocaleString(
                    "en-IN"
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
  // NEW PURCHASE FORM
  // ==================================================

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] p-6">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">

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
                New Purchase Order
              </h1>

              <p className="text-sm text-gray-500">
                Add vendor and purchased items
              </p>

            </div>

          </div>

        </div>

        <form onSubmit={handleSubmit}>

          {/* PURCHASE INFORMATION */}

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">

            <h2 className="text-lg font-semibold text-[#49392f] mb-5">
              Purchase Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* VENDOR */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor / Supplier
                </label>

                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vendor:
                        e.target.value,
                    })
                  }
                  placeholder="Enter vendor name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                />

              </div>

              {/* DATE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date
                </label>

                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                />

              </div>

              {/* STATUS */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status:
                        e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#49392f]"
                >

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Received">
                    Received
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* ITEMS */}

          <div className="bg-white border border-gray-200 rounded-xl p-6">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-lg font-semibold text-[#49392f]">
                  Purchased Items
                </h2>

                <p className="text-sm text-gray-500">
                  Add items purchased from the vendor
                </p>

              </div>

              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#49392f] text-white rounded-lg hover:bg-[#382c25]"
              >

                <Plus size={17} />

                Add Item

              </button>

            </div>

            {/* ITEMS TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-[#f7f5f1]">

                    <th className="text-left px-4 py-3 text-sm">
                      Item
                    </th>

                    <th className="text-left px-4 py-3 text-sm">
                      Quantity
                    </th>

                    <th className="text-left px-4 py-3 text-sm">
                      Rate
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

                        {/* ITEM */}

                        <td className="px-4 py-3">

                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Item name"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                          />

                        </td>

                        {/* QUANTITY */}

                        <td className="px-4 py-3">

                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-28 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                          />

                        </td>

                        {/* RATE */}

                        <td className="px-4 py-3">

                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "rate",
                                e.target.value
                              )
                            }
                            className="w-32 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
                          />

                        </td>

                        {/* AMOUNT */}

                        <td className="px-4 py-3 text-right font-medium">

                          ₹
                          {getItemTotal(
                            item
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        {/* DELETE */}

                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(index)
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

            {/* TOTAL */}

            <div className="flex justify-end mt-6">

              <div className="w-full md:w-80">

                <div className="flex justify-between py-3 border-t border-gray-200">

                  <span className="font-semibold text-gray-600">
                    Total Amount
                  </span>

                  <span className="text-xl font-bold text-[#49392f]">

                    ₹
                    {getGrandTotal(
                      items
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </span>

                </div>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 mt-6">

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
                Create Purchase Order
              </button>

            </div>

          </div>

        </form>

      </div>
    );
  }

  // ==================================================
  // PURCHASE ORDERS LIST
  // ==================================================

  return (
    <div className="min-h-screen bg-[#f8f6f2] p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-2xl font-semibold text-[#49392f]">
            Purchase Orders
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage items purchased from vendors
          </p>

        </div>

        <button
          onClick={() =>
            setShowForm(true)
          }
          className="flex items-center gap-2 bg-[#49392f] text-white px-4 py-2.5 rounded-lg hover:bg-[#382c25]"
        >

          <Plus size={18} />

          New Purchase

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
              setSearch(e.target.value)
            }
            placeholder="Search by vendor or purchase order number..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#49392f]"
          />

        </div>

      </div>

      {/* PURCHASE TABLE */}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-[#f7f5f1] border-b border-gray-200">

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Purchase No.
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Date
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Vendor
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold">
                  Items
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold">
                  Amount
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

                        {/* PURCHASE NUMBER */}

                        <td className="px-5 py-4">

                          <button
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                            className="font-medium text-[#49392f] hover:underline cursor-pointer"
                          >
                            {order.orderNo}
                          </button>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {order.date}
                        </td>

                        {/* VENDOR */}

                        <td className="px-5 py-4 text-sm font-medium">
                          {order.vendor}
                        </td>

                        {/* ITEMS */}

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
                            "en-IN"
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status ===
                              "Received"
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
                    colSpan="6"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No purchase orders found.
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

export default PurchaseOrders;