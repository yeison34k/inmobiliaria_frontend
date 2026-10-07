import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { EmptyState } from '@shared/ui/EmptyState.jsx';
import { Pagination } from '@shared/ui/Pagination.jsx';
import { formatDate, formatMoney } from '@shared/lib/format.js';
import { exportToCsv } from '@shared/lib/exportCsv.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue.js';
import { useOperations } from '../../application/useOperationsQueries.js';
import { OPERATION_KIND_LABELS, OPERATION_STATUS_META, OperationStatus } from '../../domain/operation.js';
import { OperationStatusBadge } from '../components/OperationStatusBadge.jsx';
import { CloseOperationModal } from '../components/CloseOperationModal.jsx';
import { CancelOperationModal } from '../components/CancelOperationModal.jsx';
import { CommissionSplitModal } from '../components/CommissionSplitModal.jsx';
import { PayoutReportModal } from '../components/PayoutReportModal.jsx';
import { OperationDetailModal } from '../components/OperationDetailModal.jsx';

/** Historial de operaciones: reservas activas, cierres y caidas. */
export function OperationsPage() {
  const toast = useToast();
  const [filtros, setFiltros] = useState({ page: 1, q: '', estado: '', tipo: '' });
  const [cerrando, setCerrando] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [comisionOp, setComisionOp] = useState(null);
  const [detalleOp, setDetalleOp] = useState(null);
  const [verLiquidacion, setVerLiquidacion] = useState(false);
  const q = useDebouncedValue(filtros.q, 300);

  const { data, isLoading, error, refetch } = useOperations({
    ...filtros,
    q: q || undefined,
    estado: filtros.estado || undefined,
    tipo: filtros.tipo || undefined,
    pageSize: 20,
  });

  const handleExportarCsv = () => {
    const items = data?.items ?? [];
    if (!items.length) {
      toast.error('No hay operaciones para exportar');
      return;
    }

    const columnas = [
      { header: 'Código', key: 'codigo' },
      {
        header: 'Inmueble',
        format: (_, r) => (r.propiedad ? `[${r.propiedad.codigo}] ${r.propiedad.titulo}` : ''),
      },
      { header: 'Tipo', key: 'tipo', format: (v) => OPERATION_KIND_LABELS[v] || v },
      { header: 'Estado', key: 'estado', format: (v) => OPERATION_STATUS_META[v]?.label || v },
      { header: 'Cliente / Comprador', format: (_, r) => r.cliente?.nombre || '' },
      { header: 'Propietario', format: (_, r) => r.propietario?.nombre || '' },
      { header: 'Asesor', format: (_, r) => r.agente?.nombre || '' },
      { header: 'Seña / Reserva', key: 'montoSenia', format: (v) => (v ? formatMoney(v) : '') },
      { header: 'Precio Cierre', key: 'precioCierre', format: (v) => (v ? formatMoney(v) : '') },
      { header: 'Comisión %', key: 'comisionPorcentaje', format: (v) => (v ? `${v}%` : '') },
      { header: 'Comisión Valor', key: 'comisionValor', format: (v) => (v ? formatMoney(v) : '') },
      { header: 'Fecha Creación', key: 'createdAt', format: (v) => (v ? formatDate(v) : '') },
      { header: 'Fecha Cierre', key: 'fechaCierre', format: (v) => (v ? formatDate(v) : '') },
    ];

    exportToCsv('reporte_operaciones', items, columnas);
    toast.success(`${items.length} operaciones exportadas a CSV`);
  };

  return (
    <section>
      <header className="page__header">
        <div>
          <h1>Operaciones</h1>
          <p className="page__subtitle">Reservas, cierres, caídas y liquidación de comisiones</p>
        </div>
        <div className="page__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleExportarCsv}
            disabled={!data?.items?.length}
            title="Exportar reporte de cierres y comisiones a Excel/CSV"
          >
            📥 Exportar CSV
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setVerLiquidacion(true)}
          >
            📊 Liquidación de honorarios
          </button>
        </div>
      </header>

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          className="filters__search"
          placeholder="Buscar por código, propiedad o cliente"
          value={filtros.q}
          onChange={(e) => setFiltros({ ...filtros, q: e.target.value, page: 1 })}
        />
        <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value, page: 1 })}>
          <option value="">Todos los estados</option>
          {Object.entries(OPERATION_STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </select>
        <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value, page: 1 })}>
          <option value="">Venta y arriendo</option>
          <option value="venta">Venta</option>
          <option value="arriendo">Arriendo</option>
        </select>
      </form>

      {isLoading ? <Spinner label="Cargando operaciones..." /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          title="Sin operaciones registradas"
          description="Las reservas y cierres aparecen aquí con su historial completo."
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Propiedad</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Montos</th>
                  <th>Fechas</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((operacion) => (
                  <tr key={operacion.id}>
                    <td>
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setDetalleOp(operacion)}
                      >
                        <code>{operacion.codigo}</code>
                      </button>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <Link to={`/admin/propiedades/${operacion.propiedadId}`}>
                          {operacion.propiedad?.titulo ?? '—'}
                        </Link>
                        <small>{operacion.propiedad?.codigo}</small>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <span>{operacion.cliente?.nombre ?? '—'}</span>
                        <small>{operacion.cliente?.telefono ?? operacion.cliente?.email ?? ''}</small>
                      </div>
                    </td>
                    <td>{OPERATION_KIND_LABELS[operacion.tipo]}</td>
                    <td>
                      <OperationStatusBadge estado={operacion.estado} />
                      {operacion.motivoCaida ? <small className="cell-note">{operacion.motivoCaida}</small> : null}
                    </td>
                    <td>
                      <div className="cell-stack">
                        {operacion.precioCierre ? (
                          <span>Cierre: {formatMoney(operacion.precioCierre)}</span>
                        ) : (
                          <span>Lista: {formatMoney(operacion.precioLista)}</span>
                        )}
                        {operacion.montoSenia ? <small>Seña: {formatMoney(operacion.montoSenia)}</small> : null}
                        {operacion.comisionValor ? (
                          <small style={{ color: 'var(--primary)' }}>
                            Comisión: {formatMoney(operacion.comisionValor)}
                          </small>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        <small>Reserva: {formatDate(operacion.fechaReserva)}</small>
                        {operacion.fechaCierre ? <small>Cierre: {formatDate(operacion.fechaCierre)}</small> : null}
                        {operacion.fechaCaida ? <small>Caída: {formatDate(operacion.fechaCaida)}</small> : null}
                      </div>
                    </td>
                    <td className="table__actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setDetalleOp(operacion)}
                        title="Ver detalle y documentos"
                      >
                        Ficha / Docs
                      </button>

                      {operacion.estado === OperationStatus.RESERVADA ? (
                        <>
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => setCerrando(operacion)}
                          >
                            Cerrar
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setCancelando(operacion)}
                          >
                            Caída
                          </button>
                        </>
                      ) : null}

                      {operacion.estado === OperationStatus.CERRADA ? (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => setComisionOp(operacion)}
                          title="Gestionar reparto de comisiones"
                        >
                          💰 Comisiones
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={data.meta} onPageChange={(page) => setFiltros({ ...filtros, page })} />
        </>
      ) : null}

      {/* Modales */}
      {cerrando ? (
        <CloseOperationModal
          operacion={cerrando}
          onClose={() => setCerrando(null)}
          onClosed={(closed) => {
            setCerrando(null);
            refetch();
            if (closed) setComisionOp(closed);
          }}
        />
      ) : null}

      {cancelando ? (
        <CancelOperationModal
          operacion={cancelando}
          onClose={() => setCancelando(null)}
        />
      ) : null}

      {comisionOp ? (
        <CommissionSplitModal
          operacion={comisionOp}
          onClose={() => {
            setComisionOp(null);
            refetch();
          }}
        />
      ) : null}

      {verLiquidacion ? (
        <PayoutReportModal onClose={() => setVerLiquidacion(false)} />
      ) : null}

      {detalleOp ? (
        <OperationDetailModal
          operacion={detalleOp}
          onClose={() => setDetalleOp(null)}
          onOpenCommission={(op) => {
            setDetalleOp(null);
            setComisionOp(op);
          }}
        />
      ) : null}
    </section>
  );
}
