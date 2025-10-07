import axios, { AxiosInstance } from "axios";
import type {
  IBoard,
  IBoardWithData,
  IColumn,
  ICard,
  CreateBoardDto,
  CreateColumnDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  ExportBacklogDto,
} from "../types";

/**
 * Configuración de la API del backend.
 *
 * Maneja todas las llamadas HTTP a los endpoints del servidor,
 * incluyendo tableros, columnas, tarjetas y exportación.
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor para manejo de errores de la API.
 *
 * Captura y registra errores de respuesta para facilitar el debugging.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error de API:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * API para operaciones de tableros.
 *
 * Maneja todas las operaciones CRUD relacionadas con tableros.
 */
export const boardAPI = {
  getAll: () => api.get<IBoard[]>("/boards"),
  getById: (id: string) => api.get<IBoard>(`/boards/${id}`),
  getFull: (id: string) => api.get<IBoardWithData>(`/boards/${id}/full`),
  create: (data: CreateBoardDto) => api.post<IBoard>("/boards", data),
  update: (id: string, data: Partial<CreateBoardDto>) =>
    api.put<IBoard>(`/boards/${id}`, data),
  delete: (id: string) => api.delete(`/boards/${id}`),
};

/**
 * API para operaciones de columnas.
 *
 * Maneja todas las operaciones CRUD relacionadas con columnas de tableros.
 */
export const columnAPI = {
  create: (data: CreateColumnDto) => api.post<IColumn>("/boards/columns", data),
  getByBoardId: (boardId: string) =>
    api.get<IColumn[]>(`/boards/${boardId}/columns`),
  update: (id: string, data: Partial<CreateColumnDto>) =>
    api.put<IColumn>(`/boards/columns/${id}`, data),
  delete: (id: string) => api.delete(`/boards/columns/${id}`),
};

/**
 * API para operaciones de tarjetas.
 *
 * Maneja todas las operaciones CRUD relacionadas con tarjetas,
 * incluyendo el movimiento entre columnas.
 */
export const cardAPI = {
  create: (data: CreateCardDto) => api.post<ICard>("/boards/cards", data),
  getByColumnId: (columnId: string) =>
    api.get<ICard[]>(`/boards/columns/${columnId}/cards`),
  getByBoardId: (boardId: string) =>
    api.get<ICard[]>(`/boards/${boardId}/cards`),
  update: (id: string, data: UpdateCardDto) =>
    api.put<ICard>(`/boards/cards/${id}`, data),
  delete: (id: string) => api.delete(`/boards/cards/${id}`),
  move: (data: MoveCardDto) => api.post<ICard>("/boards/cards/move", data),
};

/**
 * API para operaciones de exportación.
 *
 * Maneja la exportación de datos del tablero a diferentes formatos.
 */
export const exportAPI = {
  backlog: (data: ExportBacklogDto) => api.post("/export/backlog", data),
  health: () => api.get("/export/health"),
};

export default api;
