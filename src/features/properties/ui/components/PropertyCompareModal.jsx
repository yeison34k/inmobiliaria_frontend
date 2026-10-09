import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { useTranslation } from '@shared/i18n/index.js';

/**
 * Modal comparador de propiedades lado a lado.
 * Diseñado bajo la estética minimalista y editorial de la plataforma.
 * Renderizado directamente en document.body mediante portal para flotar sobre el viewport
 * sin sufrir interferencias de contexto de apilamiento o transformaciones de páginas.
 */
export function PropertyCompareModal({
  propiedades = [],
  isOpen,
  onClose,
  onRemove,
  onClear,
}) {
  const { t, formatMoney, typeLabel, operationLabel, isEn } = useTranslation();

  // Control de tecla Escape y bloqueo de desplazamiento del fondo
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
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

  // Cálculo de precio por m² y detección de la mejor relación costo/área
  const itemsConMetricas = propiedades.map((p) => {
    const d = p.detalles ?? {};
    const area = d.areaM2 || d.areaConstruidaM2 || d.areaLoteM2 || p.area;
    const precioM2 = area && p.precio ? Math.round(p.precio / area) : null;
    return { ...p, areaCalc: area, precioM2Calc: precioM2 };
  });

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
      ? `Hello! I am comparing properties on your site and would like advisory on:\n*${nombre}* (Ref: ${ref})\nPrice: ${precio}\nLink: ${link}`
      : `¡Hola! Estoy comparando propiedades en su portal y me interesa recibir asesoría sobre:\n*${nombre}* (Ref: ${ref})\nPrecio: ${precio}\nEnlace: ${link}`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
  };

  const modalNode = (
    <div
      className="comp-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comp-modal-heading"
    >
      <div className="comp-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado del modal */}
        <header className="comp-modal-header">
          <div className="comp-modal-header__info">
            <span className="comp-modal-header__kicker">
              {isEn ? 'Side-by-side comparison' : 'Comparativa de inmuebles'} ({propiedades.length}/4)
            </span>
            <h2 id="comp-modal-heading" className="comp-modal-header__title">
              {isEn ? 'Compare Properties' : 'Comparador de Propiedades'}
            </h2>
            <p className="comp-modal-header__subtitle">
              {isEn
                ? 'Evaluate pricing, area, and specifications side by side.'
                : 'Evalúe precios, áreas y especificaciones técnicas lado a lado.'}
            </p>
          </div>

          <div className="comp-modal-header__actions">
            {propiedades.length > 0 && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={onClear}
              >
                {isEn ? 'Clear all' : 'Limpiar selección'}
              </button>
            )}
            <button
              type="button"
              className="comp-modal-close"
              onClick={onClose}
              aria-label={isEn ? 'Close' : 'Cerrar'}
              title={isEn ? 'Close' : 'Cerrar'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {propiedades.length === 0 ? (
          <div className="comp-modal-empty">
            <p>{isEn ? 'No properties selected for comparison.' : 'No has seleccionado propiedades para comparar.'}</p>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              {isEn ? 'Browse catalog' : 'Explorar catálogo'}
            </button>
          </div>
        ) : (
          <div className="comp-modal-body">
            <table className="comp-table">
              <thead>
                <tr>
                  <th className="comp-table__col-label">
                    <span>{isEn ? 'Feature' : 'Especificación'}</span>
                  </th>
                  {itemsConMetricas.map((p) => {
                    const foto = p.imagenPrincipal || p.imagenes?.[0]?.url || p.imagenes?.[0];
                    const id = p.id ?? p.slug;
                    return (
                      <th key={id} className="comp-table__col-prop">
                        <div className="comp-card-head">
                          <button
                            type="button"
                            className="comp-card-head__remove"
                            onClick={() => onRemove?.(id)}
                            title={isEn ? 'Remove from comparison' : 'Quitar de la comparación'}
                            aria-label={isEn ? 'Remove property' : 'Quitar propiedad'}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>

                          <div className="comp-card-head__thumb">
                            {foto ? (
                              <SmartImage src={foto} alt={p.titulo} />
                            ) : (
                              <span className="comp-card-head__empty-img">Sin imagen</span>
                            )}
                            <span className="comp-card-head__badge">
                              {operationLabel(p.operacion)}
                            </span>
                          </div>

                          <strong className="comp-card-head__title" title={p.nombrePublico || p.titulo}>
                            {p.nombrePublico || p.titulo}
                          </strong>
                          <span className="comp-card-head__ref">{p.codigo || 'REF'}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* PRECIO TOTAL */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? 'Total Price' : 'Precio Total'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug} className="comp-val-price">
                      <strong>{formatMoney(p.precio, p.moneda)}</strong>
                      {p.operacion === 'arriendo' && (
                        <small className="comp-val-period">{t('card.perMonth')}</small>
                      )}
                    </td>
                  ))}
                </tr>

                {/* PRECIO POR METRO CUADRADO */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? 'Price per m²' : 'Precio / m²'}
                  </td>
                  {itemsConMetricas.map((p) => {
                    const esElMejor = mejorPrecioM2 && p.precioM2Calc === mejorPrecioM2;
                    return (
                      <td key={p.id ?? p.slug}>
                        {p.precioM2Calc ? (
                          <div className="comp-m2-wrap">
                            <span>{formatMoney(p.precioM2Calc, p.moneda)} / m²</span>
                            {esElMejor && (
                              <span className="comp-best-chip" title={isEn ? 'Best price per square meter' : 'Mejor relación precio por área'}>
                                {isEn ? 'Best $/m²' : 'Mejor $/m²'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="comp-muted">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* TIPO DE INMUEBLE */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? 'Property Type' : 'Tipo de Inmueble'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug}>
                      <span className="comp-tag-type">{typeLabel(p.tipo)}</span>
                    </td>
                  ))}
                </tr>

                {/* UBICACIÓN */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? 'Location' : 'Ubicación'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug}>
                      <span className="comp-loc-text">
                        {[p.ubicacion?.barrio, p.ubicacion?.ciudad].filter(Boolean).join(', ') || '—'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* ÁREA */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? 'Built Area' : 'Área Construida'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug}>
                      {p.areaCalc ? <strong>{p.areaCalc} m²</strong> : <span className="comp-muted">—</span>}
                    </td>
                  ))}
                </tr>

                {/* HABITACIONES */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? 'Bedrooms' : 'Habitaciones'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug}>
                      {p.detalles?.habitaciones ? `${p.detalles.habitaciones} hab` : <span className="comp-muted">—</span>}
                    </td>
                  ))}
                </tr>

                {/* BAÑOS */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? 'Bathrooms' : 'Baños'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug}>
                      {p.detalles?.banos ? `${p.detalles.banos} baños` : <span className="comp-muted">—</span>}
                    </td>
                  ))}
                </tr>

                {/* PARQUEADEROS */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? 'Parking Spaces' : 'Parqueaderos'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug}>
                      {p.detalles?.parqueaderos ? `${p.detalles.parqueaderos} parq` : <span className="comp-muted">—</span>}
                    </td>
                  ))}
                </tr>

                {/* RECORRIDO VIRTUAL 3D */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? '3D Tour' : 'Recorrido 3D'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug}>
                      {p.tourUrl || p.historia?.tourUrl ? (
                        <span className="comp-chip-tour">{isEn ? 'Available' : 'Disponible'}</span>
                      ) : (
                        <span className="comp-muted">{isEn ? 'Not included' : 'No incluido'}</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* ADMINISTRACIÓN MENSUAL */}
                <tr>
                  <td className="comp-table__col-label">
                    {isEn ? 'Monthly HOA' : 'Administración'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug}>
                      {p.detalles?.administracionMensual ? (
                        <span>{formatMoney(p.detalles.administracionMensual, p.moneda)} / mes</span>
                      ) : (
                        <span className="comp-muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* ACCIONES DIRECTAS */}
                <tr className="comp-table__row-actions">
                  <td className="comp-table__col-label">
                    {isEn ? 'Actions' : 'Acciones'}
                  </td>
                  {itemsConMetricas.map((p) => (
                    <td key={p.id ?? p.slug}>
                      <div className="comp-actions-cell">
                        <Link
                          to={`/propiedades/${p.slug}`}
                          className="btn btn--primary btn--sm comp-btn-view"
                          onClick={onClose}
                        >
                          {isEn ? 'View property' : 'Ver propiedad'}
                        </Link>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm comp-btn-wa"
                          onClick={() => handleWhatsApp(p)}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.697.073-2.18-.541-1.614-.666-2.613-2.372-2.694-2.48-.08-.108-.66-88-.66-1.677 0-.796.417-1.189.566-1.351.149-.162.327-.202.435-.202.109 0 .218.001.313.006.101.005.236-.039.369.28.136.326.463 1.13.504 1.211.04.082.067.177.013.284-.053.107-.08.175-.16.269-.079.094-.167.21-.238.282-.08.082-.162.171-.07.328.093.158.411.678.882 1.097.606.539 1.116.707 1.274.786.158.079.251.069.344-.04.093-.108.399-.464.506-.624.106-.16.213-.133.359-.08.146.053.929.438 1.089.518.16.079.266.12.306.186.04.066.04.385-.104.79zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.659 1.438 5.169L2 22l4.985-1.408C8.423 21.523 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.159-.472-4.444-1.285l-.319-.202-2.956.834.843-2.887-.211-.336C4.053 14.996 3.6 13.535 3.6 12c0-4.632 3.768-8.4 8.4-8.4 4.633 0 8.4 3.768 8.4 8.4 0 4.632-3.767 8.4-8.4 8.4z" />
                          </svg>
                          <span>WhatsApp</span>
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

  return typeof document !== 'undefined'
    ? createPortal(modalNode, document.body)
    : modalNode;
}
