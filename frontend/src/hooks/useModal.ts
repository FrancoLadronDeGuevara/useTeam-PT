import { useState, useCallback } from "react";

/**
 * Hook personalizado para manejar el estado de modales.
 *
 * Proporciona una interfaz simple para abrir, cerrar y verificar
 * el estado de un modal, reduciendo la duplicación de código.
 *
 * @returns Objeto con funciones y estado para manejar modales
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};
