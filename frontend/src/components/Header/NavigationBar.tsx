import { ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { useBoardContext } from "../../context/BoardContext";

/**
 * Props del componente NavigationBar.
 */
interface NavigationBarProps {
  selectedBoardId: string | null;
  onBackToBoards: () => void;
}

/**
 * Barra de navegación que se muestra debajo del header.
 * Incluye el botón de volver y los usuarios conectados.
 * Estilo similar a Trello con información contextual.
 */
const NavigationBar = ({
  selectedBoardId,
  onBackToBoards,
}: NavigationBarProps) => {
  const { connectedUsers } = useBoardContext();

  return (
    <nav className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Lado izquierdo - Navegación */}
          <div className="flex items-center gap-4">
            {selectedBoardId && (
              <button
                onClick={onBackToBoards}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md transition-colors duration-200"
              >
                <ArrowLeft size={18} />
                <span className="font-medium text-sm">Volver a Tableros</span>
              </button>
            )}
          </div>

          {/* Lado derecho - Usuarios conectados */}
          <div className="flex items-center gap-3">
            {connectedUsers > 0 ? (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-md dark:bg-green-900/20 dark:text-green-400">
                <Wifi size={16} />
                <span className="text-sm font-medium">
                  {connectedUsers} conectados
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-3 py-2 rounded-md dark:bg-slate-600 dark:text-slate-400">
                <WifiOff size={16} />
                <span className="text-sm font-medium">Sin conexión</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
