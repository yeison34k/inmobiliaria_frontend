import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { es } from './translations/es.js';
import { en } from './translations/en.js';
import { formatNumber, formatMoney, formatArea, formatDate, formatDateTime, relativeDays } from '../lib/format.js';

const STORAGE_KEY = 'inmobiliaria_lang';
const TRANSLATIONS = { es, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
      const browserLang = navigator.language?.toLowerCase() || '';
      return browserLang.startsWith('en') ? 'en' : 'es';
    } catch {
      return 'es';
    }
  });

  const setLanguage = (lang) => {
    const valid = lang === 'en' ? 'en' : 'es';
    setLanguageState(valid);
    try {
      localStorage.setItem(STORAGE_KEY, valid);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.es;
    const fallbackDict = TRANSLATIONS.es;

    /**
     * Traducción por clave de puntos (ej: 'home.hero.title1')
     * con reemplazo opcional de parámetros (ej: { name: 'Penthouse' })
     */
    const t = (path, params) => {
      const keys = path.split('.');
      let val = keys.reduce((acc, k) => acc?.[k], currentDict);
      if (val === undefined) {
        val = keys.reduce((acc, k) => acc?.[k], fallbackDict);
      }
      if (val === undefined) return path;

      if (typeof val === 'string' && params && typeof params === 'object') {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replaceAll(`{${k}}`, v ?? ''),
          val
        );
      }
      return val;
    };

    const isEn = language === 'en';
    const locale = isEn ? 'en-US' : 'es-CO';

    const formatNum = (num) => formatNumber(num, locale);
    const formatMon = (val, moneda = 'COP') => formatMoney(val, moneda, locale);
    const formatAr = (val) => formatArea(val, locale);
    const formatDt = (val) => formatDate(val, locale);
    const formatDtTime = (val) => formatDateTime(val, locale);
    const relDays = (val) => relativeDays(val, locale);

    const typeLabel = (tipo) =>
      t(`types.${tipo}`) || tipo;

    const operationLabel = (operacion) =>
      t(`operations.${operacion}`) || operacion;

    const statusLabel = (estado) =>
      t(`status.${estado}`) || estado;

    return {
      language,
      isEn,
      setLanguage,
      toggleLanguage: () => setLanguage(language === 'es' ? 'en' : 'es'),
      t,
      formatNumber: formatNum,
      formatMoney: formatMon,
      formatArea: formatAr,
      formatDate: formatDt,
      formatDateTime: formatDtTime,
      relativeDays: relDays,
      typeLabel,
      operationLabel,
      statusLabel,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation debe utilizarse dentro de un LanguageProvider');
  }
  return ctx;
}

export const useLanguage = useTranslation;
