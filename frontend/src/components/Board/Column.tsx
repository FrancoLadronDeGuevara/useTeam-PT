import { useState, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import Card from "./Card";
import CreateCardModal from "./CreateCardModal";
import EditColumnModal from "./EditColumnModal";
import KebabMenu from "../UI/KebabMenu";
import type { IColumnWithCards } from "../../types";
import { useBoardContext } from "../../context/BoardContext";

interface ColumnProps {
  column: IColumnWithCards;
}

const Column = ({ column }: ColumnProps) => {
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { deleteColumn } = useBoardContext();
  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  // Memoizar los IDs de las tarjetas para evitar re-renders innecesarios
  const cardIds = useMemo(
    () => column.cards.map((card) => card._id),
    [column.cards]
  );

  const handleDeleteColumn = async () => {
    if (
      window.confirm(
        "¿Deseas eliminar esta columna? Se eliminarán todas las tarjetas que contenga."
      )
    ) {
      await deleteColumn(column._id);
    }
  };

  const handleEditColumn = () => {
    setShowEditModal(true);
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 h-full">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            {column.title}
            <span className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2 py-1 rounded-full">
              {column.cards.length}
            </span>
          </h3>
          <KebabMenu
            onEdit={handleEditColumn}
            onDelete={handleDeleteColumn}
            editLabel="Editar columna"
            deleteLabel="Eliminar columna"
          />
        </div>

        {/* Cards Container */}
        <div ref={setNodeRef} className="space-y-3 min-h-[100px]">
          <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
          >
            {column.cards.map((card) => (
              <Card key={card._id} card={card} />
            ))}
          </SortableContext>

          {/* Empty State */}
          {column.cards.length === 0 && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <p className="text-sm">No hay tarjetas en esta columna</p>
            </div>
          )}
        </div>

        {/* Add Card Button */}
        <button
          onClick={() => setShowCreateCardModal(true)}
          className="w-full mt-3 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Agregar Tarjeta
        </button>
      </div>

      {/* Create Card Modal */}
      {showCreateCardModal && (
        <CreateCardModal
          columnId={column._id}
          onClose={() => setShowCreateCardModal(false)}
        />
      )}

      {/* Edit Column Modal */}
      {showEditModal && (
        <EditColumnModal
          column={column}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default Column;
