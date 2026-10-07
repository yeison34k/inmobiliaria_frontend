export const SELECTION_STATUS_META = Object.freeze({
  borrador: { label: 'Borrador', tone: 'neutral' },
  enviada: { label: 'Enviada', tone: 'success' },
  archivada: { label: 'Archivada', tone: 'neutral' },
});

export const MAX_PROPIEDADES = 8;

export const EVENTO_META = Object.freeze({
  abrio: { label: 'Abrio el enlace', icono: '👁' },
  vio_propiedad: { label: 'Miro en detalle', icono: '🔍' },
  marco_favorita: { label: 'Marco favorita', icono: '★' },
  descarto: { label: 'Descarto', icono: '✕' },
  pidio_visita: { label: 'Pidio visita', icono: '📅' },
});

/** Una seleccion sin aperturas es una que el cliente nunca abrio. */
export const fueAbierta = (seleccion) => (seleccion?.aperturas ?? 0) > 0;
