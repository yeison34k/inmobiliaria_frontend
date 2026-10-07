import { Modal } from '@shared/ui/Modal.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { usePayoutReport } from '../../application/useOperationsQueries.js';

export function PayoutReportModal({ onClose }) {
  const { data, isLoading, error, refetch } = usePayoutReport();

  return (
    <Modal title="Liquidación de Honorarios y Comisiones" onClose={onClose} wide>
      {isLoading ? <Spinner label="Calculando liquidación consolidada..." /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {data ? (
        <div className="payout-report">
          {/* Tarjetas resumen */}
          <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <span className="stat-card__label">Comisiones liquidadas</span>
              <strong className="stat-card__value">{formatMoney(data.totales?.comisionTotal ?? 0)}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Pagado / Cobrado</span>
              <strong className="stat-card__value" style={{ color: 'var(--success, #16a34a)' }}>
                {formatMoney(data.totales?.pagado ?? 0)}
              </strong>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Pendiente por pagar</span>
              <strong className="stat-card__value" style={{ color: '#d97706' }}>
                {formatMoney(data.totales?.pendiente ?? 0)}
              </strong>
            </div>
          </div>

          {/* Tabla de liquidación por beneficiario / asesor */}
          <h4>Desglose por Asesor y Beneficiario</h4>
          <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Beneficiario</th>
                  <th>Operaciones</th>
                  <th>Total Liquidado</th>
                  <th>Pagado</th>
                  <th>Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {(data.items ?? data.asesores ?? []).map((row, idx) => (
                  <tr key={row.usuarioId || row.nombre || idx}>
                    <td>
                      <strong>{row.nombre || 'Agencia'}</strong>
                      {row.rol ? <small className="cell-note">{row.rol}</small> : null}
                    </td>
                    <td>{row.operacionesCount ?? row.operaciones ?? 1}</td>
                    <td>{formatMoney(row.total ?? row.montoTotal ?? 0)}</td>
                    <td style={{ color: 'var(--success, #16a34a)' }}>{formatMoney(row.pagado ?? 0)}</td>
                    <td style={{ color: row.pendiente > 0 ? '#d97706' : 'inherit' }}>
                      {formatMoney(row.pendiente ?? 0)}
                    </td>
                  </tr>
                ))}
                {(!data.items && !data.asesores?.length) ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem' }}>
                      No hay comisiones liquidadas en el período.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
