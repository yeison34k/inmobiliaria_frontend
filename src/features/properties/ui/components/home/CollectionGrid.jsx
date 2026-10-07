import { Link } from 'react-router-dom';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { CONCEPTS } from '../../../domain/concepts.js';

/**
 * Colecciones por concepto visual.
 * Reutiliza la identidad que el asesor ya eligio para cada propiedad:
 * quien busca "algo frente al mar" entra por aqui, no por un filtro.
 */
const COLECCIONES = [
  { concepto: 'costero', titulo: 'Frente al mar', copy: 'Luz, arena y horizonte' },
  { concepto: 'urbano', titulo: 'Vida urbana', copy: 'Altura, diseno y ciudad' },
  { concepto: 'campestre', titulo: 'Campo y naturaleza', copy: 'Verde, silencio y aire' },
  { concepto: 'clasico', titulo: 'Con historia', copy: 'Barrios y casas con pasado' },
];

export function CollectionGrid({ propiedades = [] }) {
  /** Una foto representativa por coleccion, tomada del inventario real. */
  const portadaDe = (concepto) =>
    propiedades.find((p) => p.historia?.concepto === concepto && p.imagenPrincipal)?.imagenPrincipal ?? null;

  const conteo = (concepto) =>
    propiedades.filter((p) => p.historia?.concepto === concepto).length;

  return (
    <div className="colecciones">
      {COLECCIONES.map((coleccion, index) => {
        const portada = portadaDe(coleccion.concepto);
        const total = conteo(coleccion.concepto);
        const tokens = CONCEPTS[coleccion.concepto].tokens;

        return (
          <Reveal key={coleccion.concepto} delay={index * 90} as="article" className="coleccion">
            <Link
              to={`/propiedades?concepto=${coleccion.concepto}`}
              style={{ '--coleccion-acento': tokens['--exp-accent'] }}
            >
              <span className="coleccion__foto">
                {portada
                  ? <SmartImage src={portada} />
                  : <span className="coleccion__vacia" style={{ background: tokens['--exp-bg-alt'] }} />}
              </span>
              <span className="coleccion__texto">
                <strong>{coleccion.titulo}</strong>
                <span>{coleccion.copy}</span>
                {total ? <em>{total} {total === 1 ? 'propiedad' : 'propiedades'}</em> : <em>Proximamente</em>}
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
