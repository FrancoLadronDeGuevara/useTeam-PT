import { ArrowLeft, Users } from "lucide-react";
import { useBoardContext } from "../../context/BoardContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

/**
 * Props del componente Header.
 */
interface HeaderProps {
  selectedBoardId: string | null;
  onBackToBoards: () => void;
}

/**
 * Componente Header que muestra la información del tablero actual
 * y el estado de conexión de usuarios.
 *
 * Se adapta dinámicamente según si hay un tablero seleccionado o no.
 */
const Header = ({ selectedBoardId, onBackToBoards }: HeaderProps) => {
  const { currentBoard, connectedUsers } = useBoardContext();

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 p-4">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Lado izquierdo - Navegación y título */}
          <div className="flex items-center gap-4">
            {selectedBoardId && (
              <button
                onClick={onBackToBoards}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Volver a Tableros</span>
              </button>
            )}

            {!selectedBoardId && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Tablero de Kanban
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Organiza tu trabajo de manera eficiente
                </p>
              </div>
            )}

            {selectedBoardId && currentBoard && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentBoard.title}
                </h1>
                {currentBoard.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {currentBoard.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Lado derecho - Usuarios conectados y switch de tema */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {connectedUsers > 0 && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full dark:bg-green-900/20 dark:text-green-400">
                <Users size={24} />
                <span className="font-medium">{connectedUsers} conectados</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
