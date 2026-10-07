import { useState } from 'react';
import { calculateSettlement, DEFAULT_COMMISSION_PERCENT } from '../../domain/lease.js';
import { formatMoney } from '@shared/lib/format.js';

/**
 * Modal de Liquidación Mensual al Propietario.
 * Incluye simulador/calculadora en vivo y vista de extracto contable oficial listo para imprimir.
 */
export function LeaseSettlementModal({ contrato, onClose, onSettled }) {
  const [periodo, setPeriodo] = useState('Septiembre 2026');
  const [canon, setCanon] = useState(contrato.canon || 0);
  const [comisionPct, setComisionPct] = useState(contrato.comisionPorcentaje || DEFAULT_COMMISSION_PERCENT);
  const [aplicaIva, setAplicaIva] = useState(contrato.aplicaIva ?? true);
  const [vistaExtracto, setVistaExtracto] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const [deducciones, setDeducciones] = useState([
    ...(contrato.administracionPH
      ? [{ id: 'ded-1', concepto: 'Cuota de Administración PH', monto: contrato.administracionPH }]
      : []),
    { id: 'ded-2', concepto: 'GMF 4x1000 transferencia bancaria', monto: Math.round((contrato.canon || 0) * 0.004) },
  ]);

  const calculos = calculateSettlement({
    canon,
    comisionPct,
    aplicaIva,
    deducciones,
  });

  const agregarDeduccion = () => {
    setDeducciones((prev) => [
      ...prev,
      { id: `ded-${Date.now()}`, concepto: 'Mantenimiento o concepto autorizado', monto: 0 },
    ]);
  };

  const actualizarDeduccion = (id, campo, valor) => {
    setDeducciones((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [campo]: campo === 'monto' ? Number(valor) || 0 : valor } : d))
    );
  };

  const eliminarDeduccion = (id) => {
    setDeducciones((prev) => prev.filter((d) => d.id !== id));
  };

  const handleConfirmarLiquidacion = () => {
    const liquidacionData = {
      periodo,
      fechaPago: new Date().toISOString().split('T')[0],
      canonCobrado: calculos.canon,
      comisionPorcentaje: calculos.comisionPct,
      comisionAgencia: calculos.comisionVal,
      ivaComision: calculos.ivaVal,
      totalHonorarios: calculos.honorarioTotalAgencia,
      deducciones: deducciones.map((d) => ({ concepto: d.concepto, monto: d.monto })),
      totalDeducciones: calculos.totalDeducciones,
      netoGirado: calculos.netoGirar,
      estadoPago: 'consignado',
    };

    onSettled(contrato.id, liquidacionData);
    setGuardado(true);
    setVistaExtracto(true);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content modal-content--wide"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: vistaExtracto ? '750px' : '680px' }}
      >
        {/* Cabecera del modal */}
        <div className="modal-header">
          <div>
            <span className="modal-header__kicker">Gestión de Arrendamientos</span>
            <h3 className="modal-header__title">
              {vistaExtracto ? 'Extracto Mensual de Liquidación' : 'Liquidar Canon al Propietario'}
            </h3>
            <p className="modal-header__subtitle">
              Contrato <strong>{contrato.codigo}</strong> · {contrato.propiedadTitulo}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {/* MODO EXTRACTO / RECIBO FORMAL PARA IMPRESIÓN */}
        {vistaExtracto ? (
          <div className="extracto-container printable-document">
            <div className="extracto-header">
              <div className="extracto-logo-area">
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>INMOBILIARIA S.A.S.</h2>
                <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#6b7280' }}>
                  NIT: 900.542.819-1 · Matrícula Inmobiliaria No. 2024-BOG
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                  Departamento de Tesorería y Administración
                </p>
              </div>
              <div className="extracto-doc-meta" style={{ textAlign: 'right' }}>
                <span className="extracto-badge">EXTRACTO DE GIRO</span>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', fontWeight: 700 }}>
                  No. EXT-{contrato.codigo.replace('CON-', '')}-{periodo.replace(' ', '-')}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                  Fecha de expedición: {new Date().toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>

            <hr className="extracto-divider" />

            {/* Datos de las partes */}
            <div className="extracto-grid">
              <div className="extracto-box">
                <span className="extracto-box__label">PROPIETARIO / BENEFICIARIO</span>
                <p className="extracto-box__val"><strong>{contrato.propietarioNombre}</strong></p>
                <p className="extracto-box__sub">{contrato.propietarioDoc}</p>
                <p className="extracto-box__sub">Giro: {contrato.propietarioBanco}</p>
              </div>
              <div className="extracto-box">
                <span className="extracto-box__label">INMUEBLE ARRENDADO</span>
                <p className="extracto-box__val"><strong>{contrato.propiedadTitulo}</strong></p>
                <p className="extracto-box__sub">{contrato.direccion} - {contrato.ciudad}</p>
                <p className="extracto-box__sub">Inquilino: {contrato.arrendatarioNombre}</p>
              </div>
            </div>

            <div style={{ margin: '1rem 0 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-soft)' }}>
                Período Liquidado: <strong style={{ color: 'var(--text)' }}>{periodo}</strong>
              </span>
              <span className="badge badge--success">PAGO APLICADO</span>
            </div>

            {/* Tabla de liquidación */}
            <table className="extracto-table">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th style={{ textAlign: 'right' }}>Devengado (+)</th>
                  <th style={{ textAlign: 'right' }}>Deducción (-)</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Canon de Arrendamiento Recibido</strong>
                    <br /><small style={{ color: '#6b7280' }}>Pago mensual según contrato</small>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                    +{formatMoney(calculos.canon)}
                  </td>
                  <td style={{ textAlign: 'right' }}>—</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney(calculos.canon)}</td>
                </tr>
                <tr>
                  <td>
                    Comisión de Administración ({calculos.comisionPct}%)
                    <br /><small style={{ color: '#6b7280' }}>Honorario por gestión y corretaje</small>
                  </td>
                  <td style={{ textAlign: 'right' }}>—</td>
                  <td style={{ textAlign: 'right', color: '#dc2626' }}>
                    -{formatMoney(calculos.comisionVal)}
                  </td>
                  <td style={{ textAlign: 'right' }}>-{formatMoney(calculos.comisionVal)}</td>
                </tr>
                {calculos.aplicaIva && (
                  <tr>
                    <td>
                      IVA sobre honorario ({calculos.ivaPct}%)
                      <br /><small style={{ color: '#6b7280' }}>Impuesto al valor agregado legal</small>
                    </td>
                    <td style={{ textAlign: 'right' }}>—</td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>
                      -{formatMoney(calculos.ivaVal)}
                    </td>
                    <td style={{ textAlign: 'right' }}>-{formatMoney(calculos.ivaVal)}</td>
                  </tr>
                )}
                {deducciones.map((d) => (
                  <tr key={d.id}>
                    <td>{d.concepto}</td>
                    <td style={{ textAlign: 'right' }}>—</td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>
                      -{formatMoney(d.monto)}
                    </td>
                    <td style={{ textAlign: 'right' }}>-{formatMoney(d.monto)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="extracto-total-row">
                  <td colSpan="3">
                    <strong>TOTAL NETO GIRADO A SU CUENTA:</strong>
                    <br />
                    <small style={{ fontWeight: 400, color: '#4b5563' }}>
                      Transferido a: {contrato.propietarioBanco}
                    </small>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                    {formatMoney(calculos.netoGirar)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Firmas de conformidad */}
            <div className="extracto-firmas">
              <div className="extracto-firma-col">
                <div className="extracto-linea-firma" />
                <p><strong>Departamento de Tesorería</strong></p>
                <small>Inmobiliaria S.A.S.</small>
              </div>
              <div className="extracto-firma-col">
                <div className="extracto-linea-firma" />
                <p><strong>{contrato.propietarioNombre}</strong></p>
                <small>Firma Propietario / Representante</small>
              </div>
            </div>

            <div className="modal-actions noprint" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setVistaExtracto(false)}
              >
                ← Modificar valores
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleImprimir}
              >
                🖨️ Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        ) : (
          /* MODO CALCULADORA / FORMULARIO */
          <div className="settlement-form">
            <div className="settlement-grid-2">
              <div className="form-group">
                <label className="form-label">Mes / Período a Liquidar</label>
                <select
                  className="form-control"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                >
                  <option value="Septiembre 2026">Septiembre 2026</option>
                  <option value="Octubre 2026">Octubre 2026</option>
                  <option value="Noviembre 2026">Noviembre 2026</option>
                  <option value="Diciembre 2026">Diciembre 2026</option>
                  <option value="Agosto 2026">Agosto 2026 (Anterior)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Canon Recibido ($ COP)</label>
                <input
                  type="number"
                  className="form-control"
                  value={canon}
                  onChange={(e) => setCanon(Number(e.target.value) || 0)}
                  step="50000"
                />
              </div>
            </div>

            {/* Comisión e IVA */}
            <div className="settlement-grid-2" style={{ marginTop: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Honorario Inmobiliaria (%)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="form-control"
                    value={comisionPct}
                    onChange={(e) => setComisionPct(Number(e.target.value) || 0)}
                    step="0.5"
                    min="0"
                    max="30"
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>
                    = {formatMoney(calculos.comisionVal)}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">IVA sobre Comisión (19%)</label>
                <div style={{ display: 'flex', alignItems: 'center', height: '38px', gap: '0.75rem' }}>
                  <label className="checkbox-toggle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={aplicaIva}
                      onChange={(e) => setAplicaIva(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.85rem' }}>Aplica IVA legal</span>
                  </label>
                  {aplicaIva && (
                    <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
                      +{formatMoney(calculos.ivaVal)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Deducciones / Descuentos autorizados */}
            <div className="deducciones-section" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="form-label" style={{ margin: 0 }}>
                  Deducciones y Gastos Autorizados
                </span>
                <button
                  type="button"
                  className="btn btn--xs btn--ghost"
                  onClick={agregarDeduccion}
                  style={{ fontSize: '0.75rem' }}
                >
                  + Agregar concepto
                </button>
              </div>

              {deducciones.map((d) => (
                <div key={d.id} className="deduccion-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={d.concepto}
                    onChange={(e) => actualizarDeduccion(d.id, 'concepto', e.target.value)}
                    placeholder="Concepto (ej. Administración PH, Plomería...)"
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    className="form-control"
                    value={d.monto}
                    onChange={(e) => actualizarDeduccion(d.id, 'monto', e.target.value)}
                    placeholder="Valor"
                    style={{ flex: 1 }}
                    step="5000"
                  />
                  <button
                    type="button"
                    className="btn btn--xs btn--danger"
                    onClick={() => eliminarDeduccion(d.id)}
                    title="Eliminar deducción"
                    style={{ padding: '0.4rem 0.6rem' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Desglose resumen en tiempo real */}
            <div className="settlement-summary-card" style={{ marginTop: '1.25rem' }}>
              <div className="settlement-summary-line">
                <span>(+) Canon mensual recibido:</span>
                <strong>{formatMoney(calculos.canon)}</strong>
              </div>
              <div className="settlement-summary-line" style={{ color: '#dc2626' }}>
                <span>(-) Honorarios inmobiliaria ({calculos.comisionPct}% + IVA):</span>
                <span>-{formatMoney(calculos.honorarioTotalAgencia)}</span>
              </div>
              <div className="settlement-summary-line" style={{ color: '#dc2626' }}>
                <span>(-) Deducciones autorizadas (Admon, reparaciones, GMF):</span>
                <span>-{formatMoney(calculos.totalDeducciones)}</span>
              </div>
              <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border)' }} />
              <div className="settlement-summary-line settlement-summary-line--total">
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>NETO A GIRAR AL PROPIETARIO:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                  {formatMoney(calculos.netoGirar)}
                </span>
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                Cuenta destino: <strong>{contrato.propietarioBanco}</strong> ({contrato.propietarioNombre})
              </p>
            </div>

            {/* Botones de acción */}
            <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn--secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setVistaExtracto(true)}
              >
                👁️ Vista Previa Extracto
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleConfirmarLiquidacion}
              >
                ✓ Aplicar y Generar Extracto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
