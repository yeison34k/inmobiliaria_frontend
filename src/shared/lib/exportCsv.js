/**
 * Exportador de datos a archivo CSV compatible con Excel en Windows.
 * Agrega el BOM UTF-8 (\uFEFF) para que Excel reconozca tildes, ñ y caracteres especiales.
 *
 * @param {string} nombreArchivo - Nombre sugerido sin o con extension .csv
 * @param {Array<Object>} datos - Coleccion de registros a exportar
 * @param {Array<{ header: string, key?: string, format?: (val: any, row: Object) => string }>} columnas
 */
export function exportToCsv(nombreArchivo, datos = [], columnas = []) {
  if (!datos || datos.length === 0) {
    alert('No hay datos disponibles para exportar con los filtros seleccionados.');
    return;
  }

  // Sanitizar valor para celda CSV (escapar comillas dobles y saltos)
  const escapar = (val) => {
    if (val === null || val === undefined) return '';
    const texto = String(val).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
    if (texto.includes(',') || texto.includes('"') || texto.includes(';')) {
      return `"${texto.replace(/"/g, '""')}"`;
    }
    return `"${texto}"`;
  };

  // Encabezados
  const encabezados = columnas.map((c) => escapar(c.header)).join(';');

  // Filas
  const filas = datos.map((row) => {
    return columnas
      .map((col) => {
        const raw = col.key ? row[col.key] : undefined;
        const formatted = col.format ? col.format(raw, row) : raw;
        return escapar(formatted);
      })
      .join(';');
  });

  // BOM UTF-8 para Excel + filas separadas por salto
  const contenidoCsv = '\uFEFF' + [encabezados, ...filas].join('\r\n');

  // Descarga automatica en el navegador
  const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const fechaHoy = new Date().toISOString().split('T')[0];
  const nombreFinal = nombreArchivo.endsWith('.csv')
    ? nombreArchivo
    : `${nombreArchivo}_${fechaHoy}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', nombreFinal);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
