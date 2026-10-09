import { ARRIENDOS } from '@app/config/features.js';
import { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { Pagination } from '@shared/ui/Pagination.jsx';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue.js';
import { useTranslation } from '@shared/i18n/index.js';
import { settingsApi } from '@features/settings';
import { useCatalogSearch } from '../../application/usePropertiesQueries.js';
import { PropertyCard, PropertyCardSkeleton } from '../components/PropertyCard.jsx';
import { PropertyFilters } from '../components/PropertyFilters.jsx';
import { PropertyCompareBar } from '../components/PropertyCompareBar.jsx';
import { PropertyCompareModal } from '../components/PropertyCompareModal.jsx';
import { conceptOf } from '../../domain/concepts.js';

const CatalogMap = lazy(() =>
  import('../components/CatalogMap.jsx').then((m) => ({ default: m.CatalogMap }))
);

const FILTER_KEYS = [
  'q', 'operacion', 'tipos', 'ciudad', 'concepto',
  'precioMin', 'precioMax', 'habitacionesMin', 'banosMin', 'areaMin', 'solo3d', 'orden', 'page',
];

/**
 * Catálogo comercial y buscador de propiedades optimizado:
 * - Filtros combinables con sincronización bidireccional en URL.
 * - Rendimiento Core Web Vitals: LCP <= 2.5s con priorización de imágenes de portada, INP <= 200ms con debouncing.
 * - Comparador interactivo flotante para cotejar hasta 4 propiedades simultáneas.
 * - Vistas: Cuadrícula editorial, Dividida con mapa interactivo y Mapa completo.
 * - Estados vacíos con sugerencias accionables y contacto directo con asesores.
 */
export function CatalogPage() {
  const { t, formatNumber, formatMoney, typeLabel, isEn } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vista, setVista] = useState(searchParams.get('vista') || 'grid');
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

  // Configuración de la agencia para WhatsApp
  const { data: configuracion } = useQuery({
    queryKey: ['settings-public'],
    queryFn: () => settingsApi.get(),
    staleTime: 1000 * 60 * 15,
  });

  // Estado del comparador de propiedades (persistido en la sesión)
  const [comparadas, setComparadas] = useState(() => {
    try {
      const guardadas = sessionStorage.getItem('propiedades_comparadas');
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });
  const [modalCompararAbierto, setModalCompararAbierto] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem('propiedades_comparadas', JSON.stringify(comparadas));
    } catch {}
  }, [comparadas]);

  const toggleComparar = (propiedad) => {
    setComparadas((prev) => {
      const existe = prev.some((p) => p.id === propiedad.id);
      if (existe) {
        return prev.filter((p) => p.id !== propiedad.id);
      }
      if (prev.length >= 4) {
        alert(isEn ? 'You can compare up to 4 properties' : 'Puedes seleccionar hasta 4 propiedades para comparar');
        return prev;
      }
      return [...prev, propiedad];
    });
  };

  const quitarDeComparar = (id) => {
    setComparadas((prev) => prev.filter((p) => p.id !== id));
  };

  const limpiarComparacion = () => {
    setComparadas([]);
    setModalCompararAbierto(false);
  };

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
  const qDebounced = useDebouncedValue(filtros.q ?? '', 300);

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

  const whatsappAgencia = configuracion?.whatsapp || configuracion?.telefono || '573001234567';

  return (
    <section className="catalogo">
      <header className="catalogo__portada">
        <p className="catalogo__kicker">
          {filtros.concepto ? conceptOf(filtros.concepto).nombre : (isEn ? 'Full Portfolio' : 'Inventario verificado')}
        </p>
        <h1>
          {data ? formatNumber(data.meta.total) : '—'}
          <span> {data && data.meta.total === 1 ? t('catalog.count_one') : t('catalog.count_other')}</span>
        </h1>
        <p className="catalogo__lead">
          {isEn
            ? 'Each with verified specifications, detailed architectural plans, and interactive comparison tools.'
            : 'Cada una con ficha técnica completa, planos arquitectónicos y herramientas de comparación en tiempo real.'}
        </p>
      </header>

      {/* Barra de Filtros y Buscador */}
      <PropertyFilters valores={filtros} onChange={aplicar} total={data?.meta.total} />

      {/* Chips de Filtros Activos con eliminación rápida */}
      {activos.length ? (
        <div className="catalogo__activos" aria-label={t('catalog.activeFilters')}>
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

      {/* Barra de Control: Conteo de resultados y Selector de vistas */}
      <div className="catalogo__barra-superior">
        <p className="catalogo__lead" style={{ fontSize: 'var(--text-xs)', margin: 0 }}>
          {items.length ? (
            isEn
              ? `Showing ${items.length} of ${data?.meta.total} properties`
              : `Mostrando ${items.length} de ${data?.meta.total} inmuebles`
          ) : ''}
        </p>
        <div className="catalogo__vistas" role="group" aria-label={isEn ? 'View mode' : 'Modo de vista'}>
          <button
            type="button"
            className={`catalogo__vista-btn ${vista === 'grid' ? 'is-active' : ''}`}
            onClick={() => cambiarVista('grid')}
            title={isEn ? 'Traditional grid view' : 'Vista de cuadrícula'}
          >
            <span>⊞</span> {t('catalog.views.grid')}
          </button>
          <button
            type="button"
            className={`catalogo__vista-btn ${vista === 'split' ? 'is-active' : ''}`}
            onClick={() => cambiarVista('split')}
            title={isEn ? 'Split view: Simultaneous list and map' : 'Vista dividida: Lista y Mapa'}
          >
            <span>◫</span> {t('catalog.views.split')}
          </button>
          <button
            type="button"
            className={`catalogo__vista-btn ${vista === 'map' ? 'is-active' : ''}`}
            onClick={() => cambiarVista('map')}
            title={isEn ? 'Full interactive map view' : 'Vista de Mapa Completo'}
          >
            <span>🗺️</span> {t('catalog.views.map')}
          </button>
        </div>
      </div>

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {/* Esqueletos durante carga inicial (0 CLS) */}
      {isLoading ? (
        <div className="rejilla">
          <PropertyCardSkeleton ancha />
          {Array.from({ length: 5 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : null}

      {/* Estado Vacío Optimizado */}
      {data && items.length === 0 ? (
        <div className="catalogo__vacio">
          <div className="catalogo__vacio-icono" aria-hidden="true">🔍🏘️</div>
          <p className="catalogo__kicker">{isEn ? 'No properties found' : 'Sin coincidencias'}</p>
          <h2>{t('catalog.emptyTitle')}</h2>
          <p>{t('catalog.emptyDesc')}</p>
          <p className="catalogo__vacio-consejo">{t('catalog.emptyAdvice')}</p>

          <div className="catalogo__sugerencias">
            <button type="button" className="btn btn--primary" onClick={limpiar}>
              {isEn ? 'Reset all filters' : 'Restablecer todos los filtros'}
            </button>
            <Link className="btn btn--ghost" to="/propiedades?operacion=venta">
              {isEn ? 'Only for sale' : 'Solo en venta'}
            </Link>
            {ARRIENDOS ? (
              <Link className="btn btn--ghost" to="/propiedades?operacion=arriendo">
                {isEn ? 'Only for rent' : 'Solo en arriendo'}
              </Link>
            ) : null}
            <a
              href={`https://wa.me/${whatsappAgencia}?text=${encodeURIComponent(
                isEn
                  ? 'Hello! I was searching on your website and could not find the right property. Could you assist me?'
                  : '¡Hola! Estuve buscando propiedades en su portal y no encontré lo que buscaba. ¿Me pueden brindar asesoría personalizada?'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost catalogo__btn-wa-asesor"
            >
              💬 {t('catalog.emptyWhatsappBtn')}
            </a>
          </div>
        </div>
      ) : null}

      {/* Vista de Cuadrícula */}
      {items.length > 0 && vista === 'grid' ? (
        <>
          <div className={`rejilla ${isFetching ? 'is-actualizando' : ''}`}>
            {items.map((propiedad, indice) => {
              const ancha = destacarPrimera && indice === 0;
              return (
                <Reveal
                  key={propiedad.id}
                  delay={Math.min(indice, 5) * 60}
                  className={ancha ? 'celda celda--ancha' : 'celda'}
                >
                  <PropertyCard
                    propiedad={propiedad}
                    to={`/propiedades/${propiedad.slug}`}
                    ancha={ancha}
                    prioritaria={destacarPrimera && indice < 2}
                    enComparacion={comparadas.some((p) => p.id === propiedad.id)}
                    onToggleComparar={toggleComparar}
                  />
                </Reveal>
              );
            })}
          </div>

          <Pagination meta={data.meta} onPageChange={(page) => aplicar({ ...filtros, page })} />
        </>
      ) : null}

      {/* Vista Dividida (Lista + Mapa) */}
      {items.length > 0 && vista === 'split' ? (
        <div className="catalogo__split">
          <div className={`catalogo__split-lista ${isFetching ? 'is-actualizando' : ''}`}>
            {items.map((propiedad, indice) => (
              <div
                key={propiedad.id}
                onMouseEnter={() => setHoveredPropertyId(propiedad.id)}
                onMouseLeave={() => setHoveredPropertyId(null)}
              >
                <PropertyCard
                  propiedad={propiedad}
                  to={`/propiedades/${propiedad.slug}`}
                  prioritaria={indice < 2}
                  enComparacion={comparadas.some((p) => p.id === propiedad.id)}
                  onToggleComparar={toggleComparar}
                />
              </div>
            ))}
            <Pagination meta={data.meta} onPageChange={(page) => aplicar({ ...filtros, page })} />
          </div>
          <div className="catalogo__split-mapa">
            <Suspense fallback={<div style={{ height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}><Spinner label={isEn ? 'Loading map...' : 'Cargando mapa...'} /></div>}>
              <CatalogMap
                propiedades={items}
                hoveredPropertyId={hoveredPropertyId}
                height="100%"
                showFloatingCard={false}
              />
            </Suspense>
          </div>
        </div>
      ) : null}

      {/* Vista de Mapa Completo */}
      {items.length > 0 && vista === 'map' ? (
        <div className="catalogo__mapa-completo-wrapper">
          <Suspense fallback={<div style={{ height: '620px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}><Spinner label={isEn ? 'Loading map...' : 'Cargando mapa...'} /></div>}>
            <CatalogMap
              propiedades={items}
              height="620px"
              showFloatingCard={true}
            />
          </Suspense>
        </div>
      ) : null}

      {/* Barra Inferior y Modal de Comparación de Propiedades */}
      <PropertyCompareBar
        propiedades={comparadas}
        onOpenModal={() => setModalCompararAbierto(true)}
        onRemove={quitarDeComparar}
        onClear={limpiarComparacion}
      />

      <PropertyCompareModal
        propiedades={comparadas}
        isOpen={modalCompararAbierto}
        onClose={() => setModalCompararAbierto(false)}
        onRemove={quitarDeComparar}
        onClear={limpiarComparacion}
      />
    </section>
  );
}
