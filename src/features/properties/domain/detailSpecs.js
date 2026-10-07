/**
 * Espejo de PROPERTY_DETAIL_SPECS del backend, con metadatos de presentacion.
 * El formulario de propiedades se genera desde aqui: agregar un campo nuevo
 * es una linea en esta tabla (y su columna en la migracion).
 */
export const DETAIL_SPECS = Object.freeze({
  apartamento: [
    { name: 'habitaciones', label: 'Habitaciones', type: 'number', min: 0 },
    { name: 'banos', label: 'Banos', type: 'number', min: 0 },
    { name: 'areaM2', label: 'Area (m2)', type: 'number', min: 1, required: true },
    { name: 'piso', label: 'Piso', type: 'number', min: 0 },
    { name: 'parqueaderos', label: 'Parqueaderos', type: 'number', min: 0 },
    { name: 'administracionMensual', label: 'Administracion mensual', type: 'number', min: 0, format: 'money' },
    { name: 'antiguedadAnos', label: 'Antiguedad (anos)', type: 'number', min: 0 },
    { name: 'ascensor', label: 'Tiene ascensor', type: 'boolean' },
    { name: 'amoblado', label: 'Amoblado', type: 'boolean' },
  ],
  casa: [
    { name: 'habitaciones', label: 'Habitaciones', type: 'number', min: 0 },
    { name: 'banos', label: 'Banos', type: 'number', min: 0 },
    { name: 'areaLoteM2', label: 'Area del lote (m2)', type: 'number', min: 1, required: true },
    { name: 'areaConstruidaM2', label: 'Area construida (m2)', type: 'number', min: 0 },
    { name: 'pisos', label: 'Pisos', type: 'number', min: 1 },
    { name: 'parqueaderos', label: 'Parqueaderos', type: 'number', min: 0 },
    { name: 'administracionMensual', label: 'Administracion mensual', type: 'number', min: 0, format: 'money' },
    { name: 'antiguedadAnos', label: 'Antiguedad (anos)', type: 'number', min: 0 },
    { name: 'patio', label: 'Tiene patio', type: 'boolean' },
    { name: 'conjuntoCerrado', label: 'Conjunto cerrado', type: 'boolean' },
  ],
  lote: [
    { name: 'areaM2', label: 'Area (m2)', type: 'number', min: 1, required: true },
    {
      name: 'usoSuelo',
      label: 'Uso del suelo',
      type: 'select',
      options: ['residencial', 'comercial', 'industrial', 'agricola', 'mixto'],
    },
    { name: 'frenteM', label: 'Frente (m)', type: 'number', min: 0 },
    { name: 'fondoM', label: 'Fondo (m)', type: 'number', min: 0 },
    {
      name: 'topografia',
      label: 'Topografia',
      type: 'select',
      options: ['plano', 'inclinado', 'irregular'],
    },
    {
      name: 'serviciosDisponibles',
      label: 'Servicios disponibles',
      type: 'tags',
      hint: 'Separe con comas: agua, energia, gas...',
    },
    { name: 'escriturado', label: 'Escriturado', type: 'boolean' },
  ],
  oficina: [
    { name: 'areaM2', label: 'Area (m2)', type: 'number', min: 1, required: true },
    { name: 'banos', label: 'Banos', type: 'number', min: 0 },
    { name: 'piso', label: 'Piso', type: 'number', min: 0 },
    { name: 'parqueaderos', label: 'Parqueaderos', type: 'number', min: 0 },
    { name: 'salasReuniones', label: 'Salas de reuniones', type: 'number', min: 0 },
    { name: 'administracionMensual', label: 'Administracion mensual', type: 'number', min: 0, format: 'money' },
    { name: 'recepcion', label: 'Tiene recepcion', type: 'boolean' },
  ],
});

export const specFor = (tipo) => DETAIL_SPECS[tipo] ?? [];

/** Valores iniciales del formulario para un tipo dado. */
export function emptyDetails(tipo) {
  return Object.fromEntries(specFor(tipo).map((field) => {
    if (field.type === 'boolean') return [field.name, false];
    if (field.type === 'tags') return [field.name, []];
    if (field.type === 'select') return [field.name, field.options[0]];
    return [field.name, ''];
  }));
}

/** Normaliza el payload de detalles antes de enviarlo a la API. */
export function serializeDetails(tipo, values) {
  const result = {};
  for (const field of specFor(tipo)) {
    const value = values[field.name];
    if (field.type === 'boolean') { result[field.name] = Boolean(value); continue; }
    if (field.type === 'tags') {
      result[field.name] = Array.isArray(value)
        ? value
        : String(value ?? '').split(',').map((v) => v.trim()).filter(Boolean);
      continue;
    }
    if (value === '' || value === null || value === undefined) continue;
    result[field.name] = field.type === 'number' ? Number(value) : value;
  }
  return result;
}

/** Resumen corto para tarjetas: "3 hab · 2 banos · 128 m2". */
export function detailsSummary(propiedad) {
  const d = propiedad.detalles ?? {};
  const parts = [];
  if (d.habitaciones) parts.push(`${d.habitaciones} hab`);
  if (d.banos) parts.push(`${d.banos} banos`);
  const area = d.areaM2 ?? d.areaLoteM2;
  if (area) parts.push(`${area} m2`);
  if (propiedad.tipo === 'lote' && d.usoSuelo) parts.push(d.usoSuelo);
  if (propiedad.tipo === 'oficina' && d.salasReuniones) parts.push(`${d.salasReuniones} salas`);
  return parts.join(' · ');
}
