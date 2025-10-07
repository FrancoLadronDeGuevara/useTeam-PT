import { io, Socket } from "socket.io-client";
import {
  WS_CLIENT_EVENTS,
  WS_SERVER_EVENTS,
  ServerEvent,
} from "../constants/websocket-events";
import type {
  CreateCardDto,
  UpdateCardDto,
  CreateColumnDto,
  MoveCardDto,
  ICard,
} from "../types";

/**
 * Servicio de WebSocket para sincronización en tiempo real.
 *
 * Maneja la conexión con el servidor WebSocket y proporciona métodos
 * para enviar y recibir eventos de sincronización entre usuarios.
 */
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Array<(payload: unknown) => void>> = new Map();

  /**
   * Establece la conexión con el servidor WebSocket.
   *
   * Si ya existe una conexión activa, la reutiliza.
   * Configura reconexión automática y reattacha los listeners existentes.
   */
  connect(): Socket {
    if (this.socket?.connected) {
      console.log("WebSocket ya está conectado");
      return this.socket;
    }

    this.socket = io(WS_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Reattachamos los listeners guardados para esta instancia del socket
    for (const [event, callbacks] of this.listeners.entries()) {
      callbacks.forEach((cb) => this.socket?.on(event, cb));
    }

    this.socket.on("connect", () => {
      console.log("WebSocket conectado:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket desconectado");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Error de conexión WebSocket:", error);
    });

    return this.socket;
  }

  /**
   * Desconecta el WebSocket y limpia todos los listeners.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Se une a un tablero específico para recibir notificaciones de cambios.
   */
  joinBoard(boardId: string): void {
    console.log("WebSocket: Uniéndose al tablero", boardId);
    this.socket?.emit(WS_CLIENT_EVENTS.BOARD_JOIN, { boardId });
  }

  /**
   * Sale de un tablero específico, dejando de recibir notificaciones.
   */
  leaveBoard(boardId: string): void {
    this.socket?.emit(WS_CLIENT_EVENTS.BOARD_LEAVE, { boardId });
  }

  /**
   * Notifica la creación de una tarjeta a otros usuarios.
   */
  createCard(data: CreateCardDto | ICard): void {
    this.socket?.emit(WS_CLIENT_EVENTS.CARD_CREATE, data);
  }

  /**
   * Notifica la actualización de una tarjeta a otros usuarios.
   */
  updateCard(id: string, updates: UpdateCardDto): void {
    this.socket?.emit(WS_CLIENT_EVENTS.CARD_UPDATE, { id, updates });
  }

  /**
   * Notifica la eliminación de una tarjeta a otros usuarios.
   */
  deleteCard(id: string, boardId?: string): void {
    this.socket?.emit(WS_CLIENT_EVENTS.CARD_DELETE, { id, boardId });
  }

  /**
   * Notifica el movimiento de una tarjeta a otros usuarios.
   */
  moveCard(data: MoveCardDto & { boardId?: string }): void {
    console.log("WebSocket: Emitiendo evento card:move", data);
    this.socket?.emit(WS_CLIENT_EVENTS.CARD_MOVE, data);
  }

  /**
   * Notifica la creación de una columna a otros usuarios.
   */
  createColumn(data: CreateColumnDto): void {
    this.socket?.emit(WS_CLIENT_EVENTS.COLUMN_CREATE, data);
  }

  /**
   * Notifica la actualización de una columna a otros usuarios.
   */
  updateColumn(id: string, updates: Partial<CreateColumnDto>): void {
    this.socket?.emit(WS_CLIENT_EVENTS.COLUMN_UPDATE, { id, updates });
  }

  /**
   * Notifica la eliminación de una columna a otros usuarios.
   */
  deleteColumn(id: string): void {
    this.socket?.emit(WS_CLIENT_EVENTS.COLUMN_DELETE, { id });
  }

  /**
   * Registra un listener para un evento del servidor.
   *
   * Los listeners se guardan y se reattachen automáticamente
   * cuando se reconecta el WebSocket.
   */
  on<T = unknown>(event: ServerEvent, callback: (payload: T) => void): void {
    // Aseguramos que el socket existe y se attachará
    if (!this.socket) {
      this.connect();
    }

    // Guardamos el listener para reattachment en reconexión
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const stored = this.listeners.get(event)!;
    const cbUnknown = callback as (payload: unknown) => void;
    if (stored.includes(cbUnknown)) {
      return; // evitamos registro duplicado
    }
    stored.push(cbUnknown);

    // Si el socket está disponible, lo attachamos ahora
    this.socket?.on(event, cbUnknown);
  }

  /**
   * Remueve un listener específico de un evento.
   */
  off(event: ServerEvent, callback: (payload: unknown) => void): void {
    if (!this.socket) return;

    this.socket.off(event, callback);

    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Remueve todos los listeners de un evento específico.
   */
  removeAllListeners(event: ServerEvent): void {
    if (!this.socket) return;

    this.socket.removeAllListeners(event);
    this.listeners.delete(event);
  }
}

const websocketService = new WebSocketService();

export default websocketService;
export { WS_SERVER_EVENTS };
