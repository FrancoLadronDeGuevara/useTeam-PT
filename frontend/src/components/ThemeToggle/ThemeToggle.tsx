import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

/**
 * Componente ThemeToggle que permite cambiar entre tema claro y oscuro.
 * Incluye un switch animado con iconos de sol y luna.
 */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 transition-colors duration-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
      aria-label={`Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
          theme === "dark" ? "translate-x-7" : "translate-x-1"
        }`}
      >
        <div className="flex h-full w-full items-center justify-center">
          {theme === "light" ? (
            <Sun size={14} className="text-yellow-500" />
          ) : (
            <Moon size={14} className="text-slate-600" />
          )}
        </div>
      </span>
    </button>
  );
};

export default ThemeToggle;
