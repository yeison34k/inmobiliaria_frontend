import { useParallax } from '@shared/hooks/useReveal.js';
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
 * Bloque 1: el gran impacto.
 * No hay ficha tecnica aqui: solo el nombre propio del inmueble, una promesa
 * de estilo de vida y una unica accion.
 */
export function ExperienceHero({ propiedad, onCta }) {
  const { isEn } = useTranslation();
  const [ref, offset] = useParallax(0.1);
  const historia = propiedad.historia ?? {};
  const portada = propiedad.imagenPrincipal;
  const embed = aEmbed(historia.videoUrl);

  const ctaDefault = isEn ? 'Schedule a private tour' : 'Agendar un recorrido privado';
  const cta3d = isEn ? 'Explore 3D Tour' : 'Ver Recorrido 3D';

  return (
    <header className="exp-hero" ref={ref}>
      <div className="exp-hero__media">
        {esArchivoDeVideo(historia.videoUrl) ? (
          <video src={historia.videoUrl} autoPlay muted loop playsInline poster={portada ?? undefined} />
        ) : embed ? (
          <iframe src={embed} title={`Video de ${propiedad.nombrePublico || propiedad.titulo}`} allow="autoplay; fullscreen" frameBorder="0" />
        ) : portada ? (
          <img
            src={portada}
            alt={propiedad.nombrePublico || propiedad.titulo}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            style={{ transform: `translate3d(0, ${offset}px, 0) scale(1.18)` }}
          />
        ) : (
          <div className="exp-hero__fallback" />
        )}
        <span className="exp-hero__veil" aria-hidden="true" />
      </div>

      <div className="exp-hero__content">
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

      <p className="exp-hero__name">{propiedad.nombrePublico}</p>

      <span className="exp-hero__scroll" aria-hidden="true">
        <span />
      </span>
    </header>
  );
}
