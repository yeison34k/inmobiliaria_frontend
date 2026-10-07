export const TIPOS = Object.freeze({
  apartamento: 'Apartamento', casa: 'Casa', lote: 'Lote', oficina: 'Oficina',
});

export const MATCH_STATUS_META = Object.freeze({
  nueva: { label: 'Nueva', tone: 'warning' },
  vista: { label: 'Vista', tone: 'info' },
  enviada: { label: 'Enviada', tone: 'success' },
  descartada: { label: 'Descartada', tone: 'neutral' },
});

/** Color del puntaje: lo que merece una llamada hoy vs lo que puede esperar. */
export const tonoPuntaje = (puntaje) => {
  if (puntaje >= 90) return 'success';
  if (puntaje >= 75) return 'info';
  return 'neutral';
};

export const requerimientoVacio = {
  titulo: '',
  operacion: 'venta',
  tipos: [],
  ciudad: '',
  precioMin: '',
  precioMax: '',
  habitacionesMin: '',
  banosMin: '',
  areaMin: '',
  notas: '',
};
