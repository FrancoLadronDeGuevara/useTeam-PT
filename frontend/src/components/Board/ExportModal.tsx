import { useState, FormEvent } from "react";
import { X, Mail } from "lucide-react";
import { exportAPI } from "../../services/api";
import { isValidEmail } from "../../utils/helpers";
import { ERROR_MESSAGES } from "../../utils/constants";
import toast from "react-hot-toast";

interface ExportModalProps {
  boardId: string;
  onClose: () => void;
}

const ExportModal = ({ boardId, onClose }: ExportModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!isValidEmail(email)) {
      toast.error(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    setIsSubmitting(true);
    try {
      await exportAPI.backlog({
        boardId,
        recipientEmail: email,
        fields: ["id", "title", "description", "column", "createdAt"],
      });

      toast.success(
        "📧 Solicitud de exportación enviada! Revisa tu email en breve.",
        {
          duration: 5000,
        }
      );
      onClose();
    } catch (error) {
      console.error("Error exportando backlog:", error);
      toast.error("❌ Error al exportar. Por favor, inténtalo de nuevo.", {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="text-green-500" size={28} />
            Exportar Backlog
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            Exporta todas las tareas de este tablero como un archivo CSV. El
            archivo será enviado a tu dirección de correo electrónico.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dirección de Correo *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.email@ejemplo.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2">
              Recibirás un archivo CSV con todas las tareas incluyendo: ID,
              Título, Descripción, Columna y Fecha de Creación.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!email.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Enviar Exportación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;
