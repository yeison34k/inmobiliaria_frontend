import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useVisitMutations } from '../../application/useVisitsQueries.js';
import { VISIT_OUTCOME_META, VISIT_OUTCOMES } from '../../domain/visit.js';

/**
 * Cierra la visita con su resultado.
 * Sin resultado no hay seguimiento, por eso es obligatorio elegir uno.
 */
export function VisitOutcomeModal({ visita, onClose, onDone }) {
  const toast = useToast();
  const { complete } = useVisitMutations({ onError: (e) => toast.error(e.displayMessage) });
  const [resultado, setResultado] = useState('interesado');
  const [notas, setNotas] = useState('');

  const confirmar = () => complete.mutate({ id: visita.id, resultado, notas: notas || undefined }, {
    onSuccess: (r) => {
      toast.success('Visita cerrada');
      onDone?.(r);
      onClose();
    },
  });

  return (
    <Modal
      title={`Resultado de la visita ${visita.codigo}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn--primary" disabled={complete.isPending} onClick={confirmar}>
            {complete.isPending ? 'Guardando...' : 'Registrar resultado'}
          </button>
        </>
      }
    >
      <p className="modal__lead">
        <strong>{visita.propiedad?.titulo}</strong><br />
        Cliente: {visita.cliente?.nombre} · {visita.cliente?.telefono ?? visita.cliente?.email ?? 'sin contacto'}
      </p>

      <div className="opciones">
        {VISIT_OUTCOMES.map((clave) => (
          <button
            key={clave}
            type="button"
            className={resultado === clave ? 'opcion is-activa' : 'opcion'}
            onClick={() => setResultado(clave)}
          >
            {VISIT_OUTCOME_META[clave].label}
          </button>
        ))}
      </div>

      <Field label="Que dijo el cliente" hint="Lo que sirva para el siguiente contacto">
        <textarea rows="4" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </Field>
    </Modal>
  );
}
