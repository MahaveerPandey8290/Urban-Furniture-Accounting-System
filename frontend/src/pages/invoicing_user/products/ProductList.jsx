import { Package, Plus, Pencil, Trash2 } from "lucide-react";

function ProductList({
  products,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onNewProduct,
}) {
  const isAllSelected = products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  // Currency formatter
  const formatPrice = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val || "0";
    return num.toLocaleString("en-IN");
  };

  if (products.length === 0) {
    return (
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#f5f2eb] text-[#716B63] mx-auto flex items-center justify-center mb-3">
          <Package size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[#211D19]">No products found</h3>
        <p className="text-sm text-[#716B63] mt-2 max-w-sm mx-auto">
          No matching products available in master records. You can add a new product.
        </p>
        <button
          type="button"
          onClick={onNewProduct}
          className="mt-5 inline-flex items-center gap-2 px-4.5 py-2.5 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>New Product</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e7e3da] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e7e3da] bg-[#faf8f4] text-xs text-[#716B63] font-semibold uppercase tracking-wider select-none">
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  aria-label="Select all products"
                  className="rounded border-[#cfc6b6] text-[#342921] focus:ring-[#342921] cursor-pointer w-4 h-4 accent-[#342921]"
                />
              </th>
              <th className="py-3.5 px-4">PRODUCT</th>
              <th className="py-3.5 px-4">CATEGORY</th>
              <th className="py-3.5 px-4">TYPE</th>
              <th className="py-3.5 px-4 text-right">SALES PRICE</th>
              <th className="py-3.5 px-4 text-right">COST</th>
              <th className="py-3.5 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f5f2eb]">
            {products.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              return (
                <tr
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className={`hover:bg-[#faf8f4] transition cursor-pointer ${
                    isSelected ? "bg-[#f8f5ee]/60" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.id)}
                      aria-label={`Select ${product.productName}`}
                      className="rounded border-[#cfc6b6] text-[#342921] focus:ring-[#342921] cursor-pointer w-4 h-4 accent-[#342921]"
                    />
                  </td>

                  {/* Product Name (with thumbnail only if user manually uploaded image) */}
                  <td className="py-3.5 px-4 font-semibold text-sm text-[#211D19]">
                    <div className="flex items-center gap-2.5">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="w-8 h-8 rounded-lg object-cover border border-[#e7e3da] flex-shrink-0"
                        />
                      )}
                      <span className="truncate">{product.productName || "Untitled Product"}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-xs text-[#211D19]">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#faf8f4] text-[#716B63] border border-[#e7e3da] font-medium">
                      {product.category || "—"}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        product.productType === "Goods"
                          ? "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]"
                          : product.productType === "Service"
                          ? "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]"
                          : "bg-[#f3effa] text-[#553c7b] border-[#dfd4f2]"
                      }`}
                    >
                      {product.productType || "Goods"}
                    </span>
                  </td>

                  {/* Sales Price */}
                  <td className="py-3.5 px-4 text-right font-semibold text-sm text-[#211D19]">
                    Rs. {formatPrice(product.salesPrice)}
                  </td>

                  {/* Cost */}
                  <td className="py-3.5 px-4 text-right font-medium text-sm text-[#716B63]">
                    Rs. {formatPrice(product.cost)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => (onEditProduct || onSelectProduct)(product)}
                        className="p-1.5 rounded-lg text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
                        title="Edit Product"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct && onDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductList;
