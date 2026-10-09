import { useEffect, useRef } from 'react';
import { useTranslation } from '@shared/i18n/index.js';

const esArchivoDeVideo = (url) => /\.(mp4|webm|mov)(\?|$)/i.test(url ?? '');

const aEmbed = (url) => {
  if (!url) return null;
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtube) {
    return `https://www.youtube.com/embed/${youtube[1]}?autoplay=1&mute=1&loop=1&controls=0&playlist=${youtube[1]}&modestbranding=1`;
  }
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1&background=1`;
  return null;
};

/**
 * Bloque 1: el gran impacto cinematográfico con efecto Parallax multi-capa.
 * - Capa 0 (Media): fondo de imagen/video con desplazamiento desacelerado (0.38x) y zoom suave.
 * - Capa 1 (Contenido): textos y acciones con desplazamiento inverso sutil (-0.16x) y desvanecimiento progresivo.
 * - Capa 2 (Insignia & Scroll): salida anticipada para máxima elegancia visual.
 */
export function ExperienceHero({ propiedad, onCta }) {
  const { isEn } = useTranslation();
  const heroRef = useRef(null);
  const mediaRef = useRef(null);
  const contentRef = useRef(null);
  const badgeRef = useRef(null);
  const scrollRef = useRef(null);

  const historia = propiedad.historia ?? {};
  const portada = propiedad.imagenPrincipal;
  const embed = aEmbed(historia.videoUrl);

  const ctaDefault = isEn ? 'Schedule a private tour' : 'Agendar un recorrido privado';
  const cta3d = isEn ? 'Explore 3D Tour' : 'Ver Recorrido 3D';

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const hero = heroRef.current;
    if (!hero) return undefined;

    let rafId = null;

    const updateParallax = () => {
      rafId = null;
      const scrollY = window.scrollY;
      const heroHeight = hero.offsetHeight || window.innerHeight;

      // Fuera del área de visualización del hero detenemos el cálculo
      if (scrollY > heroHeight + 80) return;

      // 1. Capa Fondo: desplazamiento hacia abajo más lento que el scroll
      if (mediaRef.current) {
        const bgY = Math.round(scrollY * 0.38);
        mediaRef.current.style.transform = `translate3d(0, ${bgY}px, 0) scale(1.08)`;
      }

      // 2. Capa Primer Plano: texto flotante con fade progresivo
      if (contentRef.current) {
        const fgY = Math.round(scrollY * -0.16);
        const opacity = Math.max(0, 1 - (scrollY / (heroHeight * 0.72))).toFixed(3);
        contentRef.current.style.transform = `translate3d(0, ${fgY}px, 0)`;
        contentRef.current.style.opacity = opacity;
      }

      // 3. Insignia superior con desvanecimiento sutil
      if (badgeRef.current) {
        const badgeY = Math.round(scrollY * -0.08);
        const badgeOpacity = Math.max(0, 1 - (scrollY / 280)).toFixed(3);
        badgeRef.current.style.transform = `translate3d(0, ${badgeY}px, 0)`;
        badgeRef.current.style.opacity = badgeOpacity;
      }

      // 4. Indicador de scroll: se desvanece de inmediato en los primeros pixeles
      if (scrollRef.current) {
        const scrollOpacity = Math.max(0, 1 - (scrollY / 100)).toFixed(3);
        scrollRef.current.style.opacity = scrollOpacity;
      }
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateParallax();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <header className="exp-hero" ref={heroRef}>
      <div className="exp-hero__media" ref={mediaRef}>
        {esArchivoDeVideo(historia.videoUrl) ? (
          <video src={historia.videoUrl} autoPlay muted loop playsInline poster={portada ?? undefined} />
        ) : embed ? (
          <iframe src={embed} title={`Video de ${propiedad.nombrePublico || propiedad.titulo}`} allow="autoplay; fullscreen" frameBorder="0" />
        ) : portada ? (
          <img
            src={portada}
            alt={propiedad.nombrePublico || propiedad.titulo}
            loading="eager"
            fetchpriority="high"
            decoding="sync"
          />
        ) : (
          <div className="exp-hero__fallback" />
        )}
        <span className="exp-hero__veil" aria-hidden="true" />
      </div>

      <div className="exp-hero__content" ref={contentRef}>
        <p className="exp-kicker">
          {[propiedad.ubicacion?.barrio, propiedad.ubicacion?.ciudad].filter(Boolean).join(' · ')}
        </p>

        <h1 className="exp-hero__title">{propiedad.titularPublico}</h1>

        {historia.subtitulo ? <p className="exp-hero__subtitle">{historia.subtitulo}</p> : null}

        <div className="exp-hero__actions">
          <button type="button" className="exp-cta" onClick={onCta}>
            {historia.ctaTexto ?? ctaDefault}
          </button>
          {historia.tourUrl && (
            <a href="#tour-3d" className="exp-cta exp-cta--tour">
              <span className="exp-cta__icon">🥽</span> {cta3d}
            </a>
          )}
        </div>
      </div>

      <p className="exp-hero__name" ref={badgeRef}>{propiedad.nombrePublico}</p>

      <span className="exp-hero__scroll" ref={scrollRef} aria-hidden="true">
        <span />
      </span>
    </header>
  );
}
