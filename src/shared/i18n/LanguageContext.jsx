import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { es } from './translations/es.js';
import { en } from './translations/en.js';

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

    const formatNumber = (num) =>
      num === null || num === undefined || isNaN(num)
        ? '-'
        : new Intl.NumberFormat(locale).format(Number(num));

    const formatMoney = (val, moneda = 'COP') => {
      if (val === null || val === undefined || isNaN(val)) return '-';
      const num = Number(val);
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: moneda,
          maximumFractionDigits: 0,
        }).format(num);
      } catch {
        return `$ ${formatNumber(num)} ${moneda}`;
      }
    };

    const formatArea = (val) => (val ? `${formatNumber(val)} m²` : '-');

    const formatDate = (val) =>
      val
        ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(val))
        : '-';

    const relativeDays = (val) => {
      if (!val) return '-';
      const days = Math.max(0, Math.floor((Date.now() - new Date(val).getTime()) / 86_400_000));
      if (isEn) {
        if (days === 0) return 'today';
        if (days === 1) return 'yesterday';
        return `${days} days ago`;
      }
      if (days === 0) return 'hoy';
      if (days === 1) return 'ayer';
      return `hace ${days} días`;
    };

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
      formatNumber,
      formatMoney,
      formatArea,
      formatDate,
      relativeDays,
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
