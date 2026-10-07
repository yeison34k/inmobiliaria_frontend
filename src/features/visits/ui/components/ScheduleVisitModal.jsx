import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { ContactPicker } from '@features/contacts';
import { PropertyPicker } from '@features/properties';
import { useVisitMutations } from '../../application/useVisitsQueries.js';
import { DURACIONES } from '../../domain/visit.js';

/** Redondea al proximo cuarto de hora: agendar a las 10:07 no tiene sentido. */
function proximaFranja(base = new Date()) {
  const fecha = new Date(base.getTime() + 60 * 60_000);
  fecha.setMinutes(Math.ceil(fecha.getMinutes() / 15) * 15, 0, 0);
  const desfase = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - desfase).toISOString().slice(0, 16);
}

/**
 * Agenda una visita.
 * Se abre desde la ficha de una propiedad, desde la agenda general o desde una consulta web.
 */
export function ScheduleVisitModal({ propiedad: initialPropiedad, consulta, onClose, onDone }) {
  const toast = useToast();
  const { schedule } = useVisitMutations({ onError: (e) => toast.error(e.displayMessage) });

  const [selectedProp, setSelectedProp] = useState(initialPropiedad ?? null);
  const [propiedadId, setPropiedadId] = useState(initialPropiedad?.id ?? null);
  const [form, setForm] = useState({
    contactoId: consulta?.contactoId ?? null,
    fechaInicio: proximaFranja(consulta?.fechaPreferida ? new Date(consulta.fechaPreferida) : undefined),
    duracionMin: 45,
    notas: consulta?.mensaje ? `Consulta web: ${consulta.mensaje}`.slice(0, 500) : '',
  });

  const confirmar = () => {
    const targetPropId = initialPropiedad?.id || propiedadId;
    if (!targetPropId) {
      toast.error('Seleccione la propiedad a visitar');
      return;
    }
    if (!form.contactoId) {
      toast.error('Seleccione el cliente que visita');
      return;
    }
    schedule.mutate({
      propiedadId: targetPropId,
      contactoId: form.contactoId,
      consultaId: consulta?.id,
      fechaInicio: new Date(form.fechaInicio).toISOString(),
      duracionMin: Number(form.duracionMin),
      notas: form.notas || undefined,
    }, {
      onSuccess: (visita) => {
        toast.success(`Visita ${visita.codigo} agendada`);
        onDone?.(visita);
        onClose();
      },
    });
  };

  const propActual = initialPropiedad || selectedProp;

  return (
    <Modal
      title={propActual ? `Agendar visita · ${propActual.codigo}` : 'Agendar nueva visita'}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn--primary" disabled={schedule.isPending} onClick={confirmar}>
            {schedule.isPending ? 'Agendando...' : 'Agendar visita'}
          </button>
        </>
      }
    >
      {initialPropiedad ? (
        <p className="modal__lead">
          <strong>{initialPropiedad.nombrePublico ?? initialPropiedad.titulo}</strong><br />
          {initialPropiedad.direccion ?? initialPropiedad.ubicacion?.etiqueta}
          {consulta ? <> · desde la consulta de {consulta.nombre}</> : null}
        </p>
      ) : (
        <div style={{ marginBottom: '1.25rem' }}>
          <PropertyPicker
            value={propiedadId}
            onChange={setPropiedadId}
            onSelectProperty={setSelectedProp}
            required
          />
        </div>
      )}

      {consulta?.fechaPreferida ? (
        <p className="field__hint" style={{ marginBottom: '1rem' }}>
          El cliente pidio preferentemente:{' '}
          {new Intl.DateTimeFormat('es-CO', { dateStyle: 'full', timeStyle: 'short' })
            .format(new Date(consulta.fechaPreferida))}
        </p>
      ) : null}

      <ContactPicker
        label="Cliente que visita"
        tipo="cliente"
        required
        value={form.contactoId}
        onChange={(contactoId) => setForm({ ...form, contactoId })}
      />

      <div className="form-grid">
        <Field label="Fecha y hora" required>
          <input
            type="datetime-local"
            value={form.fechaInicio}
            onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
          />
        </Field>
        <Field label="Duracion" hint="El asesor no puede tener dos visitas encima">
          <select
            value={form.duracionMin}
            onChange={(e) => setForm({ ...form, duracionMin: e.target.value })}
          >
            {DURACIONES.map((min) => <option key={min} value={min}>{min} minutos</option>)}
          </select>
        </Field>
      </div>

      <Field label="Notas para el asesor">
        <textarea
          rows="3"
          placeholder="Que busca el cliente, condiciones especiales, como llegar..."
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />
      </Field>
    </Modal>
  );
}
