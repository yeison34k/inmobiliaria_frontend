import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import { InquiryForm } from '@features/inquiries';
import { useCatalogProperty } from '../../application/usePropertiesQueries.js';
import { conceptOf, conceptStyle, ensureConceptFont } from '../../domain/concepts.js';
import { ExperienceHero } from '../components/experience/ExperienceHero.jsx';
import { ExperienceManifesto } from '../components/experience/ExperienceManifesto.jsx';
import { EditorialGallery } from '../components/experience/EditorialGallery.jsx';
import { VirtualTour } from '../components/experience/VirtualTour.jsx';
import { TechnicalSpecs } from '../components/experience/TechnicalSpecs.jsx';
import { FloorPlans } from '../components/experience/FloorPlans.jsx';
import { Neighborhood } from '../components/experience/Neighborhood.jsx';
import { PropertyLocationMap } from '../components/experience/PropertyLocationMap.jsx';
import { MortgageCalculator } from '../components/MortgageCalculator.jsx';
import { ShareButtons } from '../components/ShareButtons.jsx';
import { WhatsAppFloatingButton } from '../components/experience/WhatsAppFloatingButton.jsx';

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
      <PropertyLocationMap propiedad={propiedad} />
      <Neighborhood propiedad={propiedad} />

      {propiedad.operacion === 'venta' ? (
        <section className="exp-section exp-calculadora">
          <MortgageCalculator
            precio={propiedad.precio}
            moneda={propiedad.moneda}
            onConsultarCredito={irAContacto}
          />
        </section>
      ) : null}

      <section className="exp-section exp-contacto" ref={contactoRef}>
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

      <button
        type="button"
        className={`exp-cta exp-cta--flotante ${ctaVisible ? 'is-visible' : ''}`}
        onClick={irAContacto}
      >
        {propiedad.historia?.ctaTexto ?? t('experience.contact.ctaFloating')}
      </button>

      <WhatsAppFloatingButton propiedad={propiedad} />
    </article>
  );
}
