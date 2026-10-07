import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { Pagination } from '@shared/ui/Pagination.jsx';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue.js';
import { useTranslation } from '@shared/i18n/index.js';
import { useCatalogSearch } from '../../application/usePropertiesQueries.js';
import { PropertyCard, PropertyCardSkeleton } from '../components/PropertyCard.jsx';
import { PropertyFilters } from '../components/PropertyFilters.jsx';
import { CatalogMap } from '../components/CatalogMap.jsx';
import { conceptOf } from '../../domain/concepts.js';

const FILTER_KEYS = [
  'q', 'operacion', 'tipos', 'ciudad', 'concepto',
  'precioMin', 'precioMax', 'habitacionesMin', 'banosMin', 'areaMin', 'solo3d', 'orden', 'page',
];

/**
 * Catalogo publico con alternancia de Cuadricula / Dividido / Mapa Interactivo.
 * Los filtros viven en la URL para poder compartir una busqueda.
 */
export function CatalogPage() {
  const { t, formatNumber, formatMoney, typeLabel, isEn } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vista, setVista] = useState(searchParams.get('vista') || 'grid');
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

  const etiquetas = useMemo(() => ({
    q: (v) => `"${v}"`,
    operacion: (v) => (v === 'venta' ? t('catalog.filters.chips.forSale') : t('catalog.filters.chips.forRent')),
    tipos: (v) => typeLabel(v),
    ciudad: (v) => v,
    concepto: (v) => `${t('catalog.filters.chips.collection')}: ${conceptOf(v).nombre}`,
    precioMin: (v) => `${t('catalog.filters.chips.fromPrice')} ${formatMoney(v)}`,
    precioMax: (v) => `${t('catalog.filters.chips.toPrice')} ${formatMoney(v)}`,
    habitacionesMin: (v) => `${v}+ ${t('catalog.filters.chips.rooms')}`,
    banosMin: (v) => `${v}+ ${t('catalog.filters.chips.baths')}`,
    areaMin: (v) => `${v}+ m²`,
    solo3d: () => t('catalog.filters.chips.tour3d'),
  }), [t, formatMoney, typeLabel]);

  const filtrosUrl = useMemo(() => {
    const entries = FILTER_KEYS
      .map((key) => [key, searchParams.get(key)])
      .filter(([, value]) => value !== null && value !== '');
    return Object.fromEntries(entries);
  }, [searchParams]);

  const [filtros, setFiltros] = useState({ orden: 'recientes', page: 1, ...filtrosUrl });
  const qDebounced = useDebouncedValue(filtros.q ?? '', 350);

  const consulta = { ...filtros, q: qDebounced || undefined, pageSize: vista === 'map' ? 36 : 12 };
  const { data, isLoading, isFetching, error, refetch } = useCatalogSearch(consulta);

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
    const params = new URLSearchParams(searchParams);
    if (nuevaVista === 'grid') params.delete('vista');
    else params.set('vista', nuevaVista);
    setSearchParams(params, { replace: true });
  };

  const aplicar = (nuevos) => {
    setFiltros(nuevos);
    const params = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      if (nuevos[key]) params.set(key, String(nuevos[key]));
    }
    if (vista !== 'grid') params.set('vista', vista);
    setSearchParams(params, { replace: true });
  };

  const limpiar = () => aplicar({ orden: 'recientes', page: 1 });
  const quitar = (clave) => aplicar({ ...filtros, [clave]: undefined, page: 1 });

  const activos = Object.entries(filtros)
    .filter(([clave, valor]) => etiquetas[clave] && valor);

  const items = data?.items ?? [];
  const destacarPrimera = filtros.page === 1 || !filtros.page;

  return (
    <section className="catalogo">
      <header className="catalogo__portada">
        <p className="catalogo__kicker">
          {filtros.concepto ? conceptOf(filtros.concepto).nombre : (isEn ? 'Full Portfolio' : 'Inventario completo')}
        </p>
        <h1>
          {data ? formatNumber(data.meta.total) : '—'}
          <span> {data && data.meta.total === 1 ? t('catalog.count_one') : t('catalog.count_other')}</span>
        </h1>
        <p className="catalogo__lead">
          {isEn
            ? 'Each with its full specification sheet, architectural floorplans, and georeferenced neighborhood guide.'
            : 'Cada una con su ficha completa, planos por nivel y recorrido del entorno georreferenciado.'}
        </p>
      </header>

      <PropertyFilters valores={filtros} onChange={aplicar} total={data?.meta.total} />

      {activos.length ? (
        <div className="catalogo__activos">
          {activos.map(([clave, valor]) => (
            <button key={clave} type="button" className="ficha-filtro" onClick={() => quitar(clave)}>
              {etiquetas[clave](valor)}<span aria-hidden="true">×</span>
            </button>
          ))}
          <button type="button" className="ficha-filtro ficha-filtro--limpiar" onClick={limpiar}>
            {t('catalog.clearAll')}
          </button>
        </div>
      ) : null}

      {/* Barra de control de visualización: Cuadrícula, Dividido o Mapa Completo */}
      <div className="catalogo__barra-superior">
        <p className="catalogo__lead" style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
          {items.length ? (isEn ? `Showing ${items.length} of ${data?.meta.total} properties` : `Mostrando ${items.length} de ${data?.meta.total} inmuebles`) : ''}
        </p>
        <div className="catalogo__vistas" role="group" aria-label={isEn ? 'View mode' : 'Modo de vista'}>
          <button
            type="button"
            className={`catalogo__vista-btn ${vista === 'grid' ? 'is-active' : ''}`}
            onClick={() => cambiarVista('grid')}
            title={isEn ? 'Traditional grid view' : 'Vista de cuadrícula tradicional'}
          >
            <span>⊞</span> {t('catalog.views.grid')}
          </button>
          <button
            type="button"
            className={`catalogo__vista-btn ${vista === 'split' ? 'is-active' : ''}`}
            onClick={() => cambiarVista('split')}
            title={isEn ? 'Split view: Simultaneous list and map' : 'Vista dividida: Lista y Mapa simultáneos'}
          >
            <span>◫</span> {t('catalog.views.split')}
          </button>
          <button
            type="button"
            className={`catalogo__vista-btn ${vista === 'map' ? 'is-active' : ''}`}
            onClick={() => cambiarVista('map')}
            title={isEn ? 'Full interactive map view' : 'Vista de Mapa Interactivo Completo'}
          >
            <span>🗺️</span> {t('catalog.views.map')}
          </button>
        </div>
      </div>

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {isLoading ? (
        <div className="rejilla">
          <PropertyCardSkeleton ancha />
          {Array.from({ length: 5 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : null}

      {data && items.length === 0 ? (
        <div className="catalogo__vacio">
          <p className="catalogo__kicker">{isEn ? 'No results' : 'Sin resultados'}</p>
          <h2>{t('catalog.emptyTitle')}</h2>
          <p>{t('catalog.emptyDesc')}</p>
          <div className="catalogo__sugerencias">
            <button type="button" className="btn btn--primary" onClick={limpiar}>
              {isEn ? 'View full inventory' : 'Ver todo el inventario'}
            </button>
            <Link className="btn btn--ghost" to="/propiedades?operacion=venta">
              {isEn ? 'Only for sale' : 'Solo venta'}
            </Link>
            <Link className="btn btn--ghost" to="/propiedades?operacion=arriendo">
              {isEn ? 'Only for rent' : 'Solo arriendo'}
            </Link>
          </div>
        </div>
      ) : null}

      {items.length > 0 && vista === 'grid' ? (
        <>
          <div className={`rejilla ${isFetching ? 'is-actualizando' : ''}`}>
            {items.map((propiedad, indice) => {
              const ancha = destacarPrimera && indice === 0;
              return (
                <Reveal
                  key={propiedad.id}
                  delay={Math.min(indice, 5) * 70}
                  className={ancha ? 'celda celda--ancha' : 'celda'}
                >
                  <PropertyCard
                    propiedad={propiedad}
                    to={`/propiedades/${propiedad.slug}`}
                    ancha={ancha}
                  />
                </Reveal>
              );
            })}
          </div>

          <Pagination meta={data.meta} onPageChange={(page) => aplicar({ ...filtros, page })} />
        </>
      ) : null}

      {items.length > 0 && vista === 'split' ? (
        <div className="catalogo__split">
          <div className={`catalogo__split-lista ${isFetching ? 'is-actualizando' : ''}`}>
            {items.map((propiedad) => (
              <div
                key={propiedad.id}
                onMouseEnter={() => setHoveredPropertyId(propiedad.id)}
                onMouseLeave={() => setHoveredPropertyId(null)}
              >
                <PropertyCard
                  propiedad={propiedad}
                  to={`/propiedades/${propiedad.slug}`}
                />
              </div>
            ))}
            <Pagination meta={data.meta} onPageChange={(page) => aplicar({ ...filtros, page })} />
          </div>
          <div className="catalogo__split-mapa">
            <CatalogMap
              propiedades={items}
              hoveredPropertyId={hoveredPropertyId}
              height="100%"
              showFloatingCard={false}
            />
          </div>
        </div>
      ) : null}

      {items.length > 0 && vista === 'map' ? (
        <div className="catalogo__mapa-completo-wrapper">
          <CatalogMap
            propiedades={items}
            height="620px"
            showFloatingCard={true}
          />
        </div>
      ) : null}
    </section>
  );
}

