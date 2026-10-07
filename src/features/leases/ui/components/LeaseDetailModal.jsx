import { formatMoney } from '@shared/lib/format.js';
import { LEASE_STATUS_META } from '../../domain/lease.js';

/**
 * Modal de Detalle de Contrato de Arrendamiento.
 * Muestra condiciones contractuales, fianza/póliza, codeudores e historial de liquidaciones.
 */
export function LeaseDetailModal({ contrato, onClose, onOpenSettlement }) {
  const meta = LEASE_STATUS_META[contrato.estado] || LEASE_STATUS_META.activo;
  const liquidaciones = contrato.liquidaciones || [];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content--wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="modal-header__kicker">Contrato {contrato.codigo}</span>
              <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>
            </div>
            <h3 className="modal-header__title">{contrato.propiedadTitulo}</h3>
            <p className="modal-header__subtitle">
              {contrato.direccion} · {contrato.ciudad}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="lease-detail-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tarjetas de Partes del Contrato */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                👤 Arrendatario (Inquilino)
              </span>
              <h4 style={{ margin: '0.3rem 0 0.2rem', fontSize: '1rem' }}>{contrato.arrendatarioNombre}</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-soft)' }}>{contrato.arrendatarioDoc}</p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.82rem' }}>📞 {contrato.arrendatarioTelefono}</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-soft)' }}>✉️ {contrato.arrendatarioEmail}</p>
              {contrato.codeudor && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-faint)', borderTop: '1px dashed var(--border)', paddingTop: '0.35rem' }}>
                  <strong>Codeudor:</strong> {contrato.codeudor}
                </p>
              )}
            </div>

            <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                🏠 Propietario (Beneficiario)
              </span>
              <h4 style={{ margin: '0.3rem 0 0.2rem', fontSize: '1rem' }}>{contrato.propietarioNombre}</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-soft)' }}>{contrato.propietarioDoc}</p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                Cuenta Bancaria de Giro:
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-soft)' }}>{contrato.propietarioBanco}</p>
            </div>
          </div>

          {/* Condiciones Económicas y Póliza */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--surface)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase', display: 'block' }}>Canon Mensual</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>{formatMoney(contrato.canon)}</strong>
            </div>
            <div style={{ background: 'var(--surface)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase', display: 'block' }}>Comisión Agencia</span>
              <strong style={{ fontSize: '1.05rem', color: '#059669' }}>{contrato.comisionPorcentaje}% + IVA</strong>
            </div>
            <div style={{ background: 'var(--surface)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase', display: 'block' }}>Admon Copropiedad</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>{formatMoney(contrato.administracionPH || 0)}</strong>
            </div>
            <div style={{ background: 'var(--surface)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)', textTransform: 'uppercase', display: 'block' }}>Vigencia Contrato</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{contrato.duracionMeses} meses</strong>
            </div>
          </div>

          {/* Fianza / Póliza de Arrendamiento */}
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                🛡️ Póliza de Fianza Colectiva
              </span>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.88rem', fontWeight: 600 }}>
                {contrato.aseguradora} · No. {contrato.polizaNumero}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Vencimiento Póliza:</span>
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: contrato.estado === 'por_vencer' ? '#d97706' : '#059669' }}>
                {contrato.polizaVence} {contrato.estado === 'por_vencer' && '⚠️ (Renovar pronto)'}
              </p>
            </div>
          </div>

          {/* Historial de Liquidaciones del Contrato */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>
                Extractos y Liquidaciones Registradas ({liquidaciones.length})
              </h4>
              <button
                type="button"
                className="btn btn--xs btn--primary"
                onClick={() => onOpenSettlement(contrato)}
              >
                + Liquidar Nuevo Mes
              </button>
            </div>

            {liquidaciones.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', fontStyle: 'italic', margin: '0.5rem 0' }}>
                Aún no hay liquidaciones registradas para este contrato.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tabla" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Fecha</th>
                      <th>Canon</th>
                      <th>Honorario Inmob.</th>
                      <th>Deducciones</th>
                      <th>Neto Girado</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liquidaciones.map((liq) => (
                      <tr key={liq.id}>
                        <td><strong>{liq.periodo}</strong></td>
                        <td>{liq.fechaPago}</td>
                        <td>{formatMoney(liq.canonCobrado)}</td>
                        <td style={{ color: '#dc2626' }}>-{formatMoney(liq.totalHonorarios)}</td>
                        <td style={{ color: '#dc2626' }}>-{formatMoney(liq.totalDeducciones)}</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>{formatMoney(liq.netoGirado)}</td>
                        <td><span className="badge badge--success">{liq.estadoPago}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cerrar
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onOpenSettlement(contrato)}
          >
            💰 Liquidar Canon de este Contrato
          </button>
        </div>
      </div>
    </div>
  );
}
