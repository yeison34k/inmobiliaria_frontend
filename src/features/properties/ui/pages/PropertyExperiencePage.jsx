import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import { InquiryForm } from '@features/inquiries';
import { settingsApi } from '@features/settings';
import { useCatalogProperty } from '../../application/usePropertiesQueries.js';
import { conceptOf, conceptStyle, ensureConceptFont } from '../../domain/concepts.js';
import { ExperienceHero } from '../components/experience/ExperienceHero.jsx';
import { ExperienceManifesto } from '../components/experience/ExperienceManifesto.jsx';
import { EditorialGallery } from '../components/experience/EditorialGallery.jsx';
import { VirtualTour } from '../components/experience/VirtualTour.jsx';
import { TechnicalSpecs } from '../components/experience/TechnicalSpecs.jsx';
import { FloorPlans } from '../components/experience/FloorPlans.jsx';
import { Neighborhood } from '../components/experience/Neighborhood.jsx';
import { ShareButtons } from '../components/ShareButtons.jsx';
import { ExperienceSectionNav } from '../components/experience/ExperienceSectionNav.jsx';
import { WhatsAppFloatingButton } from '../components/experience/WhatsAppFloatingButton.jsx';

const PropertyLocationMap = lazy(() =>
  import('../components/experience/PropertyLocationMap.jsx').then((m) => ({ default: m.PropertyLocationMap }))
);

const MortgageCalculator = lazy(() =>
  import('../components/MortgageCalculator.jsx').then((m) => ({ default: m.MortgageCalculator }))
);

/**
 * Landing de la propiedad como experiencia cronologica:
 * impacto → historia → inmersion → recorrido → datos → entorno → contacto.
 *
 * Toda la identidad visual (paleta, tipografia, geometria, movimiento) sale
 * del concepto elegido para esa propiedad, no de una plantilla unica.
 */
export function PropertyExperiencePage() {
  const { slug } = useParams();
  const { data: propiedad, isLoading, error, refetch } = useCatalogProperty(slug);
  const { data: configuracion } = useQuery({
    queryKey: ['settings-public'],
    queryFn: () => settingsApi.get(),
    staleTime: 1000 * 60 * 15,
  });
  const { t, formatMoney, isEn } = useTranslation();
  const contactoRef = useRef(null);
  const [ctaVisible, setCtaVisible] = useState(false);

  const concepto = propiedad?.historia?.concepto ?? 'minimal';

  useEffect(() => { ensureConceptFont(concepto); }, [concepto]);

  useEffect(() => {
    const onScroll = () => setCtaVisible(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Garantizar que cada vez que se abre una propiedad el scroll comience en el encabezado superior
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [slug]);

  useEffect(() => {
    if (propiedad && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    }
  }, [propiedad]);

  useEffect(() => {
    if (!propiedad) return;
    const prevTitle = document.title;
    const nombre = propiedad.nombrePublico || propiedad.titulo;
    const ciudad = propiedad.ubicacion?.ciudad ? ` · ${propiedad.ubicacion.ciudad}` : '';
    document.title = `${nombre}${ciudad} | ${t('nav.brand')}`;

    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', propiedad.historia?.subtitulo || propiedad.descripcion || propiedad.titulo);
    setMeta('property', 'og:title', `${nombre}${ciudad}`);
    setMeta('property', 'og:description', propiedad.historia?.subtitulo || propiedad.descripcion || '');
    if (propiedad.imagenPrincipal) setMeta('property', 'og:image', propiedad.imagenPrincipal);
    setMeta('property', 'og:url', window.location.href);

    return () => {
      document.title = prevTitle;
    };
  }, [propiedad, t]);

  if (isLoading) return <Spinner label={t('experience.loading')} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const irAContacto = () => contactoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const meta = conceptOf(concepto);

  return (
    <article
      className={`exp ${meta.oscuro ? 'exp--oscuro' : 'exp--claro'}`}
      data-concepto={concepto}
      style={conceptStyle(concepto)}
    >
      {/* Barra de acceso y cambio de idioma flotante */}
      <nav
        aria-label={isEn ? 'Property navigation' : 'Navegación de la propiedad'}
        style={{
          position: 'fixed',
          top: '1.25rem',
          left: '1.25rem',
          right: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 90,
          pointerEvents: 'none',
        }}
      >
        <Link
          to="/propiedades"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '9999px',
            padding: '0.45rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 500,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            transition: 'background 0.2s ease',
          }}
        >
          {t('experience.back')}
        </Link>
        <div style={{ pointerEvents: 'auto' }}>
          <LanguageSwitcher />
        </div>
      </nav>

      <ExperienceHero propiedad={propiedad} onCta={irAContacto} />

      <ExperienceManifesto propiedad={propiedad} />
      <EditorialGallery propiedad={propiedad} />
      <VirtualTour propiedad={propiedad} />
      <FloorPlans propiedad={propiedad} />
      <TechnicalSpecs propiedad={propiedad} />
      <Suspense fallback={<div style={{ minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner label={isEn ? 'Loading map...' : 'Cargando mapa...'} /></div>}>
        <PropertyLocationMap propiedad={propiedad} />
      </Suspense>
      <Neighborhood propiedad={propiedad} />

      {propiedad.operacion === 'venta' ? (
        <section className="exp-section exp-calculadora" id="calculadora-hipotecaria">
          <Suspense fallback={<div style={{ minHeight: '150px' }}><Spinner label={isEn ? 'Loading calculator...' : 'Cargando simulador...'} /></div>}>
            <MortgageCalculator
              precio={propiedad.precio}
              moneda={propiedad.moneda}
              onConsultarCredito={irAContacto}
            />
          </Suspense>
        </section>
      ) : null}

      <section className="exp-section exp-contacto" id="seccion-contacto" ref={contactoRef}>
        <Reveal className="exp-contacto__texto">
          <p className="exp-kicker">{t('experience.contact.kicker')}</p>
          <h2 className="exp-title">
            {t('experience.contact.title', { name: propiedad.nombrePublico || propiedad.titulo })}
          </h2>
          <p className="exp-contacto__lead">
            {t('experience.contact.lead')}
          </p>
          <p className="exp-contacto__precio">{formatMoney(propiedad.precio, propiedad.moneda)}</p>
        </Reveal>

        <Reveal delay={120} className="exp-contacto__form">
          <InquiryForm propiedadId={propiedad.id} titulo={propiedad.nombrePublico} />
        </Reveal>
      </section>

      <footer className="exp-pie">
        <Link to="/propiedades">{t('experience.back')}</Link>
        <ShareButtons propiedad={propiedad} />
        <span>{propiedad.codigo}</span>
      </footer>

      {/* Navegación rápida interactiva de secciones & ScrollSpy */}
      <ExperienceSectionNav propiedad={propiedad} />

      <button
        type="button"
        className={`exp-cta exp-cta--flotante ${ctaVisible ? 'is-visible' : ''}`}
        onClick={irAContacto}
      >
        {propiedad.historia?.ctaTexto ?? t('experience.contact.ctaFloating')}
      </button>

      <WhatsAppFloatingButton
        propiedad={propiedad}
        telefono={propiedad.asesor?.whatsapp || propiedad.asesor?.telefono || configuracion?.whatsapp || configuracion?.telefono}
      />
    </article>
  );
}
