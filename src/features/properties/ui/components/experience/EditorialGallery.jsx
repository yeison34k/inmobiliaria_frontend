import { useState } from 'react';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { useParallax } from '@shared/hooks/useReveal.js';

/** Una imagen flotante: se desplaza distinto al scroll segun su formato. */
function GalleryItem({ imagen, intensidad, onOpen }) {
  const [ref, offset] = useParallax(intensidad);

  return (
    <Reveal as="figure" className={`exp-galeria__item exp-galeria__item--${imagen.formato}`}>
      <button type="button" onClick={() => onOpen(imagen)} aria-label={`Ampliar ${imagen.titulo ?? imagen.alt ?? 'imagen'}`}>
        <span className="exp-galeria__marco" ref={ref}>
          <img
            src={imagen.url}
            alt={imagen.alt ?? ''}
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
 * Bloque 3: galeria de inmersion.
 * No es un carrusel con flechas: es una composicion editorial que mezcla
 * panoramicas, verticales y detalles de materiales, con aire entre ellas
 * para que la vista descanse.
 */
export function EditorialGallery({ propiedad }) {
  const [ampliada, setAmpliada] = useState(null);
  const imagenes = (propiedad.imagenes ?? []).filter((img) => !img.plantaId);
  if (!imagenes.length) return null;

  return (
    <section className="exp-section exp-galeria">
      <Reveal>
        <p className="exp-kicker">La propiedad</p>
      </Reveal>

      <div className="exp-galeria__grid">
        {imagenes.map((imagen, index) => (
          <GalleryItem
            key={imagen.id}
            imagen={imagen}
            intensidad={imagen.formato === 'detalle' ? 0.16 : 0.07}
            onOpen={setAmpliada}
          />
        ))}
      </div>

      {ampliada ? (
        <div
          className="exp-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setAmpliada(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setAmpliada(null); }}
        >
          <button type="button" className="exp-lightbox__close" aria-label="Cerrar">×</button>
          <img src={ampliada.url} alt={ampliada.alt ?? ''} />
          {ampliada.titulo ? <p>{ampliada.titulo}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
