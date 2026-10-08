import { useState, useEffect, useRef, useCallback } from 'react';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { useParallax } from '@shared/hooks/useReveal.js';
import { useTranslation } from '@shared/i18n/index.js';

/** Una imagen flotante en modo mosaico editorial: se desplaza según su formato */
function GalleryItem({ imagen, index, intensidad, onOpen }) {
  const [ref, offset] = useParallax(intensidad);

  return (
    <Reveal as="figure" className={`exp-galeria__item exp-galeria__item--${imagen.formato ?? 'panoramica'}`}>
      <button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={`Ampliar ${imagen.titulo ?? imagen.alt ?? `imagen ${index + 1}`}`}
      >
        <span className="exp-galeria__marco" ref={ref}>
          <img
            src={imagen.url}
            alt={imagen.alt ?? imagen.titulo ?? ''}
            loading="lazy"
            style={{ transform: `translate3d(0, ${offset}px, 0) scale(1.22)` }}
          />
        </span>
      </button>
      {imagen.titulo ? <figcaption>{imagen.titulo}</figcaption> : null}
    </Reveal>
  );
}

/**
 * Galería de fotos de la propiedad.
 * Ofrece un carrusel interactivo de alta gama con flechas de navegación previo/siguiente,
 * contador numérico, tira de miniaturas táctil, atajos de teclado y modal lightbox ampliado.
 * También permite alternar a la composición editorial en mosaico.
 */
export function EditorialGallery({ propiedad }) {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [viewMode, setViewMode] = useState('carrusel'); // 'carrusel' | 'mosaico'

  const thumbRefs = useRef([]);
  const touchStartX = useRef(null);

  // Imágenes que no pertenecen a planos arquitectónicos (o imagen principal como fallback)
  const imagenesFiltradas = (propiedad.imagenes ?? []).filter((img) => !img.plantaId);
  const list = imagenesFiltradas.length > 0
    ? imagenesFiltradas
    : (propiedad.imagenPrincipal
        ? [{ id: 'principal', url: propiedad.imagenPrincipal, alt: propiedad.titulo, formato: 'panoramica', titulo: propiedad.titulo }]
        : []);

  const total = list.length;
  const currentImg = list[activeIdx] || list[0];

  const prev = useCallback((e) => {
    e?.stopPropagation();
    setActiveIdx((i) => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback((e) => {
    e?.stopPropagation();
    setActiveIdx((i) => (i + 1) % total);
  }, [total]);

  const prevLightbox = useCallback((e) => {
    e?.stopPropagation();
    setLightboxIdx((i) => (i - 1 + total) % total);
  }, [total]);

  const nextLightbox = useCallback((e) => {
    e?.stopPropagation();
    setLightboxIdx((i) => (i + 1) % total);
  }, [total]);

  // Navegación por teclado en Lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevLightbox();
      } else if (e.key === 'ArrowRight') {
        nextLightbox();
      } else if (e.key === 'Escape') {
        setLightboxIdx(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx, prevLightbox, nextLightbox]);

  // Centrar miniatura activa en el visor
  useEffect(() => {
    const el = thumbRefs.current[activeIdx];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeIdx]);

  // Soporte táctil swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) next();
    else if (diff < -45) prev();
    touchStartX.current = null;
  };

  if (total === 0) return null;

  return (
    <section className="exp-section exp-galeria" id="seccion-galeria">
      <Reveal>
        <div className="exp-galeria__header">
          <div>
            <p className="exp-kicker">{t('experience.gallery.kicker') || 'Galería fotográfica'}</p>
            <h2 className="exp-title">{t('experience.gallery.title') || 'Espacios y detalles'}</h2>
          </div>

          {total > 1 && (
            <div className="exp-galeria__controls" role="group" aria-label="Modo de visualización de fotos">
              <button
                type="button"
                className={`exp-galeria__mode-btn ${viewMode === 'carrusel' ? 'is-active' : ''}`}
                onClick={() => setViewMode('carrusel')}
                aria-pressed={viewMode === 'carrusel'}
                title={t('experience.gallery.carouselView') || 'Carrusel con flechas'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>{t('experience.gallery.carouselView') || 'Carrusel'}</span>
              </button>

              <button
                type="button"
                className={`exp-galeria__mode-btn ${viewMode === 'mosaico' ? 'is-active' : ''}`}
                onClick={() => setViewMode('mosaico')}
                aria-pressed={viewMode === 'mosaico'}
                title={t('experience.gallery.mosaicView') || 'Mosaico editorial'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>{t('experience.gallery.mosaicView') || 'Mosaico'}</span>
              </button>
            </div>
          )}
        </div>
      </Reveal>

      {/* ==================== MODO 1: CARRUSEL CON FLECHAS ==================== */}
      {viewMode === 'carrusel' && (
        <Reveal delay={100} className="exp-galeria__carousel-wrap">
          <div
            className="exp-galeria__stage"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Imagen activa con click para ampliar */}
            <div
              className="exp-galeria__stage-canvas"
              onClick={() => setLightboxIdx(activeIdx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setLightboxIdx(activeIdx); }}
              aria-label={`Ampliar imagen ${activeIdx + 1}`}
            >
              <img
                key={currentImg.url}
                src={currentImg.url}
                alt={currentImg.alt ?? currentImg.titulo ?? propiedad.titulo}
                className="exp-galeria__stage-img"
              />
            </div>

            {/* Flecha Izquierda: Foto anterior */}
            {total > 1 && (
              <button
                type="button"
                className="exp-galeria__arrow exp-galeria__arrow--prev"
                onClick={prev}
                aria-label={t('experience.gallery.prev') || 'Foto anterior'}
                title={`${t('experience.gallery.prev') || 'Foto anterior'} (←)`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {/* Flecha Derecha: Foto siguiente */}
            {total > 1 && (
              <button
                type="button"
                className="exp-galeria__arrow exp-galeria__arrow--next"
                onClick={next}
                aria-label={t('experience.gallery.next') || 'Foto siguiente'}
                title={`${t('experience.gallery.next') || 'Foto siguiente'} (→)`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* Contador de Fotos */}
            <div className="exp-galeria__counter">
              <span>{activeIdx + 1}</span> / {total}
            </div>

            {/* Botón de Pantalla Completa */}
            <button
              type="button"
              className="exp-galeria__zoom-btn"
              onClick={() => setLightboxIdx(activeIdx)}
              aria-label={t('experience.gallery.fullscreen') || 'Ampliar imagen'}
              title="Ampliar en pantalla completa"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
              <span>{t('experience.gallery.fullscreen') || 'Ampliar'}</span>
            </button>

            {/* Título o Pie de Foto */}
            {(currentImg.titulo || currentImg.alt) && (
              <div className="exp-galeria__caption-overlay">
                <span>{currentImg.titulo || currentImg.alt}</span>
              </div>
            )}
          </div>

          {/* Tira inferior de miniaturas navegables */}
          {total > 1 && (
            <div className="exp-galeria__thumbs" role="tablist" aria-label="Miniaturas de la galería">
              {list.map((img, i) => (
                <button
                  key={img.id ?? i}
                  ref={(el) => { thumbRefs.current[i] = el; }}
                  type="button"
                  className={`exp-galeria__thumb ${i === activeIdx ? 'is-active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  role="tab"
                  aria-selected={i === activeIdx}
                >
                  <img src={img.url} alt="" loading="lazy" />
                  <span className="exp-galeria__thumb-num">{i + 1}</span>
                </button>
              ))}
            </div>
          )}
        </Reveal>
      )}

      {/* ==================== MODO 2: MOSAICO EDITORIAL ==================== */}
      {viewMode === 'mosaico' && (
        <div className="exp-galeria__grid">
          {list.map((imagen, index) => (
            <GalleryItem
              key={imagen.id ?? index}
              imagen={imagen}
              index={index}
              intensidad={imagen.formato === 'detalle' ? 0.22 : 0.14}
              onOpen={setLightboxIdx}
            />
          ))}
        </div>
      )}

      {/* ==================== MODAL LIGHTBOX CON FLECHAS ==================== */}
      {lightboxIdx !== null && (
        <div
          className="exp-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Galería ampliada en pantalla completa"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Barra superior con contador y botón cerrar */}
          <div className="exp-lightbox__topbar" onClick={(e) => e.stopPropagation()}>
            <div className="exp-lightbox__counter">
              <span>{lightboxIdx + 1}</span> / {total}
            </div>
            <button
              type="button"
              className="exp-lightbox__close"
              onClick={() => setLightboxIdx(null)}
              aria-label={t('experience.gallery.close') || 'Cerrar galería'}
              title="Cerrar (Esc)"
            >
              ×
            </button>
          </div>

          {/* Flecha Izquierda Lightbox */}
          {total > 1 && (
            <button
              type="button"
              className="exp-lightbox__arrow exp-lightbox__arrow--prev"
              onClick={prevLightbox}
              aria-label={t('experience.gallery.prev') || 'Foto anterior'}
              title={`${t('experience.gallery.prev') || 'Foto anterior'} (←)`}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Flecha Derecha Lightbox */}
          {total > 1 && (
            <button
              type="button"
              className="exp-lightbox__arrow exp-lightbox__arrow--next"
              onClick={nextLightbox}
              aria-label={t('experience.gallery.next') || 'Foto siguiente'}
              title={`${t('experience.gallery.next') || 'Foto siguiente'} (→)`}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Foto Principal en Lightbox */}
          <div className="exp-lightbox__media" onClick={(e) => e.stopPropagation()}>
            <img
              key={list[lightboxIdx].url}
              src={list[lightboxIdx].url}
              alt={list[lightboxIdx].alt ?? list[lightboxIdx].titulo ?? ''}
              className="exp-lightbox__img"
            />
            {(list[lightboxIdx].titulo || list[lightboxIdx].alt) && (
              <p className="exp-lightbox__caption">
                {list[lightboxIdx].titulo || list[lightboxIdx].alt}
              </p>
            )}
          </div>

          {/* Tira inferior de miniaturas en Lightbox */}
          {total > 1 && (
            <div className="exp-lightbox__thumbs" onClick={(e) => e.stopPropagation()}>
              {list.map((img, i) => (
                <button
                  key={img.id ?? i}
                  type="button"
                  className={`exp-lightbox__thumb ${i === lightboxIdx ? 'is-active' : ''}`}
                  onClick={() => setLightboxIdx(i)}
                  aria-label={`Ver foto ${i + 1}`}
                >
                  <img src={img.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
