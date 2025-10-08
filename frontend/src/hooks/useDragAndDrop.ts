import { useState, useCallback } from "react";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useBoardContext } from "../context/BoardContext";
import {
  findCardInBoard,
  findColumnByCardId,
  findColumnById,
} from "../utils/helpers";
import type { ICard, IColumnWithCards } from "../types";

/**
 * Hook personalizado para manejar la lógica de arrastrar y soltar tarjetas.
 *
 * Encapsula toda la lógica compleja de arrastrar y soltar tarjetas,
 * incluyendo el cálculo de posiciones y la validación de movimientos.
 *
 * @param currentBoard - El tablero actual con sus columnas y tarjetas
 * @returns Objeto con funciones y estado para arrastrar y soltar
 */
export const useDragAndDrop = (currentBoard: any) => {
  const [activeCard, setActiveCard] = useState<ICard | null>(null);
  const { moveCard } = useBoardContext();

  /**
   * Maneja el inicio del arrastre de una tarjeta.
   *
   * @param event - Evento de inicio del arrastre
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const card = findCardInBoard(currentBoard, active.id as string);
      setActiveCard(card);
    },
    [currentBoard]
  );

  /**
   * Maneja el final del arrastrar y soltar de una tarjeta.
   *
   * Calcula las posiciones correctas y valida el movimiento antes de
   * enviarlo al contexto para sincronización con el backend.
   *
   * @param event - Evento de finalización del arrastrar y soltar
   */
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveCard(null);
        return;
      }

      const activeCardId = active.id as string;
      const overCardId = over.id as string;

      if (activeCardId === overCardId) {
        setActiveCard(null);
        return;
      }

      const activeColumn = findColumnByCardId(currentBoard, activeCardId);
      const overColumn =
        findColumnByCardId(currentBoard, overCardId) ||
        findColumnById(currentBoard, overCardId);

      if (!activeColumn || !overColumn) {
        setActiveCard(null);
        return;
      }

      // dnd-kit suministra el índice ordenable en data.current; lo tratamos como opcional
      type SortableData = { current?: { sortable?: { index?: number } } };
      const activeSortableIndex = (
        active.data as unknown as SortableData | undefined
      )?.current?.sortable?.index;
      const overSortableIndex = (
        over.data as unknown as SortableData | undefined
      )?.current?.sortable?.index;

      const activeCardIndex =
        typeof activeSortableIndex === "number"
          ? activeSortableIndex
          : activeColumn.cards.findIndex((c: ICard) => c._id === activeCardId);
      let overCardIndex =
        typeof overSortableIndex === "number"
          ? overSortableIndex
          : overColumn.cards.findIndex((c: ICard) => c._id === overCardId);

      // Calcular índice destino correctamente:
      // - Si el "over" es la columna (soltar en el contenedor), colocar al final
      // - Si la columna está vacía, índice 0
      // - Si "over" es una tarjeta, usar su índice como base
      const isOverColumn = overColumn._id === overCardId;

      if (isOverColumn) {
        // Soltar en el contenedor de la columna
        if (activeColumn._id === overColumn._id) {
          // misma columna → al final (último índice válido)
          overCardIndex = Math.max(0, overColumn.cards.length - 1);
        } else {
          // columna distinta → apendea al final
          overCardIndex = overColumn.cards.length;
        }
      } else if (overCardIndex === -1) {
        // Columna vacía
        overCardIndex = 0;
      }

      // Validar que las posiciones sean válidas
      if (activeCardIndex < 0 || overCardIndex < 0) {
        setActiveCard(null);
        return;
      }

      try {
        await moveCard({
          cardId: activeCardId,
          sourceColumnId: activeColumn._id,
          destinationColumnId: overColumn._id,
          sourcePosition: activeCardIndex,
          destinationPosition: overCardIndex,
        });
      } catch (error) {
        console.error("Error moviendo tarjeta:", error);
      }

      setActiveCard(null);
    },
    [currentBoard, moveCard]
  );

  return {
    activeCard,
    handleDragStart,
    handleDragEnd,
  };
};
