import { useEffect } from 'react';

/**
 * Hook reutilizable para capturar la tecla Escape y disparar un callback (cerrar modales, drawers, overlays).
 * Maneja automáticamente la adición y limpieza del listener en window.
 *
 * @param {Function} onEscape - Callback ejecutado al presionar Escape
 * @param {boolean} [active=true] - Permite activar o pausar condicionalmente la escucha
 */
export function useEscapeKey(onEscape, active = true) {
  useEffect(() => {
    if (!active || typeof onEscape !== 'function') return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onEscape(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, active]);
}
