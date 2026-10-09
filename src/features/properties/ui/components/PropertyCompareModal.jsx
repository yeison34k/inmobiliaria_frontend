import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { useTranslation } from '@shared/i18n/index.js';

/**
 * Modal / Cajón comparador de propiedades lado a lado.
 * Permite contrastar de 2 a 4 inmuebles en precio, $/m², especificaciones,
 * amenidades y contacto directo.
 */
export function PropertyCompareModal({
  propiedades = [],
  isOpen,
  onClose,
  onRemove,
  onClear,
}) {
  const { t, formatMoney, typeLabel, operationLabel, isEn } = useTranslation();

  // Cerrar con Escape y bloquear scroll del body
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calcular precio por metro cuadrado y destacar la opción más costo-eficiente
  const itemsConMetricas = propiedades.map((p) => {
    const d = p.detalles ?? {};
    const area = d.areaM2 || d.areaConstruidaM2 || d.areaLoteM2 || p.area;
    const precioM2 = area && p.precio ? Math.round(p.precio / area) : null;
    return { ...p, areaCalc: area, precioM2Calc: precioM2 };
  });

  // Encontrar el precio/m2 más bajo entre las que tienen cálculo disponible
  const preciosM2Validos = itemsConMetricas
    .map((p) => p.precioM2Calc)
    .filter((val) => typeof val === 'number' && val > 0);
  const mejorPrecioM2 = preciosM2Validos.length > 1 ? Math.min(...preciosM2Validos) : null;

  const handleWhatsApp = (propiedad) => {
    const rawPhone = propiedad.asesor?.whatsapp || propiedad.asesor?.telefono || '573001234567';
    let clean = String(rawPhone).replace(/\D/g, '');
    if (clean.length === 10 && !clean.startsWith('57')) clean = `57${clean}`;
    const targetPhone = clean || '573001234567';

    const nombre = propiedad.nombrePublico || propiedad.titulo;
    const precio = formatMoney(propiedad.precio, propiedad.moneda);
    const ref = propiedad.codigo || '';
    const link = `${window.location.origin}/propiedades/${propiedad.slug}`;

    const mensaje = isEn
      ? `Hello! I am comparing properties on your site and would like advisory on:\n*${nombre}* (Ref: ${ref})\n💰 Price: ${precio}\n🔗 Link: ${link}`
      : `¡Hola! Estoy comparando propiedades en su portal y me interesa recibir asesoría sobre:\n*${nombre}* (Ref: ${ref})\n💰 Precio: ${precio}\n🔗 Enlace: ${link}`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="compare-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="compare-modal-title">
      <div className="compare-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del modal */}
        <header className="compare-modal-header">
          <div>
            <div className="compare-modal-badge">
              <span>⚖️</span> {t('catalog.compareBar.title')} ({propiedades.length}/4)
            </div>
            <h2 id="compare-modal-title" className="compare-modal-title">
              {t('catalog.compareModal.title')}
            </h2>
            <p className="compare-modal-subtitle">
              {t('catalog.compareModal.subtitle')}
            </p>
          </div>
          <div className="compare-modal-actions">
            {propiedades.length > 0 && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={onClear}
                title={t('catalog.compareBar.clear')}
              >
                {t('catalog.compareBar.clear')}
              </button>
            )}
            <button
              type="button"
              className="compare-modal-close"
              onClick={onClose}
              aria-label={t('catalog.compareModal.close')}
              title={t('catalog.compareModal.close')}
            >
              ✕
            </button>
          </div>
        </header>

        {propiedades.length === 0 ? (
          <div className="compare-modal-empty">
            <p>{t('catalog.compareModal.empty')}</p>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              {isEn ? 'Browse properties' : 'Explorar propiedades'}
            </button>
          </div>
        ) : (
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-table__feature-col">
                    <span>{isEn ? 'Property' : 'Inmueble'}</span>
                  </th>
                  {itemsConMetricas.map((p) => {
                    const foto = p.imagenPrincipal || p.imagenes?.[0]?.url || p.imagenes?.[0];
                    return (
                      <th key={p.id} className="compare-table__prop-col">
                        <div className="compare-card-head">
                          <button
                            type="button"
                            className="compare-card-remove"
                            onClick={() => onRemove(p.id)}
                            title={isEn ? 'Remove from comparison' : 'Quitar de la comparación'}
                            aria-label={isEn ? 'Remove property' : 'Quitar inmueble'}
                          >
                            ✕
                          </button>
                          <div className="compare-card-thumb">
                            {foto ? (
                              <SmartImage src={foto} alt={p.titulo} />
                            ) : (
                              <div className="compare-card-thumb-empty">Sin foto</div>
                            )}
                            <span className="compare-card-chip">{operationLabel(p.operacion)}</span>
                          </div>
                          <strong className="compare-card-name" title={p.nombrePublico || p.titulo}>
                            {p.nombrePublico || p.titulo}
                          </strong>
                          <span className="compare-card-code">{p.codigo || 'REF'}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* PRECIO */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{isEn ? 'Price' : 'Precio'}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id} className="compare-val-price">
                      <span className="compare-price-highlight">
                        {formatMoney(p.precio, p.moneda)}
                      </span>
                      {p.operacion === 'arriendo' && (
                        <small className="compare-price-period">{t('card.perMonth')}</small>
                      )}
                    </td>
                  ))}
                </tr>

                {/* PRECIO POR METRO CUADRADO */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{t('catalog.compareModal.priceM2')}</strong>
                  </td>
                  {itemsConMetricas.map((p) => {
                    const esElMejor = mejorPrecioM2 && p.precioM2Calc === mejorPrecioM2;
                    return (
                      <td key={p.id}>
                        {p.precioM2Calc ? (
                          <div className="compare-m2-box">
                            <span>{formatMoney(p.precioM2Calc, p.moneda)} / m²</span>
                            {esElMejor && (
                              <span className="compare-best-badge" title="Mejor costo por área">
                                🌟 {t('catalog.compareModal.bestPriceM2')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="compare-faint">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* UBICACIÓN */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{t('catalog.compareModal.location')}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id}>
                      <span className="compare-icon-text">
                        📍 {[p.ubicacion?.barrio, p.ubicacion?.ciudad].filter(Boolean).join(', ') || '—'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* TIPO DE INMUEBLE */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{t('catalog.compareModal.type')}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id}>
                      <span className="compare-tag-type">{typeLabel(p.tipo)}</span>
                    </td>
                  ))}
                </tr>

                {/* ÁREA */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{t('catalog.compareModal.area')}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id}>
                      {p.areaCalc ? <strong>{p.areaCalc} m²</strong> : <span className="compare-faint">—</span>}
                    </td>
                  ))}
                </tr>

                {/* HABITACIONES */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{t('catalog.compareModal.rooms')}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id}>
                      {p.detalles?.habitaciones ? (
                        <span>🛏️ {p.detalles.habitaciones}</span>
                      ) : (
                        <span className="compare-faint">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* BAÑOS */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{t('catalog.compareModal.baths')}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id}>
                      {p.detalles?.banos ? (
                        <span>🛁 {p.detalles.banos}</span>
                      ) : (
                        <span className="compare-faint">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* PARQUEADEROS */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{t('catalog.compareModal.parking')}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id}>
                      {p.detalles?.parqueaderos ? (
                        <span>🚗 {p.detalles.parqueaderos}</span>
                      ) : (
                        <span className="compare-faint">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* TOUR 3D */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{t('catalog.compareModal.tour3d')}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id}>
                      {p.tourUrl || p.historia?.tourUrl ? (
                        <span className="compare-badge-3d">🥽 {isEn ? 'Available' : 'Disponible'}</span>
                      ) : (
                        <span className="compare-faint">{isEn ? 'Not included' : 'No'}</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* ADMINISTRACIÓN */}
                <tr>
                  <td className="compare-table__feature-col">
                    <strong>{t('catalog.compareModal.adminFee')}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id}>
                      {p.detalles?.administracionMensual ? (
                        <span>{formatMoney(p.detalles.administracionMensual, p.moneda)} / mes</span>
                      ) : (
                        <span className="compare-faint">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* BOTONES DE ACCIÓN */}
                <tr className="compare-table__actions-row">
                  <td className="compare-table__feature-col">
                    <strong>{isEn ? 'Actions' : 'Acciones'}</strong>
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id}>
                      <div className="compare-cell-actions">
                        <Link
                          to={`/propiedades/${p.slug}`}
                          className="btn btn--primary btn--sm compare-btn-view"
                          onClick={onClose}
                        >
                          {t('catalog.compareModal.viewProperty')} →
                        </Link>
                        <button
                          type="button"
                          className="compare-btn-wa"
                          onClick={() => handleWhatsApp(p)}
                          title={t('catalog.compareModal.contact')}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.697.073-2.18-.541-1.614-.666-2.613-2.372-2.694-2.48-.08-.108-.66-88-.66-1.677 0-.796.417-1.189.566-1.351.149-.162.327-.202.435-.202.109 0 .218.001.313.006.101.005.236-.039.369.28.136.326.463 1.13.504 1.211.04.082.067.177.013.284-.053.107-.08.175-.16.269-.079.094-.167.21-.238.282-.08.082-.162.171-.07.328.093.158.411.678.882 1.097.606.539 1.116.707 1.274.786.158.079.251.069.344-.04.093-.108.399-.464.506-.624.106-.16.213-.133.359-.08.146.053.929.438 1.089.518.16.079.266.12.306.186.04.066.04.385-.104.79zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.659 1.438 5.169L2 22l4.985-1.408C8.423 21.523 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.159-.472-4.444-1.285l-.319-.202-2.956.834.843-2.887-.211-.336C4.053 14.996 3.6 13.535 3.6 12c0-4.632 3.768-8.4 8.4-8.4 4.633 0 8.4 3.768 8.4 8.4 0 4.632-3.767 8.4-8.4 8.4z" />
                          </svg>
                          <span>{t('card.contactWhatsApp')}</span>
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
