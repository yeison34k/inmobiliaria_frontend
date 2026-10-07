import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { authApi } from '@features/auth/infrastructure/authApi.js';
import { propertyApi } from '@features/properties/infrastructure/propertyApi.js';
import { contactApi } from '@features/contacts/infrastructure/contactApi.js';

/**
 * Modal universal para transferir o reasignar la responsabilidad comercial
 * de un inmueble o de un contacto CRM a otro asesor del equipo.
 */
export function ReassignAdvisorModal({ item, tipo = 'propiedad', onClose, onSuccess }) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const currentAsesorId = item?.asesorId || item?.asesor?.id || '';
  const [nuevoAsesorId, setNuevoAsesorId] = useState(currentAsesorId);
  const [guardando, setGuardando] = useState(false);

  // Lista de usuarios/asesores del equipo
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => authApi.listUsers({ pageSize: 100 }),
  });

  const asesores = (usersData?.items || []).filter((u) => u.activo);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);
      if (tipo === 'propiedad') {
        await propertyApi.update(item.id, { asesorId: nuevoAsesorId || null });
        queryClient.invalidateQueries({ queryKey: ['propiedades'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        toast.success(`Inmueble ${item.codigo || ''} reasignado exitosamente`);
      } else {
        await contactApi.asignarAsesor(item.id, nuevoAsesorId || null);
        queryClient.invalidateQueries({ queryKey: ['contactos'] });
        toast.success(`Contacto ${item.nombre} reasignado exitosamente`);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.displayMessage || 'Error al reasignar asesor');
    } finally {
      setGuardando(false);
    }
  };

  const tituloItem = tipo === 'propiedad'
    ? `[${item.codigo}] ${item.titulo}`
    : `${item.nombre} (${item.tipo || 'Prospecto'})`;

  return (
    <Modal
      title={tipo === 'propiedad' ? 'Reasignar Asesor del Inmueble' : 'Reasignar Responsable del Contacto'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={guardando || isLoading}
          >
            {guardando ? 'Reasignando...' : 'Confirmar Reasignación'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--surface-muted)', borderRadius: 'var(--radius)' }}>
          <small style={{ color: 'var(--text-faint)', display: 'block', marginBottom: '0.2rem' }}>
            {tipo === 'propiedad' ? 'Inmueble seleccionado:' : 'Contacto seleccionado:'}
          </small>
          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
            {tituloItem}
          </strong>
        </div>

        <Field
          label="Nuevo Asesor Comercial *"
          hint="El asesor seleccionado será el encargado de gestionar visitas, negociaciones y seguimiento"
        >
          <select
            value={nuevoAsesorId}
            onChange={(e) => setNuevoAsesorId(e.target.value)}
            disabled={isLoading}
          >
            <option value="">— Sin asesor asignado (Bolsa común) —</option>
            {asesores.map((asesor) => (
              <option key={asesor.id} value={asesor.id}>
                {asesor.nombre} ({asesor.rol === 'admin' ? 'Administrador' : 'Asesor'} · {asesor.email})
              </option>
            ))}
          </select>
        </Field>
      </form>
    </Modal>
  );
}
