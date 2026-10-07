import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@shared/ui/Badge.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { Modal } from '@shared/ui/Modal.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { authApi } from '../../infrastructure/authApi.js';
import { ROLE_LABELS, UserRole } from '../../domain/session.js';

const vacio = { nombre: '', email: '', password: '', telefono: '', rol: UserRole.AGENTE };

export function UsersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState(vacio);

  const { data, isLoading, error } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => authApi.listUsers({ pageSize: 100 }),
  });

  const crear = useMutation({
    mutationFn: (payload) => authApi.createUser(payload),
    onSuccess: () => {
      toast.success('Usuario creado');
      setAbierto(false);
      setForm(vacio);
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (err) => toast.error(err.displayMessage),
  });

  const alternarEstado = useMutation({
    mutationFn: ({ id, activo }) => authApi.updateUser(id, { activo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
    onError: (err) => toast.error(err.displayMessage),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <section>
      <header className="page__header">
        <div>
          <h1>Equipo</h1>
          <p className="page__subtitle">Usuarios con acceso al panel</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setAbierto(true)}>Nuevo usuario</button>
      </header>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th /></tr>
          </thead>
          <tbody>
            {data.items.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>{ROLE_LABELS[usuario.rol]}</td>
                <td>
                  <Badge tone={usuario.activo ? 'success' : 'neutral'}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="table__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => alternarEstado.mutate({ id: usuario.id, activo: !usuario.activo })}
                  >
                    {usuario.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {abierto ? (
        <Modal
          title="Nuevo usuario"
          onClose={() => setAbierto(false)}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setAbierto(false)}>Cancelar</button>
              <button type="button" className="btn btn--primary" disabled={crear.isPending} onClick={() => crear.mutate(form)}>
                Crear
              </button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Nombre" required>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </Field>
            <Field label="Email" required>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Contrasena" hint="Minimo 8 caracteres" required>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
            <Field label="Telefono">
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </Field>
            <Field label="Rol">
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
