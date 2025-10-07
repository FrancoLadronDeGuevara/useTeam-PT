import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBoardContext } from "../../context/BoardContext";
import EditCardModal from "./EditCardModal";
import KebabMenu from "../UI/KebabMenu";
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

  const handleDelete = async () => {
    if (isSortableDragging) return;
    if (window.confirm("¿Deseas eliminar esta tarjeta?")) {
      await deleteCard(card._id);
    }
  };

  const handleEdit = () => {
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
        className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md dark:shadow-slate-900/20 dark:hover:shadow-slate-900/30 transition-all cursor-move border border-slate-200 dark:border-slate-600 group ${
          isDragging ? "shadow-xl dark:shadow-slate-900/40" : ""
        }`}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-slate-900 dark:text-white flex-1 pr-2">
            {card.title}
          </h4>

          {/* Kebab Menu */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <KebabMenu
              onEdit={handleEdit}
              onDelete={handleDelete}
              editLabel="Editar tarjeta"
              deleteLabel="Eliminar tarjeta"
            />
          </div>
        </div>

        {/* Card Description */}
        {card.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
            {card.description}
          </p>
        )}

        {/* Card Footer */}
        <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">
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
