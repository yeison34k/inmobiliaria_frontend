import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { useTranslation } from '@shared/i18n/index.js';

/**
 * Barra flotante inferior para gestión de propiedades en comparación.
 * Diseñada en sintonía con el sistema visual sobrio y minimalista de la plataforma.
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
    <aside className="compare-dock" aria-label={t('catalog.compareBar.title')}>
      <div className="compare-dock__info">
        <span className="compare-dock__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </span>
        <div className="compare-dock__text">
          <strong className="compare-dock__title">
            {isEn ? 'Compare' : 'Comparar'}
          </strong>
          <span className="compare-dock__counter">
            {propiedades.length}/4 {isEn ? 'selected' : 'seleccionadas'}
          </span>
        </div>
      </div>

      {/* Miniaturas de los inmuebles seleccionados */}
      <div className="compare-dock__thumbs">
        {propiedades.map((p) => {
          const foto = p.imagenPrincipal || p.imagenes?.[0]?.url || p.imagenes?.[0];
          return (
            <div key={p.id} className="compare-dock__thumb" title={p.nombrePublico || p.titulo}>
              {foto ? (
                <SmartImage src={foto} alt={p.titulo} />
              ) : (
                <span className="compare-dock__thumb-fallback">IMG</span>
              )}
              <button
                type="button"
                className="compare-dock__thumb-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(p.id);
                }}
                aria-label={`Quitar ${p.titulo}`}
                title={isEn ? 'Remove' : 'Quitar'}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Acciones principales */}
      <div className="compare-dock__actions">
        <button
          type="button"
          className="btn btn--primary compare-dock__btn-compare"
          onClick={onOpenModal}
        >
          <span>{isEn ? 'Compare now' : 'Comparar ahora'}</span>
          <span className="compare-dock__badge-num">{propiedades.length}</span>
        </button>

        <button
          type="button"
          className="btn btn--ghost compare-dock__btn-clear"
          onClick={onClear}
          title={isEn ? 'Clear all' : 'Limpiar selección'}
        >
          {isEn ? 'Clear' : 'Limpiar'}
        </button>
      </div>
    </aside>
  );
}
