import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Trash2 } from "lucide-react";
import Card from "./Card";
import CreateCardModal from "./CreateCardModal";
import type { IColumnWithCards } from "../../types";
import { useBoardContext } from "../../context/BoardContext";

interface ColumnProps {
  column: IColumnWithCards;
}

const Column = ({ column }: ColumnProps) => {
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const { deleteColumn } = useBoardContext();
  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  const cardIds = column.cards.map((card) => card._id);

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-slate-100 rounded-xl p-4 h-full">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            {column.title}
            <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full">
              {column.cards.length}
            </span>
          </h3>
          <button
            onClick={async () => {
              if (
                window.confirm(
                  "Deseas eliminar esta columna? Se eliminarán sus tarjetas."
                )
              ) {
                await deleteColumn(column._id);
              }
            }}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            title="Delete column"
          >
            <Trash2 size={16} />
          </button>
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
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No hay tarjetas en esta columna</p>
            </div>
          )}
        </div>

        {/* Add Card Button */}
        <button
          onClick={() => setShowCreateCardModal(true)}
          className="w-full mt-3 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 py-2 rounded-lg transition-colors"
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
    </div>
  );
};

export default Column;
