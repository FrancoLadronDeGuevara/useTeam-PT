/**
 * Constantes de la aplicación.
 *
 * Centraliza todas las constantes utilizadas en la aplicación
 * para facilitar el mantenimiento y evitar valores mágicos.
 */

// Configuración de la API
export const API_CONFIG = {
  DEFAULT_URL: "http://localhost:3000",
  WS_URL: "ws://localhost:3000",
  TIMEOUT: 10000,
} as const;

// Configuración de WebSocket
export const WS_CONFIG = {
  RECONNECTION_DELAY: 1000,
  RECONNECTION_ATTEMPTS: 5,
  TRANSPORTS: ["websocket"] as const,
} as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DURATION: {
    SUCCESS: 3000,
    ERROR: 4000,
    EXPORT: 5000,
    USER_CONNECTED: 2000,
  },
} as const;

// Configuración de arrastrar y soltar
export const DRAG_CONFIG = {
  ACTIVATION_DISTANCE: 8,
  COLLISION_DETECTION: "closestCorners",
} as const;

// Configuración de UI
export const UI_CONFIG = {
  MODAL_Z_INDEX: 50,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "Este campo es obligatorio",
  NETWORK_ERROR: "Error de conexión. Por favor, inténtalo de nuevo.",
  UNKNOWN_ERROR: "Ha ocurrido un error inesperado",
  VALIDATION_ERROR: "Por favor, revisa los datos ingresados",
} as const;

// Mensajes de éxito comunes
export const SUCCESS_MESSAGES = {
  BOARD_CREATED: "✅ Tablero creado exitosamente",
  BOARD_UPDATED: "✏️ Tablero actualizado exitosamente",
  BOARD_DELETED: "🗑️ Tablero eliminado",
  COLUMN_CREATED: "➕ Columna creada",
  COLUMN_UPDATED: "✏️ Columna actualizada exitosamente",
  COLUMN_DELETED: "🗑️ Columna eliminada",
  CARD_CREATED: "➕ Tarjeta creada",
  CARD_UPDATED: "✏️ Tarjeta actualizada",
  CARD_DELETED: "🗑️ Tarjeta eliminada",
  CARD_MOVED: "↔️ Tarjeta movida",
  EXPORT_REQUESTED:
    "📧 Solicitud de exportación enviada! Revisa tu email en breve.",
} as const;
