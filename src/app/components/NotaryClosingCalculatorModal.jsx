import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { formatMoney } from '@shared/lib/format.js';

export function NotaryClosingCalculatorModal({ isOpen, onClose, initialPrice = 500000000 }) {
  const [precio, setPrecio] = useState(initialPrice);
  const [comisionPct, setComisionPct] = useState(3.0);
  const [aplicaIvaComision, setAplicaIvaComision] = useState(true);

  if (!isOpen) return null;

  const numPrecio = Number(precio) || 0;

  // 1. Derechos Notariales (~3.5 por mil = 0.35%) - 50% Comprador / 50% Vendedor
  const derechosNotarialesTotal = numPrecio * 0.0035;
  const derechosNotarialesMitad = derechosNotarialesTotal / 2;

  // 2. Retención en la Fuente (1.0% para personas naturales en Colombia) - 100% Vendedor
  const reteFuenteVendedor = numPrecio * 0.01;

  // 3. Impuesto de Registro y Beneficencia (~1.67% sobre el valor de venta) - 100% Comprador
  const impuestoRegistroComprador = numPrecio * 0.0167;

  // 4. Copias y certificados notariales promedio
  const copiasNotaria = 180000;
  const copiasMitad = copiasNotaria / 2;

  // 5. Comisión inmobiliaria
  const comisionValor = numPrecio * (comisionPct / 100);
  const ivaComision = aplicaIvaComision ? comisionValor * 0.19 : 0;
  const totalComisionAgencia = comisionValor + ivaComision;

  // Totales
  const totalGastosComprador = derechosNotarialesMitad + impuestoRegistroComprador + copiasMitad;
  const totalGastosVendedor = derechosNotarialesMitad + reteFuenteVendedor + copiasMitad + totalComisionAgencia;
  const netoPropietario = numPrecio - totalGastosVendedor;

  return (
    <Modal
      title="Simulador de Gastos Notariales, Registro & Cierre"
      onClose={onClose}
      footer={<button type="button" className="btn btn--primary" onClick={onClose}>Entendido</button>}
    >
      <div className="notary-calculator" style={{ fontSize: '0.88rem' }}>
        <p style={{ margin: '0 0 1rem', color: 'var(--text-soft)' }}>
          Cálculo legal estimado de escrituración bajo la normativa colombiana (Decreto 960 / Estatuto Tributario).
        </p>

        {/* Inputs de simulación */}
        <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="field">
            <label htmlFor="sim-precio">Valor Comercial del Inmueble (COP)</label>
            <input
              id="sim-precio"
              type="number"
              step="5000000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="sim-comision">Comisión Inmobiliaria (%)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                id="sim-comision"
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={comisionPct}
                onChange={(e) => setComisionPct(Number(e.target.value))}
                style={{ width: '90px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={aplicaIvaComision}
                  onChange={(e) => setAplicaIvaComision(e.target.checked)}
                />
                + IVA (19%)
              </label>
            </div>
          </div>
        </div>

        {/* Desglose comparativo Comprador vs Vendedor */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Columna Comprador */}
          <div style={{ background: 'var(--surface-muted)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🛒</span> A cargo del Comprador
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.8 }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Derechos Notariales (50%):</span>
                <strong>{formatMoney(derechosNotarialesMitad, 'COP')}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Impuesto Registro (1.67%):</span>
                <strong>{formatMoney(impuestoRegistroComprador, 'COP')}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Copias y papelería (50%):</span>
                <strong>{formatMoney(copiasMitad, 'COP')}</strong>
              </li>
              <li style={{ borderTop: '1px dashed var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--text)' }}>
                <span>Total Comprador:</span>
                <strong style={{ color: 'var(--accent)' }}>{formatMoney(totalGastosComprador, 'COP')}</strong>
              </li>
            </ul>
          </div>

          {/* Columna Vendedor */}
          <div style={{ background: 'var(--surface-muted)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🏡</span> A cargo del Vendedor
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.8 }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Derechos Notariales (50%):</span>
                <strong>{formatMoney(derechosNotarialesMitad, 'COP')}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Retención en la fuente (1%):</span>
                <strong>{formatMoney(reteFuenteVendedor, 'COP')}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Copias y papelería (50%):</span>
                <strong>{formatMoney(copiasMitad, 'COP')}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', color: '#b45309' }}>
                <span>Comisión Agencia ({comisionPct}%{aplicaIvaComision ? ' + IVA' : ''}):</span>
                <strong>{formatMoney(totalComisionAgencia, 'COP')}</strong>
              </li>
              <li style={{ borderTop: '1px dashed var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                <span>Total Deducciones:</span>
                <strong style={{ color: '#b91c1c' }}>-{formatMoney(totalGastosVendedor, 'COP')}</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Resumen Final de Cierre */}
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#166534' }}>
              Neto Estimado a Recibir por el Propietario
            </span>
            <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#14532d', letterSpacing: '-0.02em' }}>
              {formatMoney(netoPropietario, 'COP')}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#166534' }}>
              Honorarios Inmobiliaria
            </span>
            <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#15803d' }}>
              {formatMoney(totalComisionAgencia, 'COP')}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
