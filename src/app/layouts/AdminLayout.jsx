import { useEffect, useState, Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ROLE_LABELS, can, useAuth } from '@features/auth';
import { NotificationBell } from '@features/notifications';
import { PageLoader } from '@shared/ui/PageLoader.jsx';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher.jsx';
import { CommandPalette } from '../components/CommandPalette.jsx';
import { NotificationsPopover } from '../components/NotificationsPopover.jsx';
import { NotaryClosingCalculatorModal } from '../components/NotaryClosingCalculatorModal.jsx';

const NAV = [
  { to: '/admin', label: 'Panel', end: true },
  { to: '/admin/mi-dia', label: 'Mi dia' },
  { to: '/admin/propiedades', label: 'Inventario' },
  { to: '/admin/agenda', label: 'Agenda' },
  { to: '/admin/oportunidades', label: 'Oportunidades' },
  { to: '/admin/selecciones', label: 'Selecciones' },
  { to: '/admin/operaciones', label: 'Operaciones' },
  { to: '/admin/arrendamientos', label: 'Arrendamientos' },
  { to: '/admin/contactos', label: 'Contactos' },
  { to: '/admin/consultas', label: 'Consultas' },
  { to: '/admin/documentos', label: 'Documentos' },
  { to: '/admin/portales', label: 'Portales' },
  { to: '/admin/configuracion', label: 'Ajustes' },
];

export function AdminLayout() {
  const { usuario, logout } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notaryOpen, setNotaryOpen] = useState(false);
  const inicial = (usuario?.nombre || 'U').charAt(0).toUpperCase();

  // Atajo global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="admin">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.35rem 1rem' }}>
          <p className="brand" style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 700 }}>Inmobiliaria</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LanguageSwitcher />
            <NotificationsPopover />
          </div>
        </div>

        {/* Buscador rapido / Command palette trigger */}
        <button
          type="button"
          className="command-palette-trigger"
          onClick={() => setPaletteOpen(true)}
          title="Búsqueda rápida en todo el sistema (Ctrl + K)"
        >
          <span>🔍 Buscar...</span>
          <kbd className="command-palette-kbd">Ctrl K</kbd>
        </button>

        <nav className="sidebar__nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>
          ))}
          {can.gestionarUsuarios(usuario) ? <NavLink to="/admin/usuarios">Equipo</NavLink> : null}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              style={{ width: '100%', justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-soft)' }}
              onClick={() => setNotaryOpen(true)}
              title="Calcular derechos notariales, retención, impuesto de registro y liquidación de cierre"
            >
              <span>🧮</span>
              <span>Simulador Notarial</span>
            </button>
          </div>
        </nav>

        <div className="sidebar__footer">
          <NotificationBell />
          <NavLink
            to="/admin/perfil"
            className={({ isActive }) => `sidebar__user-link ${isActive ? 'active' : ''}`}
            title="Ver y editar mi perfil comercial y seguridad"
          >
            <div className="sidebar__user-avatar">{inicial}</div>
            <div className="sidebar__user-info">
              <strong>{usuario?.nombre}</strong>
              <small>{ROLE_LABELS[usuario?.rol]} • Mi perfil</small>
            </div>
          </NavLink>
          <NavLink to="/" className="btn btn--ghost btn--sm">Ver sitio</NavLink>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>Salir</button>
        </div>
      </aside>

      <main className="admin__main">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Paleta de comandos y busqueda global */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Modal de simulador notarial y cierre */}
      <NotaryClosingCalculatorModal isOpen={notaryOpen} onClose={() => setNotaryOpen(false)} />
    </div>
  );
}
