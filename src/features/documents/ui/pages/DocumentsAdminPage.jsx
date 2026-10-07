import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@shared/ui/Badge.jsx';
import { StatCard } from '@shared/ui/StatCard.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { EmptyState } from '@shared/ui/EmptyState.jsx';
import { formatDate } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useAllDocuments, useDocumentMutations } from '../../application/useDocumentsQueries.js';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_KEYS, VIGENCIA_META } from '../../domain/document.js';
import { AttachDocumentModal } from '../components/AttachDocumentModal.jsx';

const peso = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function DocumentsAdminPage() {
  const toast = useToast();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [tabVigencia, setTabVigencia] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const { data: documentos = [], isLoading, error, refetch } = useAllDocuments();
  const { remove } = useDocumentMutations({
    onError: (err) => toast.error(err.displayMessage || 'Error al eliminar el documento'),
    onSuccess: () => toast.success('Documento eliminado correctamente'),
  });

  // Metricas globales para las tarjetas de semaforo
  const metricas = useMemo(() => {
    let vigentes = 0;
    let porVencer = 0;
    let vencidos = 0;
    let sinVencimiento = 0;

    for (const doc of documentos) {
      if (doc.vigencia === 'vigente') vigentes += 1;
      else if (doc.vigencia === 'por_vencer') porVencer += 1;
      else if (doc.vigencia === 'vencido') vencidos += 1;
      else sinVencimiento += 1;
    }

    return {
      total: documentos.length,
      vigentes,
      porVencer,
      vencidos,
      sinVencimiento,
    };
  }, [documentos]);

  // Filtrado reactivo en memoria
  const documentosFiltrados = useMemo(() => {
    return documentos.filter((doc) => {
      // Filtro por tipo
      if (filtroTipo && doc.tipo !== filtroTipo) return false;

      // Filtro por pestana de vigencia
      if (tabVigencia !== 'todos' && doc.vigencia !== tabVigencia) return false;

      // Busqueda por texto
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincideNombre = doc.nombre?.toLowerCase().includes(q);
        const coincideTipo = doc.tipoLabel?.toLowerCase().includes(q);
        const coincidePropiedad = doc.propiedad?.titulo?.toLowerCase().includes(q)
          || doc.propiedad?.codigo?.toLowerCase().includes(q);
        const coincideUsuario = doc.usuario?.toLowerCase().includes(q);
        const coincideNotas = doc.notas?.toLowerCase().includes(q);

        if (!coincideNombre && !coincideTipo && !coincidePropiedad && !coincideUsuario && !coincideNotas) {
          return false;
        }
      }

      return true;
    });
  }, [documentos, filtroTipo, tabVigencia, busqueda]);

  const handleEliminar = (doc) => {
    const seguro = window.confirm(`¿Está seguro de eliminar permanentemente el documento "${doc.nombre}"?`);
    if (seguro) {
      remove.mutate(doc.id);
    }
  };

  return (
    <section className="documents-admin">
      <header className="page__header">
        <div>
          <h1>Gestión Documental y Legal</h1>
          <p className="page__subtitle">
            Expedientes de respaldo, mandatos de corretaje y semáforo de vigencias
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setModalAbierto(true)}
        >
          + Adjuntar documento
        </button>
      </header>

      {/* Tarjetas de Semáforo Legal */}
      <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        <StatCard
          label="Total Documentos"
          value={metricas.total}
          hint="Expedientes y anexos legales"
        />
        <StatCard
          label="Vigentes"
          value={metricas.vigentes}
          hint="En regla y con vigencia activa"
          tone="success"
        />
        <StatCard
          label="Por Vencer (≤30 días)"
          value={metricas.porVencer}
          hint="Requieren renovación próxima"
          tone="warning"
        />
        <StatCard
          label="Vencidos / Caducados"
          value={metricas.vencidos}
          hint="Trámites y mandatos caducados"
          tone="danger"
        />
      </div>

      {/* Barra de Filtros y Busqueda */}
      <div className="panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Tabs rapidos de vigencia */}
          <div className="status-filter" style={{ margin: 0 }}>
            <button
              type="button"
              className={`chip ${tabVigencia === 'todos' ? 'chip--active' : ''}`}
              onClick={() => setTabVigencia('todos')}
            >
              Todos ({metricas.total})
            </button>
            <button
              type="button"
              className={`chip ${tabVigencia === 'por_vencer' ? 'chip--active' : ''}`}
              onClick={() => setTabVigencia('por_vencer')}
            >
              ⚠️ Por vencer ({metricas.porVencer})
            </button>
            <button
              type="button"
              className={`chip ${tabVigencia === 'vencido' ? 'chip--active' : ''}`}
              onClick={() => setTabVigencia('vencido')}
            >
              🚨 Vencidos ({metricas.vencidos})
            </button>
            <button
              type="button"
              className={`chip ${tabVigencia === 'vigente' ? 'chip--active' : ''}`}
              onClick={() => setTabVigencia('vigente')}
            >
              ✓ Vigentes ({metricas.vigentes})
            </button>
            <button
              type="button"
              className={`chip ${tabVigencia === 'sin_vencimiento' ? 'chip--active' : ''}`}
              onClick={() => setTabVigencia('sin_vencimiento')}
            >
              Permanentes ({metricas.sinVencimiento})
            </button>
          </div>

          {/* Filtros de texto y tipo */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="search"
              placeholder="Buscar por título, código o asesor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ minWidth: '240px', padding: '0.4rem 0.75rem', fontSize: 'var(--text-sm)' }}
            />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', fontSize: 'var(--text-sm)' }}
            >
              <option value="">Todos los tipos</option>
              {DOCUMENT_TYPE_KEYS.map((k) => (
                <option key={k} value={k}>
                  {DOCUMENT_TYPES[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estados de carga / error */}
      {isLoading ? <Spinner label="Cargando expedientes legales..." /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {/* Tabla de Documentos */}
      {!isLoading && !error ? (
        documentosFiltrados.length === 0 ? (
          <EmptyState
            title="No se encontraron documentos"
            description={
              documentos.length === 0
                ? 'Aún no se han adjuntado documentos de respaldo legal en el sistema.'
                : 'Ningún documento coincide con los filtros o la búsqueda actual.'
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Tipo Legal</th>
                  <th>Inmueble / Referencia</th>
                  <th>Semáforo & Vencimiento</th>
                  <th>Subido Por</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentosFiltrados.map((doc) => {
                  const vigenciaMeta = VIGENCIA_META[doc.vigencia] ?? VIGENCIA_META.sin_vencimiento;
                  const esPdf = doc.mime?.includes('pdf') || doc.url?.endsWith('.pdf');

                  return (
                    <tr key={doc.id}>
                      {/* Documento y formato */}
                      <td>
                        <div className="cell-stack">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            title="Abrir documento en nueva pestaña"
                          >
                            <span>{esPdf ? '📄' : '🖼️'}</span>
                            <span>{doc.nombre}</span>
                          </a>
                          <small className="cell-note">
                            {doc.tamanoBytes ? peso(doc.tamanoBytes) : 'Archivo adjunto'}
                            {doc.notas ? ` · "${doc.notas}"` : ''}
                          </small>
                        </div>
                      </td>

                      {/* Tipo Legal */}
                      <td>
                        <Badge>{doc.tipoLabel || doc.tipo}</Badge>
                      </td>

                      {/* Inmueble asociado */}
                      <td>
                        {doc.propiedad ? (
                          <div className="cell-stack">
                            <Link to={`/admin/propiedades/${doc.propiedad.id}`}>
                              <strong>[{doc.propiedad.codigo}]</strong> {doc.propiedad.titulo}
                            </Link>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-faint)' }}>Sin inmueble directo</span>
                        )}
                      </td>

                      {/* Semáforo & Vencimiento */}
                      <td>
                        <div className="cell-stack">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Badge tone={vigenciaMeta.tone}>
                              {doc.vigencia === 'vencido'
                                ? (doc.diasParaVencer !== null
                                    ? `Vencido hace ${Math.abs(doc.diasParaVencer)}d`
                                    : 'Vencido')
                                : doc.vigencia === 'por_vencer'
                                ? `Vence en ${doc.diasParaVencer}d`
                                : vigenciaMeta.label}
                            </Badge>
                          </div>
                          {doc.venceAt ? (
                            <small className="cell-note">Vence: {formatDate(doc.venceAt)}</small>
                          ) : (
                            <small className="cell-note">Vigencia no estipulada</small>
                          )}
                        </div>
                      </td>

                      {/* Subido por & Fecha */}
                      <td>
                        <div className="cell-stack">
                          <span>{doc.usuario || 'Sistema'}</span>
                          <small className="cell-note">{formatDate(doc.createdAt)}</small>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td>
                        <div className="table__actions">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn--ghost btn--sm"
                            title="Descargar o ver documento original"
                          >
                            Ver / Descargar
                          </a>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleEliminar(doc)}
                            disabled={remove.isPending}
                            title="Eliminar documento"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {/* Modal para adjuntar documento legal */}
      {modalAbierto ? (
        <AttachDocumentModal onClose={() => setModalAbierto(false)} />
      ) : null}
    </section>
  );
}
