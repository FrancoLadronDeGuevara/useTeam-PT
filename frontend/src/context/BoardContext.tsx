/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
  useMemo,
} from "react";
import { boardAPI, cardAPI, columnAPI } from "../services/api";
import websocketService, { WS_SERVER_EVENTS } from "../services/websocket";
import { generateTempId, getColumnId } from "../utils/helpers";
import { NOTIFICATION_CONFIG, SUCCESS_MESSAGES } from "../utils/constants";
import toast from "react-hot-toast";
import type {
  IBoard,
  IBoardWithData,
  ICard,
  IColumn,
  CreateBoardDto,
  CreateColumnDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  UserConnectionData,
} from "../types";

/**
 * Contexto principal para manejar el estado de los tableros.
 *
 * Proporciona todas las operaciones CRUD para tableros, columnas y tarjetas,
 * además de la sincronización en tiempo real entre pestañas y usuarios.
 */
interface BoardContextType {
  boards: IBoard[];
  currentBoard: IBoardWithData | null;
  loading: boolean;
  connectedUsers: number;
  fetchBoards: () => Promise<void>;
  fetchBoardWithData: (boardId: string) => Promise<void>;
  createBoard: (data: CreateBoardDto) => Promise<IBoard>;
  updateBoard: (
    id: string,
    updates: {
      title: string;
      description?: string;
      primaryColor?: string;
      backgroundColor?: string;
    }
  ) => Promise<void>;
  createColumn: (data: CreateColumnDto) => Promise<void>;
  updateColumn: (id: string, updates: { title: string }) => Promise<void>;
  createCard: (data: CreateCardDto) => Promise<void>;
  updateCard: (id: string, updates: UpdateCardDto) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  moveCard: (data: MoveCardDto) => Promise<void>;
  setCurrentBoard: (board: IBoardWithData | null) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoardContext = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoardContext debe ser usado dentro de BoardProvider");
  }
  return context;
};

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider = ({ children }: BoardProviderProps) => {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [currentBoard, setCurrentBoard] = useState<IBoardWithData | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const currentBoardIdRef = useRef<string | null>(null);
  const recentlyCreatedCards = useRef<Set<string>>(new Set());

  // Funciones de notificación memoizadas para evitar recreaciones constantes
  const notifications = useMemo(
    () => ({
      showSuccess: (message: string) => {
        toast.success(message, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      showError: (message: string) => {
        toast.error(message, {
          duration: NOTIFICATION_CONFIG.DURATION.ERROR,
        });
      },
      boardCreated: () => {
        toast.success(SUCCESS_MESSAGES.BOARD_CREATED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      boardUpdated: () => {
        toast.success(SUCCESS_MESSAGES.BOARD_UPDATED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      boardDeleted: () => {
        toast.success(SUCCESS_MESSAGES.BOARD_DELETED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      columnCreated: () => {
        toast.success(SUCCESS_MESSAGES.COLUMN_CREATED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      columnUpdated: () => {
        toast.success(SUCCESS_MESSAGES.COLUMN_UPDATED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      columnDeleted: () => {
        toast.success(SUCCESS_MESSAGES.COLUMN_DELETED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      cardCreated: () => {
        toast.success(SUCCESS_MESSAGES.CARD_CREATED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      cardUpdated: () => {
        toast.success(SUCCESS_MESSAGES.CARD_UPDATED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      cardDeleted: () => {
        toast.success(SUCCESS_MESSAGES.CARD_DELETED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      cardMoved: () => {
        toast.success(SUCCESS_MESSAGES.CARD_MOVED, {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      userConnected: (totalUsers: number) => {
        toast.success(`📡 Usuario conectado (${totalUsers} online)`, {
          duration: NOTIFICATION_CONFIG.DURATION.USER_CONNECTED,
        });
      },
      exportRequested: () => {
        toast.success(SUCCESS_MESSAGES.EXPORT_REQUESTED, {
          duration: NOTIFICATION_CONFIG.DURATION.EXPORT,
        });
      },
      exportError: () => {
        toast.error("❌ Error al exportar. Por favor, inténtalo de nuevo.", {
          duration: NOTIFICATION_CONFIG.DURATION.ERROR,
        });
      },
      columnDeletedByOther: () => {
        toast.success("🗑️ Columna eliminada por otro usuario", {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      cardCreatedByOther: () => {
        toast.success("📝 Nueva tarjeta creada por otro usuario", {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      cardUpdatedByOther: () => {
        toast.success("✏️ Tarjeta actualizada por otro usuario", {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      cardDeletedByOther: () => {
        toast.success("🗑️ Tarjeta eliminada por otro usuario", {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      cardMovedByOther: () => {
        toast.success("↔️ Tarjeta movida por otro usuario", {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      columnCreatedByOther: () => {
        toast.success("➕ Nueva columna creada", {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      boardUpdatedByOther: () => {
        toast.success("✏️ Tablero actualizado por otro usuario", {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
      columnUpdatedByOther: () => {
        toast.success("✏️ Columna actualizada por otro usuario", {
          duration: NOTIFICATION_CONFIG.DURATION.SUCCESS,
        });
      },
    }),
    []
  );

  /**
   * Emite eventos para sincronizar entre pestañas usando localStorage.
   *
   * Cuando una pestaña realiza un cambio, emite un evento que otras pestañas
   * pueden escuchar para actualizar su estado local.
   */
  const emitTabEvent = useCallback((event: string, payload: unknown) => {
    try {
      const message = JSON.stringify({ event, payload, ts: Date.now() });
      localStorage.setItem("board-sync", message);
      // Limpiamos la key para evitar crecimiento del localStorage
      localStorage.removeItem("board-sync");
    } catch {
      // Ignoramos errores de almacenamiento
    }
  }, []);

  // Mantenemos referencia al ID del tablero actual para usar en los listeners
  useEffect(() => {
    currentBoardIdRef.current = currentBoard?._id ?? null;
  }, [currentBoard]);

  /**
   * Obtiene todos los tableros del usuario.
   */
  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await boardAPI.getAll();
      setBoards(response.data);
    } catch (error) {
      notifications.showError("Error cargando tableros");
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  /**
   * Obtiene un tablero completo con todas sus columnas y tarjetas.
   * También se une al tablero vía WebSocket para recibir actualizaciones en tiempo real.
   */
  const fetchBoardWithData = useCallback(
    async (boardId: string) => {
      try {
        setLoading(true);
        const response = await boardAPI.getFull(boardId);
        setCurrentBoard(response.data);

        // Nos unimos al tablero vía WebSocket para recibir actualizaciones
        websocketService.joinBoard(boardId);
      } catch (error) {
        notifications.showError("Error cargando tablero");
        console.error("Error fetching board:", error);
      } finally {
        setLoading(false);
      }
    },
    [notifications]
  );

  /**
   * Crea un nuevo tablero.
   */
  const createBoard = useCallback(
    async (data: CreateBoardDto): Promise<IBoard> => {
      try {
        const response = await boardAPI.create(data);
        setBoards((prev) => [...prev, response.data]);

        // Notificamos a otros usuarios vía WebSocket
        websocketService.createBoard(response.data);

        notifications.boardCreated();
        return response.data;
      } catch (error) {
        notifications.showError("Error creando tablero");
        console.error("Error creating board:", error);
        throw error;
      }
    },
    [notifications]
  );

  /**
   * Actualiza un tablero existente.
   */
  const updateBoard = useCallback(
    async (id: string, updates: { title: string; description?: string }) => {
      try {
        const response = await boardAPI.update(id, updates);

        // Actualizar en la lista de tableros
        setBoards((prev) =>
          prev.map((board) =>
            board._id === id ? { ...board, ...response.data } : board
          )
        );

        // Actualizar el tablero actual si es el que estamos viendo
        if (currentBoard && currentBoard._id === id) {
          setCurrentBoard({
            ...currentBoard,
            title: response.data.title,
            description: response.data.description,
            primaryColor: response.data.primaryColor,
            backgroundColor: response.data.backgroundColor,
          });
        }

        // Emitir evento WebSocket para sincronizar con otros usuarios
        const socket = websocketService.connect();
        if (socket.connected) {
          websocketService.updateBoard(id, updates);
        } else {
          socket.on("connect", () => {
            websocketService.updateBoard(id, updates);
          });
        }

        notifications.boardUpdated();
      } catch (error) {
        notifications.showError("Error actualizando tablero");
        console.error("Error updating board:", error);
        throw error;
      }
    },
    [currentBoard, setCurrentBoard, notifications]
  );

  /**
   * Crea una nueva columna en un tablero.
   * Actualiza el estado local y sincroniza con otras pestañas.
   */
  const createColumn = useCallback(
    async (data: CreateColumnDto) => {
      try {
        const response = await columnAPI.create(data);

        // Actualizamos el tablero actual si es el que estamos viendo
        if (currentBoard && currentBoard._id === data.boardId) {
          setCurrentBoard((prev) =>
            prev
              ? {
                  ...prev,
                  columns: [...prev.columns, { ...response.data, cards: [] }],
                }
              : null
          );
        }

        notifications.columnCreated();
        // Sincronizamos con otras pestañas
        emitTabEvent("column:created", response.data);
      } catch (error) {
        notifications.showError("Error creando columna");
        console.error("Error creando columna:", error);
        throw error;
      }
    },
    [currentBoard, emitTabEvent, notifications]
  );

  /**
   * Actualiza una columna existente.
   */
  const updateColumn = useCallback(
    async (id: string, updates: { title: string }) => {
      try {
        const response = await columnAPI.update(id, updates);

        // Actualizar el tablero actual si es el que estamos viendo
        if (currentBoard) {
          setCurrentBoard((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              columns: prev.columns.map((col) =>
                col._id === id ? { ...col, ...response.data } : col
              ),
            };
          });
        }

        // Emitir evento WebSocket para sincronizar con otros usuarios
        const socket = websocketService.connect();
        if (socket.connected) {
          websocketService.updateColumn(id, updates);
        } else {
          socket.on("connect", () => {
            websocketService.updateColumn(id, updates);
          });
        }

        notifications.columnUpdated();
      } catch (error) {
        notifications.showError("Error actualizando columna");
        console.error("Error updating column:", error);
        throw error;
      }
    },
    [currentBoard, notifications]
  );

  /**
   * Crea una nueva tarjeta con actualización optimista.
   *
   * Esta función implementa un patrón de actualización optimista que mejora la
   * experiencia del usuario al mostrar cambios inmediatamente en la UI antes de
   * que el servidor confirme la operación.
   *
   * Flujo:
   * 1. Genera un ID temporal único para la tarjeta
   * 2. Actualiza inmediatamente el estado local (UI)
   * 3. Envía la petición al backend
   * 4. Reemplaza la tarjeta temporal con la real cuando llega la respuesta
   * 5. Sincroniza con otras pestañas via localStorage
   *
   * @param data - Datos de la tarjeta a crear
   * @throws Error si falla la creación en el backend
   */
  const createCard = useCallback(
    async (data: CreateCardDto) => {
      try {
        // Generamos un ID temporal para la actualización optimista
        const tempId = generateTempId();
        const tempCard: ICard = {
          ...data,
          _id: tempId,
          description: data.description || "",
          position: data.position || 0,
          backgroundColor: data.backgroundColor || "#ffffff",
          textColor: data.textColor || "#000000",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Marcamos como recién creada para evitar duplicados
        recentlyCreatedCards.current.add(tempId);

        // ACTUALIZACIÓN OPTIMISTA: mostramos la tarjeta inmediatamente
        setCurrentBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.map((col) => {
              if (col._id !== getColumnId(data.columnId)) return col;
              const exists = col.cards.some((c) => c._id === tempId);
              if (exists) return col;
              return { ...col, cards: [...col.cards, tempCard] };
            }),
          };
        });

        // Creamos la tarjeta real en el backend
        const response = await cardAPI.create(data);
        const realCard = response.data;

        // Reemplazamos la tarjeta temporal con la real
        setCurrentBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.map((col) => {
              if (col._id !== getColumnId(data.columnId)) return col;
              return {
                ...col,
                cards: col.cards.map((c) => (c._id === tempId ? realCard : c)),
              };
            }),
          };
        });

        // Sincronizamos con otras pestañas
        emitTabEvent("card:created", realCard);

        // Limpiamos la referencia temporal después de un tiempo
        setTimeout(() => {
          recentlyCreatedCards.current.delete(tempId);
        }, 10000);

        notifications.cardCreated();
      } catch (error) {
        notifications.showError("Error creando tarjeta");
        console.error("Error creando tarjeta:", error);
        throw error;
      }
    },
    [emitTabEvent, notifications]
  );

  /**
   * Actualiza una tarjeta existente.
   * Actualiza el estado local y notifica a otros usuarios via WebSocket.
   */
  const updateCard = useCallback(
    async (id: string, updates: UpdateCardDto) => {
      try {
        await cardAPI.update(id, updates);

        // Actualizamos el estado local
        if (currentBoard) {
          setCurrentBoard((prev) =>
            prev
              ? {
                  ...prev,
                  columns: prev.columns.map((col) => ({
                    ...col,
                    cards: col.cards.map((card) =>
                      card._id === id ? { ...card, ...updates } : card
                    ),
                  })),
                }
              : null
          );
        }

        // Notificamos a otros usuarios vía WebSocket
        websocketService.updateCard(id, updates);

        notifications.cardUpdated();
      } catch (error) {
        notifications.showError("Error actualizando tarjeta");
        console.error("Error actualizando tarjeta:", error);
        throw error;
      }
    },
    [currentBoard, notifications]
  );

  /**
   * Elimina una tarjeta.
   * Actualiza el estado local, notifica via WebSocket y sincroniza entre pestañas.
   */
  const deleteCard = useCallback(
    async (id: string) => {
      try {
        await cardAPI.delete(id);

        // Actualizamos el estado local inmediatamente
        if (currentBoard) {
          setCurrentBoard((prev) =>
            prev
              ? {
                  ...prev,
                  columns: prev.columns.map((col) => ({
                    ...col,
                    cards: col.cards.filter((card) => card._id !== id),
                  })),
                }
              : null
          );
        }

        // Notificamos a otros usuarios vía WebSocket
        websocketService.deleteCard(id);

        // Sincronizamos con otras pestañas
        emitTabEvent("card:deleted", { id });

        notifications.cardDeleted();
      } catch (error) {
        notifications.showError("Error eliminando tarjeta");
        console.error("Error eliminando tarjeta:", error);
        throw error;
      }
    },
    [currentBoard, emitTabEvent, notifications]
  );

  /**
   * Elimina una columna y todas sus tarjetas.
   * El backend maneja la eliminación en cascada automáticamente.
   */
  const deleteColumn = useCallback(
    async (id: string) => {
      try {
        await columnAPI.delete(id);

        // Actualizamos el estado local - eliminamos la columna y sus tarjetas
        setCurrentBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.filter((col) => col._id !== id),
          };
        });

        notifications.columnDeleted();
        // Sincronizamos con otras pestañas
        emitTabEvent("column:deleted", { id });
      } catch (error) {
        notifications.showError("Error eliminando columna");
        console.error("Error eliminando columna:", error);
        throw error;
      }
    },
    [emitTabEvent, notifications]
  );

  /**
   * Elimina un tablero completo.
   * Si es el tablero actual, lo deselecciona.
   */
  const deleteBoard = useCallback(
    async (id: string) => {
      try {
        await boardAPI.delete(id);
        setBoards((prev) => prev.filter((b) => b._id !== id));
        if (currentBoard?._id === id) {
          setCurrentBoard(null);
        }
        // Notificamos a otros usuarios vía WebSocket
        websocketService.deleteBoard(id);

        notifications.boardDeleted();
        // Sincronizamos con otras pestañas
        emitTabEvent("board:deleted", { id });
      } catch (error) {
        notifications.showError("Error eliminando tablero");
        console.error("Error eliminando tablero:", error);
        throw error;
      }
    },
    [currentBoard, emitTabEvent, notifications]
  );

  /**
   * Mueve una tarjeta de una posición a otra con actualización optimista.
   *
   * Esta función maneja el drag & drop de tarjetas entre columnas con una
   * estrategia de actualización optimista para una experiencia fluida.
   *
   * Características:
   * - Actualización inmediata de la UI (optimista)
   * - Validación de posiciones y columnas
   * - Ajuste automático de índices para la misma columna
   * - Sincronización via WebSocket con otros usuarios
   * - No mueve tarjetas temporales (prefijo 'temp_')
   *
   * @param moveData - Datos del movimiento incluyendo columnas y posiciones
   * @throws Error si falla la sincronización con el backend
   */
  const moveCard = useCallback(
    async (moveData: MoveCardDto) => {
      // ACTUALIZACIÓN OPTIMISTA: movemos la tarjeta inmediatamente en la UI
      setCurrentBoard((prev) => {
        if (!prev) return prev;

        const { sourceColumnId, destinationColumnId, sourcePosition } =
          moveData;
        let { destinationPosition } = moveData;

        const nextColumns = prev.columns.map((col) => ({
          ...col,
          cards: [...col.cards],
        }));
        const sourceCol = nextColumns.find((c) => c._id === sourceColumnId);
        const destCol = nextColumns.find((c) => c._id === destinationColumnId);
        if (!sourceCol || !destCol) return prev;

        const [moved] = sourceCol.cards.splice(sourcePosition, 1);
        if (!moved) return prev;

        // Ajustamos la posición si movemos dentro de la misma columna
        if (
          sourceColumnId === destinationColumnId &&
          destinationPosition > sourcePosition
        ) {
          destinationPosition = destinationPosition - 1;
        }

        const insertIndex = Math.max(
          0,
          Math.min(destinationPosition, destCol.cards.length)
        );
        destCol.cards.splice(insertIndex, 0, {
          ...moved,
          columnId: destinationColumnId,
        });

        return { ...prev, columns: nextColumns };
      });

      try {
        // No movemos tarjetas temporales (que empiezan con 'temp_')
        if (moveData.cardId.startsWith("temp_")) {
          console.log("Skipping move for temporary card:", moveData.cardId);
          return;
        }

        // Enviamos el movimiento via WebSocket para sincronizar con otros usuarios
        websocketService.moveCard(moveData);
      } catch (error) {
        // Si falla, revertimos recargando el tablero desde el backend
        if (currentBoard?._id) {
          fetchBoardWithData(currentBoard._id);
        }
        console.error("Error moviendo tarjeta:", error);
        notifications.showError("Error moviendo tarjeta");
        throw error;
      }
    },
    [currentBoard, fetchBoardWithData, notifications]
  );

  /**
   * El WebSocket se conecta automáticamente cuando se necesita.
   * No necesitamos conectarlo aquí para evitar múltiples conexiones.
   */

  /**
   * Listener para sincronización entre pestañas usando localStorage.
   *
   * Escucha eventos de otras pestañas y actualiza el estado local
   * para mantener sincronización en tiempo real.
   */
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== "board-sync" || !e.newValue) return;
      try {
        const { event, payload } = JSON.parse(e.newValue);

        if (event === "card:deleted") {
          // Eliminamos la tarjeta del estado local
          const { id } = payload as { id: string };
          setCurrentBoard((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              columns: prev.columns.map((col) => ({
                ...col,
                cards: col.cards.filter((c) => c._id !== id),
              })),
            };
          });
        } else if (event === "column:created") {
          // Agregamos la nueva columna al estado local
          const column = payload as IColumn;
          setCurrentBoard((prev) => {
            if (!prev) return prev;
            if (column.boardId !== prev._id) return prev;
            const exists = prev.columns.some((c) => c._id === column._id);
            return exists
              ? prev
              : {
                  ...prev,
                  columns: [...prev.columns, { ...column, cards: [] }],
                };
          });
        } else if (event === "column:deleted") {
          // Eliminamos la columna del estado local
          const { id } = payload as { id: string };
          setCurrentBoard((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              columns: prev.columns.filter((c) => c._id !== id),
            };
          });
          notifications.columnDeletedByOther();
        } else if (event === "card:updated") {
          // Actualizamos la tarjeta en el estado local
          const { id, updates } = payload as {
            id: string;
            updates: UpdateCardDto;
          };
          setCurrentBoard((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              columns: prev.columns.map((col) => ({
                ...col,
                cards: col.cards.map((c) =>
                  c._id === id ? { ...c, ...updates } : c
                ),
              })),
            };
          });
        } else if (event === "card:created") {
          const card = payload as ICard;
          setCurrentBoard((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              columns: prev.columns.map((col) => {
                if (col._id !== card.columnId) return col;
                const exists = col.cards.some((c) => c._id === card._id);
                return exists ? col : { ...col, cards: [...col.cards, card] };
              }),
            };
          });
          notifications.cardCreatedByOther();
        } else if (event === "card:moved") {
          const boardId = currentBoardIdRef.current;
          if (boardId) {
            fetchBoardWithData(boardId);
          }
        } else if (event === "board:created") {
          // Agregamos el tablero al estado local
          const board = payload as IBoard;
          setBoards((prev) => {
            const exists = prev.some((b) => b._id === board._id);
            return exists ? prev : [...prev, board];
          });
        } else if (event === "board:deleted") {
          // Eliminamos el tablero del estado local
          const { id } = payload as { id: string };
          setBoards((prev) => prev.filter((b) => b._id !== id));

          // Si es el tablero actual, deseleccionarlo
          if (currentBoard?._id === id) {
            setCurrentBoard(null);
          }
        }
      } catch {
        /* ignore malformed storage payload */
      }
    };
    window.addEventListener("storage", handleStorage);
    // Listener: Usuario conectado
    const handleUserConnected = (data: UserConnectionData) => {
      setConnectedUsers(data.totalUsers);
      notifications.userConnected(data.totalUsers);
    };

    // Listener: Usuario desconectado
    const handleUserDisconnected = (data: UserConnectionData) => {
      setConnectedUsers(data.totalUsers);
    };

    // Listener: Tarjeta creada por otro usuario
    const handleCardCreated = (card: ICard) => {
      setCurrentBoard((prev) => {
        if (!prev) return prev;

        // Verificar que la columna existe en el board actual
        const column = prev.columns.find((col) => col._id === card.columnId);
        if (!column) {
          return prev;
        }

        return {
          ...prev,
          columns: prev.columns.map((col) => {
            if (col._id !== card.columnId) return col;

            // Buscar si hay una tarjeta temporal con el mismo contenido
            const tempCardIndex = col.cards.findIndex(
              (c) =>
                c._id.startsWith("temp_") &&
                c.title === card.title &&
                c.description === card.description
            );

            if (tempCardIndex !== -1) {
              // Reemplazar tarjeta temporal con la real
              const newCards = [...col.cards];
              newCards[tempCardIndex] = card;
              return { ...col, cards: newCards };
            }

            // Si no hay tarjeta temporal, verificar si ya existe la real
            const exists = col.cards.some((c) => c._id === card._id);
            if (exists) {
              return col;
            }

            return { ...col, cards: [...col.cards, card] };
          }),
        };
      });

      // Solo mostrar toast si no es una tarjeta recién creada por esta pestaña
      if (!recentlyCreatedCards.current.has(card._id)) {
        notifications.cardCreatedByOther();
      }
    };

    // Listener: Tarjeta actualizada por otro usuario
    const handleCardUpdated = (card: ICard) => {
      setCurrentBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            cards: col.cards.map((c) =>
              c._id === card._id ? { ...c, ...card } : c
            ),
          })),
        };
      });
      notifications.cardUpdatedByOther();
    };

    // Listener: Tarjeta eliminada por otro usuario
    const handleCardDeleted = ({ id }: { id: string }) => {
      setCurrentBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            cards: col.cards.filter((card) => card._id !== id),
          })),
        };
      });
      notifications.cardDeletedByOther();
    };

    // Listener: Tarjeta movida por otro usuario
    const handleCardMoved = ({ moveData }: { moveData: MoveCardDto }) => {
      setCurrentBoard((prev) => {
        if (!prev) return prev;

        const { sourceColumnId, destinationColumnId, sourcePosition, cardId } =
          moveData;
        let { destinationPosition } = moveData;

        // Crear copias profundas de las columnas
        const nextColumns = prev.columns.map((col) => ({
          ...col,
          cards: [...col.cards],
        }));

        const sourceCol = nextColumns.find((c) => c._id === sourceColumnId);
        const destCol = nextColumns.find((c) => c._id === destinationColumnId);

        if (!sourceCol || !destCol) {
          return prev;
        }

        // Buscar la tarjeta por ID primero, luego por posición
        let moved = sourceCol.cards.find((c) => c._id === cardId);
        if (moved) {
          // Remover por ID
          sourceCol.cards = sourceCol.cards.filter((c) => c._id !== cardId);
        } else {
          // Fallback: remover por posición
          moved = sourceCol.cards.splice(sourcePosition, 1)[0];
        }

        if (!moved) {
          return prev;
        }

        // Ajustar posición si es la misma columna
        if (
          sourceColumnId === destinationColumnId &&
          destinationPosition > sourcePosition
        ) {
          destinationPosition = destinationPosition - 1;
        }

        // Insertar en la nueva posición
        const insertIndex = Math.max(
          0,
          Math.min(destinationPosition, destCol.cards.length)
        );
        destCol.cards.splice(insertIndex, 0, {
          ...moved,
          columnId: destinationColumnId,
        });

        return { ...prev, columns: nextColumns };
      });

      notifications.cardMovedByOther();
    };

    // Listener: Columna creada
    const handleColumnCreated = (column: IColumn) => {
      setCurrentBoard((prev) => {
        if (!prev) return prev;
        if (column.boardId !== prev._id) return prev;
        return {
          ...prev,
          columns: [...prev.columns, { ...column, cards: [] }],
        };
      });
      notifications.columnCreatedByOther();
    };

    // Listener: Tablero actualizado por otro usuario
    const handleBoardUpdated = (board: {
      id: string;
      title: string;
      description?: string;
      primaryColor?: string;
      backgroundColor?: string;
    }) => {
      // Actualizar en la lista de tableros
      setBoards((prev) =>
        prev.map((b) =>
          b._id === board.id
            ? {
                ...b,
                title: board.title,
                description: board.description || "",
                primaryColor: board.primaryColor,
                backgroundColor: board.backgroundColor,
              }
            : b
        )
      );

      // Actualizar el tablero actual si es el que estamos viendo
      setCurrentBoard((prev) => {
        if (!prev || prev._id !== board.id) return prev;
        return {
          ...prev,
          title: board.title,
          description: board.description || "",
          primaryColor: board.primaryColor,
          backgroundColor: board.backgroundColor,
        };
      });

      notifications.boardUpdatedByOther();
    };

    // Listener: Columna actualizada por otro usuario
    const handleColumnUpdated = (column: {
      _id: string;
      title: string;
      boardId: string;
    }) => {
      // Actualizar el tablero actual si es el que estamos viendo
      setCurrentBoard((prev) => {
        if (!prev || prev._id !== column.boardId) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) =>
            col._id === column._id ? { ...col, title: column.title } : col
          ),
        };
      });

      notifications.columnUpdatedByOther();
    };

    // Listener: Tablero creado por otro usuario
    const handleBoardCreated = (board: IBoard) => {
      // Agregar a la lista de tableros si no existe
      setBoards((prev) => {
        const exists = prev.some((b) => b._id === board._id);
        if (!exists) {
          // Solo mostrar notificación si el tablero no existe (fue creado por otro usuario)
          notifications.boardCreated();
          return [...prev, board];
        }
        return prev;
      });
    };

    // Listener: Tablero eliminado por otro usuario
    const handleBoardDeleted = ({ id }: { id: string }) => {
      // Verificar si el tablero existe antes de eliminarlo
      setBoards((prev) => {
        const exists = prev.some((b) => b._id === id);
        if (exists) {
          // Solo mostrar notificación si el tablero existía (fue eliminado por otro usuario)
          notifications.boardDeleted();

          // Si es el tablero actual, deseleccionarlo
          if (currentBoard?._id === id) {
            setCurrentBoard(null);
          }

          return prev.filter((b) => b._id !== id);
        }
        return prev;
      });
    };

    // Registrar listeners
    websocketService.on(WS_SERVER_EVENTS.USER_CONNECTED, handleUserConnected);
    websocketService.on(
      WS_SERVER_EVENTS.USER_DISCONNECTED,
      handleUserDisconnected
    );
    websocketService.on(WS_SERVER_EVENTS.BOARD_CREATED, handleBoardCreated);
    websocketService.on(WS_SERVER_EVENTS.BOARD_UPDATED, handleBoardUpdated);
    websocketService.on(WS_SERVER_EVENTS.BOARD_DELETED, handleBoardDeleted);
    websocketService.on(WS_SERVER_EVENTS.CARD_CREATED, handleCardCreated);
    websocketService.on(WS_SERVER_EVENTS.CARD_UPDATED, handleCardUpdated);
    websocketService.on(WS_SERVER_EVENTS.CARD_DELETED, handleCardDeleted);
    websocketService.on(WS_SERVER_EVENTS.CARD_MOVED, handleCardMoved);
    websocketService.on(WS_SERVER_EVENTS.COLUMN_CREATED, handleColumnCreated);
    websocketService.on(WS_SERVER_EVENTS.COLUMN_UPDATED, handleColumnUpdated);
    websocketService.on(
      WS_SERVER_EVENTS.COLUMN_DELETED,
      ({ id }: { id: string }) => {
        setCurrentBoard((prev) => {
          if (!prev) return prev;
          return { ...prev, columns: prev.columns.filter((c) => c._id !== id) };
        });
      }
    );

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorage);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.USER_CONNECTED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.USER_DISCONNECTED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.BOARD_CREATED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.BOARD_UPDATED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.BOARD_DELETED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.CARD_CREATED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.CARD_UPDATED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.CARD_DELETED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.CARD_MOVED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.COLUMN_CREATED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.COLUMN_UPDATED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.COLUMN_DELETED);
    };
  }, [fetchBoardWithData, notifications]);

  const value: BoardContextType = useMemo(
    () => ({
      boards,
      currentBoard,
      loading,
      connectedUsers,
      fetchBoards,
      fetchBoardWithData,
      createBoard,
      updateBoard,
      createColumn,
      updateColumn,
      createCard,
      updateCard,
      deleteCard,
      deleteColumn,
      deleteBoard,
      moveCard,
      setCurrentBoard,
    }),
    [
      boards,
      currentBoard,
      loading,
      connectedUsers,
      fetchBoards,
      fetchBoardWithData,
      createBoard,
      updateBoard,
      createColumn,
      updateColumn,
      createCard,
      updateCard,
      deleteCard,
      deleteColumn,
      deleteBoard,
      moveCard,
      setCurrentBoard,
    ]
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
