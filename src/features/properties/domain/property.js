export const PropertyType = Object.freeze({
  APARTAMENTO: 'apartamento',
  CASA: 'casa',
  LOTE: 'lote',
  OFICINA: 'oficina',
});

export const TYPE_LABELS = Object.freeze({
  apartamento: 'Apartamento',
  casa: 'Casa',
  lote: 'Lote',
  oficina: 'Oficina',
});

export const OperationType = Object.freeze({ VENTA: 'venta', ARRIENDO: 'arriendo' });

export const OPERATION_LABELS = Object.freeze({ venta: 'En venta', arriendo: 'En arriendo' });

export const PropertyStatus = Object.freeze({
  BORRADOR: 'borrador',
  PUBLICADA: 'publicada',
  RESERVADA: 'reservada',
  VENDIDA: 'vendida',
  RENTADA: 'rentada',
  SUSPENDIDA: 'suspendida',
});

/** Etiqueta + color por estado (los colores del tablero operativo). */
export const STATUS_META = Object.freeze({
  borrador: { label: 'Borrador', tone: 'draft' },
  publicada: { label: 'Publicada', tone: 'success' },
  reservada: { label: 'Reservada', tone: 'warning' },
  vendida: { label: 'Vendida', tone: 'purple' },
  rentada: { label: 'Rentada', tone: 'info' },
  suspendida: { label: 'Suspendida', tone: 'neutral' },
});

/**
 * Espejo de la maquina de estados del backend: se usa solo para decidir que
 * botones mostrar. El backend sigue siendo la autoridad que valida.
 */
const TRANSITIONS = Object.freeze({
  borrador: ['publicada', 'suspendida'],
  publicada: ['borrador', 'suspendida'],
  reservada: ['suspendida'],
  vendida: [],
  rentada: ['publicada', 'suspendida'],
  suspendida: ['borrador', 'publicada'],
});

export const allowedStatuses = (estado) => TRANSITIONS[estado] ?? [];

/**
 * Accion principal contextual de cada fila del listado:
 * disponible -> Reservar; reservada -> Cerrar / Liberar.
 */
export function primaryAction(propiedad) {
  switch (propiedad.estado) {
    case PropertyStatus.PUBLICADA:
      return { key: 'reservar', label: 'Reservar', tone: 'primary' };
    case PropertyStatus.RESERVADA:
      return { key: 'cerrar', label: 'Cerrar operacion', tone: 'primary' };
    case PropertyStatus.BORRADOR:
      return { key: 'publicar', label: 'Publicar', tone: 'primary' };
    case PropertyStatus.SUSPENDIDA:
      return { key: 'publicar', label: 'Reactivar', tone: 'ghost' };
    default:
      return null;
  }
}

export const isPublic = (propiedad) =>
  [PropertyStatus.PUBLICADA, PropertyStatus.RESERVADA].includes(propiedad.estado);

export const SORT_OPTIONS = Object.freeze([
  { value: 'recientes', label: 'Mas recientes' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
  { value: 'actualizadas', label: 'Actualizadas' },
]);
