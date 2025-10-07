import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { Plus, Download, Trash2 } from "lucide-react";
import { useBoardContext } from "../../context/BoardContext";
import Column from "./Column";
import Card from "./Card";
import CreateColumnModal from "./CreateColumnModal";
import ExportModal from "./ExportModal";
import type { ICard, IColumnWithCards } from "../../types";

interface BoardProps {
  boardId: string;
}

const Board = ({ boardId }: BoardProps) => {
  const { currentBoard, fetchBoardWithData, moveCard, loading, deleteBoard } =
    useBoardContext();
  const [activeCard, setActiveCard] = useState<ICard | null>(null);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (boardId) {
      fetchBoardWithData(boardId);
    }
  }, [boardId, fetchBoardWithData]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = findCard(active.id as string);
    setActiveCard(card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeCardId = active.id as string;
    const overCardId = over.id as string;

    if (activeCardId === overCardId) {
      setActiveCard(null);
      return;
    }

    const activeColumn = findColumnByCardId(activeCardId);
    const overColumn =
      findColumnByCardId(overCardId) || findColumnById(overCardId);

    if (!activeColumn || !overColumn) {
      setActiveCard(null);
      return;
    }

    // dnd-kit suministra el índice sortable en data.current; lo tratamos como opcional
    type SortableData = { current?: { sortable?: { index?: number } } };
    const activeSortableIndex = (
      active.data as unknown as SortableData | undefined
    )?.current?.sortable?.index;
    const overSortableIndex = (over.data as unknown as SortableData | undefined)
      ?.current?.sortable?.index;

    const activeCardIndex =
      typeof activeSortableIndex === "number"
        ? activeSortableIndex
        : activeColumn.cards.findIndex((c) => c._id === activeCardId);
    let overCardIndex =
      typeof overSortableIndex === "number"
        ? overSortableIndex
        : overColumn.cards.findIndex((c) => c._id === overCardId);

    console.log("Index calculation:", {
      activeCardId,
      activeSortableIndex,
      activeCardIndex,
      overCardId,
      overSortableIndex,
      overCardIndex,
      activeColumnCards: activeColumn.cards.map((c) => c._id),
      overColumnCards: overColumn.cards.map((c) => c._id),
    });

    // Calcular índice destino correctamente:
    // - Si el "over" es la columna (soltar en el contenedor), colocar al final
    // - Si la columna está vacía, índice 0
    // - Si "over" es una card, usar su índice como base
    const isOverColumn = overColumn._id === overCardId;

    if (isOverColumn) {
      // Soltar en el contenedor de la columna
      if (activeColumn._id === overColumn._id) {
        // misma columna → al final (último índice válido)
        overCardIndex = Math.max(0, overColumn.cards.length - 1);
      } else {
        // columna distinta → apendea al final
        overCardIndex = overColumn.cards.length;
      }
    } else if (overCardIndex === -1) {
      // Columna vacía
      overCardIndex = 0;
    }

    // Validar que las posiciones sean válidas
    if (activeCardIndex < 0 || overCardIndex < 0) {
      console.error("Invalid positions:", { activeCardIndex, overCardIndex });
      setActiveCard(null);
      return;
    }

    console.log("Moving card with data:", {
      cardId: activeCardId,
      sourceColumnId: activeColumn._id,
      destinationColumnId: overColumn._id,
      sourcePosition: activeCardIndex,
      destinationPosition: overCardIndex,
    });

    try {
      await moveCard({
        cardId: activeCardId,
        sourceColumnId: activeColumn._id,
        destinationColumnId: overColumn._id,
        sourcePosition: activeCardIndex,
        destinationPosition: overCardIndex,
      });
    } catch (error) {
      console.error("Error moving card:", error);
    }

    setActiveCard(null);
  };

  const findCard = (cardId: string): ICard | null => {
    if (!currentBoard) return null;
    for (const column of currentBoard.columns) {
      const card = column.cards.find((c) => c._id === cardId);
      if (card) return card;
    }
    return null;
  };

  const findColumnByCardId = (cardId: string): IColumnWithCards | undefined => {
    if (!currentBoard) return undefined;
    return currentBoard.columns.find((col) =>
      col.cards.some((card) => card._id === cardId)
    );
  };

  const findColumnById = (columnId: string): IColumnWithCards | undefined => {
    if (!currentBoard) return undefined;
    return currentBoard.columns.find((col) => col._id === columnId);
  };

  if (loading || !currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Board Actions */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setShowCreateColumnModal(true)}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Agregar Columna
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Download size={18} />
            Exportar Backlog
          </button>
          <button
            onClick={async () => {
              if (window.confirm("Deseas eliminar este tablero?")) {
                await deleteBoard(currentBoard._id);
              }
            }}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Trash2 size={18} />
            Eliminar Tablero
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {currentBoard.columns.map((column) => (
            <Column key={column._id} column={column} />
          ))}

          {currentBoard.columns.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  No hay columnas creadas
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Agrega una nueva columna para comenzar
                </p>
                <button
                  onClick={() => setShowCreateColumnModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  Agregar Columna
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <div className="opacity-90">
              <Card card={activeCard} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      {showCreateColumnModal && (
        <CreateColumnModal
          boardId={boardId}
          onClose={() => setShowCreateColumnModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          boardId={boardId}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default Board;
