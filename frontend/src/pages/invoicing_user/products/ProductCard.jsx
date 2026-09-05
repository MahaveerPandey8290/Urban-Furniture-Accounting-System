import { Pencil, Trash2 } from "lucide-react";

function ProductCard({ product, onClick, onEdit, onDelete }) {
  const hasImage = Boolean(product.image);

  // Format currency
  const formatPrice = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val || "0";
    return num.toLocaleString("en-IN");
  };

  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white border border-[#e7e3da] rounded-xl p-5 shadow-xs hover:border-[#b8ad9e] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Product Image: Only shown if manually uploaded */}
        {hasImage && (
          <div className="w-full h-36 rounded-lg overflow-hidden bg-[#f5f2eb] border border-[#e7e3da] mb-3.5 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
            />
          </div>
        )}

        {/* Top badges: Category & Type & Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {product.category && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#faf8f4] text-[#716B63] border border-[#e7e3da]">
                {product.category}
              </span>
            )}
            {product.productType && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  product.productType === "Goods"
                    ? "bg-[#eef3e8] text-[#3e5335] border-[#d3dfca]"
                    : product.productType === "Service"
                    ? "bg-[#faf0e6] text-[#7a4e2d] border-[#e8d7c5]"
                    : "bg-[#f3effa] text-[#553c7b] border-[#dfd4f2]"
                }`}
              >
                {product.productType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => (onEdit || onClick)(product)}
              className="p-1 rounded-md text-[#716B63] hover:text-[#211D19] hover:bg-[#ebe6dc] transition cursor-pointer"
              title="Edit Product"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete && onDelete(product.id)}
              className="p-1 rounded-md text-[#716B63] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Delete Product"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-[#211D19] group-hover:text-[#4d3f35] transition leading-snug">
          {product.productName || "Untitled Product"}
        </h3>

        {/* Pricing Info */}
        <div className="mt-3.5 pt-3 border-t border-[#f5f2eb] space-y-1.5 text-sm">
          <div className="flex items-center justify-between text-[#211D19]">
            <span className="text-[#716B63]">Sales Price:</span>
            <span className="font-semibold">Rs. {formatPrice(product.salesPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-[#716B63]">
            <span>Cost:</span>
            <span className="font-medium text-[#211D19]">Rs. {formatPrice(product.cost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
