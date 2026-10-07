import { Reveal } from '@shared/ui/Reveal.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import { specFor } from '../../../domain/detailSpecs.js';
import { OPERATION_LABELS, TYPE_LABELS } from '../../../domain/property.js';

/** Iconos por campo: la informacion dura, mostrada de forma iconica. */
const ICONOS = {
  habitaciones: '◫', banos: '◔', areaM2: '⬚', areaLoteM2: '⬚', areaConstruidaM2: '▤',
  piso: '◰', pisos: '◰', parqueaderos: '⬓', ascensor: '⇅', amoblado: '◧',
  administracionMensual: '◷', antiguedadAnos: '◵', patio: '❖', conjuntoCerrado: '⌂',
  usoSuelo: '◈', frenteM: '↔', fondoM: '↕', topografia: '◭', escriturado: '✓',
  serviciosDisponibles: '⚟', salasReuniones: '▣', recepcion: '◎',
};

const valorLegible = (campo, valor, moneda, formatMoney, isEn) => {
  if (valor === null || valor === undefined || valor === '') return null;
  if (campo.type === 'boolean') return valor ? (isEn ? 'Yes' : 'Sí') : 'No';
  if (campo.type === 'tags') {
    const lista = Array.isArray(valor) ? valor : [valor];
    return lista.length ? lista.join(' · ') : null;
  }
  if (campo.format === 'money') return formatMoney(valor, moneda);
  return String(valor);
};

/**
 * Bloque 5: datos tecnicos con diseno de vanguardia.
 * La informacion dura es necesaria, pero llega despues de la historia
 * y se muestra como una retícula de datos, no como una tabla.
 */
export function TechnicalSpecs({ propiedad }) {
  const { formatMoney, typeLabel, operationLabel, isEn } = useTranslation();
  const campos = specFor(propiedad.tipo)
    .map((campo) => ({ campo, valor: valorLegible(campo, propiedad.detalles?.[campo.name], propiedad.moneda, formatMoney, isEn) }))
    .filter((fila) => fila.valor !== null);

  return (
    <section className="exp-section exp-datos">
      <Reveal>
        <p className="exp-kicker">{isEn ? 'Specifications' : 'Ficha técnica'}</p>
      </Reveal>

      <Reveal delay={80} className="exp-datos__precio">
        <div>
          <p className="exp-datos__etiqueta">{operationLabel(propiedad.operacion)}</p>
          <p className="exp-datos__valor">
            {formatMoney(propiedad.precio, propiedad.moneda)}
            {propiedad.operacion === 'arriendo' ? <span> {isEn ? '/mo' : '/mes'}</span> : null}
          </p>
        </div>
        <div className="exp-datos__meta">
          <span>{typeLabel(propiedad.tipo)}</span>
          <span>{propiedad.codigo}</span>
        </div>
      </Reveal>

      <div className="exp-datos__grid">
        {campos.map(({ campo, valor }, index) => (
          <Reveal key={campo.name} delay={index * 45} as="article" className="exp-dato">
            <span className="exp-dato__icono" aria-hidden="true">{ICONOS[campo.name] ?? '◆'}</span>
            <p className="exp-dato__label">{campo.label}</p>
            <p className="exp-dato__valor">{valor}</p>
          </Reveal>
        ))}
      </div>

      {propiedad.caracteristicas?.length ? (
        <Reveal delay={120} className="exp-datos__amenidades">
          <p className="exp-kicker">Amenidades</p>
          <ul>
            {propiedad.caracteristicas.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </Reveal>
      ) : null}
    </section>
  );
}
