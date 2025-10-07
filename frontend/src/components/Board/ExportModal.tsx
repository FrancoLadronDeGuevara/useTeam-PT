import { useState, FormEvent } from "react";
import { X, Mail } from "lucide-react";
import { exportAPI } from "../../services/api";
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

    setIsSubmitting(true);
    try {
      await exportAPI.backlog({
        boardId,
        recipientEmail: email,
        fields: ["id", "title", "description", "column", "createdAt"],
      });

      toast.success("Export request sent! Check your email shortly.", {
        duration: 5000,
        icon: "📧",
      });
      onClose();
    } catch (error) {
      console.error("Error exporting backlog:", error);
      toast.error("Failed to export backlog. Please try again.");
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
            Export Backlog
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
            Export all tasks from this board as a CSV file. The file will be
            sent to your email address.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2">
              You'll receive a CSV file with all tasks including: ID, Title,
              Description, Column, and Created Date.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Export"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;
