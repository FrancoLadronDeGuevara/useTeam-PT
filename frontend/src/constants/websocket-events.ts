// Eventos del cliente al servidor
export const WS_CLIENT_EVENTS = {
  // Board
  BOARD_JOIN: "board:join",
  BOARD_LEAVE: "board:leave",
  BOARD_UPDATE: "board:update",

  // Cards
  CARD_CREATE: "card:create",
  CARD_UPDATE: "card:update",
  CARD_DELETE: "card:delete",
  CARD_MOVE: "card:move",

  // Columns
  COLUMN_CREATE: "column:create",
  COLUMN_UPDATE: "column:update",
  COLUMN_DELETE: "column:delete",
} as const;

// Eventos del servidor al cliente
export const WS_SERVER_EVENTS = {
  // Users
  USER_CONNECTED: "user-connected",
  USER_DISCONNECTED: "user-disconnected",

  // Board
  BOARD_UPDATED: "board:updated",

  // Cards
  CARD_CREATED: "card:created",
  CARD_UPDATED: "card:updated",
  CARD_DELETED: "card:deleted",
  CARD_MOVED: "card:moved",

  // Columns
  COLUMN_CREATED: "column:created",
  COLUMN_UPDATED: "column:updated",
  COLUMN_DELETED: "column:deleted",

  // Errors
  ERROR: "error",
} as const;

export type ClientEvent =
  (typeof WS_CLIENT_EVENTS)[keyof typeof WS_CLIENT_EVENTS];
export type ServerEvent =
  (typeof WS_SERVER_EVENTS)[keyof typeof WS_SERVER_EVENTS];
