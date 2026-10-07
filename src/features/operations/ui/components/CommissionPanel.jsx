import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@shared/ui/Badge.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { useMyCommission } from '../../application/useOperationsQueries.js';

const fecha = (valor) =>
  valor ? new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(new Date(valor)) : '';

/**
 * Lo que el asesor lleva y lo que tiene por cerrar.
 *
 * Los dos numeros nunca se suman: el de la izquierda ya esta decidido en
 * el reparto de operaciones cerradas, el de la derecha es una proyeccion
 * sobre reservas que todavia pueden caerse. Por eso el segundo dice con
 * que porcentaje se calculo.
 */
export function CommissionPanel() {
  const { data, isLoading } = useMyCommission();
  const [abierto, setAbierto] = useState(false);

  if (isLoading || !data?.definido) return null;

  const { definido, pipeline, mes, anio, participacion } = data;
  const detalle = abierto ? [...definido.detalle, ...pipeline.detalle] : [];

  return (
    <article className="comision-panel">
      <header>
        <h2>Mi comision</h2>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAbierto(!abierto)}>
          {abierto ? 'Ocultar detalle' : 'Ver detalle'}
        </button>
      </header>

      <div className="comision-panel__cifras">
        <div className="comision-panel__cifra">
          <span className="comision-panel__etiqueta">Cerrado en {mes}</span>
          <strong>{formatMoney(definido.total)}</strong>
          <small>
            {definido.porCobrar
              ? `${formatMoney(definido.porCobrar)} por cobrar`
              : definido.total
                ? 'todo pagado'
                : 'sin cierres este mes'}
          </small>
        </div>

        <div className="comision-panel__cifra comision-panel__cifra--estimada">
          <span className="comision-panel__etiqueta">
            En reservas por cerrar <Badge tone="neutral">estimado</Badge>
          </span>
          <strong>{formatMoney(pipeline.proyectado)}</strong>
          <small>
            {pipeline.operaciones
              ? `${pipeline.operaciones} ${pipeline.operaciones === 1 ? 'operacion' : 'operaciones'} · al ${participacion}% de participacion`
              : 'no tiene reservas abiertas'}
          </small>
        </div>

        <div className="comision-panel__cifra">
          <span className="comision-panel__etiqueta">Acumulado del ano</span>
          <strong>{formatMoney(anio.total)}</strong>
          <small>{anio.operaciones} {anio.operaciones === 1 ? 'cierre' : 'cierres'}</small>
        </div>
      </div>

      {pipeline.sinValorar ? (
        <p className="comision-panel__aviso">
          {pipeline.sinValorar === 1
            ? 'Una reserva no tiene comision definida, por lo que no entra en la proyeccion.'
            : `${pipeline.sinValorar} reservas no tienen comision definida y no entran en la proyeccion.`}
        </p>
      ) : null}

      {abierto && detalle.length ? (
        <table className="comision-panel__detalle">
          <thead>
            <tr>
              <th>Operacion</th>
              <th>Propiedad</th>
              <th>Fecha</th>
              <th>Valor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {definido.detalle.map((d) => (
              <tr key={d.operacionId}>
                <td>{d.codigo}</td>
                <td>{d.propiedad}</td>
                <td>{fecha(d.fecha)}</td>
                <td>{formatMoney(d.valor)}</td>
                <td>
                  <Badge tone={d.estado === 'pagado' ? 'success' : 'warning'}>
                    {d.estado === 'pagado' ? 'pagado' : 'por cobrar'}
                  </Badge>
                </td>
              </tr>
            ))}
            {pipeline.detalle.map((p) => (
              <tr key={p.operacionId} className="es-estimada">
                <td>{p.codigo}</td>
                <td>
                  {p.propiedad}
                  {p.cliente ? <small> · {p.cliente}</small> : null}
                </td>
                <td>reservada {fecha(p.fechaReserva)}</td>
                <td>{p.proyectado === null ? <span className="texto-tenue">sin definir</span> : formatMoney(p.proyectado)}</td>
                <td><Badge tone="neutral">estimado</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {abierto ? (
        <Link className="btn btn--ghost btn--sm" to="/admin/operaciones">Ver operaciones</Link>
      ) : null}
    </article>
  );
}
