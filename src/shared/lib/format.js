const currencyFormatters = new Map();

const getActiveLocale = () => {
  try {
    const lang = document.documentElement.lang || localStorage.getItem('inmobiliaria_lang') || 'es';
    return lang.startsWith('en') ? 'en-US' : 'es-CO';
  } catch {
    return 'es-CO';
  }
};

const formatterFor = (moneda = 'COP', locale = getActiveLocale()) => {
  const key = `${moneda}_${locale}`;
  if (!currencyFormatters.has(key)) {
    currencyFormatters.set(key, new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: moneda,
      maximumFractionDigits: 0,
    }));
  }
  return currencyFormatters.get(key);
};

export const formatNumber = (value, locale = getActiveLocale()) =>
  value === null || value === undefined || isNaN(value)
    ? '-'
    : new Intl.NumberFormat(locale).format(Number(value));

export const formatMoney = (value, moneda = 'COP', locale = getActiveLocale()) => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  try {
    return formatterFor(moneda, locale).format(Number(value));
  } catch {
    return `$ ${formatNumber(value, locale)} ${moneda}`;
  }
};

/**
 * Version compacta para KPIs: "$ 25,5 M", "$ 3.400 M".
 *
 * Todo lo que pasa del millon se expresa en millones, con una sola unidad.
 * Antes convivian "M" y "MM", y en espanol "MM" se lee como millones: un KPI
 * de "$ 3.4 MM" se podia entender como tres millones y medio cuando eran tres
 * mil cuatrocientos. Ademas el corte por valor crudo mostraba "$ 1000.0 M"
 * justo antes de saltar a "$ 1.0 MM".
 *
 * El numero va por Intl y no por toFixed, para que el separador decimal sea el
 * del idioma: "3,4" en espanol, donde el punto separa miles.
 */
export const formatMoneyShort = (value, moneda = 'COP', locale = getActiveLocale()) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return '-';
  if (Math.abs(n) < 1_000_000) return formatMoney(n, moneda, locale);

  const simbolo = moneda === 'USD' ? 'US$' : '$';
  const millones = n / 1_000_000;
  // Bajo mil millones un decimal informa; por encima ya no aporta nada
  const decimales = Math.abs(millones) < 1000 ? 1 : 0;
  const texto = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(millones);

  return `${simbolo} ${texto} M`;
};

export const formatArea = (value, locale = getActiveLocale()) =>
  value ? `${formatNumber(value, locale)} m²` : '-';

export const formatDate = (value, locale = getActiveLocale()) =>
  value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : '-';

export const formatDateTime = (value, locale = getActiveLocale()) =>
  value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';

/** El separador decimal sigue al idioma: "3,5%" en espanol, "3.5%" en ingles. */
export const formatPercent = (value, locale = getActiveLocale()) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return '-';
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n)}%`;
};

export const relativeDays = (value, locale = getActiveLocale()) => {
  if (!value) return '-';
  const isEn = (locale || getActiveLocale()).startsWith('en');
  // Se acota a 0: un reloj de servidor adelantado no debe mostrar dias negativos
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (isEn) {
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  }
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  return `hace ${days} días`;
};
