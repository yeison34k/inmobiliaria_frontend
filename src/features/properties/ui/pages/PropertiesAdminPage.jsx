import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { EmptyState } from '@shared/ui/EmptyState.jsx';
import { Pagination } from '@shared/ui/Pagination.jsx';
import { formatMoney, formatDate, relativeDays } from '@shared/lib/format.js';
import { exportToCsv } from '@shared/lib/exportCsv.js';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useAuth, can } from '@features/auth';
import { CancelOperationModal, CloseOperationModal, DirectClosingModal, ReserveModal } from '@features/operations';
import { usePropertiesSearch, usePropertyMutations } from '../../application/usePropertiesQueries.js';
import { STATUS_META, TYPE_LABELS, OPERATION_LABELS, primaryAction } from '../../domain/property.js';
import { detailsSummary } from '../../domain/detailSpecs.js';
import { PropertyStatusBadge } from '../components/PropertyStatusBadge.jsx';
import { PropertyFilters } from '../components/PropertyFilters.jsx';
import { ReassignAdvisorModal } from '@app/components/ReassignAdvisorModal.jsx';
import { NotaryClosingCalculatorModal } from '@app/components/NotaryClosingCalculatorModal.jsx';

/**
 * Vista operativa del inventario.
 * Cada fila muestra el estado con su color y la accion contextual que
 * corresponde: disponible -> Reservar, reservada -> Cerrar / Caida.
 */
export function PropertiesAdminPage() {
  const toast = useToast();
  const { usuario } = useAuth();
  const [filtros, setFiltros] = useState({ page: 1, orden: 'actualizadas' });
  const [asignacionFiltro, setAsignacionFiltro] = useState('todas'); // 'todas' | 'mis_propiedades'
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'tarjetas'
  const [modal, setModal] = useState(null); // { tipo, propiedad }
  const [notaryModal, setNotaryModal] = useState({ isOpen: false, initialPrice: 500000000 });
  const [reasignando, setReasignando] = useState(null);
  const q = useDebouncedValue(filtros.q ?? '', 350);

  const { data, isLoading, isFetching, error, refetch } = usePropertiesSearch({
    ...filtros,
    asesorId: asignacionFiltro === 'mis_propiedades' ? usuario?.id : undefined,
    q: q || undefined,
    pageSize: 15,
  });
  const { changeStatus, remove } = usePropertyMutations({
    onError: (e) => toast.error(e.displayMessage),
  });

  const ejecutarAccion = (propiedad, accion) => {
    if (accion.key === 'publicar') {
      changeStatus.mutate({ id: propiedad.id, estado: 'publicada' }, {
        onSuccess: () => toast.success(`${propiedad.codigo} publicada`),
      });
      return;
    }
    if (accion.key === 'reservar') setModal({ tipo: 'reservar', propiedad });
    if (accion.key === 'cerrar') setModal({ tipo: 'cerrar', propiedad });
  };

  const handleExportarCsv = () => {
    const items = data?.items ?? [];
    if (!items.length) {
      toast.error('No hay propiedades para exportar');
      return;
    }

    const columnas = [
      { header: 'Código', key: 'codigo' },
      { header: 'Título', key: 'titulo' },
      { header: 'Tipo', key: 'tipo', format: (v) => TYPE_LABELS[v] || v },
      { header: 'Operación', key: 'operacion' },
      { header: 'Precio', key: 'precio' },
      { header: 'Moneda', key: 'moneda' },
      { header: 'Área (m²)', key: 'areaConstruida', format: (v, r) => v ?? r.areaTotal ?? r.area ?? '' },
      { header: 'Habitaciones', key: 'habitaciones', format: (v) => v ?? '' },
      { header: 'Baños', key: 'banios', format: (v) => v ?? '' },
      { header: 'Ciudad', key: 'ciudad' },
      { header: 'Dirección', key: 'direccion', format: (v) => v ?? '' },
      { header: 'Estado', key: 'estado', format: (v) => STATUS_META[v]?.label || v },
      { header: 'Destacada', key: 'destacada', format: (v) => (v ? 'Sí' : 'No') },
      { header: 'Fecha Registro', key: 'createdAt', format: (v) => (v ? formatDate(v) : '') },
    ];

    exportToCsv('inventario_propiedades', items, columnas);
    toast.success(`${items.length} propiedades exportadas a CSV`);
  };

  return (
    <section>
      <header className="page__header">
        <div>
          <h1>Inventario</h1>
          <p className="page__subtitle">
            {data ? `${data.meta.total} propiedades` : 'Cargando...'}
            {isFetching ? ' · actualizando' : ''}
          </p>
        </div>
        <div className="page__actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Selector de Vista: Tabla vs Cuadrícula */}
          <div style={{ display: 'inline-flex', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <button
              type="button"
              className={`btn btn--sm ${vista === 'tabla' ? 'btn--primary' : 'btn--ghost'}`}
              style={{ borderRadius: 0, padding: '0.4rem 0.75rem' }}
              onClick={() => setVista('tabla')}
              title="Vista en tabla de datos detallada"
            >
              📋 Tabla
            </button>
            <button
              type="button"
              className={`btn btn--sm ${vista === 'tarjetas' ? 'btn--primary' : 'btn--ghost'}`}
              style={{ borderRadius: 0, padding: '0.4rem 0.75rem' }}
              onClick={() => setVista('tarjetas')}
              title="Vista en cuadrícula visual de tarjetas"
            >
              🎴 Cuadrícula
            </button>
          </div>

          <button
            type="button"
            className="btn btn--outline"
            onClick={() => setNotaryModal({ isOpen: true, initialPrice: 500000000 })}
            title="Simulador de escrituración, gastos notariales, retención y comisión"
          >
            🧮 Simulador Notarial
          </button>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleExportarCsv}
            disabled={!data?.items?.length}
            title="Descargar listado en formato Excel / CSV"
          >
            📥 Exportar CSV
          </button>
          <Link className="btn btn--primary" to="/admin/propiedades/nueva">Nueva propiedad</Link>
        </div>
      </header>

      <PropertyFilters
        valores={filtros}
        onChange={setFiltros}
        onReset={() => setFiltros({ page: 1, orden: 'actualizadas' })}
      />

      {/* Filtro rapido de asignacion: Todas vs Mis Propiedades */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`chip ${asignacionFiltro === 'todas' ? 'chip--active' : ''}`}
          onClick={() => {
            setAsignacionFiltro('todas');
            setFiltros((prev) => ({ ...prev, page: 1 }));
          }}
        >
          🌐 Todas las propiedades
        </button>
        <button
          type="button"
          className={`chip ${asignacionFiltro === 'mis_propiedades' ? 'chip--active' : ''}`}
          onClick={() => {
            setAsignacionFiltro('mis_propiedades');
            setFiltros((prev) => ({ ...prev, page: 1 }));
          }}
        >
          👤 Mis propiedades a cargo
        </button>
      </div>

      <div className="status-filter">
        <button
          type="button"
          className={!filtros.estados ? 'chip chip--active' : 'chip'}
          onClick={() => setFiltros({ ...filtros, estados: undefined, page: 1 })}
        >
          Todos los estados
        </button>
        {Object.entries(STATUS_META).map(([estado, meta]) => (
          <button
            key={estado}
            type="button"
            className={filtros.estados === estado ? 'chip chip--active' : 'chip'}
            onClick={() => setFiltros({ ...filtros, estados: estado, page: 1 })}
          >
            {meta.label} {data?.meta && filtros.estados === estado ? `(${data.meta.total})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          title={asignacionFiltro === 'mis_propiedades' ? 'No tienes propiedades asignadas actualmente' : 'No hay propiedades con esos filtros'}
          description={asignacionFiltro === 'mis_propiedades' ? 'Puedes autoasignarte inmuebles o pedir a administración la asignación comercial.' : undefined}
          action={<Link className="btn btn--primary" to="/admin/propiedades/nueva">Cargar una propiedad</Link>}
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          {vista === 'tabla' ? (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Propiedad</th>
                    <th>Tipo / detalle</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Asesor</th>
                    <th>Actualizada</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((propiedad) => {
                    const accion = primaryAction(propiedad);
                    return (
                      <tr key={propiedad.id}>
                        <td>
                          <div className="cell-property">
                            {propiedad.imagenPrincipal
                              ? <img src={propiedad.imagenPrincipal} alt="" className="cell-thumb" />
                              : <span className="cell-thumb cell-thumb--empty">—</span>}
                            <div className="cell-stack">
                              <Link to={`/admin/propiedades/${propiedad.id}`}>{propiedad.titulo}</Link>
                              <small>{propiedad.codigo} · {propiedad.ubicacion?.etiqueta}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span>{TYPE_LABELS[propiedad.tipo]}</span>
                            <small>{detailsSummary(propiedad)}</small>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span>{formatMoney(propiedad.precio, propiedad.moneda)}</span>
                            <small>{propiedad.operacion}</small>
                          </div>
                        </td>
                        <td><PropertyStatusBadge estado={propiedad.estado} /></td>
                        <td>
                          <div className="cell-stack">
                            <span>{propiedad.asesor?.nombre || 'Bolsa común'}</span>
                            <button
                              type="button"
                              className="cell-note"
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '11px',
                              }}
                              onClick={() => setReasignando(propiedad)}
                              title="Reasignar asesor responsable de esta propiedad"
                            >
                              🔄 Reasignar
                            </button>
                          </div>
                        </td>
                        <td><small>{relativeDays(propiedad.updatedAt)}</small></td>
                        <td className="table__actions">
                          {accion ? (
                            <button
                              type="button"
                              className={`btn btn--${accion.tone} btn--sm`}
                              onClick={() => ejecutarAccion(propiedad, accion)}
                            >
                              {accion.label}
                            </button>
                          ) : null}

                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setNotaryModal({ isOpen: true, initialPrice: propiedad.precio || 500000000 })}
                            title="Simular gastos notariales para este inmueble"
                          >
                            🧮 Cierre
                          </button>

                          {propiedad.estado === 'reservada' ? (
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => setModal({ tipo: 'caida', propiedad })}
                            >
                              Caida
                            </button>
                          ) : null}

                          {propiedad.estado === 'publicada' ? (
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => setModal({ tipo: 'cierre-directo', propiedad })}
                            >
                              Cierre directo
                            </button>
                          ) : null}

                          <Link className="btn btn--ghost btn--sm" to={`/admin/propiedades/${propiedad.id}/editar`}>
                            Editar
                          </Link>

                          {can.eliminarPropiedad(usuario) && ['borrador', 'suspendida'].includes(propiedad.estado) ? (
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => {
                                if (confirm(`Eliminar ${propiedad.codigo}?`)) {
                                  remove.mutate(propiedad.id, { onSuccess: () => toast.success('Propiedad eliminada') });
                                }
                              }}
                            >
                              Eliminar
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className="admin-property-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
                margin: '1.25rem 0',
              }}
            >
              {data.items.map((propiedad) => {
                const accion = primaryAction(propiedad);
                return (
                  <article
                    key={propiedad.id}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    {/* Media Header */}
                    <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: 'var(--surface-sunken)' }}>
                      {propiedad.imagenPrincipal ? (
                        <img
                          src={propiedad.imagenPrincipal}
                          alt={propiedad.titulo}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)', fontSize: '0.85rem' }}>
                          Sin imagen
                        </div>
                      )}
                      {/* Badges on image */}
                      <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.35rem' }}>
                        <span
                          style={{
                            background: 'rgba(0,0,0,0.72)',
                            backdropFilter: 'blur(4px)',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {OPERATION_LABELS[propiedad.operacion] || propiedad.operacion}
                        </span>
                        {propiedad.destacada ? (
                          <span style={{ background: '#d4af37', color: '#000', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                            ★ Destacada
                          </span>
                        ) : null}
                      </div>

                      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <PropertyStatusBadge estado={propiedad.estado} />
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '10px',
                          background: 'rgba(15, 23, 42, 0.78)',
                          backdropFilter: 'blur(4px)',
                          color: '#f8fafc',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: '4px',
                        }}
                      >
                        {propiedad.codigo}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.6rem' }}>
                      <div>
                        <Link
                          to={`/admin/propiedades/${propiedad.id}`}
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'var(--text)',
                            textDecoration: 'none',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                          title={propiedad.titulo}
                        >
                          {propiedad.titulo}
                        </Link>
                        <small style={{ color: 'var(--text-soft)', display: 'block', marginTop: '2px' }}>
                          {propiedad.ubicacion?.etiqueta || propiedad.ciudad || 'Ubicación no especificada'}
                        </small>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '1.18rem', color: 'var(--primary)' }}>
                          {formatMoney(propiedad.precio, propiedad.moneda)}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                          {TYPE_LABELS[propiedad.tipo] || propiedad.tipo}
                        </span>
                      </div>

                      {/* Specs summary */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          fontSize: '0.8rem',
                          color: 'var(--text-soft)',
                          padding: '0.45rem 0',
                          borderTop: '1px solid var(--border)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        {propiedad.habitaciones != null ? (
                          <span title={`${propiedad.habitaciones} habitaciones`}>
                            🛏️ {propiedad.habitaciones} hab
                          </span>
                        ) : null}
                        {propiedad.banios != null ? (
                          <span title={`${propiedad.banios} baños`}>
                            🚿 {propiedad.banios} bñ
                          </span>
                        ) : null}
                        {propiedad.areaConstruida || propiedad.areaTotal ? (
                          <span title="Área construida">
                            📐 {propiedad.areaConstruida || propiedad.areaTotal} m²
                          </span>
                        ) : null}
                      </div>

                      {/* Advisor line */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-soft)' }}>
                          👤 {propiedad.asesor?.nombre || 'Bolsa común'}
                        </span>
                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                          onClick={() => setReasignando(propiedad)}
                        >
                          🔄 Reasignar
                        </button>
                      </div>

                      {/* Card Actions Footer */}
                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: '0.5rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.4rem',
                          alignItems: 'center',
                        }}
                      >
                        {accion ? (
                          <button
                            type="button"
                            className={`btn btn--${accion.tone} btn--sm`}
                            style={{ flex: 1 }}
                            onClick={() => ejecutarAccion(propiedad, accion)}
                          >
                            {accion.label}
                          </button>
                        ) : null}

                        <Link
                          className="btn btn--ghost btn--sm"
                          to={`/admin/propiedades/${propiedad.id}/editar`}
                        >
                          Editar
                        </Link>

                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setNotaryModal({ isOpen: true, initialPrice: propiedad.precio || 500000000 })}
                          title="Simular gastos notariales y de cierre para este inmueble"
                        >
                          🧮 Cierre
                        </button>

                        {propiedad.estado === 'reservada' ? (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setModal({ tipo: 'caida', propiedad })}
                          >
                            Caída
                          </button>
                        ) : null}

                        {propiedad.estado === 'publicada' ? (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setModal({ tipo: 'cierre-directo', propiedad })}
                          >
                            Cierre directo
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <Pagination meta={data.meta} onPageChange={(page) => setFiltros({ ...filtros, page })} />
        </>
      ) : null}

      {modal?.tipo === 'reservar' ? (
        <ReserveModal propiedad={modal.propiedad} onClose={() => setModal(null)} />
      ) : null}
      {modal?.tipo === 'cerrar' ? (
        <CloseOperationModal propiedad={modal.propiedad} onClose={() => setModal(null)} />
      ) : null}
      {modal?.tipo === 'caida' ? (
        <CancelOperationModal propiedad={modal.propiedad} onClose={() => setModal(null)} />
      ) : null}
      {modal?.tipo === 'cierre-directo' ? (
        <DirectClosingModal propiedad={modal.propiedad} onClose={() => setModal(null)} />
      ) : null}

      {reasignando ? (
        <ReassignAdvisorModal
          item={reasignando}
          tipo="propiedad"
          onClose={() => setReasignando(null)}
          onSuccess={() => refetch()}
        />
      ) : null}

      {/* Modal de simulador notarial y liquidación de cierre */}
      <NotaryClosingCalculatorModal
        isOpen={notaryModal.isOpen}
        onClose={() => setNotaryModal({ isOpen: false, initialPrice: 500000000 })}
        initialPrice={notaryModal.initialPrice}
      />
    </section>
  );
}
