import { Reveal } from '@shared/ui/Reveal.jsx';
import { SURROUNDING_META } from '../../../domain/concepts.js';

/**
 * Bloque 6: curaduria del vecindario.
 * Quien compra premium no compra solo la casa: compra el barrio.
 */
export function Neighborhood({ propiedad }) {
  const puntos = propiedad.entorno ?? [];
  if (!puntos.length) return null;

  const porCategoria = puntos.reduce((mapa, punto) => {
    (mapa[punto.categoria] ??= []).push(punto);
    return mapa;
  }, {});

  return (
    <section className="exp-section exp-barrio">
      <Reveal>
        <p className="exp-kicker">El entorno</p>
        <h2 className="exp-title">
          {[propiedad.ubicacion?.barrio, propiedad.ubicacion?.ciudad].filter(Boolean).join(', ')}
        </h2>
      </Reveal>

      <div className="exp-barrio__grid">
        {Object.entries(porCategoria).map(([categoria, lista], index) => {
          const meta = SURROUNDING_META[categoria] ?? { label: categoria, icono: '○' };
          return (
            <Reveal key={categoria} delay={index * 80} as="article" className="exp-barrio__card">
              <p className="exp-barrio__cat">
                <span aria-hidden="true">{meta.icono}</span> {meta.label}
              </p>
              <ul>
                {lista.map((punto) => (
                  <li key={punto.id}>
                    <strong>{punto.nombre}</strong>
                    {punto.descripcion ? <span>{punto.descripcion}</span> : null}
                    {punto.distanciaMin !== null && punto.distanciaMin !== undefined ? (
                      <em>{punto.distanciaMin} min</em>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
