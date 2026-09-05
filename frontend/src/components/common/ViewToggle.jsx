import { List, LayoutGrid } from "lucide-react";

/**
 * Reusable toggle button group for switching between List View and Kanban View.
 */
function ViewToggle({ currentView, onChange }) {
  return (
    <div className="flex items-center bg-[#faf8f4] border border-[#e7e3da] p-1 rounded-xl">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
          currentView === "list"
            ? "bg-[#342921] text-white shadow-xs"
            : "text-[#6e6357] hover:text-[#24201a]"
        }`}
        title="List View"
      >
        <List size={14} />
        <span>List View</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("kanban")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
          currentView === "kanban"
            ? "bg-[#342921] text-white shadow-xs"
            : "text-[#6e6357] hover:text-[#24201a]"
        }`}
        title="Kanban View"
      >
        <LayoutGrid size={14} />
        <span>Kanban View</span>
      </button>
    </div>
  );
}

export default ViewToggle;
