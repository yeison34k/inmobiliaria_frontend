import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import { detailsSummary } from '../../domain/detailSpecs.js';
import { conceptOf } from '../../domain/concepts.js';
import { catalogApi } from '../../infrastructure/propertyApi.js';
import { propertyKeys } from '../../application/usePropertiesQueries.js';
import { prefetchPropertyExperience } from '@app/router.jsx';
import { PropertyStatusBadge } from './PropertyStatusBadge.jsx';

/**
 * Tarjeta del catalogo con navegación de fotos por flechas.
 * Al pasar el cursor aparece el titular emocional de la propiedad: el dato
 * frio queda siempre visible y la promesa se revela como premio.
 */
export function PropertyCard({ propiedad, to, mostrarEstado = false, ancha = false }) {
  const { t, formatMoney, typeLabel, operationLabel, isEn } = useTranslation();
  const queryClient = useQueryClient();
  const historia = propiedad.historia ?? {};
  const concepto = conceptOf(historia.concepto);

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

  return (
    <article className={ancha ? 'tarjeta tarjeta--ancha' : 'tarjeta'}>
      <Link to={to} onMouseEnter={handlePrefetch} onFocus={handlePrefetch}>
        <span className="tarjeta__foto">
          {fotoActual
            ? <SmartImage src={fotoActual} alt={propiedad.titulo} />
            : <span className="tarjeta__vacia">{t('card.noImage')}</span>}

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

          <span className="tarjeta__cinta">{operationLabel(propiedad.operacion)}</span>
          {propiedad.destacada ? <span className="tarjeta__sello">{t('card.featured')}</span> : null}
          {(propiedad.tourUrl || historia.tourUrl) ? (
            <span className="tarjeta__tour3d" title={t('card.tour3dTitle')}>
              {t('card.tour3dBadge')}
            </span>
          ) : null}

          {/* En la tarjeta normal el titular se revela sobre la foto */}
          {historia.titular && !ancha ? (
            <span className="tarjeta__revelado">
              <span className="tarjeta__titular">{historia.titular}</span>
              <span className="tarjeta__accion">{t('card.viewExperience')}</span>
            </span>
          ) : null}
        </span>

        <span className="tarjeta__cuerpo">
          <span className="tarjeta__lugar">{propiedad.ubicacion?.etiqueta ?? '-'}</span>

          <span className="tarjeta__nombre">
            {propiedad.nombrePublico ?? propiedad.titulo}
          </span>

          {/* En la tarjeta ancha hay sitio para mostrarlo siempre */}
          {historia.titular && ancha ? (
            <span className="tarjeta__titular tarjeta__titular--fijo">{historia.titular}</span>
          ) : null}

          <span className="tarjeta__datos">
            {typeLabel(propiedad.tipo)}
            {detailsSummary(propiedad) ? ` · ${detailsSummary(propiedad)}` : ''}
          </span>

          <span className="tarjeta__pie">
            <span className="tarjeta__precio">
              {formatMoney(propiedad.precio, propiedad.moneda)}
              {propiedad.operacion === 'arriendo' ? <em>{t('card.perMonth')}</em> : null}
            </span>
            {mostrarEstado
              ? <PropertyStatusBadge estado={propiedad.estado} />
              : <span className="tarjeta__concepto" style={{ '--punto': concepto.tokens['--exp-accent'] }}>
                  {concepto.nombre}
                </span>}
          </span>
        </span>
      </Link>
    </article>
  );
}

/** Esqueleto de carga: conserva el ritmo de la grilla y evita el salto. */
export function PropertyCardSkeleton({ ancha = false }) {
  return (
    <article className={`tarjeta tarjeta--esqueleto ${ancha ? 'tarjeta--ancha' : ''}`} aria-hidden="true">
      <span className="tarjeta__foto" />
      <span className="tarjeta__cuerpo">
        <span className="linea linea--corta" />
        <span className="linea linea--larga" />
        <span className="linea linea--media" />
      </span>
    </article>
  );
}
