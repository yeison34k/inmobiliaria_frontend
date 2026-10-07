import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { Badge } from '@shared/ui/Badge.jsx';
import { formatDateTime, formatMoney } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import {
  CancelOperationModal, CloseOperationModal, DirectClosingModal,
  OperationStatusBadge, ReserveModal, useOperations,
} from '@features/operations';
import { ScheduleVisitModal } from '@features/visits/ui/components/ScheduleVisitModal.jsx';
import { VisitOutcomeBadge, VisitStatusBadge, useVisits } from '@features/visits';
import { DocumentsPanel } from '@features/documents';
import {
  useProperty, usePropertyHistory, usePropertyMutations, usePropertyPriceHistory,
} from '../../application/usePropertiesQueries.js';
import { STATUS_META, TYPE_LABELS, allowedStatuses } from '../../domain/property.js';
import { specFor } from '../../domain/detailSpecs.js';
import { conceptOf } from '../../domain/concepts.js';
import { PropertyStatusBadge } from '../components/PropertyStatusBadge.jsx';
import { PropertyImageManager } from '../components/PropertyImageManager.jsx';

/** Ficha interna: ciclo de vida, imagenes, operaciones e historial. */
export function PropertyAdminDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [modal, setModal] = useState(null);

  const { data: propiedad, isLoading, error, refetch } = useProperty(id);
  const { data: historial = [] } = usePropertyHistory(id);
  const { data: operaciones } = useOperations({ propiedadId: id, pageSize: 10 });
  const { data: visitas } = useVisits({ propiedadId: id, pageSize: 10 });
  const { data: precios = [] } = usePropertyPriceHistory(id);
  const { changeStatus } = usePropertyMutations({ onError: (e) => toast.error(e.displayMessage) });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const mover = (estado) => {
    const motivo = estado === 'suspendida'
      ? prompt('Motivo de la suspension (opcional)') ?? undefined
      : undefined;
    changeStatus.mutate({ id, estado, motivo }, {
      onSuccess: () => toast.success(`Estado actualizado a ${estado}`),
    });
  };

  return (
    <section className="admin-detail">
      <header className="page__header">
        <div>
          <nav className="breadcrumb">
            <Link to="/admin/propiedades">Inventario</Link><span>/</span><span>{propiedad.codigo}</span>
          </nav>
          <h1>{propiedad.titulo}</h1>
          <p className="page__subtitle">
            {TYPE_LABELS[propiedad.tipo]} · {propiedad.operacion} · {propiedad.ubicacion?.etiqueta}
          </p>
        </div>
        <div className="page__actions">
          <PropertyStatusBadge estado={propiedad.estado} />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => window.print()}
            title="Imprimir o exportar a PDF la ficha comercial para clientes"
          >
            🖨️ Imprimir Ficha
          </button>
          <Link className="btn btn--ghost" to={`/admin/propiedades/${id}/editar`}>Editar ficha</Link>
          <Link className="btn btn--primary" to={`/admin/propiedades/${id}/experiencia`}>Experiencia</Link>
          {propiedad.estado === 'publicada' || propiedad.estado === 'reservada' ? (
            <Link className="btn btn--ghost" to={`/propiedades/${propiedad.slug}`} target="_blank" rel="noreferrer">
              Ver publicacion
            </Link>
          ) : null}
        </div>
      </header>

      <div className="admin-detail__grid">
        <div>
          <article className="panel">
            <h2>Ciclo de vida</h2>
            <p className="panel__hint">
              Precio: <strong>{formatMoney(propiedad.precio, propiedad.moneda)}</strong>
              {propiedad.publicadaAt ? <> · publicada el {formatDateTime(propiedad.publicadaAt)}</> : null}
            </p>

            <div className="actions-row">
              <button type="button" className="btn btn--primary" onClick={() => setModal('visita')}>
                Agendar visita
              </button>

              {propiedad.estado === 'publicada' ? (
                <>
                  <button type="button" className="btn btn--ghost" onClick={() => setModal('reservar')}>
                    Registrar reserva
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setModal('cierre-directo')}>
                    Cierre directo
                  </button>
                </>
              ) : null}

              {propiedad.estado === 'reservada' ? (
                <>
                  <button type="button" className="btn btn--primary" onClick={() => setModal('cerrar')}>
                    Cerrar operacion
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => setModal('caida')}>
                    Registrar caida
                  </button>
                </>
              ) : null}

              {allowedStatuses(propiedad.estado).map((estado) => (
                <button
                  key={estado}
                  type="button"
                  className="btn btn--ghost"
                  disabled={changeStatus.isPending}
                  onClick={() => mover(estado)}
                >
                  Pasar a {STATUS_META[estado].label.toLowerCase()}
                </button>
              ))}
            </div>

            {propiedad.imagenes.length === 0 ? (
              <p className="panel__warning">
                Esta propiedad no tiene imagenes: no podra publicarse hasta que agregue al menos una.
              </p>
            ) : null}
          </article>

          {/* Panel de Experiencia & Landing Page */}
          <article className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <h2>Landing Page & Experiencia Visual</h2>
                <p className="panel__hint">
                  Tema activo: <strong style={{ color: 'var(--text)' }}>{conceptOf(propiedad.historia?.concepto).nombre}</strong> · {conceptOf(propiedad.historia?.concepto).resumen}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link className="btn btn--secondary btn--sm" to={`/admin/propiedades/${id}/editar`}>
                  ✏️ Editar Ficha & Temas
                </Link>
                {propiedad.slug && (
                  <a
                    className="btn btn--ghost btn--sm"
                    href={`/propiedades/${propiedad.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🌐 Ver Landing ↗
                  </a>
                )}
              </div>
            </div>

            <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                  Titular Emocional de Portada
                </span>
                <span className="badge badge--neutral">
                  Concepto: {propiedad.historia?.concepto || 'minimal'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text)' }}>
                {propiedad.historia?.titular ? `"${propiedad.historia.titular}"` : 'Sin titular emocional configurado'}
              </p>
              {propiedad.historia?.subtitulo && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-soft)' }}>
                  {propiedad.historia.subtitulo}
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--surface)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Distribución</span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>
                  {propiedad.plantas?.length ? `${propiedad.plantas.length} Niveles` : 'Sin plantas'}
                </p>
              </div>
              <div style={{ background: 'var(--surface)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Entorno</span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>
                  {propiedad.entorno?.length ? `${propiedad.entorno.length} Puntos` : 'Sin entorno'}
                </p>
              </div>
              <div style={{ background: 'var(--surface)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Recorrido 3D</span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: propiedad.historia?.tourUrl ? '#059669' : 'var(--text-soft)' }}>
                  {propiedad.historia?.tourUrl ? (
                    <a
                      href={propiedad.historia.tourUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#0284c7', textDecoration: 'none' }}
                      title="Probar tour 3D en pestaña nueva"
                    >
                      ✓ Activo (Ver ↗)
                    </a>
                  ) : 'No configurado'}
                </p>
              </div>
              <div style={{ background: 'var(--surface)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Video Hero</span>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: propiedad.historia?.videoUrl ? '#059669' : 'var(--text-soft)' }}>
                  {propiedad.historia?.videoUrl ? '✓ Activo' : 'No configurado'}
                </p>
              </div>
            </div>
          </article>

          <article className="panel">
            <h2>Caracteristicas</h2>
            <dl className="specs">
              {specFor(propiedad.tipo).map((field) => {
                const valor = propiedad.detalles?.[field.name];
                if (valor === null || valor === undefined || valor === '') return null;
                const texto = field.type === 'boolean'
                  ? (valor ? 'Si' : 'No')
                  : field.format === 'money' ? formatMoney(valor, propiedad.moneda)
                  : Array.isArray(valor) ? valor.join(', ') : String(valor);
                if (!texto) return null;
                return (
                  <div key={field.name} className="specs__item">
                    <dt>{field.label}</dt><dd>{texto}</dd>
                  </div>
                );
              })}
            </dl>
            {propiedad.caracteristicas?.length ? (
              <ul className="chips">
                {propiedad.caracteristicas.map((c) => <li key={c} className="chip">{c}</li>)}
              </ul>
            ) : null}
          </article>

          <PropertyImageManager propiedad={propiedad} />

          <DocumentsPanel propiedadId={id} titulo="Documentos de la propiedad" />
        </div>

        <aside>
          <article className="panel">
            <h2>Operaciones</h2>
            {operaciones?.items?.length ? (
              <ul className="timeline">
                {operaciones.items.map((operacion) => (
                  <li key={operacion.id}>
                    <div className="timeline__head">
                      <code>{operacion.codigo}</code>
                      <OperationStatusBadge estado={operacion.estado} />
                    </div>
                    <p>
                      {operacion.cliente?.nombre} ·{' '}
                      {formatMoney(operacion.precioCierre ?? operacion.precioLista)}
                    </p>
                    <small>
                      {formatDateTime(operacion.fechaCierre ?? operacion.fechaCaida ?? operacion.fechaReserva)}
                      {operacion.motivoCaida ? ` · ${operacion.motivoCaida}` : ''}
                    </small>
                  </li>
                ))}
              </ul>
            ) : <p className="panel__hint">Sin operaciones registradas.</p>}
          </article>

          <article className="panel">
            <h2>Visitas</h2>
            {visitas?.items?.length ? (
              <ul className="timeline">
                {visitas.items.map((visita) => (
                  <li key={visita.id}>
                    <div className="timeline__head">
                      <code>{visita.codigo}</code>
                      <VisitStatusBadge estado={visita.estado} />
                      <VisitOutcomeBadge resultado={visita.resultado} />
                    </div>
                    <p>{visita.cliente?.nombre}</p>
                    <small>
                      {formatDateTime(visita.fechaInicio)}
                      {visita.asesor?.nombre ? ` · ${visita.asesor.nombre}` : ''}
                    </small>
                  </li>
                ))}
              </ul>
            ) : <p className="panel__hint">Sin visitas agendadas.</p>}
          </article>

          <article className="panel">
            <h2>Historial de precios</h2>
            {precios.length ? (
              <ul className="timeline">
                {precios.map((cambio) => (
                  <li key={cambio.id}>
                    <div className="timeline__head">
                      <strong>{formatMoney(cambio.precioNuevo, cambio.moneda)}</strong>
                      <Badge tone={cambio.variacion < 0 ? 'warning' : 'success'}>
                        {cambio.variacion > 0 ? '+' : ''}{cambio.variacion}%
                      </Badge>
                    </div>
                    <small>
                      Antes {formatMoney(cambio.precioAnterior, cambio.moneda)} ·{' '}
                      {formatDateTime(cambio.createdAt)}
                      {cambio.usuario ? ` · ${cambio.usuario}` : ''}
                    </small>
                  </li>
                ))}
              </ul>
            ) : <p className="panel__hint">El precio no ha cambiado desde la carga.</p>}
          </article>

          <article className="panel">
            <h2>Historial de estados</h2>
            <ul className="timeline">
              {historial.map((entrada) => (
                <li key={entrada.id}>
                  <div className="timeline__head">
                    <Badge tone={STATUS_META[entrada.estadoNuevo]?.tone ?? 'neutral'}>
                      {entrada.estadoNuevo}
                    </Badge>
                    {entrada.estadoAnterior ? <small>desde {entrada.estadoAnterior}</small> : null}
                  </div>
                  <small>
                    {formatDateTime(entrada.createdAt)}
                    {entrada.usuario ? ` · ${entrada.usuario}` : ''}
                    {entrada.motivo ? ` · ${entrada.motivo}` : ''}
                  </small>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </div>

      {modal === 'visita' ? <ScheduleVisitModal propiedad={propiedad} onClose={() => setModal(null)} /> : null}
      {modal === 'reservar' ? <ReserveModal propiedad={propiedad} onClose={() => setModal(null)} /> : null}
      {modal === 'cerrar' ? <CloseOperationModal propiedad={propiedad} onClose={() => setModal(null)} /> : null}
      {modal === 'caida' ? <CancelOperationModal propiedad={propiedad} onClose={() => setModal(null)} /> : null}
      {modal === 'cierre-directo' ? <DirectClosingModal propiedad={propiedad} onClose={() => setModal(null)} /> : null}
    </section>
  );
}
