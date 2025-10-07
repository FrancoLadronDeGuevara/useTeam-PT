/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { boardAPI, cardAPI, columnAPI } from "../services/api";
import websocketService, { WS_SERVER_EVENTS } from "../services/websocket";
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
  createColumn: (data: CreateColumnDto) => Promise<void>;
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

/**
 * Función helper para extraer el ID de columna.
 *
 * Maneja tanto strings como ObjectId que vienen del backend.
 * Esto es necesario porque el backend puede devolver columnId como ObjectId
 * pero el frontend siempre espera strings.
 */
const getColumnId = (
  columnId: string | { _id: string; title: string }
): string => {
  return typeof columnId === "string" ? columnId : columnId._id;
};

export const BoardProvider = ({ children }: BoardProviderProps) => {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [currentBoard, setCurrentBoard] = useState<IBoardWithData | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const currentBoardIdRef = useRef<string | null>(null);
  const recentlyCreatedCards = useRef<Set<string>>(new Set());

  /**
   * Emite eventos para sincronizar entre pestañas usando localStorage.
   *
   * Cuando una pestaña hace un cambio, emite un evento que otras pestañas
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

  // Mantenemos referencia al boardId actual para usar en los listeners
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
      toast.error("Error cargando tableros");
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene un tablero completo con todas sus columnas y tarjetas.
   * También se une al tablero via WebSocket para recibir actualizaciones en tiempo real.
   */
  const fetchBoardWithData = useCallback(async (boardId: string) => {
    try {
      setLoading(true);
      const response = await boardAPI.getFull(boardId);
      setCurrentBoard(response.data);

      // Nos unimos al tablero via WebSocket para recibir actualizaciones
      websocketService.joinBoard(boardId);
    } catch (error) {
      toast.error("Error cargando tablero");
      console.error("Error fetching board:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo tablero.
   */
  const createBoard = useCallback(
    async (data: CreateBoardDto): Promise<IBoard> => {
      try {
        const response = await boardAPI.create(data);
        setBoards((prev) => [...prev, response.data]);
        toast.success("Tablero creado exitosamente");
        return response.data;
      } catch (error) {
        toast.error("Error creando tablero");
        console.error("Error creating board:", error);
        throw error;
      }
    },
    []
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

        toast.success("Columna creada");
        // Sincronizamos con otras pestañas
        emitTabEvent("column:created", response.data);
      } catch (error) {
        toast.error("Error creando columna");
        console.error("Error creando columna:", error);
        throw error;
      }
    },
    [currentBoard, emitTabEvent]
  );

  /**
   * Crea una nueva tarjeta con actualización optimista.
   *
   * Primero muestra la tarjeta temporalmente en la UI, luego la crea en el backend
   * y reemplaza la temporal con la real. Esto da una sensación de respuesta inmediata.
   */
  const createCard = useCallback(
    async (data: CreateCardDto) => {
      try {
        // Generamos un ID temporal para la actualización optimista
        const tempId = `temp_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const tempCard: ICard = {
          ...data,
          _id: tempId,
          description: data.description || "",
          position: data.position || 0,
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

        toast.success("Tarjeta creada");
      } catch (error) {
        toast.error("Error creando tarjeta");
        console.error("Error creando tarjeta:", error);
        throw error;
      }
    },
    [emitTabEvent]
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

        // Notificamos a otros usuarios via WebSocket
        websocketService.updateCard(id, updates);

        toast.success("Tarjeta actualizada");
      } catch (error) {
        toast.error("Error actualizando tarjeta");
        console.error("Error actualizando tarjeta:", error);
        throw error;
      }
    },
    [currentBoard]
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

        // Notificamos a otros usuarios via WebSocket
        websocketService.deleteCard(id);

        // Sincronizamos con otras pestañas
        emitTabEvent("card:deleted", { id });

        toast.success("Tarjeta eliminada");
      } catch (error) {
        toast.error("Error eliminando tarjeta");
        console.error("Error eliminando tarjeta:", error);
        throw error;
      }
    },
    [currentBoard, emitTabEvent]
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

        toast.success("Columna eliminada");
        // Sincronizamos con otras pestañas
        emitTabEvent("column:deleted", { id });
      } catch (error) {
        toast.error("Error eliminando columna");
        console.error("Error eliminando columna:", error);
        throw error;
      }
    },
    [emitTabEvent]
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
        toast.success("Tablero eliminado");
        // Sincronizamos con otras pestañas
        emitTabEvent("board:deleted", { id });
      } catch (error) {
        toast.error("Error eliminando tablero");
        console.error("Error eliminando tablero:", error);
        throw error;
      }
    },
    [currentBoard, emitTabEvent]
  );

  /**
   * Mueve una tarjeta de una posición a otra con actualización optimista.
   *
   * Primero actualiza la UI inmediatamente, luego sincroniza con el backend.
   * No mueve tarjetas temporales (que empiezan con 'temp_').
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
        toast.error("Error moviendo tarjeta");
        throw error;
      }
    },
    [currentBoard, fetchBoardWithData]
  );

  /**
   * Conecta el WebSocket cuando se monta el provider.
   * Se desconecta automáticamente al desmontar.
   */
  useEffect(() => {
    websocketService.connect();
    return () => {
      websocketService.disconnect();
    };
  }, []);

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
          toast.success("Columna eliminada por otro usuario", { icon: "🗑️" });
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
          toast.success("Nueva tarjeta creada en otra pestaña", { icon: "📝" });
        } else if (event === "card:moved") {
          const boardId = currentBoardIdRef.current;
          if (boardId) {
            fetchBoardWithData(boardId);
          }
        }
      } catch {
        /* ignore malformed storage payload */
      }
    };
    window.addEventListener("storage", handleStorage);
    // Listener: Usuario conectado
    const handleUserConnected = (data: UserConnectionData) => {
      console.log("WebSocket: User connected", data);
      setConnectedUsers(data.totalUsers);
      toast.success(`Usuario conectado (${data.totalUsers} online)`, {
        duration: 2000,
        icon: "👋",
      });
    };

    // Listener: Usuario desconectado
    const handleUserDisconnected = (data: UserConnectionData) => {
      setConnectedUsers(data.totalUsers);
    };

    // Listener: Tarjeta creada por otro usuario
    const handleCardCreated = (card: ICard) => {
      console.log("WebSocket: Card created event received", card);

      setCurrentBoard((prev) => {
        if (!prev) return prev;

        // Verificar que la columna existe en el board actual
        const column = prev.columns.find((col) => col._id === card.columnId);
        if (!column) {
          console.log("Column not found in current board, ignoring card");
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
              console.log("Replacing temp card with real card", card._id);
              const newCards = [...col.cards];
              newCards[tempCardIndex] = card;
              return { ...col, cards: newCards };
            }

            // Si no hay tarjeta temporal, verificar si ya existe la real
            const exists = col.cards.some((c) => c._id === card._id);
            if (exists) {
              console.log("Card already exists, skipping");
              return col;
            }

            console.log("Adding card to column", col._id);
            return { ...col, cards: [...col.cards, card] };
          }),
        };
      });

      // Solo mostrar toast si no es una tarjeta recién creada por esta pestaña
      if (!recentlyCreatedCards.current.has(card._id)) {
        toast.success("Nueva tarjeta creada por otro usuario", { icon: "📝" });
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
      toast.success("Tarjeta actualizada por otro usuario", { icon: "✏️" });
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
      toast.success("Tarjeta eliminada por otro usuario", { icon: "🗑️" });
    };

    // Listener: Tarjeta movida por otro usuario
    const handleCardMoved = ({ moveData }: { moveData: MoveCardDto }) => {
      console.log("WebSocket: Card moved event received", moveData);

      setCurrentBoard((prev) => {
        if (!prev) return prev;

        const { sourceColumnId, destinationColumnId, sourcePosition, cardId } =
          moveData;
        let { destinationPosition } = moveData;

        console.log("Moving card:", {
          cardId,
          from: { column: sourceColumnId, position: sourcePosition },
          to: { column: destinationColumnId, position: destinationPosition },
        });

        // Crear copias profundas de las columnas
        const nextColumns = prev.columns.map((col) => ({
          ...col,
          cards: [...col.cards],
        }));

        const sourceCol = nextColumns.find((c) => c._id === sourceColumnId);
        const destCol = nextColumns.find((c) => c._id === destinationColumnId);

        if (!sourceCol || !destCol) {
          console.log("Source or destination column not found");
          return prev;
        }

        // Buscar la tarjeta por ID primero, luego por posición
        let moved = sourceCol.cards.find((c) => c._id === cardId);
        if (moved) {
          // Remover por ID
          sourceCol.cards = sourceCol.cards.filter((c) => c._id !== cardId);
          console.log("Removed card by ID:", moved._id);
        } else {
          // Fallback: remover por posición
          moved = sourceCol.cards.splice(sourcePosition, 1)[0];
          console.log("Removed card by position:", moved?._id);
        }

        if (!moved) {
          console.log("Card not found to move");
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

        console.log("Card moved successfully to position:", insertIndex);
        return { ...prev, columns: nextColumns };
      });

      toast.success("Tarjeta movida por otro usuario", { icon: "↔️" });
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
      toast.success("Nueva columna creada", { icon: "➕" });
    };

    // Registrar listeners
    websocketService.on(WS_SERVER_EVENTS.USER_CONNECTED, handleUserConnected);
    websocketService.on(
      WS_SERVER_EVENTS.USER_DISCONNECTED,
      handleUserDisconnected
    );
    websocketService.on(WS_SERVER_EVENTS.CARD_CREATED, handleCardCreated);
    websocketService.on(WS_SERVER_EVENTS.CARD_UPDATED, handleCardUpdated);
    websocketService.on(WS_SERVER_EVENTS.CARD_DELETED, handleCardDeleted);
    websocketService.on(WS_SERVER_EVENTS.CARD_MOVED, handleCardMoved);
    websocketService.on(WS_SERVER_EVENTS.COLUMN_CREATED, handleColumnCreated);
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
      websocketService.removeAllListeners(WS_SERVER_EVENTS.CARD_CREATED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.CARD_UPDATED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.CARD_DELETED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.CARD_MOVED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.COLUMN_CREATED);
      websocketService.removeAllListeners(WS_SERVER_EVENTS.COLUMN_DELETED);
    };
  }, [fetchBoardWithData]);

  const value: BoardContextType = {
    boards,
    currentBoard,
    loading,
    connectedUsers,
    fetchBoards,
    fetchBoardWithData,
    createBoard,
    createColumn,
    createCard,
    updateCard,
    deleteCard,
    deleteColumn,
    deleteBoard,
    moveCard,
    setCurrentBoard,
  };

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
