import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useActiveOperation, useOperationMutations } from '../../application/useOperationsQueries.js';
import { comisionEstimada } from '../../domain/operation.js';

/**
 * Paso 2: cierre de la operacion.
 * Acepta la operacion directamente o una propiedad reservada (busca su
 * reserva activa), porque se abre tanto desde el listado de propiedades
 * como desde el de operaciones.
 */
export function CloseOperationModal({ operacion, propiedad, onClose, onDone }) {
  const toast = useToast();
  const { data: activa, isLoading } = useActiveOperation(operacion ? null : propiedad?.id);
  const target = operacion ?? activa;

  const [form, setForm] = useState({ precioCierre: '', comisionPorcentaje: '', notas: '' });
  const { close } = useOperationMutations({ onError: (e) => toast.error(e.displayMessage) });

  if (!operacion && isLoading) {
    return <Modal title="Cerrar operacion" onClose={onClose}><Spinner /></Modal>;
  }

  if (!target) {
    return (
      <Modal title="Cerrar operacion" onClose={onClose}>
        <p>Esta propiedad no tiene una reserva activa. Registre primero la reserva.</p>
      </Modal>
    );
  }

  const precioLista = target.precioLista ?? propiedad?.precio;
  const porcentaje = form.comisionPorcentaje === '' ? target.comisionPorcentaje : form.comisionPorcentaje;
  const comision = comisionEstimada(form.precioCierre, porcentaje);
  const estadoFinal = target.tipo === 'venta' ? 'vendida' : 'rentada';

  const confirmar = () => {
    close.mutate({
      id: target.id,
      precioCierre: Number(form.precioCierre),
      comisionPorcentaje: form.comisionPorcentaje === '' ? undefined : Number(form.comisionPorcentaje),
      notas: form.notas || undefined,
    }, {
      onSuccess: (result) => {
        toast.success(`Operacion ${result.codigo} cerrada`);
        onDone?.(result);
        onClose();
      },
    });
  };

  return (
    <Modal
      title={`Cerrar operacion ${target.codigo}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={close.isPending || !form.precioCierre}
            onClick={confirmar}
          >
            {close.isPending ? 'Cerrando...' : `Cerrar y marcar ${estadoFinal}`}
          </button>
        </>
      }
    >
      <p className="modal__lead">
        <strong>{target.propiedad?.titulo ?? propiedad?.titulo}</strong><br />
        Cliente: {target.cliente?.nombre ?? '-'} · Precio de lista: {formatMoney(precioLista)}
        {target.montoSenia ? <> · Senia recibida: {formatMoney(target.montoSenia)}</> : null}
      </p>

      <div className="form-grid">
        <Field label="Precio final de cierre" required hint="Es el valor que queda en el historial">
          <input
            type="number"
            min="1"
            value={form.precioCierre}
            onChange={(e) => setForm({ ...form, precioCierre: e.target.value })}
          />
        </Field>
        <Field
          label="Comision (%)"
          hint={comision ? `Comision estimada: ${formatMoney(comision)}` : 'Sin comision'}
        >
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder={target.comisionPorcentaje ?? ''}
            value={form.comisionPorcentaje}
            onChange={(e) => setForm({ ...form, comisionPorcentaje: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Comentarios del cierre">
        <textarea
          rows="3"
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />
      </Field>
    </Modal>
  );
}
