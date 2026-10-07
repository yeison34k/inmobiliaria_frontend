import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useContactMutations } from '../../application/useContactsQueries.js';
import { CONTACT_TYPE_LABELS, ContactType, ORIGIN_LABELS } from '../../domain/contact.js';

const vacio = {
  nombre: '', apellido: '', tipo: ContactType.CLIENTE,
  email: '', telefono: '', documento: '', notas: '',
  origen: 'otro',
};

export function ContactFormModal({ contacto, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(contacto ? { ...vacio, ...contacto } : vacio);
  const { create, update } = useContactMutations({ onError: (e) => toast.error(e.displayMessage) });
  const guardando = create.isPending || update.isPending;

  const guardar = () => {
    const payload = Object.fromEntries(
      Object.entries(form).filter(([key, value]) =>
        ['nombre', 'apellido', 'tipo', 'email', 'telefono', 'documento', 'notas', 'origen',
          'presupuestoMin', 'presupuestoMax', 'financiacion', 'plazo'].includes(key)
        && value !== '' && value !== null),
    );

    const mutation = contacto
      ? update.mutateAsync({ id: contacto.id, ...payload })
      : create.mutateAsync(payload);

    mutation.then((saved) => {
      toast.success(contacto ? 'Contacto actualizado' : 'Contacto creado');
      onSaved?.(saved);
      onClose();
    }).catch(() => {});
  };

  return (
    <Modal
      title={contacto ? 'Editar contacto' : 'Nuevo contacto'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn--primary" disabled={guardando} onClick={guardar}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Nombre" required>
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </Field>
        <Field label="Apellido">
          <input value={form.apellido ?? ''} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
        </Field>
        <Field label="Tipo" hint="Define si puede comprar, vender o ambas">
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {Object.entries(CONTACT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Email">
          <input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Telefono" hint="Email o telefono: al menos uno">
          <input value={form.telefono ?? ''} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </Field>
        <Field label="Documento">
          <input value={form.documento ?? ''} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
        </Field>
        <Field label="Origen o canal de captación">
          <select value={form.origen ?? 'otro'} onChange={(e) => setForm({ ...form, origen: e.target.value })}>
            {Object.entries(ORIGIN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset className="fieldset">
        <legend>Calificacion</legend>
        <p className="field__hint">
          Define a quien se le dedica el dia: quien ya tiene como pagar y
          necesita mudarse pronto va primero.
        </p>
        <div className="form-grid">
          <Field label="Presupuesto desde">
            <input
              type="number" min="0"
              value={form.presupuestoMin ?? ''}
              onChange={(e) => setForm({ ...form, presupuestoMin: e.target.value })}
            />
          </Field>
          <Field label="Presupuesto hasta">
            <input
              type="number" min="0"
              value={form.presupuestoMax ?? ''}
              onChange={(e) => setForm({ ...form, presupuestoMax: e.target.value })}
            />
          </Field>
          <Field label="Como paga">
            <select
              value={form.financiacion ?? 'no_definido'}
              onChange={(e) => setForm({ ...form, financiacion: e.target.value })}
            >
              {Object.entries(FINANCIACION_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Cuando necesita">
            <select
              value={form.plazo ?? 'explorando'}
              onChange={(e) => setForm({ ...form, plazo: e.target.value })}
            >
              {Object.entries(PLAZO_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <Field label="Notas">
        <textarea rows="3" value={form.notas ?? ''} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
      </Field>
    </Modal>
  );
}
