import { ArrowLeft, Users } from "lucide-react";
import { useBoardContext } from "../../context/BoardContext";

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
    <header className="bg-white shadow-sm border-b border-slate-200 p-4">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Lado izquierdo - Navegación y título */}
          <div className="flex items-center gap-4">
            {selectedBoardId && (
              <button
                onClick={onBackToBoards}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Volver a Tableros</span>
              </button>
            )}

            {!selectedBoardId && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Tablero de Kanban
                </h1>
                <p className="text-sm text-slate-600">
                  Organiza tu trabajo de manera eficiente
                </p>
              </div>
            )}

            {selectedBoardId && currentBoard && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {currentBoard.title}
                </h1>
                {currentBoard.description && (
                  <p className="text-sm text-slate-600">
                    {currentBoard.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Lado derecho - Usuarios conectados */}
          {connectedUsers > 0 && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <Users size={24} />
              <span className="font-medium">{connectedUsers} conectados</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
