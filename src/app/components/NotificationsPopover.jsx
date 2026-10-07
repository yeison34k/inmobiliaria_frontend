import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@shared/ui/Badge.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { formatDate } from '@shared/lib/format.js';
import { useDashboardAlerts, useDashboardMetrics } from '@features/dashboard';

export function NotificationsPopover() {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [tab, setTab] = useState('todas'); // 'todas' | 'urgentes' | 'preventivas'
  const popoverRef = useRef(null);

  const { data: alertas, isLoading: cargandoAlertas, refetch: refrescarAlertas } = useDashboardAlerts({
    diasSinActualizar: 90,
  });
  const { data: metricas, refetch: refrescarMetricas } = useDashboardMetrics();

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickAfuera = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    if (abierto) {
      document.addEventListener('mousedown', handleClickAfuera);
    }
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, [abierto]);

  // Consolidar todas las notificaciones operativas
  const { itemsUrgentes, itemsPreventivas, totalCount } = useMemo(() => {
    const urgentes = [];
    const preventivas = [];

    if (alertas) {
      // 1. Documentos Vencidos (Urgente)
      for (const d of alertas.documentosVencidos || []) {
        urgentes.push({
          id: `doc-vencido-${d.id}`,
          tipo: 'doc_vencido',
          titulo: `Documento Vencido: ${d.nombre}`,
          subtitulo: `${d.tipo} · Inmueble: ${d.propiedad || 'General'}`,
          detalle: d.diasParaVencer ? `Expiró hace ${Math.abs(d.diasParaVencer)} días` : 'Vencido',
          tone: 'danger',
          icon: '🚨',
          link: '/admin/documentos',
        });
      }

      // 2. Visitas sin registrar resultado (Urgente)
      for (const v of alertas.visitasSinCerrar || []) {
        urgentes.push({
          id: `visita-abierta-${v.id}`,
          tipo: 'visita_pendiente',
          titulo: `Visita sin cerrar: [${v.codigo}]`,
          subtitulo: `${v.propiedad || 'Inmueble'} · Cliente: ${v.cliente || 'Prospecto'}`,
          detalle: v.fechaInicio ? `Programada el ${formatDate(v.fechaInicio)}` : 'Pendiente de resultado',
          tone: 'danger',
          icon: '📅',
          link: '/admin/agenda',
        });
      }

      // 3. Reservas Estancadas > 30 días (Urgente)
      for (const r of alertas.reservasEstancadas || []) {
        urgentes.push({
          id: `reserva-estancada-${r.id}`,
          tipo: 'reserva_fria',
          titulo: `Reserva estancada: [${r.codigo}]`,
          subtitulo: r.propiedad,
          detalle: 'Más de 30 días en seña sin formalizar cierre ni caída',
          tone: 'warning',
          icon: '⏳',
          link: '/admin/operaciones',
        });
      }

      // 4. Documentos Por Vencer en <= 30 días (Preventiva)
      for (const d of alertas.documentosPorVencer || []) {
        preventivas.push({
          id: `doc-porvencer-${d.id}`,
          tipo: 'doc_por_vencer',
          titulo: `Renovación Legal: ${d.nombre}`,
          subtitulo: `${d.tipo} · ${d.propiedad || 'Inmueble'}`,
          detalle: `Vence en ${d.diasParaVencer} días`,
          tone: 'warning',
          icon: '📄',
          link: '/admin/documentos',
        });
      }

      // 5. Propiedades sin fotos (Preventiva)
      for (const p of alertas.sinImagenes || []) {
        preventivas.push({
          id: `prop-sin-fotos-${p.id}`,
          tipo: 'sin_fotos',
          titulo: `Inmueble sin fotografías: [${p.codigo}]`,
          subtitulo: p.titulo,
          detalle: 'No se puede publicar hasta cargar al menos una foto',
          tone: 'neutral',
          icon: '🖼️',
          link: `/admin/propiedades/${p.id}`,
        });
      }

      // 6. Propiedades sin actualizar > 90 días (Preventiva)
      for (const p of alertas.sinActualizar || []) {
        preventivas.push({
          id: `prop-estancada-${p.id}`,
          tipo: 'estancada',
          titulo: `Ficha sin actualizar (>90d): [${p.codigo}]`,
          subtitulo: p.titulo,
          detalle: 'Revisar vigencia de precio con propietario',
          tone: 'neutral',
          icon: '⏱️',
          link: `/admin/propiedades/${p.id}`,
        });
      }
    }

    // 7. Consultas nuevas (Leads calientes)
    if (metricas?.consultasNuevas > 0) {
      urgentes.unshift({
        id: 'consultas-nuevas',
        tipo: 'leads',
        titulo: `${metricas.consultasNuevas} Consulta(s) web sin atender`,
        subtitulo: 'Prospectos interesados que escribieron desde el portal',
        detalle: 'Atender y convertir en contacto del CRM',
        tone: 'purple',
        icon: '🔔',
        link: '/admin/consultas',
      });
    }

    const total = urgentes.length + preventivas.length;
    return { itemsUrgentes: urgentes, itemsPreventivas: preventivas, totalCount: total };
  }, [alertas, metricas]);

  const itemsMostrados = useMemo(() => {
    if (tab === 'urgentes') return itemsUrgentes;
    if (tab === 'preventivas') return itemsPreventivas;
    return [...itemsUrgentes, ...itemsPreventivas];
  }, [tab, itemsUrgentes, itemsPreventivas]);

  const handleRefrescar = () => {
    refrescarAlertas();
    refrescarMetricas();
  };

  const handleItemClick = (link) => {
    setAbierto(false);
    navigate(link);
  };

  return (
    <div className="notifications-wrapper" ref={popoverRef}>
      {/* Boton Campana */}
      <button
        type="button"
        className="notifications-bell-btn"
        onClick={() => setAbierto(!abierto)}
        title="Centro de alertas y notificaciones"
        aria-label="Notificaciones"
      >
        <span className="bell-icon">🔔</span>
        {totalCount > 0 ? (
          <span className="notifications-badge">{totalCount > 99 ? '99+' : totalCount}</span>
        ) : null}
      </button>

      {/* Flyout Popover */}
      {abierto ? (
        <div className="notifications-popover" role="dialog" aria-label="Notificaciones">
          <header className="notifications-popover__header">
            <div>
              <h3>Alertas & Notificaciones</h3>
              <small>{totalCount} asuntos pendientes</small>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleRefrescar}
              title="Recargar alertas en tiempo real"
            >
              🔄
            </button>
          </header>

          {/* Filtros por pestaña */}
          <div className="notifications-popover__tabs">
            <button
              type="button"
              className={`chip ${tab === 'todas' ? 'chip--active' : ''}`}
              onClick={() => setTab('todas')}
            >
              Todas ({totalCount})
            </button>
            <button
              type="button"
              className={`chip ${tab === 'urgentes' ? 'chip--active' : ''}`}
              onClick={() => setTab('urgentes')}
            >
              🚨 Urgentes ({itemsUrgentes.length})
            </button>
            <button
              type="button"
              className={`chip ${tab === 'preventivas' ? 'chip--active' : ''}`}
              onClick={() => setTab('preventivas')}
            >
              ⚠️ Preventivas ({itemsPreventivas.length})
            </button>
          </div>

          {/* Lista de alertas */}
          <div className="notifications-popover__body">
            {cargandoAlertas ? (
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <Spinner label="Verificando alertas..." />
              </div>
            ) : itemsMostrados.length === 0 ? (
              <div className="notifications-popover__empty">
                <span>🎉</span>
                <p>¡Todo al día!</p>
                <small>No hay alertas pendientes en esta categoría.</small>
              </div>
            ) : (
              <ul className="notifications-list">
                {itemsMostrados.map((item) => (
                  <li
                    key={item.id}
                    className="notifications-item"
                    onClick={() => handleItemClick(item.link)}
                  >
                    <span className="notifications-item__icon">{item.icon}</span>
                    <div className="notifications-item__content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                        <strong>{item.titulo}</strong>
                        <Badge tone={item.tone}>{item.detalle}</Badge>
                      </div>
                      <small>{item.subtitulo}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
