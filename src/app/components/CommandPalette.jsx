import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue.js';
import { formatMoney } from '@shared/lib/format.js';
import { Badge } from '@shared/ui/Badge.jsx';
import { can, useAuth } from '@features/auth';
import { STATUS_META, TYPE_LABELS, usePropertiesSearch } from '@features/properties';
import { useContacts } from '@features/contacts';
import { DOCUMENT_TYPES, useAllDocuments } from '@features/documents';

export function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 200);

  // Consultas en tiempo real
  const { data: propsData } = usePropertiesSearch({
    q: debouncedQuery.trim() || undefined,
    pageSize: 5,
  });

  const { data: contactsData } = useContacts({
    q: debouncedQuery.trim() || undefined,
    pageSize: 5,
  });

  const { data: allDocs = [] } = useAllDocuments();

  // Filtrado de documentos legales
  const matchingDocs = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase().trim();
    return allDocs
      .filter((d) =>
        d.nombre?.toLowerCase().includes(q) ||
        d.tipoLabel?.toLowerCase().includes(q) ||
        d.propiedad?.codigo?.toLowerCase().includes(q) ||
        d.propiedad?.titulo?.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [allDocs, debouncedQuery]);

  // Acciones y enlaces del sistema
  const quickActions = useMemo(() => {
    const actions = [
      {
        id: 'act-nueva-prop',
        group: 'Acciones Rápidas',
        title: 'Crear nueva propiedad',
        subtitle: 'Dar de alta un nuevo inmueble en el catálogo',
        icon: '➕',
        perform: () => navigate('/admin/propiedades/nueva'),
      },
      {
        id: 'act-agenda',
        group: 'Acciones Rápidas',
        title: 'Agenda de Visitas',
        subtitle: 'Ver calendario de recorridos y citas comerciales',
        icon: '📅',
        perform: () => navigate('/admin/agenda'),
      },
      {
        id: 'act-operaciones',
        group: 'Acciones Rápidas',
        title: 'Operaciones & Cierres',
        subtitle: 'Reservas activas, comisiones y cierres de venta',
        icon: '💼',
        perform: () => navigate('/admin/operaciones'),
      },
      {
        id: 'act-documentos',
        group: 'Acciones Rápidas',
        title: 'Gestión Documental',
        subtitle: 'Expedientes, mandatos de corretaje y semáforo',
        icon: '📂',
        perform: () => navigate('/admin/documentos'),
      },
      {
        id: 'act-perfil',
        group: 'Acciones Rápidas',
        title: 'Mi Perfil & Seguridad',
        subtitle: 'Modificar datos de contacto y contraseña',
        icon: '👤',
        perform: () => navigate('/admin/perfil'),
      },
      {
        id: 'act-portales',
        group: 'Acciones Rápidas',
        title: 'Sindicación a Portales',
        subtitle: 'Feeds XML/JSON para Finca Raíz, Metrocuadrado y portales aliados',
        icon: '📡',
        perform: () => navigate('/admin/portales'),
      },
      {
        id: 'act-configuracion',
        group: 'Acciones Rápidas',
        title: 'Configuración & Parámetros Legales',
        subtitle: 'Matrícula de arrendador Ley 820, NIT, comisiones y datos institucionales',
        icon: '⚙️',
        perform: () => navigate('/admin/configuracion'),
      },
      {
        id: 'act-sitio',
        group: 'Acciones Rápidas',
        title: 'Ver Sitio Público',
        subtitle: 'Abrir portal web de cara a clientes',
        icon: '🌐',
        perform: () => navigate('/'),
      },
    ];

    if (can.gestionarUsuarios(usuario)) {
      actions.push({
        id: 'act-usuarios',
        group: 'Acciones Rápidas',
        title: 'Equipo de Asesores',
        subtitle: 'Administración de usuarios y roles',
        icon: '👥',
        perform: () => navigate('/admin/usuarios'),
      });
    }

    if (!debouncedQuery.trim()) return actions;
    const q = debouncedQuery.toLowerCase();
    return actions.filter(
      (a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
    );
  }, [debouncedQuery, navigate, usuario]);

  // Lista aplanada de todos los resultados interactivos para navegacion con flechas
  const flatItems = useMemo(() => {
    const list = [];

    // Acciones rapidas
    for (const act of quickActions) {
      list.push({ ...act, type: 'action' });
    }

    // Propiedades
    if (debouncedQuery.trim() && propsData?.items) {
      for (const p of propsData.items) {
        list.push({
          id: `prop-${p.id}`,
          group: 'Propiedades en Inventario',
          title: `[${p.codigo}] ${p.titulo}`,
          subtitle: `${TYPE_LABELS[p.tipo] || p.tipo} · ${formatMoney(p.precio, p.moneda)} · ${p.ciudad}`,
          icon: '🏠',
          status: p.estado,
          type: 'property',
          perform: () => navigate(`/admin/propiedades/${p.id}`),
        });
      }
    }

    // Contactos
    if (debouncedQuery.trim() && contactsData?.items) {
      for (const c of contactsData.items) {
        list.push({
          id: `contact-${c.id}`,
          group: 'Contactos & Leads CRM',
          title: c.nombre,
          subtitle: `${c.etapa.toUpperCase()} · 📞 ${c.telefono || 'Sin teléfono'} · ✉️ ${c.email || 'Sin email'}`,
          icon: '👤',
          type: 'contact',
          perform: () => navigate('/admin/contactos'),
        });
      }
    }

    // Documentos
    if (matchingDocs.length > 0) {
      for (const d of matchingDocs) {
        list.push({
          id: `doc-${d.id}`,
          group: 'Expedientes Legales',
          title: d.nombre,
          subtitle: `${d.tipoLabel || d.tipo}${d.propiedad ? ` · Inmueble: [${d.propiedad.codigo}]` : ''}`,
          icon: '📄',
          type: 'document',
          perform: () => navigate('/admin/documentos'),
        });
      }
    }

    return list;
  }, [quickActions, debouncedQuery, propsData, contactsData, matchingDocs, navigate]);

  // Auto focus al abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Control de teclado para la paleta
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < flatItems.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : flatItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          flatItems[selectedIndex].perform();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="command-palette-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="command-palette" role="dialog" aria-modal="true">
        {/* Cabecera de Entrada */}
        <div className="command-palette__search">
          <span className="command-palette__icon">🔍</span>
          <input
            ref={inputRef}
            type="search"
            placeholder="Buscar propiedades, clientes, documentos o saltar a..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button type="button" className="command-palette__esc" onClick={onClose}>
            ESC
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="command-palette__body">
          {flatItems.length === 0 ? (
            <div className="command-palette__empty">
              <p>No se encontraron resultados para <strong>"{query}"</strong></p>
              <small>Intente buscar por código (ej. PROP-), nombre o ciudad</small>
            </div>
          ) : (
            <ul className="command-palette__list">
              {flatItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const prevItem = flatItems[idx - 1];
                const showGroupHeader = !prevItem || prevItem.group !== item.group;

                return (
                  <li key={item.id}>
                    {showGroupHeader ? (
                      <div className="command-palette__group-header">{item.group}</div>
                    ) : null}
                    <div
                      className={`command-palette__item ${isSelected ? 'command-palette__item--selected' : ''}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        item.perform();
                        onClose();
                      }}
                    >
                      <span className="command-palette__item-icon">{item.icon}</span>
                      <div className="command-palette__item-content">
                        <strong>{item.title}</strong>
                        <small>{item.subtitle}</small>
                      </div>
                      {item.status ? (
                        <Badge tone={STATUS_META[item.status]?.tone}>
                          {STATUS_META[item.status]?.label || item.status}
                        </Badge>
                      ) : null}
                      {isSelected ? <span className="command-palette__item-enter">↵</span> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pie de Ayuda */}
        <footer className="command-palette__footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> para navegar
          </span>
          <span>
            <kbd>Enter</kbd> para seleccionar
          </span>
          <span>
            <kbd>Esc</kbd> para cerrar
          </span>
        </footer>
      </div>
    </div>
  );
}
