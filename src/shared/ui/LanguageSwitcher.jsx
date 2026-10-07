import { useTranslation } from '../i18n/index.js';

export function LanguageSwitcher({ className = '', variant = 'pill' }) {
  const { language, setLanguage } = useTranslation();

  return (
    <div
      className={`lang-switcher lang-switcher--${variant} ${className}`}
      role="group"
      aria-label="Selector de idioma / Language selector"
    >
      <button
        type="button"
        className={`lang-switcher__btn ${language === 'es' ? 'is-active' : ''}`}
        onClick={() => setLanguage('es')}
        title="Español"
        aria-pressed={language === 'es'}
      >
        <span className="lang-switcher__flag" aria-hidden="true">🇨🇴</span>
        <span className="lang-switcher__code">ES</span>
      </button>

      <span className="lang-switcher__sep" aria-hidden="true">/</span>

      <button
        type="button"
        className={`lang-switcher__btn ${language === 'en' ? 'is-active' : ''}`}
        onClick={() => setLanguage('en')}
        title="English"
        aria-pressed={language === 'en'}
      >
        <span className="lang-switcher__flag" aria-hidden="true">🇺🇸</span>
        <span className="lang-switcher__code">EN</span>
      </button>
    </div>
  );
}
