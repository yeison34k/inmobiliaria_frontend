import { Link } from 'react-router-dom';
import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import { detailsSummary } from '../../domain/detailSpecs.js';
import { conceptOf } from '../../domain/concepts.js';
import { PropertyStatusBadge } from './PropertyStatusBadge.jsx';

/**
 * Tarjeta del catalogo.
 * Al pasar el cursor aparece el titular emocional de la propiedad: el dato
 * frio queda siempre visible y la promesa se revela como premio.
 */
export function PropertyCard({ propiedad, to, mostrarEstado = false, ancha = false }) {
  const { t, formatMoney, typeLabel, operationLabel, isEn } = useTranslation();
  const historia = propiedad.historia ?? {};
  const concepto = conceptOf(historia.concepto);

  return (
    <article className={ancha ? 'tarjeta tarjeta--ancha' : 'tarjeta'}>
      <Link to={to}>
        <span className="tarjeta__foto">
          {propiedad.imagenPrincipal
            ? <SmartImage src={propiedad.imagenPrincipal} alt={propiedad.titulo} />
            : <span className="tarjeta__vacia">{t('card.noImage')}</span>}

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
