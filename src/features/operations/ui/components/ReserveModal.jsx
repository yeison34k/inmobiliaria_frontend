import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { ContactPicker } from '@features/contacts';
import { useOperationMutations } from '../../application/useOperationsQueries.js';

/**
 * Paso 1 del cierre: Estado -> Montos -> Participantes -> Comentarios.
 * Al confirmar, la propiedad queda reservada y deja de ofrecerse como
 * disponible, pero sigue en el inventario.
 */
export function ReserveModal({ propiedad, onClose, onDone }) {
  const toast = useToast();
  const { reserve } = useOperationMutations({ onError: (e) => toast.error(e.displayMessage) });
  const [form, setForm] = useState({
    clienteId: null,
    propietarioId: propiedad.propietarioId ?? null,
    montoSenia: '',
    comisionPorcentaje: '3',
    notas: '',
  });

  const confirmar = () => {
    if (!form.clienteId) {
      toast.error('Seleccione el cliente que reserva');
      return;
    }
    reserve.mutate({
      propiedadId: propiedad.id,
      clienteId: form.clienteId,
      propietarioId: form.propietarioId ?? undefined,
      montoSenia: form.montoSenia === '' ? undefined : Number(form.montoSenia),
      comisionPorcentaje: form.comisionPorcentaje === '' ? undefined : Number(form.comisionPorcentaje),
      notas: form.notas || undefined,
    }, {
      onSuccess: (operacion) => {
        toast.success(`Reserva ${operacion.codigo} registrada`);
        onDone?.(operacion);
        onClose();
      },
    });
  };

  return (
    <Modal
      title={`Reservar ${propiedad.codigo}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn--primary" disabled={reserve.isPending} onClick={confirmar}>
            {reserve.isPending ? 'Registrando...' : 'Registrar reserva'}
          </button>
        </>
      }
    >
      <p className="modal__lead">
        <strong>{propiedad.titulo}</strong><br />
        Precio de lista: {formatMoney(propiedad.precio, propiedad.moneda)} · Operacion: {propiedad.operacion}
      </p>

      <div className="form-grid">
        <ContactPicker
          label="Cliente (comprador / inquilino)"
          tipo="cliente"
          required
          value={form.clienteId}
          onChange={(clienteId) => setForm({ ...form, clienteId })}
        />
        <ContactPicker
          label="Propietario"
          tipo="propietario"
          value={form.propietarioId}
          onChange={(propietarioId) => setForm({ ...form, propietarioId })}
        />
      </div>

      <div className="form-grid">
        <Field label="Monto de la senia" hint="Deje vacio si aun no hay pago">
          <input
            type="number"
            min="0"
            value={form.montoSenia}
            onChange={(e) => setForm({ ...form, montoSenia: e.target.value })}
          />
        </Field>
        <Field label="Comision (%)">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.comisionPorcentaje}
            onChange={(e) => setForm({ ...form, comisionPorcentaje: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Comentarios">
        <textarea
          rows="3"
          placeholder="Condiciones acordadas, fechas clave, estado del credito..."
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />
      </Field>
    </Modal>
  );
}
