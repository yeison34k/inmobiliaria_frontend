import { Link } from 'react-router-dom';
import { StatCard } from '@shared/ui/StatCard.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { formatMoneyShort, formatNumber, formatPercent, relativeDays } from '@shared/lib/format.js';
import { STATUS_META } from '@features/properties';
import { useDashboardAlerts, useDashboardMetrics } from '../../application/useDashboardQueries.js';

const AlertList = ({ titulo, items, render }) => {
  if (!items?.length) return null;
  return (
    <article className="panel">
      <h3>{titulo} <span className="panel__count">{items.length}</span></h3>
      <ul className="alert-list">
        {items.map((item) => <li key={item.id}>{render(item)}</li>)}
      </ul>
    </article>
  );
};

/** Tablero de control: estado del inventario y salud de las operaciones. */
export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardMetrics();
  const { data: alertas } = useDashboardAlerts({ diasSinActualizar: 90 });

  if (isLoading) return <Spinner label="Calculando metricas..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { inventario, operaciones, mesActual, serieCierres, topCiudades, consultasNuevas, visitas, arrendamientos } = data;
  const maxSerie = Math.max(1, ...serieCierres.map((s) => s.cierres));

  return (
    <section>
      <header className="page__header">
        <div>
          <h1>Panel de control</h1>
          <p className="page__subtitle">Estado del inventario y de las operaciones en curso</p>
        </div>
      </header>

      <div className="stats">
        <StatCard
          label="Inventario activo"
          value={formatNumber(inventario.activo)}
          hint={`Valor en cartera: ${formatMoneyShort(inventario.valor)}`}
        />
        <StatCard
          label="Reservas activas"
          value={formatNumber(operaciones.reservasActivas)}
          hint={`Senias retenidas: ${formatMoneyShort(operaciones.seniasActivas)}`}
          tone="warning"
        />
        <StatCard
          label="Cierres del mes"
          value={formatNumber(mesActual.cierres)}
          hint={`Volumen: ${formatMoneyShort(mesActual.volumen)} · comision ${formatMoneyShort(mesActual.comisiones)}`}
          tone="success"
        />
        <StatCard
          label="Tasa de caida"
          value={formatPercent(operaciones.tasaCaida)}
          hint={`${operaciones.caidasTotal} caidas de ${operaciones.caidasTotal + operaciones.cerradasTotal} operaciones`}
          tone={operaciones.tasaCaida > 30 ? 'danger' : 'neutral'}
        />
        <StatCard
          label="Visitas de hoy"
          value={formatNumber(visitas?.hoy ?? 0)}
          hint={`${formatNumber(visitas?.proximas ?? 0)} proximas · ${formatPercent(visitas?.tasaInteres ?? 0)} deja interes`}
          tone="info"
        />
        <StatCard
          label="Consultas nuevas"
          value={formatNumber(consultasNuevas)}
          hint={<Link to="/admin/consultas">Ver bandeja</Link>}
          tone="info"
        />
        {arrendamientos ? (
          <>
            <StatCard
              label="Cánones en cartera"
              value={formatMoneyShort(arrendamientos.totalCanones ?? 0)}
              hint={`${arrendamientos.totalActivos ?? 0} contratos activos · honorarios ${formatMoneyShort(arrendamientos.totalHonorariosEstimados ?? 0)}`}
              tone="success"
            />
            <StatCard
              label="Pólizas por vencer"
              value={formatNumber(arrendamientos.polizasPorVencer ?? 0)}
              hint={<Link to="/admin/arrendamientos">Gestionar en arrendamientos</Link>}
              tone={arrendamientos.polizasPorVencer > 0 ? 'warning' : 'neutral'}
            />
          </>
        ) : null}
      </div>

      <div className="dashboard__grid">
        <article className="panel">
          <h2>Propiedades por estado</h2>
          <ul className="status-bars">
            {Object.entries(STATUS_META).map(([estado, meta]) => {
              const total = inventario.porEstado[estado] ?? 0;
              const maximo = Math.max(1, ...Object.values(inventario.porEstado));
              return (
                <li key={estado}>
                  <span className="status-bars__label">{meta.label}</span>
                  <span className="status-bars__track">
                    <span
                      className={`status-bars__fill status-bars__fill--${meta.tone}`}
                      style={{ width: `${(total / maximo) * 100}%` }}
                    />
                  </span>
                  <Link to={`/admin/propiedades?estados=${estado}`} className="status-bars__value">
                    {formatNumber(total)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="panel">
          <h2>Cierres de los ultimos 6 meses</h2>
          {serieCierres.length === 0 ? (
            <p className="panel__hint">Aun no hay operaciones cerradas.</p>
          ) : (
            <ul className="bars">
              {serieCierres.map((punto) => (
                <li key={punto.mes}>
                  <span className="bars__bar" style={{ height: `${(punto.cierres / maxSerie) * 100}%` }} />
                  <small>{punto.mes.slice(5)}</small>
                  <strong>{punto.cierres}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel">
          <h2>Inventario por tipo</h2>
          <table className="table table--compact">
            <thead><tr><th>Tipo</th><th>Operacion</th><th>Total</th></tr></thead>
            <tbody>
              {inventario.porTipo.map((fila) => (
                <tr key={`${fila.tipo}-${fila.operacion}`}>
                  <td>{fila.tipo}</td>
                  <td>{fila.operacion}</td>
                  <td>{formatNumber(fila.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="panel">
          <h2>Ciudades con mas oferta</h2>
          <ul className="ranking">
            {topCiudades.map((ciudad) => (
              <li key={ciudad.ciudad}>
                <span>{ciudad.ciudad}</span>
                <strong>{formatNumber(ciudad.total)}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <h2 className="section-title">
        Alertas operativas {alertas?.total ? <span className="panel__count">{alertas.total}</span> : null}
      </h2>

      <div className="dashboard__grid">
        <AlertList
          titulo="Publicadas sin actualizar (90 dias)"
          items={alertas?.sinActualizar}
          render={(item) => (
            <>
              <Link to={`/admin/propiedades/${item.id}`}>{item.titulo}</Link>
              <small>{item.codigo} · {relativeDays(item.updatedAt)}</small>
            </>
          )}
        />
        <AlertList
          titulo="Fichas sin imagenes"
          items={alertas?.sinImagenes}
          render={(item) => (
            <>
              <Link to={`/admin/propiedades/${item.id}/editar`}>{item.titulo}</Link>
              <small>{item.codigo} · no se puede publicar</small>
            </>
          )}
        />
        <AlertList
          titulo="Borradores antiguos"
          items={alertas?.borradoresAntiguos}
          render={(item) => (
            <>
              <Link to={`/admin/propiedades/${item.id}`}>{item.titulo}</Link>
              <small>{item.codigo} · creado {relativeDays(item.createdAt)}</small>
            </>
          )}
        />
        <AlertList
          titulo="Documentos vencidos"
          items={alertas?.documentosVencidos}
          render={(item) => (
            <>
              <Link to={`/admin/propiedades/${item.propiedadId}`}>{item.tipo}</Link>
              <small>{item.propiedad ?? item.nombre} · vencio hace {Math.abs(item.diasParaVencer)} dias</small>
            </>
          )}
        />
        <AlertList
          titulo="Documentos por vencer"
          items={alertas?.documentosPorVencer}
          render={(item) => (
            <>
              <Link to={`/admin/propiedades/${item.propiedadId}`}>{item.tipo}</Link>
              <small>{item.propiedad ?? item.nombre} · vence en {item.diasParaVencer} dias</small>
            </>
          )}
        />
        <AlertList
          titulo="Visitas sin cerrar"
          items={alertas?.visitasSinCerrar}
          render={(item) => (
            <>
              <Link to="/admin/agenda">{item.propiedad}</Link>
              <small>{item.codigo} · {item.cliente} · {relativeDays(item.fechaInicio)}</small>
            </>
          )}
        />
        <AlertList
          titulo="Reservas estancadas (30 dias)"
          items={alertas?.reservasEstancadas}
          render={(item) => (
            <>
              <Link to="/admin/operaciones">{item.propiedad}</Link>
              <small>{item.codigo} · reservada {relativeDays(item.fechaReserva)}</small>
            </>
          )}
        />
      </div>
    </section>
  );
}
