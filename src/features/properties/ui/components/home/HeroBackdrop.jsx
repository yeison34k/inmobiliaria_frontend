import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SmartImage } from '@shared/ui/SmartImage.jsx';

const INTERVALO = 7000;

const menosMovimiento = () =>
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Fondo cinematografico de la portada: las propiedades publicadas se suceden
 * con un fundido largo y un zoom continuo, y el fondo se desplaza con el
 * scroll para que la primera pantalla no se sienta estatica.
 *
 * Es decorativo: si no hay imagenes cae a un fondo solido y el buscador
 * sigue funcionando igual.
 */
export function HeroBackdrop({ propiedades = [] }) {
  const [indice, setIndice] = useState(0);
  const [desplazamiento, setDesplazamiento] = useState(0);
  const conFoto = propiedades.filter((p) => p.imagenPrincipal);

  useEffect(() => {
    if (conFoto.length < 2 || menosMovimiento()) return undefined;
    const timer = setInterval(() => {
      setIndice((actual) => (actual + 1) % conFoto.length);
    }, INTERVALO);
    return () => clearInterval(timer);
  }, [conFoto.length]);

  // Parallax: el fondo baja mas lento que la pagina
  useEffect(() => {
    if (menosMovimiento()) return undefined;
    let frame = null;
    const calcular = () => {
      frame = null;
      setDesplazamiento(Math.min(window.scrollY * 0.28, 220));
    };
    const onScroll = () => { if (frame === null) frame = requestAnimationFrame(calcular); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!conFoto.length) return <div className="portada__fondo portada__fondo--vacio" aria-hidden="true" />;

  const activa = conFoto[indice % conFoto.length];

  return (
    <>
      <div
        className="portada__fondo"
        aria-hidden="true"
        style={{ transform: `translate3d(0, ${desplazamiento}px, 0)` }}
      >
        {conFoto.map((propiedad, i) => (
          <SmartImage
            key={propiedad.id}
            src={propiedad.imagenPrincipal}
            className={i === indice ? 'is-activa' : ''}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
        <span className="portada__velo" />
      </div>

      <div className="portada__credito">
        <Link to={`/propiedades/${activa.slug}`}>
          <span className="portada__credito-etiqueta">En portada</span>
          <strong key={activa.id} className="portada__credito-nombre">
            {activa.nombrePublico ?? activa.titulo}
          </strong>
          <span className="portada__credito-lugar">{activa.ubicacion?.etiqueta}</span>
        </Link>

        <span className="portada__puntos" role="tablist" aria-label="Propiedades en portada">
          {conFoto.map((propiedad, i) => (
            <button
              key={propiedad.id}
              type="button"
              role="tab"
              aria-selected={i === indice}
              aria-label={propiedad.nombrePublico ?? propiedad.titulo}
              className={i === indice ? 'is-activo' : ''}
              onClick={() => setIndice(i)}
            />
          ))}
        </span>
      </div>
    </>
  );
}
