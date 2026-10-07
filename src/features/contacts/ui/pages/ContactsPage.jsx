import { useState } from 'react';
import { Badge } from '@shared/ui/Badge.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { EmptyState } from '@shared/ui/EmptyState.jsx';
import { Pagination } from '@shared/ui/Pagination.jsx';
import { formatDate } from '@shared/lib/format.js';
import { exportToCsv } from '@shared/lib/exportCsv.js';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useAuth } from '@features/auth';
import { useContactMutations, useContacts } from '../../application/useContactsQueries.js';
import {
  CONTACT_TYPE_LABELS, CONTACT_TYPE_TONES,
  STAGE_LABELS, STAGE_TONES,
  estaSeguimientoVencido,
} from '../../domain/contact.js';
import { ContactFormModal } from '../components/ContactFormModal.jsx';
import { ContactDetailModal } from '../components/ContactDetailModal.jsx';
import { ContactPipelineView } from '../components/ContactPipelineView.jsx';
import { FollowUpQueueWidget } from '../components/FollowUpQueueWidget.jsx';
import { ReassignAdvisorModal } from '@app/components/ReassignAdvisorModal.jsx';

export function ContactsPage() {
  const toast = useToast();
  const { usuario } = useAuth();
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'embudo'
  const [filtros, setFiltros] = useState({ page: 1, q: '', tipo: '', etapa: '' });
  const [asignacionFiltro, setAsignacionFiltro] = useState('todos'); // 'todos' | 'mis_contactos'
  const [detalleId, setDetalleId] = useState(null);
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [reasignando, setReasignando] = useState(null);
  const q = useDebouncedValue(filtros.q, 300);

  const { data, isLoading, error, refetch } = useContacts({
    ...filtros,
    asesorId: asignacionFiltro === 'mis_contactos' ? usuario?.id : undefined,
    q: q || undefined,
    tipo: filtros.tipo || undefined,
    etapa: filtros.etapa || undefined,
    pageSize: vista === 'embudo' ? 100 : 20,
  });

  const { deactivate } = useContactMutations({ onError: (e) => toast.error(e.displayMessage) });

  const handleExportarCsv = () => {
    const items = data?.items ?? [];
    if (!items.length) {
      toast.error('No hay contactos para exportar');
      return;
    }

    const columnas = [
      { header: 'Nombre', key: 'nombre' },
      { header: 'Tipo', key: 'tipo', format: (v) => CONTACT_TYPE_LABELS[v] || v },
      { header: 'Etapa CRM', key: 'etapa', format: (v) => STAGE_LABELS[v] || v },
      { header: 'Teléfono', key: 'telefono', format: (v) => v || '' },
      { header: 'Email', key: 'email', format: (v) => v || '' },
      { header: 'Asesor Asignado', format: (_, r) => r.asesor?.nombre || '' },
      { header: 'Presupuesto Mín', key: 'presupuestoMin', format: (v) => v || '' },
      { header: 'Presupuesto Máx', key: 'presupuestoMax', format: (v) => v || '' },
      { header: 'Próxima Acción', key: 'proximaAccionAt', format: (v) => (v ? formatDate(v) : '') },
      { header: 'Nota Próxima Acción', key: 'proximaAccionNota', format: (v) => v || '' },
      { header: 'Fecha Registro', key: 'createdAt', format: (v) => (v ? formatDate(v) : '') },
    ];

    exportToCsv('contactos_crm', items, columnas);
    toast.success(`${items.length} contactos exportados a CSV`);
  };

  return (
    <section>
      <header className="page__header">
        <div>
          <h1>CRM de Contactos</h1>
          <p className="page__subtitle">Embudo comercial, seguimiento y clientes de la inmobiliaria</p>
        </div>
        <div className="page__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleExportarCsv}
            disabled={!data?.items?.length}
            title="Exportar base de prospectos a Excel/CSV"
          >
            📥 Exportar CSV
          </button>
          <div className="view-toggle">
            <button
              type="button"
              className={`btn btn--sm ${vista === 'tabla' ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setVista('tabla')}
            >
              📋 Tabla
            </button>
            <button
              type="button"
              className={`btn btn--sm ${vista === 'embudo' ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setVista('embudo')}
            >
              📊 Embudo (Pipeline)
            </button>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setCreando(true)}>
            + Nuevo contacto
          </button>
        </div>
      </header>

      {/* Alerta de seguimientos vencidos y del día */}
      <FollowUpQueueWidget onSelectContact={(c) => setDetalleId(c.id)} />

      {/* Filtro rápido de asignación: Todos vs Mis Prospectos */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`chip ${asignacionFiltro === 'todos' ? 'chip--active' : ''}`}
          onClick={() => {
            setAsignacionFiltro('todos');
            setFiltros((prev) => ({ ...prev, page: 1 }));
          }}
        >
          🌐 Todos los prospectos
        </button>
        <button
          type="button"
          className={`chip ${asignacionFiltro === 'mis_contactos' ? 'chip--active' : ''}`}
          onClick={() => {
            setAsignacionFiltro('mis_contactos');
            setFiltros((prev) => ({ ...prev, page: 1 }));
          }}
        >
          👤 Mis prospectos asignados
        </button>
      </div>

      {/* Barra de filtros */}
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          className="filters__search"
          placeholder="Buscar por nombre, email, teléfono o documento"
          value={filtros.q}
          onChange={(e) => setFiltros({ ...filtros, q: e.target.value, page: 1 })}
        />
        <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value, page: 1 })}>
          <option value="">Todos los tipos</option>
          {Object.entries(CONTACT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={filtros.etapa} onChange={(e) => setFiltros({ ...filtros, etapa: e.target.value, page: 1 })}>
          <option value="">Todas las etapas</option>
          {Object.entries(STAGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </form>

      {isLoading ? <Spinner label="Cargando contactos..." /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          title="Sin contactos"
          description="Cree el primer cliente o propietario para comenzar la gestión comercial."
        />
      ) : null}

      {data && data.items.length > 0 && vista === 'embudo' ? (
        <ContactPipelineView
          contactos={data.items}
          onSelectContact={(c) => setDetalleId(c.id)}
        />
      ) : null}

      {data && data.items.length > 0 && vista === 'tabla' ? (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Etapa</th>
                  <th>Contacto</th>
                  <th>Próxima acción</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((contacto) => {
                  const vencido = estaSeguimientoVencido(contacto);
                  return (
                    <tr key={contacto.id}>
                      <td>
                        <button
                          type="button"
                          className="btn-link font-semibold"
                          onClick={() => setDetalleId(contacto.id)}
                        >
                          {contacto.nombreCompleto}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                          <small className="cell-note">
                            Asesor: {contacto.vista?.asesorNombre || contacto.asesor?.nombre || 'Bolsa común'}
                          </small>
                          <button
                            type="button"
                            className="cell-note"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              fontSize: '11px',
                            }}
                            onClick={() => setReasignando(contacto)}
                            title="Reasignar asesor responsable de este contacto"
                          >
                            🔄 Reasignar
                          </button>
                        </div>
                      </td>
                      <td>
                        <Badge tone={CONTACT_TYPE_TONES[contacto.tipo]}>
                          {CONTACT_TYPE_LABELS[contacto.tipo]}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone={STAGE_TONES[contacto.etapa] ?? 'neutral'}>
                          {STAGE_LABELS[contacto.etapa] ?? contacto.etapa}
                        </Badge>
                      </td>
                      <td>
                        <div className="cell-stack">
                          <span>{contacto.email ?? '—'}</span>
                          <small>{contacto.telefono ?? '—'}</small>
                        </div>
                      </td>
                      <td>
                        {contacto.proximaAccion ? (
                          <div className="cell-stack">
                            <span className={vencido ? 'text-danger font-semibold' : ''}>
                              {vencido ? '⚠️ ' : ''}{contacto.proximaAccion}
                            </span>
                            {contacto.proximaAccionAt ? (
                              <small className="text-muted">{formatDate(contacto.proximaAccionAt)}</small>
                            ) : null}
                          </div>
                        ) : (
                          <small className="text-muted">Sin programar</small>
                        )}
                      </td>
                      <td>
                        <Badge tone={contacto.activo ? 'success' : 'neutral'}>
                          {contacto.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="table__actions">
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => setDetalleId(contacto.id)}
                        >
                          Ficha CRM
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setEditando(contacto)}
                        >
                          Editar
                        </button>
                        {contacto.activo ? (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => deactivate.mutate(contacto.id)}
                          >
                            Dar de baja
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination meta={data.meta} onPageChange={(page) => setFiltros({ ...filtros, page })} />
        </>
      ) : null}

      {/* Modal Ficha Detallada CRM */}
      {detalleId ? (
        <ContactDetailModal
          contactoId={detalleId}
          onClose={() => setDetalleId(null)}
          onEdit={(c) => {
            setDetalleId(null);
            setEditando(c);
          }}
        />
      ) : null}

      {/* Modal Crear / Editar datos básicos */}
      {creando ? (
        <ContactFormModal
          onClose={() => setCreando(false)}
          onSaved={(c) => {
            refetch();
            if (c?.id) setDetalleId(c.id);
          }}
        />
      ) : null}

      {editando ? (
        <ContactFormModal
          contacto={editando}
          onClose={() => setEditando(null)}
          onSaved={() => refetch()}
        />
      ) : null}

      {reasignando ? (
        <ReassignAdvisorModal
          item={reasignando}
          tipo="contacto"
          onClose={() => setReasignando(null)}
          onSuccess={() => refetch()}
        />
      ) : null}
    </section>
  );
}
