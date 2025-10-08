/**
 * Eventos WebSocket del cliente al servidor
 */
export const WS_CLIENT_EVENTS = {
  // Board events
  BOARD_JOIN: "board:join",
  BOARD_LEAVE: "board:leave",
  BOARD_CREATE: "board:create",
  BOARD_UPDATE: "board:update",
  BOARD_DELETE: "board:delete",

  // Card events
  CARD_CREATE: "card:create",
  CARD_UPDATE: "card:update",
  CARD_DELETE: "card:delete",
  CARD_MOVE: "card:move",

  // Column events
  COLUMN_CREATE: "column:create",
  COLUMN_UPDATE: "column:update",
  COLUMN_DELETE: "column:delete",
} as const;

/**
 * Eventos WebSocket del servidor al cliente
 */
export const WS_SERVER_EVENTS = {
  // User events
  USER_CONNECTED: "user-connected",
  USER_DISCONNECTED: "user-disconnected",

  // Board events
  BOARD_CREATED: "board:created",
  BOARD_UPDATED: "board:updated",
  BOARD_DELETED: "board:deleted",

  // Card events
  CARD_CREATED: "card:created",
  CARD_UPDATED: "card:updated",
  CARD_DELETED: "card:deleted",
  CARD_MOVED: "card:moved",

  // Column events
  COLUMN_CREATED: "column:created",
  COLUMN_UPDATED: "column:updated",
  COLUMN_DELETED: "column:deleted",

  // Error events
  ERROR: "error",
} as const;

/**
 * Tipos TypeScript derivados de las constantes
 * Proporcionan type safety completo
 */
export type ClientEvent =
  (typeof WS_CLIENT_EVENTS)[keyof typeof WS_CLIENT_EVENTS];
export type ServerEvent =
  (typeof WS_SERVER_EVENTS)[keyof typeof WS_SERVER_EVENTS];
