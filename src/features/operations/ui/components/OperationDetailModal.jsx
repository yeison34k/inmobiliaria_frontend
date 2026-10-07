import { Modal } from '@shared/ui/Modal.jsx';
import { Badge } from '@shared/ui/Badge.jsx';
import { formatDate, formatMoney } from '@shared/lib/format.js';
import { DocumentsPanel } from '@features/documents';
import {
  OPERATION_KIND_LABELS, OPERATION_STATUS_META, OperationStatus,
} from '../../domain/operation.js';

export function OperationDetailModal({ operacion, onClose, onOpenCommission }) {
  if (!operacion) return null;

  return (
    <Modal
      title={`Operación ${operacion.codigo}`}
      onClose={onClose}
      wide
      footer={
        <>
          {operacion.estado === OperationStatus.CERRADA ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onOpenCommission?.(operacion)}
            >
              💰 Gestionar reparto de comisiones
            </button>
          ) : null}
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cerrar
          </button>
        </>
      }
    >
      <div className="operation-detail">
        {/* Encabezado */}
        <header className="panel panel--bordered" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Badge tone={OPERATION_STATUS_META[operacion.estado]?.tone ?? 'neutral'}>
                  {OPERATION_STATUS_META[operacion.estado]?.label ?? operacion.estado}
                </Badge>
                <Badge tone="info">{OPERATION_KIND_LABELS[operacion.tipo] ?? operacion.tipo}</Badge>
              </div>
              <h3 style={{ margin: '0.5rem 0 0.25rem' }}>{operacion.propiedad?.titulo ?? 'Propiedad'}</h3>
              <p className="text-muted" style={{ margin: 0 }}>Código: {operacion.propiedad?.codigo}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <small className="text-muted">Monto operación</small>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>
                {formatMoney(operacion.precioCierre || operacion.precioLista)}
              </h3>
              {operacion.comisionValor ? (
                <small className="text-muted">Comisión: {formatMoney(operacion.comisionValor)}</small>
              ) : null}
            </div>
          </div>
        </header>

        {/* Ficha técnica de la operación */}
        <div className="contact-detail__info-grid" style={{ marginBottom: '1.5rem' }}>
          <div>
            <small>Cliente</small>
            <p>{operacion.cliente?.nombre ?? '—'}</p>
          </div>
          <div>
            <small>Propietario</small>
            <p>{operacion.propietario?.nombre ?? '—'}</p>
          </div>
          <div>
            <small>Fecha reserva</small>
            <p>{formatDate(operacion.fechaReserva)}</p>
          </div>
          <div>
            <small>Fecha cierre</small>
            <p>{operacion.fechaCierre ? formatDate(operacion.fechaCierre) : 'En curso'}</p>
          </div>
        </div>

        {/* Documentos vinculados a esta operación */}
        <DocumentsPanel
          operacionId={operacion.id}
          titulo="Documentos de la operación (Promesas, escrituras, comprobantes)"
        />
      </div>
    </Modal>
  );
}
