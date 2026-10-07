import { Link } from 'react-router-dom';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { OPERATION_LABELS, TYPE_LABELS } from '../../../domain/property.js';
import { detailsSummary } from '../../../domain/detailSpecs.js';

function Pieza({ propiedad, destacada = false }) {
  const historia = propiedad.historia ?? {};

  return (
    <article className={destacada ? 'pieza pieza--grande' : 'pieza'}>
      <Link to={`/propiedades/${propiedad.slug}`}>
        <span className="pieza__foto">
          {propiedad.imagenPrincipal
            ? <SmartImage src={propiedad.imagenPrincipal} alt={propiedad.titulo} />
            : <span className="pieza__vacia">Sin imagen</span>}
          <span className="pieza__cinta">{OPERATION_LABELS[propiedad.operacion]}</span>
        </span>

        <span className="pieza__cuerpo">
          <span className="pieza__lugar">{propiedad.ubicacion?.etiqueta}</span>
          <strong className="pieza__nombre">{propiedad.nombrePublico ?? propiedad.titulo}</strong>
          {destacada && historia.titular ? (
            <span className="pieza__titular">{historia.titular}</span>
          ) : null}
          <span className="pieza__datos">
            {TYPE_LABELS[propiedad.tipo]} · {detailsSummary(propiedad)}
          </span>
          <span className="pieza__precio">
            {formatMoney(propiedad.precio, propiedad.moneda)}
            {propiedad.operacion === 'arriendo' ? <em>/mes</em> : null}
          </span>
        </span>
      </Link>
    </article>
  );
}

/**
 * Seleccion destacada con jerarquia editorial: una pieza principal grande
 * con su titular emocional y dos secundarias al costado. Rompe la
 * cuadricula uniforme sin perder la lectura rapida de precio y ubicacion.
 */
export function FeaturedShowcase({ propiedades = [] }) {
  if (!propiedades.length) return null;
  const [principal, ...resto] = propiedades;

  return (
    <div className="vitrina">
      <Reveal className="vitrina__principal">
        <Pieza propiedad={principal} destacada />
      </Reveal>

      <div className="vitrina__lado">
        {resto.slice(0, 2).map((propiedad, index) => (
          <Reveal key={propiedad.id} delay={(index + 1) * 110}>
            <Pieza propiedad={propiedad} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
