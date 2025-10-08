/**
 * Funciones de utilidad para la aplicación.
 *
 * Contiene funciones helper reutilizables que no dependen
 * de React hooks y pueden ser utilizadas en cualquier parte de la aplicación.
 */

import type { ICard, IColumnWithCards } from "../types";

/**
 * Genera un ID temporal único para actualizaciones optimistas.
 *
 * @returns ID temporal único
 */
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extrae el ID de columna de un valor que puede ser string o objeto.
 *
 * Maneja tanto strings como ObjectId que vienen del backend.
 * Esto es necesario porque el backend puede devolver columnId como ObjectId
 * pero el frontend siempre espera strings.
 *
 * @param columnId - ID de columna (string o objeto con _id)
 * @returns ID de columna como string
 */
export const getColumnId = (
  columnId: string | { _id: string; title: string }
): string => {
  return typeof columnId === "string" ? columnId : columnId._id;
};

/**
 * Formatea una fecha para mostrar en la UI.
 *
 * @param dateString - Fecha en formato ISO string
 * @returns Fecha formateada para mostrar
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Valida si un email tiene formato válido.
 *
 * @param email - Email a validar
 * @returns true si el email es válido, false en caso contrario
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Función debounce para optimizar llamadas frecuentes.
 *
 * @param func - Función a aplicar debounce
 * @param delay - Retraso en milisegundos
 * @returns Función con debounce aplicado
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Función throttle para limitar la frecuencia de ejecución.
 *
 * @param func - Función a aplicar throttle
 * @param limit - Límite en milisegundos
 * @returns Función con throttle aplicado
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Busca una tarjeta por su ID en todas las columnas de un tablero.
 *
 * @param board - Tablero con columnas y tarjetas
 * @param cardId - ID de la tarjeta a buscar
 * @returns La tarjeta encontrada o null si no existe
 */
export const findCardInBoard = (
  board: { columns: IColumnWithCards[] } | null,
  cardId: string
): ICard | null => {
  if (!board) return null;

  for (const column of board.columns) {
    const card = column.cards.find((c) => c._id === cardId);
    if (card) return card;
  }
  return null;
};

/**
 * Busca la columna que contiene una tarjeta específica.
 *
 * @param board - Tablero con columnas y tarjetas
 * @param cardId - ID de la tarjeta
 * @returns La columna que contiene la tarjeta o undefined si no se encuentra
 */
export const findColumnByCardId = (
  board: { columns: IColumnWithCards[] } | null,
  cardId: string
): IColumnWithCards | undefined => {
  if (!board) return undefined;

  return board.columns.find((col) =>
    col.cards.some((card) => card._id === cardId)
  );
};

/**
 * Busca una columna por su ID.
 *
 * @param board - Tablero con columnas y tarjetas
 * @param columnId - ID de la columna
 * @returns La columna encontrada o undefined si no existe
 */
export const findColumnById = (
  board: { columns: IColumnWithCards[] } | null,
  columnId: string
): IColumnWithCards | undefined => {
  if (!board) return undefined;

  return board.columns.find((col) => col._id === columnId);
};

/**
 * Clona un objeto de forma profunda.
 *
 * @param obj - Objeto a clonar
 * @returns Objeto clonado
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array)
    return obj.map((item) => deepClone(item)) as unknown as T;
  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Genera un color aleatorio para avatares o elementos visuales.
 *
 * @returns Color hexadecimal
 */
export const generateRandomColor = (): string => {
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
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
