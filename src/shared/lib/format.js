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

export const formatMoney = (value, moneda = 'COP', locale = getActiveLocale()) =>
  value === null || value === undefined ? '-' : formatterFor(moneda, locale).format(Number(value));

/** Version compacta para KPIs: $ 1.250 M */
export const formatMoneyShort = (value, moneda = 'COP', locale = getActiveLocale()) => {
  const n = Number(value ?? 0);
  const symbol = moneda === 'USD' ? 'US$' : '$';
  if (Math.abs(n) >= 1_000_000_000) return `${symbol} ${(n / 1_000_000_000).toFixed(1)} MM`;
  if (Math.abs(n) >= 1_000_000) return `${symbol} ${(n / 1_000_000).toFixed(1)} M`;
  return formatMoney(n, moneda, locale);
};

export const formatNumber = (value, locale = getActiveLocale()) =>
  new Intl.NumberFormat(locale).format(Number(value ?? 0));

export const formatArea = (value, locale = getActiveLocale()) =>
  value ? `${formatNumber(value, locale)} m²` : '-';

export const formatDate = (value, locale = getActiveLocale()) =>
  value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value)) : '-';

export const formatDateTime = (value, locale = getActiveLocale()) =>
  value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';

export const formatPercent = (value) => `${Number(value ?? 0).toFixed(1)}%`;

export const relativeDays = (value) => {
  if (!value) return '-';
  const isEn = getActiveLocale().startsWith('en');
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
