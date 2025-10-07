import { useState, MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Edit2 } from "lucide-react";
import { useBoardContext } from "../../context/BoardContext";
import EditCardModal from "./EditCardModal";
import type { ICard } from "../../types";

interface CardProps {
  card: ICard;
  isDragging?: boolean;
}

const Card = ({ card, isDragging = false }: CardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const { deleteCard } = useBoardContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isSortableDragging) return;
    if (window.confirm("Deseas eliminar esta tarjeta?")) {
      await deleteCard(card._id);
    }
  };

  const handleEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isSortableDragging) return;
    setShowEditModal(true);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-move border border-slate-200 group ${
          isDragging ? "shadow-xl" : ""
        }`}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-slate-900 flex-1 pr-2">
            {card.title}
          </h4>

          {/* Action Buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              disabled={isSortableDragging}
              className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
              title="Edit card"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isSortableDragging}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              title="Delete card"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Card Description */}
        {card.description && (
          <p className="text-sm text-slate-600 line-clamp-3">
            {card.description}
          </p>
        )}

        {/* Card Footer */}
        <div className="mt-3 text-xs text-slate-400">
          {new Date(card.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditCardModal card={card} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
};

export default Card;
