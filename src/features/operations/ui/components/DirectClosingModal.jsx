import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { ContactPicker } from '@features/contacts';
import { useOperationMutations } from '../../application/useOperationsQueries.js';

/** Atajo "marcar como vendida/rentada": crea la operacion ya cerrada. */
export function DirectClosingModal({ propiedad, onClose, onDone }) {
  const toast = useToast();
  const { directClosing } = useOperationMutations({ onError: (e) => toast.error(e.displayMessage) });
  const [form, setForm] = useState({
    clienteId: null,
    propietarioId: propiedad.propietarioId ?? null,
    precioCierre: String(propiedad.precio ?? ''),
    comisionPorcentaje: '3',
    notas: '',
  });

  const estadoFinal = propiedad.operacion === 'venta' ? 'vendida' : 'rentada';

  const confirmar = () => {
    if (!form.clienteId) {
      toast.error('Seleccione el cliente de la operacion');
      return;
    }
    directClosing.mutate({
      propiedadId: propiedad.id,
      clienteId: form.clienteId,
      propietarioId: form.propietarioId ?? undefined,
      precioCierre: Number(form.precioCierre),
      comisionPorcentaje: form.comisionPorcentaje === '' ? undefined : Number(form.comisionPorcentaje),
      notas: form.notas || undefined,
    }, {
      onSuccess: (operacion) => {
        toast.success(`Operacion ${operacion.codigo} registrada y cerrada`);
        onDone?.(operacion);
        onClose();
      },
    });
  };

  return (
    <Modal
      title={`Marcar ${propiedad.codigo} como ${estadoFinal}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn--primary" disabled={directClosing.isPending} onClick={confirmar}>
            {directClosing.isPending ? 'Registrando...' : 'Registrar cierre'}
          </button>
        </>
      }
    >
      <p className="modal__lead">
        Sin reserva previa. Igual se crea la operacion para no perder el
        historial comercial. Precio de lista: {formatMoney(propiedad.precio, propiedad.moneda)}
      </p>

      <div className="form-grid">
        <ContactPicker
          label="Cliente"
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
        <Field label="Precio final de cierre" required>
          <input
            type="number"
            min="1"
            value={form.precioCierre}
            onChange={(e) => setForm({ ...form, precioCierre: e.target.value })}
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
        <textarea rows="3" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
      </Field>
    </Modal>
  );
}
