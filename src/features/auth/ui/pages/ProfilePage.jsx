import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@shared/ui/Badge.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { formatDate } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { ROLE_LABELS, UserRole, can, useAuth } from '@features/auth';
import { authApi } from '../../infrastructure/authApi.js';

// Evaluador de fortaleza de contrasena
function evaluarFortaleza(pwd = '') {
  let score = 0;
  if (!pwd) return { score: 0, label: 'Vacía', color: 'var(--border)' };

  if (pwd.length >= 8) score += 25;
  if (pwd.length >= 12) score += 15;
  if (/[A-Z]/.test(pwd)) score += 20;
  if (/[a-z]/.test(pwd)) score += 15;
  if (/[0-9]/.test(pwd)) score += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 10;

  if (score < 40) return { score: Math.min(score, 35), label: 'Débil', color: 'var(--danger)' };
  if (score < 75) return { score: Math.min(score, 70), label: 'Aceptable', color: '#d09a2c' };
  return { score: Math.min(score, 100), label: 'Fuerte y Segura', color: 'var(--success)' };
}

export function ProfilePage() {
  const toast = useToast();
  const { usuario, actualizarPerfil } = useAuth();

  // Estado del formulario de perfil
  const [formPerfil, setFormPerfil] = useState({
    nombre: usuario?.nombre || '',
    telefono: usuario?.telefono || '',
  });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // Estado del formulario de contrasena
  const [formPwd, setFormPwd] = useState({
    passwordActual: '',
    passwordNuevo: '',
    confirmarPassword: '',
  });
  const [guardandoPwd, setGuardandoPwd] = useState(false);
  const [mostrarPwd, setMostrarPwd] = useState(false);

  const fortaleza = useMemo(() => evaluarFortaleza(formPwd.passwordNuevo), [formPwd.passwordNuevo]);

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!formPerfil.nombre.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    try {
      setGuardandoPerfil(true);
      const res = await authApi.updateProfile({
        nombre: formPerfil.nombre.trim(),
        telefono: formPerfil.telefono.trim() || null,
      });
      actualizarPerfil({
        nombre: res.nombre || formPerfil.nombre.trim(),
        telefono: res.telefono,
      });
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      toast.error(err.displayMessage || 'Error al actualizar el perfil');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    if (!formPwd.passwordActual) {
      toast.error('Indique su contraseña actual');
      return;
    }
    if (formPwd.passwordNuevo.length < 8) {
      toast.error('La nueva contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (formPwd.passwordNuevo !== formPwd.confirmarPassword) {
      toast.error('La nueva contraseña y su confirmación no coinciden');
      return;
    }

    try {
      setGuardandoPwd(true);
      await authApi.changePassword({
        passwordActual: formPwd.passwordActual,
        passwordNuevo: formPwd.passwordNuevo,
      });
      toast.success('Contraseña cambiada con éxito');
      setFormPwd({ passwordActual: '', passwordNuevo: '', confirmarPassword: '' });
    } catch (err) {
      toast.error(err.displayMessage || 'Error al cambiar la contraseña');
    } finally {
      setGuardandoPwd(false);
    }
  };

  const iniciales = (usuario?.nombre || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <section className="profile-page">
      <header className="page__header">
        <div>
          <div className="breadcrumb">
            <Link to="/admin">Panel</Link>
            <span>/</span>
            <span>Mi Perfil</span>
          </div>
          <h1>Mi Perfil y Cuenta</h1>
          <p className="page__subtitle">
            Información comercial de contacto, seguridad de acceso y resumen de rol
          </p>
        </div>
      </header>

      {/* Tarjeta Hero de Usuario */}
      <article className="panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a5f 100%)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              flexShrink: 0,
            }}
          >
            {iniciales}
          </div>

          <div style={{ flex: '1 1 240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{usuario?.nombre}</h2>
              <Badge tone={usuario?.rol === UserRole.ADMIN ? 'purple' : 'info'}>
                {ROLE_LABELS[usuario?.rol] || usuario?.rol}
              </Badge>
              <Badge tone="success">Cuenta Activa</Badge>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-soft)', fontSize: 'var(--text-sm)' }}>
              {usuario?.email} {usuario?.telefono ? `· 📞 ${usuario?.telefono}` : ''}
            </p>
            {usuario?.createdAt ? (
              <small style={{ color: 'var(--text-faint)', fontSize: 'var(--text-xs)' }}>
                Miembro del equipo desde el {formatDate(usuario.createdAt)}
              </small>
            ) : null}
          </div>
        </div>
      </article>

      {/* Grid de Formularios: Datos Personales y Seguridad */}
      <div className="dashboard__grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Formulario 1: Datos Personales y Comerciales */}
        <article className="panel">
          <h2>Datos Comerciales</h2>
          <p className="panel__hint" style={{ marginBottom: '1.25rem' }}>
            Esta información se muestra a los clientes en los informes de visita y contactos comerciales.
          </p>

          <form onSubmit={handleGuardarPerfil}>
            <Field label="Nombre completo *" hint="Nombre y apellido corporativo">
              <input
                type="text"
                required
                maxLength={120}
                value={formPerfil.nombre}
                onChange={(e) => setFormPerfil({ ...formPerfil, nombre: e.target.value })}
              />
            </Field>

            <Field label="Teléfono comercial / WhatsApp" hint="Canal directo para contacto con clientes">
              <input
                type="tel"
                placeholder="+57 300 123 4567"
                maxLength={40}
                value={formPerfil.telefono}
                onChange={(e) => setFormPerfil({ ...formPerfil, telefono: e.target.value })}
              />
            </Field>

            <Field label="Correo electrónico institucional" hint="Identificador de inicio de sesión (administrado por el sistema)">
              <input
                type="email"
                disabled
                value={usuario?.email || ''}
                style={{ background: 'var(--surface-muted)', color: 'var(--text-faint)', cursor: 'not-allowed' }}
              />
            </Field>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={guardandoPerfil}
              >
                {guardandoPerfil ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </article>

        {/* Formulario 2: Cambio de Contraseña */}
        <article className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ margin: 0 }}>Seguridad y Contraseña</h2>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setMostrarPwd(!mostrarPwd)}
            >
              {mostrarPwd ? 'Ocultar' : 'Ver contraseñas'}
            </button>
          </div>
          <p className="panel__hint" style={{ marginBottom: '1.25rem' }}>
            Recomendamos utilizar al menos 8 caracteres combinando mayúsculas, números y símbolos.
          </p>

          <form onSubmit={handleCambiarPassword}>
            <Field label="Contraseña actual *">
              <input
                type={mostrarPwd ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Su clave actual"
                value={formPwd.passwordActual}
                onChange={(e) => setFormPwd({ ...formPwd, passwordActual: e.target.value })}
              />
            </Field>

            <Field label="Nueva contraseña *" hint="Mínimo 8 caracteres">
              <input
                type={mostrarPwd ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Nueva clave segura"
                value={formPwd.passwordNuevo}
                onChange={(e) => setFormPwd({ ...formPwd, passwordNuevo: e.target.value })}
              />
            </Field>

            {/* Medidor de Fortaleza */}
            {formPwd.passwordNuevo ? (
              <div style={{ margin: '-0.25rem 0 1rem', padding: '0.5rem 0.75rem', background: 'var(--surface-muted)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-soft)' }}>Fortaleza de contraseña:</span>
                  <strong style={{ color: fortaleza.color }}>{fortaleza.label}</strong>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${fortaleza.score}%`,
                      background: fortaleza.color,
                      transition: 'width 0.3s ease, background 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ) : null}

            <Field label="Confirmar nueva contraseña *">
              <input
                type={mostrarPwd ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Repita la nueva clave"
                value={formPwd.confirmarPassword}
                onChange={(e) => setFormPwd({ ...formPwd, confirmarPassword: e.target.value })}
              />
            </Field>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={guardandoPwd}
              >
                {guardandoPwd ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>
        </article>
      </div>

      {/* Card 3: Permisos del Rol y Accesos Rápidos */}
      <article className="panel">
        <h2>Privilegios del Rol: {ROLE_LABELS[usuario?.rol]}</h2>
        <p className="panel__hint" style={{ marginBottom: '1rem' }}>
          Capacidades habilitadas para su usuario en la plataforma inmobiliaria:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--surface-muted)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}>
            ✓ <strong>Catálogo de Inmuebles:</strong> Crear, editar fichas técnicas, subir fotos y recorridos.
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--surface-muted)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}>
            ✓ <strong>Gestión Documental:</strong> Adjuntar mandatos, certificados de tradición y consultar vigencias.
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--surface-muted)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}>
            ✓ <strong>Agenda Comercial:</strong> Programar, atender y retroalimentar visitas guiadas.
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--surface-muted)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}>
            ✓ <strong>Operaciones de Cierre:</strong> Reservar inmuebles con seña y registrar comisiones.
          </div>
          {can.gestionarUsuarios(usuario) ? (
            <div style={{ padding: '0.75rem', background: 'var(--purple-bg)', color: 'var(--purple)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}>
              ★ <strong>Administración General:</strong> Alta y edición de usuarios del equipo y auditoría.
            </div>
          ) : null}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/propiedades" className="btn btn--ghost btn--sm">
            Ver Inventario
          </Link>
          <Link to="/admin/agenda" className="btn btn--ghost btn--sm">
            Mi Agenda de Visitas
          </Link>
          <Link to="/admin/operaciones" className="btn btn--ghost btn--sm">
            Operaciones Comerciales
          </Link>
          <Link to="/admin/documentos" className="btn btn--ghost btn--sm">
            Módulo de Documentos
          </Link>
        </div>
      </article>
    </section>
  );
}
