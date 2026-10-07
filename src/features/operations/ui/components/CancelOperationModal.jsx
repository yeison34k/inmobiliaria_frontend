import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useActiveOperation, useOperationMutations } from '../../application/useOperationsQueries.js';

const MOTIVOS = [
  'Credito negado',
  'El cliente se retiro',
  'El propietario se retiro',
  'No se acordo el precio',
  'Problemas de documentacion',
];

/** Caida de reserva: la propiedad vuelve al mercado y queda el registro. */
export function CancelOperationModal({ operacion, propiedad, onClose, onDone }) {
  const toast = useToast();
  const { data: activa, isLoading } = useActiveOperation(operacion ? null : propiedad?.id);
  const target = operacion ?? activa;
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [detalle, setDetalle] = useState('');
  const { cancel } = useOperationMutations({ onError: (e) => toast.error(e.displayMessage) });

  if (!operacion && isLoading) {
    return <Modal title="Cancelar reserva" onClose={onClose}><Spinner /></Modal>;
  }
  if (!target) {
    return (
      <Modal title="Cancelar reserva" onClose={onClose}>
        <p>No hay una reserva activa para esta propiedad.</p>
      </Modal>
    );
  }

  const confirmar = () => {
    const texto = detalle ? `${motivo}: ${detalle}` : motivo;
    cancel.mutate({ id: target.id, motivo: texto.slice(0, 255) }, {
      onSuccess: (result) => {
        toast.success('Reserva cancelada, la propiedad volvio a publicarse');
        onDone?.(result);
        onClose();
      },
    });
  };

  return (
    <Modal
      title={`Cancelar reserva ${target.codigo}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Volver</button>
          <button type="button" className="btn btn--danger" disabled={cancel.isPending} onClick={confirmar}>
            {cancel.isPending ? 'Cancelando...' : 'Confirmar caida'}
          </button>
        </>
      }
    >
      <p className="modal__lead">
        La propiedad vuelve al estado <strong>publicada</strong> y la caida queda
        registrada para el calculo de la tasa de caida.
      </p>

      <Field label="Motivo" required>
        <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
          {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Field>

      <Field label="Detalle (opcional)">
        <textarea rows="3" value={detalle} onChange={(e) => setDetalle(e.target.value)} />
      </Field>
    </Modal>
  );
}
