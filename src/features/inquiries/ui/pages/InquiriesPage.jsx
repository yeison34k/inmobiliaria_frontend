import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@shared/ui/Badge.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { EmptyState } from '@shared/ui/EmptyState.jsx';
import { Pagination } from '@shared/ui/Pagination.jsx';
import { formatDateTime } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { ScheduleVisitModal } from '@features/visits/ui/components/ScheduleVisitModal.jsx';
import { useInquiries, useInquiryMutations } from '../../application/useInquiriesQueries.js';
import { INQUIRY_STATUS_META, InquiryStatus } from '../../domain/inquiry.js';

/** Bandeja de leads: atender convierte la consulta en contacto del CRM. */
export function InquiriesPage() {
  const toast = useToast();
  const [filtros, setFiltros] = useState({ page: 1, estado: InquiryStatus.NUEVA });
  const [agendando, setAgendando] = useState(null);
  const { data, isLoading, error, refetch } = useInquiries({
    ...filtros,
    estado: filtros.estado || undefined,
    pageSize: 20,
  });
  const { handle, discard } = useInquiryMutations({ onError: (e) => toast.error(e.displayMessage) });

  return (
    <section>
      <header className="page__header">
        <div>
          <h1>Consultas</h1>
          <p className="page__subtitle">Leads recibidos desde el sitio publico</p>
        </div>
      </header>

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value, page: 1 })}>
          <option value="">Todas</option>
          {Object.entries(INQUIRY_STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>
      </form>

      {isLoading ? <Spinner /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {data && data.items.length === 0 ? (
        <EmptyState title="Sin consultas" description="Cuando alguien escriba desde el sitio, aparecera aqui." />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <ul className="inquiries">
            {data.items.map((consulta) => {
              const meta = INQUIRY_STATUS_META[consulta.estado];
              return (
                <li key={consulta.id} className="inquiry">
                  <header className="inquiry__header">
                    <div>
                      <strong>{consulta.nombre}</strong>
                      <span className="inquiry__contact">{consulta.email} · {consulta.telefono ?? 'sin telefono'}</span>
                    </div>
                    <div className="inquiry__meta">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <small>{formatDateTime(consulta.createdAt)}</small>
                    </div>
                  </header>

                  {consulta.propiedad ? (
                    <p className="inquiry__property">
                      Sobre:{' '}
                      <Link to={`/propiedades/${consulta.propiedad.slug}`}>
                        {consulta.propiedad.titulo} ({consulta.propiedad.codigo})
                      </Link>
                    </p>
                  ) : null}

                  <p className="inquiry__message">{consulta.mensaje}</p>

                  {consulta.estado === InquiryStatus.NUEVA ? (
                    <footer className="inquiry__actions">
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        disabled={handle.isPending}
                        onClick={() => handle.mutate(consulta.id, {
                          onSuccess: () => toast.success('Consulta atendida y contacto creado'),
                        })}
                      >
                        Atender y crear contacto
                      </button>
                      {consulta.propiedad ? (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setAgendando(consulta)}
                        >
                          Agendar visita
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => discard.mutate(consulta.id)}
                      >
                        Descartar
                      </button>
                    </footer>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <Pagination meta={data.meta} onPageChange={(page) => setFiltros({ ...filtros, page })} />
        </>
      ) : null}
      {agendando ? (
        <ScheduleVisitModal
          propiedad={{
            id: agendando.propiedadId,
            codigo: agendando.propiedad?.codigo,
            titulo: agendando.propiedad?.titulo,
            nombrePublico: agendando.propiedad?.titulo,
          }}
          consulta={agendando}
          onClose={() => setAgendando(null)}
        />
      ) : null}
    </section>
  );
}
