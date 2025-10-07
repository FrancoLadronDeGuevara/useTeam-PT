import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface KebabMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
}

const KebabMenu = ({
  onEdit,
  onDelete,
  editLabel = "Editar",
  deleteLabel = "Eliminar",
  className = "",
}: KebabMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleEdit = () => {
    onEdit();
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-700"
        aria-label="Más opciones"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg py-1 min-w-[140px]">
          <button
            onClick={handleEdit}
            className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            {editLabel}
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors whitespace-nowrap"
          >
            {deleteLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default KebabMenu;
