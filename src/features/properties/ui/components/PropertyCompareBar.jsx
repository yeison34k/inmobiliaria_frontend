import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { useTranslation } from '@shared/i18n/index.js';

/**
 * Barra flotante inferior para gestión rápida de propiedades en comparación.
 * Aparece dinámicamente cuando el usuario marca al menos una propiedad.
 */
export function PropertyCompareBar({
  propiedades = [],
  onOpenModal,
  onRemove,
  onClear,
}) {
  const { t, formatMoney, isEn } = useTranslation();

  if (!propiedades.length) return null;

  return (
    <aside className="compare-bar" aria-label={t('catalog.compareBar.title')}>
      <div className="compare-bar__info">
        <div className="compare-bar__title-row">
          <span className="compare-bar__icon" aria-hidden="true">⚖️</span>
          <strong>{t('catalog.compareBar.title')}</strong>
          <span className="compare-bar__count">
            {propiedades.length}/4 {t('catalog.compareBar.count')}
          </span>
        </div>
      </div>

      <div className="compare-bar__thumbs">
        {propiedades.map((p) => {
          const foto = p.imagenPrincipal || p.imagenes?.[0]?.url || p.imagenes?.[0];
          return (
            <div key={p.id} className="compare-bar__thumb" title={p.nombrePublico || p.titulo}>
              {foto ? (
                <SmartImage src={foto} alt={p.titulo} />
              ) : (
                <span className="compare-bar__thumb-empty">🏠</span>
              )}
              <span className="compare-bar__thumb-price">
                {formatMoney(p.precio, p.moneda)}
              </span>
              <button
                type="button"
                className="compare-bar__thumb-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(p.id);
                }}
                aria-label={`Quitar ${p.titulo}`}
                title="Quitar"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="compare-bar__actions">
        <button
          type="button"
          className="btn btn--primary btn--sm compare-bar__btn-main"
          onClick={onOpenModal}
        >
          {t('catalog.compareBar.btn')} ({propiedades.length})
        </button>

        <button
          type="button"
          className="btn btn--ghost btn--sm compare-bar__btn-clear"
          onClick={onClear}
          title={t('catalog.compareBar.clear')}
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
