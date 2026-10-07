import { useMemo, useState } from 'react';
import { useLeases } from '../../application/useLeases.js';
import { LEASE_STATUSES, LEASE_STATUS_META } from '../../domain/lease.js';
import { formatMoney } from '@shared/lib/format.js';
import { LeaseSettlementModal } from '../components/LeaseSettlementModal.jsx';
import { LeaseDetailModal } from '../components/LeaseDetailModal.jsx';
import { NewLeaseModal } from '../components/NewLeaseModal.jsx';

/**
 * Panel de Administración de Contratos de Arrendamiento y Liquidación Mensual a Propietarios.
 * Módulo core para la gestión inmobiliaria recurrente.
 */
export function LeasesAdminPage() {
  const {
    contratos,
    totalCanones,
    totalHonorariosEstimados,
    totalActivos,
    totalPorVencer,
    registrarLiquidacion,
    agregarContrato,
  } = useLeases();

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [contratoParaLiquidar, setContratoParaLiquidar] = useState(null);
  const [contratoDetalle, setContratoDetalle] = useState(null);
  const [mostrarNuevoModal, setMostrarNuevoModal] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  // Filtrado reactivo
  const contratosFiltrados = useMemo(() => {
    return contratos.filter((c) => {
      if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const coincide =
          c.codigo.toLowerCase().includes(q) ||
          c.propiedadTitulo.toLowerCase().includes(q) ||
          c.arrendatarioNombre.toLowerCase().includes(q) ||
          c.propietarioNombre.toLowerCase().includes(q) ||
          c.ciudad.toLowerCase().includes(q) ||
          c.aseguradora.toLowerCase().includes(q);
        if (!coincide) return false;
      }
      return true;
    });
  }, [contratos, filtroEstado, busqueda]);

  const handleSettled = (contratoId, liquidacionData) => {
    const liq = registrarLiquidacion(contratoId, liquidacionData);
    setNotificacion(`Liquidación registrada con éxito para el período ${liquidacionData.periodo}.`);
    setTimeout(() => setNotificacion(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Codigo',
      'Propiedad',
      'Ciudad',
      'Arrendatario',
      'Doc Arrendatario',
      'Telefono Arrendatario',
      'Propietario',
      'Cuenta Banco Giro',
      'Canon Mensual',
      'Honorario Pct',
      'Aseguradora',
      'No Poliza',
      'Vencimiento Poliza',
      'Estado',
    ];

    const rows = contratosFiltrados.map((c) => [
      `"${c.codigo}"`,
      `"${c.propiedadTitulo.replace(/"/g, '""')}"`,
      `"${c.ciudad}"`,
      `"${c.arrendatarioNombre}"`,
      `"${c.arrendatarioDoc}"`,
      `"${c.arrendatarioTelefono}"`,
      `"${c.propietarioNombre}"`,
      `"${c.propietarioBanco}"`,
      c.canon,
      c.comisionPorcentaje,
      `"${c.aseguradora}"`,
      `"${c.polizaNumero}"`,
      `"${c.polizaVence}"`,
      `"${c.estado}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Contratos_Arrendamiento_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-page">
      {/* Portada */}
      <header className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Gestión de Arrendamientos & Liquidaciones</h1>
          <p className="admin-page__subtitle">
            Administración de canones, control de pólizas colectivas y liquidación mensual a propietarios.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="button" className="btn btn--secondary" onClick={handleExportCSV}>
            📥 Exportar CSV
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setMostrarNuevoModal(true)}
          >
            + Nuevo Contrato
          </button>
        </div>
      </header>

      {/* Alerta de notificación flotante */}
      {notificacion && (
        <div className="alerta alerta--success" style={{ marginBottom: '1.25rem' }}>
          ✓ {notificacion}
        </div>
      )}

      {/* Tarjetas KPI ejecutivas */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <span className="kpi-card__label">Cánones Bajo Administración</span>
          <p className="kpi-card__val" style={{ color: 'var(--text)' }}>
            {formatMoney(totalCanones)}
            <small style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-faint)' }}> /mes</small>
          </p>
          <span className="kpi-card__hint">Total cartera mensual activa</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-card__label">Honorarios Agencia Recurrentes</span>
          <p className="kpi-card__val" style={{ color: '#059669' }}>
            {formatMoney(totalHonorariosEstimados)}
            <small style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-faint)' }}> /mes</small>
          </p>
          <span className="kpi-card__hint">Ingreso estimado por corretaje</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-card__label">Contratos Vigentes</span>
          <p className="kpi-card__val" style={{ color: '#2563eb' }}>
            {totalActivos}
          </p>
          <span className="kpi-card__hint">Inmuebles habitados y al día</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-card__label">Pólizas por Vencer (&lt; 60 d)</span>
          <p className="kpi-card__val" style={{ color: totalPorVencer > 0 ? '#d97706' : 'var(--text)' }}>
            {totalPorVencer}
          </p>
          <span className="kpi-card__hint">Requiere gestión de renovación</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="tabla-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="buscador__campo" style={{ width: '300px' }}>
            <span className="buscador__icono">🔍</span>
            <input
              type="text"
              placeholder="Buscar por inquilino, propietario, código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Filtros de estado */}
          <div className="filtros-chips" style={{ display: 'inline-flex', gap: '0.3rem' }}>
            {[
              { id: 'todos', label: 'Todos' },
              { id: LEASE_STATUSES.ACTIVO, label: 'Vigentes' },
              { id: LEASE_STATUSES.POR_VENCER, label: 'Por Vencer' },
              { id: LEASE_STATUSES.EN_MORA, label: 'En Mora' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip ${filtroEstado === f.id ? 'chip--active' : ''}`}
                onClick={() => setFiltroEstado(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
          {contratosFiltrados.length} contrato{contratosFiltrados.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Tabla de Contratos */}
      <div className="tabla-wrapper" style={{ background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table className="tabla">
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Inmueble</th>
              <th>Arrendatario</th>
              <th>Propietario (Giro)</th>
              <th style={{ textAlign: 'right' }}>Canon Mensual</th>
              <th style={{ textAlign: 'center' }}>Comisión</th>
              <th>Póliza / Fianza</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contratosFiltrados.map((contrato) => {
              const meta = LEASE_STATUS_META[contrato.estado] || LEASE_STATUS_META.activo;
              return (
                <tr key={contrato.id}>
                  <td>
                    <strong style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{contrato.codigo}</strong>
                    <br />
                    <small style={{ color: 'var(--text-faint)' }}>{contrato.duracionMeses} meses</small>
                  </td>
                  <td>
                    <strong>{contrato.propiedadTitulo}</strong>
                    <br />
                    <small style={{ color: 'var(--text-soft)' }}>
                      {contrato.ciudad} · {contrato.direccion}
                    </small>
                  </td>
                  <td>
                    <span>{contrato.arrendatarioNombre}</span>
                    <br />
                    <small style={{ color: 'var(--text-soft)' }}>{contrato.arrendatarioTelefono}</small>
                  </td>
                  <td>
                    <span>{contrato.propietarioNombre}</span>
                    <br />
                    <small style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>
                      {contrato.propietarioBanco.split('-')[0]}
                    </small>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    {formatMoney(contrato.canon)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge--neutral">{contrato.comisionPorcentaje}%</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{contrato.aseguradora}</span>
                    <br />
                    <small style={{ color: contrato.estado === 'por_vencer' ? '#d97706' : 'var(--text-faint)' }}>
                      Vence: {contrato.polizaVence}
                    </small>
                  </td>
                  <td>
                    <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn btn--xs btn--secondary"
                        onClick={() => setContratoDetalle(contrato)}
                        title="Ver detalle del contrato e historial"
                      >
                        📄 Ficha
                      </button>
                      <button
                        type="button"
                        className="btn btn--xs btn--primary"
                        onClick={() => setContratoParaLiquidar(contrato)}
                        title="Generar liquidación y extracto mensual"
                      >
                        💰 Liquidar Mes
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {contratoParaLiquidar && (
        <LeaseSettlementModal
          contrato={contratoParaLiquidar}
          onClose={() => setContratoParaLiquidar(null)}
          onSettled={handleSettled}
        />
      )}

      {contratoDetalle && (
        <LeaseDetailModal
          contrato={contratoDetalle}
          onClose={() => setContratoDetalle(null)}
          onOpenSettlement={(c) => {
            setContratoDetalle(null);
            setContratoParaLiquidar(c);
          }}
        />
      )}

      {mostrarNuevoModal && (
        <NewLeaseModal
          onClose={() => setMostrarNuevoModal(false)}
          onCreated={(nuevo) => {
            const c = agregarContrato(nuevo);
            setNotificacion(`Contrato ${c.codigo} creado exitosamente.`);
            setTimeout(() => setNotificacion(null), 4000);
          }}
        />
      )}
    </div>
  );
}
