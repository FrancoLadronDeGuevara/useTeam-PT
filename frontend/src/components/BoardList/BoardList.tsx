import { useEffect, useState } from "react";
import { Plus, LayoutGrid } from "lucide-react";
import { useBoardContext } from "../../context/BoardContext";
import { formatDate } from "../../utils/helpers";
import CreateBoardModal from "./CreateBoardModal";
import EditBoardModal from "./EditBoardModal";
import KebabMenu from "../UI/KebabMenu";

interface BoardListProps {
  onSelectBoard: (boardId: string) => void;
}

const BoardList = ({ onSelectBoard }: BoardListProps) => {
  const { boards, loading, fetchBoards, deleteBoard } = useBoardContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<any>(null);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleDeleteBoard = async (boardId: string) => {
    if (window.confirm("¿Deseas eliminar este tablero?")) {
      await deleteBoard(boardId);
    }
  };

  const handleEditBoard = (board: any) => {
    setSelectedBoard(board);
    setShowEditModal(true);
  };

  if (loading && boards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <LayoutGrid
              className="text-blue-500 dark:text-blue-400"
              size={32}
            />
            Tus Tableros
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Selecciona un tablero para comenzar
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Crear Tablero
        </button>
      </div>

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-slate-900/20">
          <LayoutGrid
            size={64}
            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
          />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Sin Tableros
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Crea un tablero para comenzar a organizar tus ideas.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Crea tu primer tablero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => {
            // Estilos dinámicos basados en los colores del tablero
            const boardStyle = {
              backgroundColor: board.backgroundColor || "#ffffff",
              borderColor: board.primaryColor || "#3b82f6",
            };

            const isCustomColors =
              board.backgroundColor && board.backgroundColor !== "#ffffff";
            const darkModeClasses = !isCustomColors
              ? "dark:bg-slate-800 dark:shadow-slate-900/20 dark:hover:shadow-slate-900/30 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
              : "hover:shadow-lg";

            return (
              <div
                key={board._id}
                style={boardStyle}
                className={`rounded-xl shadow-sm hover:shadow-md transition-all border-2 p-6 group relative ${darkModeClasses}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3
                    onClick={() => onSelectBoard(board._id)}
                    className={`text-xl font-bold transition-colors cursor-pointer flex-1 pr-2 ${
                      isCustomColors
                        ? "text-slate-900 hover:text-slate-700"
                        : "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    }`}
                  >
                    {board.title}
                  </h3>
                  <KebabMenu
                    onEdit={() => handleEditBoard(board)}
                    onDelete={() => handleDeleteBoard(board._id)}
                    editLabel="Editar tablero"
                    deleteLabel="Eliminar tablero"
                  />
                </div>

                {board.description && (
                  <p
                    className={`text-sm line-clamp-2 mb-4 ${
                      isCustomColors
                        ? "text-slate-700 opacity-80"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {board.description}
                  </p>
                )}

                <div
                  className={`text-xs ${
                    isCustomColors
                      ? "text-slate-600 opacity-60"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Creado {formatDate(board.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Edit Board Modal */}
      {showEditModal && selectedBoard && (
        <EditBoardModal
          board={selectedBoard}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBoard(null);
          }}
        />
      )}
    </div>
  );
};

export default BoardList;
