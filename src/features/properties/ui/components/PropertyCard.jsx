import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import { conceptOf } from '../../domain/concepts.js';
import { catalogApi } from '../../infrastructure/propertyApi.js';
import { propertyKeys } from '../../application/usePropertiesQueries.js';
import { prefetchPropertyExperience } from '@app/router.jsx';
import { PropertyStatusBadge } from './PropertyStatusBadge.jsx';

/**
 * Ficha comercial del catálogo de propiedades:
 * - Precio prominente con cálculo automático de $/m² y moneda correcta.
 * - Ubicación clara (barrio, ciudad) y tipo de operación (Venta / Arriendo).
 * - Métricas clave destacadas: habitaciones, baños, m² y parqueaderos.
 * - Fotografías optimizadas (LCP con carga prioritaria condicional, sin saltos CLS).
 * - Botón de contacto directo por WhatsApp en 1 clic.
 * - Selector rápido para el comparador de inmuebles.
 */
export function PropertyCard({
  propiedad,
  to,
  mostrarEstado = false,
  ancha = false,
  prioritaria = false,
  enComparacion = false,
  onToggleComparar = null,
}) {
  const { t, formatMoney, typeLabel, operationLabel, isEn } = useTranslation();
  const queryClient = useQueryClient();
  const historia = propiedad.historia ?? {};
  const concepto = conceptOf(historia.concepto);
  const detalles = propiedad.detalles ?? {};

  // Extraer métricas clave de la ficha
  const area = detalles.areaM2 || detalles.areaConstruidaM2 || detalles.areaLoteM2 || propiedad.area;
  const habitaciones = detalles.habitaciones;
  const banos = detalles.banos;
  const parqueaderos = detalles.parqueaderos;

  // Cálculo de precio por m² para propiedades en venta
  const precioM2 = area && propiedad.precio && propiedad.operacion === 'venta'
    ? Math.round(propiedad.precio / area)
    : null;

  const fotos = (
    propiedad.imagenes?.length
      ? propiedad.imagenes.map((img) => (typeof img === 'string' ? img : img.url))
      : [propiedad.imagenPrincipal]
  ).filter(Boolean);

  const [fotoIdx, setFotoIdx] = useState(0);

  const handleCardPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fotos.length <= 1) return;
    setFotoIdx((prev) => (prev - 1 + fotos.length) % fotos.length);
  };

  const handleCardNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fotos.length <= 1) return;
    setFotoIdx((prev) => (prev + 1) % fotos.length);
  };

  const fotoActual = fotos[fotoIdx] || propiedad.imagenPrincipal;

  const handlePrefetch = () => {
    prefetchPropertyExperience();
    if (propiedad.slug) {
      queryClient.prefetchQuery({
        queryKey: propertyKeys.catalogDetail(propiedad.slug),
        queryFn: () => catalogApi.detailBySlug(propiedad.slug),
        staleTime: 120_000,
      });
    }
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rawPhone = propiedad.asesor?.whatsapp || propiedad.asesor?.telefono || '573001234567';
    let clean = String(rawPhone).replace(/\D/g, '');
    if (clean.length === 10 && !clean.startsWith('57')) clean = `57${clean}`;
    const targetPhone = clean || '573001234567';

    const nombre = propiedad.nombrePublico || propiedad.titulo;
    const precio = formatMoney(propiedad.precio, propiedad.moneda);
    const ref = propiedad.codigo || '';
    const enlace = `${window.location.origin}/propiedades/${propiedad.slug}`;

    const mensaje = isEn
      ? `Hello! I would like advisory regarding this property:\n*${nombre}* (Ref: ${ref})\n💰 Price: ${precio}\n🔗 Link: ${enlace}`
      : `¡Hola! Me gustaría recibir asesoría sobre este inmueble:\n*${nombre}* (Ref: ${ref})\n💰 Precio: ${precio}\n🔗 Enlace: ${enlace}`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
  };

  const ubicacionTexto = [propiedad.ubicacion?.barrio, propiedad.ubicacion?.ciudad].filter(Boolean).join(', ')
    || propiedad.ubicacion?.etiqueta
    || '-';

  return (
    <article className={`tarjeta ${ancha ? 'tarjeta--ancha' : ''} ${enComparacion ? 'is-en-comparacion' : ''}`}>
      <Link to={to} onMouseEnter={handlePrefetch} onFocus={handlePrefetch} className="tarjeta__link">
        {/* Contenedor de Fotografía con Relación de Aspecto Fija (0 CLS) */}
        <span className="tarjeta__foto">
          {fotoActual ? (
            <SmartImage
              src={fotoActual}
              alt={propiedad.titulo}
              loading={prioritaria ? 'eager' : 'lazy'}
              fetchPriority={prioritaria ? 'high' : 'auto'}
            />
          ) : (
            <span className="tarjeta__vacia">{t('card.noImage')}</span>
          )}

          {/* Flechas de galería rápida */}
          {fotos.length > 1 && (
            <>
              <button
                type="button"
                className="tarjeta__arrow tarjeta__arrow--prev"
                onClick={handleCardPrev}
                aria-label="Foto anterior"
                title="Foto anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="tarjeta__arrow tarjeta__arrow--next"
                onClick={handleCardNext}
                aria-label="Foto siguiente"
                title="Foto siguiente"
              >
                ›
              </button>
              <div className="tarjeta__dots">
                {fotos.slice(0, 5).map((_, i) => (
                  <span
                    key={i}
                    className={`tarjeta__dot ${i === (fotoIdx % Math.min(fotos.length, 5)) ? 'is-active' : ''}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Cintas y distintivos sobre la foto */}
          <span className={`tarjeta__cinta tarjeta__cinta--${propiedad.operacion}`}>
            {operationLabel(propiedad.operacion)}
          </span>

          {propiedad.destacada && (
            <span className="tarjeta__sello">{t('card.featured')}</span>
          )}

          {/* Botón de comparador rápido */}
          {onToggleComparar && (
            <button
              type="button"
              className={`tarjeta__btn-comparar ${enComparacion ? 'is-activo' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleComparar(propiedad);
              }}
              aria-label={enComparacion ? t('card.compared') : t('card.compare')}
              title={enComparacion ? t('card.compared') : t('card.compare')}
            >
              <span aria-hidden="true">⚖️</span>
              <span className="tarjeta__btn-comparar-label">
                {enComparacion ? t('card.compared') : t('card.compare')}
              </span>
            </button>
          )}

          {(propiedad.tourUrl || historia.tourUrl) && (
            <span className="tarjeta__tour3d" title={t('card.tour3dTitle')}>
              {t('card.tour3dBadge')}
            </span>
          )}

          {/* Titular emocional en hover */}
          {historia.titular && !ancha && (
            <span className="tarjeta__revelado">
              <span className="tarjeta__titular">{historia.titular}</span>
              <span className="tarjeta__accion">{t('card.viewExperience')}</span>
            </span>
          )}
        </span>

        {/* Cuerpo de la ficha técnica y comercial */}
        <span className="tarjeta__cuerpo">
          <span className="tarjeta__lugar-row">
            <span className="tarjeta__lugar">📍 {ubicacionTexto}</span>
            <span className="tarjeta__tipo-tag">{typeLabel(propiedad.tipo)}</span>
          </span>

          <h3 className="tarjeta__nombre">
            {propiedad.nombrePublico ?? propiedad.titulo}
          </h3>

          {historia.titular && ancha && (
            <span className="tarjeta__titular tarjeta__titular--fijo">{historia.titular}</span>
          )}

          {/* Especificaciones clave legibles en milisegundos */}
          <span className="tarjeta__specs-grid">
            {area ? (
              <span className="tarjeta__spec-chip" title={isEn ? 'Total area' : 'Área total'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/>
                </svg>
                <strong>{area}</strong> m²
              </span>
            ) : null}

            {habitaciones ? (
              <span className="tarjeta__spec-chip" title={isEn ? 'Bedrooms' : 'Habitaciones'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>
                </svg>
                <strong>{habitaciones}</strong> {t('card.specs.rooms')}
              </span>
            ) : null}

            {banos ? (
              <span className="tarjeta__spec-chip" title={isEn ? 'Bathrooms' : 'Baños'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1zm2-6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6H6V6z"/>
                </svg>
                <strong>{banos}</strong> {t('card.specs.baths')}
              </span>
            ) : null}

            {parqueaderos ? (
              <span className="tarjeta__spec-chip" title={isEn ? 'Parking' : 'Parqueaderos'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 16V8h4a2 2 0 0 1 0 4H9"/>
                </svg>
                <strong>{parqueaderos}</strong> {t('card.specs.parking')}
              </span>
            ) : null}
          </span>

          {/* Pie de la tarjeta: Precio destacado + Acciones de contacto */}
          <span className="tarjeta__pie">
            <span className="tarjeta__precio-col">
              <span className="tarjeta__precio">
                {formatMoney(propiedad.precio, propiedad.moneda)}
                {propiedad.operacion === 'arriendo' ? <em>{t('card.perMonth')}</em> : null}
              </span>
              {precioM2 ? (
                <span className="tarjeta__preciom2">
                  {formatMoney(precioM2, propiedad.moneda)} / m²
                </span>
              ) : null}
            </span>

            <span className="tarjeta__acciones-col">
              {/* Botón de contacto directo por WhatsApp */}
              <button
                type="button"
                className="tarjeta__btn-contacto"
                onClick={handleWhatsAppClick}
                title={isEn ? 'Direct WhatsApp contact' : 'Contacto directo por WhatsApp'}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.697.073-2.18-.541-1.614-.666-2.613-2.372-2.694-2.48-.08-.108-.66-88-.66-1.677 0-.796.417-1.189.566-1.351.149-.162.327-.202.435-.202.109 0 .218.001.313.006.101.005.236-.039.369.28.136.326.463 1.13.504 1.211.04.082.067.177.013.284-.053.107-.08.175-.16.269-.079.094-.167.21-.238.282-.08.082-.162.171-.07.328.093.158.411.678.882 1.097.606.539 1.116.707 1.274.786.158.079.251.069.344-.04.093-.108.399-.464.506-.624.106-.16.213-.133.359-.08.146.053.929.438 1.089.518.16.079.266.12.306.186.04.066.04.385-.104.79zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.659 1.438 5.169L2 22l4.985-1.408C8.423 21.523 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.159-.472-4.444-1.285l-.319-.202-2.956.834.843-2.887-.211-.336C4.053 14.996 3.6 13.535 3.6 12c0-4.632 3.768-8.4 8.4-8.4 4.633 0 8.4 3.768 8.4 8.4 0 4.632-3.767 8.4-8.4 8.4z" />
                </svg>
                <span>{t('card.contactWhatsApp')}</span>
              </button>

              {mostrarEstado ? (
                <PropertyStatusBadge estado={propiedad.estado} />
              ) : (
                <span className="tarjeta__concepto" style={{ '--punto': concepto.tokens['--exp-accent'] }}>
                  {concepto.nombre}
                </span>
              )}
            </span>
          </span>
        </span>
      </Link>
    </article>
  );
}

/** Esqueleto de carga con dimensiones exactas para evitar saltos (0 CLS). */
export function PropertyCardSkeleton({ ancha = false }) {
  return (
    <article className={`tarjeta tarjeta--esqueleto ${ancha ? 'tarjeta--ancha' : ''}`} aria-hidden="true">
      <span className="tarjeta__foto" />
      <span className="tarjeta__cuerpo">
        <span className="linea linea--corta" />
        <span className="linea linea--larga" />
        <span className="tarjeta__specs-grid">
          <span className="linea" style={{ width: '50px', height: '22px' }} />
          <span className="linea" style={{ width: '50px', height: '22px' }} />
          <span className="linea" style={{ width: '50px', height: '22px' }} />
        </span>
        <span className="linea linea--media" />
      </span>
    </article>
  );
}
