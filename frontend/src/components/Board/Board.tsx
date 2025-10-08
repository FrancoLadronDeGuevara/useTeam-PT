import { useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Plus, Download } from "lucide-react";
import { useBoardContext } from "../../context/BoardContext";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { useModal } from "../../hooks/useModal";
import websocketService from "../../services/websocket";
import Column from "./Column";
import Card from "./Card";
import CreateColumnModal from "./CreateColumnModal";
import ExportModal from "./ExportModal";
import EditBoardModal from "../BoardList/EditBoardModal";

interface BoardProps {
  boardId: string;
}

const Board = ({ boardId }: BoardProps) => {
  const { currentBoard, fetchBoardWithData, loading } = useBoardContext();
  const { activeCard, handleDragStart, handleDragEnd } =
    useDragAndDrop(currentBoard);
  const createColumnModal = useModal();
  const exportModal = useModal();
  const editModal = useModal();

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
      // Conectar WebSocket solo una vez por pestaña
      websocketService.connect();
    }
  }, [boardId, fetchBoardWithData]);

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
          onClick={createColumnModal.openModal}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Agregar Columna
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={exportModal.openModal}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Download size={18} />
            Exportar Backlog
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
                  onClick={createColumnModal.openModal}
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
      {createColumnModal.isOpen && (
        <CreateColumnModal
          boardId={boardId}
          onClose={createColumnModal.closeModal}
        />
      )}

      {exportModal.isOpen && (
        <ExportModal boardId={boardId} onClose={exportModal.closeModal} />
      )}

      {/* Edit Board Modal */}
      {editModal.isOpen && currentBoard && (
        <EditBoardModal board={currentBoard} onClose={editModal.closeModal} />
      )}
    </div>
  );
};

export default Board;
