import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { EmptyState } from '@shared/ui/EmptyState.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useAgenda, useVisitMutations } from '../../application/useVisitsQueries.js';
import { estaVencida } from '../../domain/visit.js';
import { VisitOutcomeBadge, VisitStatusBadge } from '../components/VisitStatusBadge.jsx';
import { VisitOutcomeModal } from '../components/VisitOutcomeModal.jsx';
import { ScheduleVisitModal } from '../components/ScheduleVisitModal.jsx';

const hora = (valor) =>
  new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date(valor));

const diaLargo = (fecha) =>
  new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(`${fecha}T12:00:00`));

/** Dia local en formato YYYY-MM-DD (toISOString daria el dia UTC). */
const diaLocal = (fecha = new Date()) => {
  const desfase = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - desfase).toISOString().slice(0, 10);
};

const esHoy = (fecha) => fecha === diaLocal();

/**
 * Agenda de visitas por dias.
 * Cada tarjeta trae la accion que corresponde a su estado: confirmar,
 * registrar resultado, marcar ausencia o cancelar.
 */
export function AgendaPage() {
  const toast = useToast();
  const [dias, setDias] = useState(7);
  const [desde, setDesde] = useState(() => diaLocal());
  const [cerrando, setCerrando] = useState(null);
  const [agendando, setAgendando] = useState(false);

  const { data, isLoading, error, refetch } = useAgenda({ desde, dias });
  const { confirm, cancel, noShow } = useVisitMutations({ onError: (e) => toast.error(e.displayMessage) });

  const mover = (saltoDias) => {
    const base = new Date(`${desde}T12:00:00`);
    base.setDate(base.getDate() + saltoDias);
    setDesde(diaLocal(base));
  };

  if (isLoading) return <Spinner label="Cargando la agenda..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <section>
      <header className="page__header">
        <div>
          <h1>Agenda</h1>
          <p className="page__subtitle">
            {data.total} {data.total === 1 ? 'visita' : 'visitas'} en los proximos {dias} dias
          </p>
        </div>
        <div className="page__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => mover(-dias)}>← Anterior</button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setDesde(diaLocal())}
          >
            Hoy
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => mover(dias)}>Siguiente →</button>
          <select value={dias} onChange={(e) => setDias(Number(e.target.value))} className="buscador__select">
            <option value={1}>1 dia</option>
            <option value={7}>7 dias</option>
            <option value={14}>14 dias</option>
            <option value={31}>Un mes</option>
          </select>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => setAgendando(true)}
          >
            + Agendar visita
          </button>
        </div>
      </header>

      {data.total === 0 ? (
        <EmptyState
          title="No hay visitas en este rango"
          description="Agende una desde la ficha de una propiedad o desde una consulta web."
          action={<Link className="btn btn--primary" to="/admin/consultas">Ver consultas</Link>}
        />
      ) : null}

      <div className="agenda">
        {data.dias.map((dia) => (
          <section key={dia.fecha} className={esHoy(dia.fecha) ? 'agenda__dia es-hoy' : 'agenda__dia'}>
            <header>
              <h2>{diaLargo(dia.fecha)}</h2>
              <span>{dia.visitas.length || 'libre'}</span>
            </header>

            {dia.visitas.length === 0 ? (
              <p className="agenda__libre">Sin visitas</p>
            ) : (
              <ul className="agenda__lista">
                {dia.visitas.map((visita) => (
                  <li key={visita.id} className={estaVencida(visita) ? 'visita esta-vencida' : 'visita'}>
                    <span className="visita__hora">
                      {hora(visita.fechaInicio)}
                      <small>{visita.duracionMin} min</small>
                    </span>

                    <div className="visita__cuerpo">
                      <div className="visita__titulo">
                        <Link to={`/admin/propiedades/${visita.propiedadId}`}>
                          {visita.propiedad?.titulo}
                        </Link>
                        <VisitStatusBadge estado={visita.estado} />
                        <VisitOutcomeBadge resultado={visita.resultado} />
                      </div>
                      <p className="visita__datos">
                        {visita.cliente?.nombre}
                        {visita.cliente?.telefono ? ` · ${visita.cliente.telefono}` : ''}
                        {visita.asesor?.nombre ? ` · asesor: ${visita.asesor.nombre}` : ' · sin asesor'}
                      </p>
                      {visita.propiedad?.direccion ? (
                        <p className="visita__lugar">{visita.propiedad.direccion}</p>
                      ) : null}
                      {estaVencida(visita) ? (
                        <p className="visita__aviso">Ya paso la hora: registre que ocurrio</p>
                      ) : null}
                    </div>

                    <div className="visita__acciones">
                      {visita.estado === 'programada' ? (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => confirm.mutate(visita.id, {
                            onSuccess: () => toast.success('Visita confirmada'),
                          })}
                        >
                          Confirmar
                        </button>
                      ) : null}

                      {['programada', 'confirmada'].includes(visita.estado) ? (
                        <>
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => setCerrando(visita)}
                          >
                            Resultado
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => noShow.mutate({ id: visita.id }, {
                              onSuccess: () => toast.success('Registrada como ausencia'),
                            })}
                          >
                            No asistio
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => {
                              const motivo = prompt('Motivo de la cancelacion');
                              if (motivo) cancel.mutate({ id: visita.id, motivo });
                            }}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {cerrando ? (
        <VisitOutcomeModal visita={cerrando} onClose={() => setCerrando(null)} />
      ) : null}

      {agendando ? (
        <ScheduleVisitModal
          onClose={() => setAgendando(false)}
          onDone={() => refetch()}
        />
      ) : null}
    </section>
  );
}
