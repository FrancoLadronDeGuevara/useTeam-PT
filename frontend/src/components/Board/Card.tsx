import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBoardContext } from "../../context/BoardContext";
import { formatDate } from "../../utils/helpers";
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
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card._id });

  // Combinar las refs para drag & drop y estilos personalizados
  const combinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    cardRef.current = node;
  };

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

  // Ajustar colores para modo oscuro si no hay colores personalizados
  const isCustomColors =
    (card.backgroundColor && card.backgroundColor !== "#ffffff") ||
    (card.textColor && card.textColor !== "#000000");

  // Estilos dinámicos basados en los colores de la tarjeta
  const cardStyle = {
    backgroundColor:
      card.backgroundColor || (isCustomColors ? "#ffffff" : undefined),
    color: card.textColor || (isCustomColors ? "#000000" : undefined),
    borderColor: card.backgroundColor || "#e2e8f0",
  };

  // Aplicar estilos CSS directamente para sobrescribir Tailwind
  useEffect(() => {
    if (cardRef.current && isCustomColors) {
      if (card.backgroundColor) {
        cardRef.current.style.setProperty(
          "background-color",
          card.backgroundColor,
          "important"
        );
      }
      if (card.textColor) {
        cardRef.current.style.setProperty("color", card.textColor, "important");
      }

      // También aplicar a todos los elementos hijos
      const titleElement = cardRef.current.querySelector("h4") as HTMLElement;
      const descriptionElement = cardRef.current.querySelector(
        "p"
      ) as HTMLElement;
      const footerElement = cardRef.current.querySelector(
        ".text-xs"
      ) as HTMLElement;

      if (titleElement && card.textColor) {
        titleElement.style.setProperty("color", card.textColor, "important");
      }
      if (descriptionElement && card.textColor) {
        descriptionElement.style.setProperty(
          "color",
          card.textColor,
          "important"
        );
      }
      if (footerElement && card.textColor) {
        footerElement.style.setProperty("color", card.textColor, "important");
      }
    }
  }, [card.backgroundColor, card.textColor, isCustomColors]);

  return (
    <>
      <div
        ref={combinedRef}
        {...attributes}
        {...listeners}
        className={`rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-move border group ${
          !isCustomColors
            ? "bg-white dark:bg-slate-800 dark:border-slate-600 dark:shadow-slate-900/20 dark:hover:shadow-slate-900/30"
            : ""
        } ${isDragging ? "shadow-xl" : ""}`}
        style={{
          ...style,
          // Solo aplicar estilos de color si hay colores personalizados
          ...(isCustomColors && cardStyle),
        }}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-2">
          <h4
            className={`font-semibold flex-1 pr-2 ${
              isCustomColors ? "" : "text-slate-900 dark:text-white"
            }`}
          >
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
          <p
            className={`text-sm line-clamp-3 ${
              isCustomColors
                ? "opacity-80"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {card.description}
          </p>
        )}

        {/* Card Footer */}
        <div
          className={`mt-3 text-xs ${
            isCustomColors ? "opacity-60" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {formatDate(card.createdAt)}
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
