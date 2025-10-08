import { useBoardContext } from "../../context/BoardContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

/**
 * Props del componente Header.
 */
interface HeaderProps {
  selectedBoardId: string | null;
}

/**
 * Componente Header simplificado que solo muestra el título y eslogan.
 * Estilo similar a Trello con diseño limpio y minimalista.
 */
const Header = ({ selectedBoardId }: HeaderProps) => {
  const { currentBoard } = useBoardContext();

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Título y eslogan */}
          <div className="flex items-center gap-4">
            {!selectedBoardId && (
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Tablero de Kanban
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  Organiza tu trabajo de manera eficiente
                </p>
              </div>
            )}

            {selectedBoardId && currentBoard && (
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {currentBoard.title}
                </h1>
                {currentBoard.description && (
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    {currentBoard.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Switch de tema */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
