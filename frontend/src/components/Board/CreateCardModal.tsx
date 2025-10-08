import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import { useBoardContext } from "../../context/BoardContext";
import ColorPicker from "../UI/ColorPicker";

interface CreateCardModalProps {
  columnId: string;
  onClose: () => void;
}

const CreateCardModal = ({ columnId, onClose }: CreateCardModalProps) => {
  const { createCard } = useBoardContext();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    backgroundColor: "#ffffff",
    textColor: "#000000",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await createCard({
        ...formData,
        columnId,
      });
      onClose();
    } catch (error) {
      console.error("Error creando tarjeta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Crear Tarjeta</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Título de la Tarjeta *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="ej., Arreglar error de login"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Agregar más detalles..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-700">Colores</h3>

              <div className="grid grid-cols-2 gap-3">
                <ColorPicker
                  value={formData.backgroundColor}
                  onChange={(color) =>
                    setFormData({ ...formData, backgroundColor: color })
                  }
                  label="Fondo"
                />

                <ColorPicker
                  value={formData.textColor}
                  onChange={(color) =>
                    setFormData({ ...formData, textColor: color })
                  }
                  label="Texto"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isSubmitting}
              className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? "Creando..." : "Crear Tarjeta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCardModal;
