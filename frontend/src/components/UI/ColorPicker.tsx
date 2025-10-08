import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

const ColorPicker = ({ value, onChange, label }: ColorPickerProps) => {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#64748b",
    "#6b7280",
    "#374151",
    "#ffffff",
    "#000000",
    "#e2e8f0",
    "#cbd5e1",
    "#94a3b8",
    "#475569",
    "#1e293b",
    "#0f172a",
  ];

  const [showColors, setShowColors] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowColors(false);
      }
    };

    if (showColors) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showColors]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>

      {/* Color Dropdown Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowColors(!showColors)}
          className="flex items-center gap-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <div
            className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 flex-shrink-0"
            style={{ backgroundColor: value }}
          >
            {value === "#ffffff" && (
              <div className="w-full h-full border border-slate-300 dark:border-slate-600 rounded"></div>
            )}
          </div>
          <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
            {value}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${
              showColors ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {showColors && (
          <div
            ref={dropdownRef}
            className="absolute bottom-full left-0 right-0 mb-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            <div className="p-3">
              <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-3">
                Seleccionar color
              </h4>
              <div className="grid grid-cols-8 gap-2.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      onChange(color);
                      setShowColors(false); // Close dropdown after selection
                    }}
                    className={`w-6 h-6 rounded-full border-2 ${
                      value === color
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                    } focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-colors`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
