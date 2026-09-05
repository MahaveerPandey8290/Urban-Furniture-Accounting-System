import { useState } from "react";
import { X, Plus } from "lucide-react";

function CategoryModal({ isOpen, onClose, onCreateCategory, existingCategories = [] }) {
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = categoryName.trim();
    if (!trimmed) {
      setError("Category Name cannot be empty");
      return;
    }

    const duplicate = existingCategories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError("This category already exists");
      return;
    }

    onCreateCategory(trimmed);
    setCategoryName("");
    setError("");
    onClose();
  };

  const handleCancel = () => {
    setCategoryName("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-[#e7e3da] shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ece4]">
          <h3 className="text-lg font-semibold text-[#211D19]">Create New Category</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="text-[#716B63] hover:text-[#211D19] transition cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#211D19] mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Living Room or Modular Desks"
              className={`w-full h-10 px-3.5 rounded-lg border ${
                error ? "border-red-400 focus:border-red-500" : "border-[#cfc6b6] focus:border-[#342921]"
              } bg-white text-sm text-[#211D19] outline-none transition`}
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0ece4]">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4.5 py-2 rounded-lg border border-[#e7e3da] text-sm font-medium text-[#716B63] hover:text-[#211D19] hover:bg-[#faf8f4] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-lg bg-[#342921] text-white text-sm font-medium hover:bg-[#231b15] transition cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;
