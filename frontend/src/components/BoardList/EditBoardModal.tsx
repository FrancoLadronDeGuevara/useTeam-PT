import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useBoardContext } from "../../context/BoardContext";
import ColorPicker from "../UI/ColorPicker";
import toast from "react-hot-toast";
import type { IBoard } from "../../types";

interface EditBoardModalProps {
  board: IBoard;
  onClose: () => void;
}

const EditBoardModal = ({ board, onClose }: EditBoardModalProps) => {
  const { updateBoard } = useBoardContext();
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || "");
  const [primaryColor, setPrimaryColor] = useState(
    board.primaryColor || "#3b82f6"
  );
  const [backgroundColor, setBackgroundColor] = useState(
    board.backgroundColor || "#f8fafc"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(board.title);
    setDescription(board.description || "");
    setPrimaryColor(board.primaryColor || "#3b82f6");
    setBackgroundColor(board.backgroundColor || "#f8fafc");
  }, [board]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    setLoading(true);
    try {
      await updateBoard(board._id, {
        title: title.trim(),
        description: description.trim() || undefined,
        primaryColor,
        backgroundColor,
      });
      onClose();
    } catch (error) {
      console.error("Error actualizando tablero:", error);
      toast.error("Error al actualizar el tablero");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Editar Tablero
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Nombre del tablero"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
                placeholder="Descripción del tablero (opcional)"
                rows={3}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Personalización de colores
              </h3>

              <ColorPicker
                value={primaryColor}
                onChange={setPrimaryColor}
                label="Color de Borde"
              />

              <ColorPicker
                value={backgroundColor}
                onChange={setBackgroundColor}
                label="Color de fondo"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBoardModal;
