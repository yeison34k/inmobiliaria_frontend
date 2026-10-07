import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import {
  CollectionGrid, FeaturedShowcase, HeroBackdrop, PropertyCard, PropertyCardSkeleton,
  CatalogMap, TYPE_LABELS, useCatalogSearch, useCities,
} from '@features/properties';

/**
 * Portada publica con mapa interactivo de ubicacion de inmuebles.
 * Busca el equilibrio entre impacto y utilidad: la primera pantalla es
 * cinematografica pero el buscador y el mapa estan siempre a la vista.
 */
export function HomePage() {
  const navigate = useNavigate();
  const { t, formatNumber } = useTranslation();
  const [busqueda, setBusqueda] = useState({ q: '', operacion: 'venta' });
  const [ciudadFiltro, setCiudadFiltro] = useState(null);

  const { data: destacadas } = useCatalogSearch({ destacada: 'true', orden: 'destacadas', pageSize: 6 });
  const { data: recientes, isLoading: cargando } = useCatalogSearch({ orden: 'recientes', pageSize: 8 });
  const { data: mapaPropsData } = useCatalogSearch({ pageSize: 40 });
  const { data: ciudades = [] } = useCities();

  const inventario = recientes?.items ?? [];
  const vitrina = (destacadas?.items?.length ? destacadas.items : inventario).slice(0, 3);
  const portada = (destacadas?.items?.length ? destacadas.items : inventario).slice(0, 5);

  const mapaItems = mapaPropsData?.items ?? inventario;
  const propiedadesParaMapa = ciudadFiltro
    ? mapaItems.filter((p) => (p.ubicacion?.ciudad || '').toLowerCase() === ciudadFiltro.toLowerCase())
    : mapaItems;

  const accesos = [
    { tipo: 'apartamento', label: t('home.hero.types.apartamento') },
    { tipo: 'casa', label: t('home.hero.types.casa') },
    { tipo: 'lote', label: t('home.hero.types.lote') },
    { tipo: 'oficina', label: t('home.hero.types.oficina') },
  ];

  const pasos = [
    {
      numero: '01',
      titulo: t('home.process.steps.0.title'),
      texto: t('home.process.steps.0.desc'),
    },
    {
      numero: '02',
      titulo: t('home.process.steps.1.title'),
      texto: t('home.process.steps.1.desc'),
    },
    {
      numero: '03',
      titulo: t('home.process.steps.2.title'),
      texto: t('home.process.steps.2.desc'),
    },
  ];

  const buscar = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (busqueda.q) params.set('q', busqueda.q);
    if (busqueda.operacion) params.set('operacion', busqueda.operacion);
    navigate(`/propiedades?${params.toString()}`);
  };

  return (
    <>
      {/* ------------------------- 1. primera pantalla ------------------------ */}
      <section className="portada">
        <HeroBackdrop propiedades={portada} />

        <div className="portada__contenido">
          <p className="portada__kicker">
            <span className="portada__pulso" aria-hidden="true" />
            {t('home.hero.kicker')}
          </p>

          <h1>
            {t('home.hero.title1')}{' '}
            <span>{t('home.hero.title2')}</span>
          </h1>

          <p className="portada__lead">
            {t('home.hero.lead')}
          </p>

          <form className="portada__buscador" onSubmit={buscar}>
            <select
              aria-label={t('catalog.filters.operation.all')}
              value={busqueda.operacion}
              onChange={(e) => setBusqueda({ ...busqueda, operacion: e.target.value })}
            >
              <option value="venta">{t('home.hero.operationBuy')}</option>
              <option value="arriendo">{t('home.hero.operationRent')}</option>
            </select>
            <span className="portada__divisor" aria-hidden="true" />
            <input
              type="search"
              placeholder={t('home.hero.searchPlaceholder')}
              value={busqueda.q}
              onChange={(e) => setBusqueda({ ...busqueda, q: e.target.value })}
            />
            <button type="submit" className="btn btn--primary">{t('home.hero.searchButton')}</button>
          </form>

          <ul className="portada__accesos">
            {accesos.map((acceso) => (
              <li key={acceso.tipo}>
                <Link to={`/propiedades?tipos=${acceso.tipo}`}>{acceso.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <dl className="portada__cifras">
          <div>
            <dt>{t('home.hero.stats.published')}</dt>
            <dd>{recientes ? formatNumber(recientes.meta.total) : '—'}</dd>
          </div>
          <div>
            <dt>{t('home.hero.stats.cities')}</dt>
            <dd>{ciudades.length ? formatNumber(ciudades.length) : '—'}</dd>
          </div>
          <div>
            <dt>{t('home.hero.stats.types')}</dt>
            <dd>{Object.keys(TYPE_LABELS).length}</dd>
          </div>
        </dl>
      </section>

      <div className="public__ancho">
        {/* --------------------------- 2. colecciones -------------------------- */}
        <section className="bloque">
          <Reveal className="bloque__encabezado">
            <div>
              <p className="bloque__kicker">{t('home.collections.kicker')}</p>
              <h2>{t('home.collections.title')}</h2>
            </div>
            <Link to="/propiedades">{t('home.collections.viewAll')}</Link>
          </Reveal>

          <CollectionGrid propiedades={inventario} />
        </section>

        {/* --------------------------- 3. destacadas --------------------------- */}
        <section className="bloque">
          <Reveal className="bloque__encabezado">
            <div>
              <p className="bloque__kicker">{t('home.featured.kicker')}</p>
              <h2>{t('home.featured.title')}</h2>
            </div>
            <Link to="/propiedades?orden=destacadas">{t('home.featured.viewAll')}</Link>
          </Reveal>

          {cargando ? (
            <div className="vitrina">
              <div className="vitrina__principal"><PropertyCardSkeleton /></div>
              <div className="vitrina__lado"><PropertyCardSkeleton /><PropertyCardSkeleton /></div>
            </div>
          ) : <FeaturedShowcase propiedades={vitrina} />}
        </section>

        {/* ------------------- mapa interactivo de portada ------------------- */}
        <section className="bloque bloque--mapa-home">
          <Reveal className="bloque__encabezado">
            <div>
              <p className="bloque__kicker">{t('home.map.kicker')}</p>
              <h2>{t('home.map.title')}</h2>
              <p style={{ color: 'var(--text-soft)', margin: '0.25rem 0 0', fontSize: 'var(--text-sm)', maxWidth: '60ch' }}>
                {t('home.map.lead')}
              </p>
            </div>
            <Link to="/propiedades?vista=map" className="btn btn--secondary btn--sm">
              {t('home.map.viewCatalogMap')}
            </Link>
          </Reveal>

          {/* Filtros de ciudad rápidos */}
          <div className="home-map-city-filter">
            <button
              type="button"
              className={`home-map-city-btn ${!ciudadFiltro ? 'is-active' : ''}`}
              onClick={() => setCiudadFiltro(null)}
            >
              {t('home.map.allColombia')} ({mapaItems.length})
            </button>
            {ciudades.slice(0, 6).map((c) => (
              <button
                key={`${c.ciudad}-${c.departamento}`}
                type="button"
                className={`home-map-city-btn ${ciudadFiltro === c.ciudad ? 'is-active' : ''}`}
                onClick={() => setCiudadFiltro(ciudadFiltro === c.ciudad ? null : c.ciudad)}
              >
                📍 {c.ciudad}
              </button>
            ))}
          </div>

          <div className="home-map-wrapper">
            <CatalogMap
              propiedades={propiedadesParaMapa}
              height="500px"
              showFloatingCard={true}
            />
          </div>
        </section>

        {/* ----------------------------- 4. proceso ---------------------------- */}
        <section className="bloque bloque--proceso">
          <Reveal className="bloque__encabezado">
            <div>
              <p className="bloque__kicker">{t('home.process.kicker')}</p>
              <h2>{t('home.process.title')}</h2>
            </div>
          </Reveal>

          <ol className="proceso">
            {pasos.map((paso, index) => (
              <Reveal key={paso.numero} delay={index * 110} as="li">
                <span className="proceso__numero">{paso.numero}</span>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ---------------------------- 5. recientes --------------------------- */}
        <section className="bloque">
          <Reveal className="bloque__encabezado">
            <div>
              <p className="bloque__kicker">{t('home.recent.kicker')}</p>
              <h2>{t('home.recent.title')}</h2>
            </div>
            <Link to="/propiedades?orden=recientes">{t('home.recent.viewMore')}</Link>
          </Reveal>

          <div className="rejilla">
            {cargando
              ? Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : inventario.slice(0, 4).map((propiedad, indice) => (
                <Reveal key={propiedad.id} delay={indice * 80} className="celda">
                  <PropertyCard propiedad={propiedad} to={`/propiedades/${propiedad.slug}`} />
                </Reveal>
              ))}
          </div>
        </section>

        {/* ----------------------------- 6. ciudades --------------------------- */}
        {ciudades.length ? (
          <section className="bloque">
            <Reveal className="bloque__encabezado">
              <div>
                <p className="bloque__kicker">{t('home.cities.kicker')}</p>
                <h2>{t('home.cities.title')}</h2>
              </div>
            </Reveal>

            <Reveal delay={90} as="ul" className="ciudades">
              {ciudades.map((ciudad) => (
                <li key={`${ciudad.ciudad}-${ciudad.departamento}`}>
                  <Link to={`/propiedades?ciudad=${encodeURIComponent(ciudad.ciudad)}`}>
                    <strong>{ciudad.ciudad}</strong>
                    <span>{ciudad.departamento}</span>
                  </Link>
                </li>
              ))}
            </Reveal>
          </section>
        ) : null}
      </div>

      {/* ------------------------------ 7. cierre ------------------------------ */}
      <section className="cierre">
        <Reveal>
          <p className="bloque__kicker">{t('home.cta.kicker')}</p>
          <h2>{t('home.cta.title')}</h2>
          <p className="cierre__lead">
            {t('home.cta.lead')}
          </p>
          <Link className="btn btn--primary" to="/propiedades">{t('home.cta.button')}</Link>
        </Reveal>
      </section>
    </>
  );
}
