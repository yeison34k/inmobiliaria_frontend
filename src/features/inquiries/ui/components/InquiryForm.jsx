import { useState } from 'react';
import { Field } from '@shared/ui/Field.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import { useInquiryMutations } from '../../application/useInquiriesQueries.js';

/** Formulario publico de contacto que aparece en la ficha de la propiedad. */
export function InquiryForm({ propiedadId, titulo }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);
  const { submit } = useInquiryMutations({ onError: (e) => setError(e.displayMessage) });

  if (enviado) {
    return (
      <aside className="contact-box contact-box--done">
        <h3>{t('inquiry.successTitle')}</h3>
        <p>{t('inquiry.successText')}</p>
      </aside>
    );
  }

  const onSubmit = (event) => {
    event.preventDefault();
    setError(null);
    submit.mutate(
      { ...form, propiedadId, telefono: form.telefono || undefined },
      { onSuccess: () => setEnviado(true) },
    );
  };

  return (
    <form className="contact-box" onSubmit={onSubmit}>
      <h3>{titulo ? t('inquiry.titleProperty') : t('inquiry.titleDefault')}</h3>
      {titulo ? <p className="contact-box__hint">{t('inquiry.hintAbout')} {titulo}</p> : null}

      <Field label={t('inquiry.name')} required>
        <input value={form.nombre} required onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
      </Field>
      <Field label={t('inquiry.email')} required>
        <input type="email" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field label={t('inquiry.phone')}>
        <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
      </Field>
      <Field label={t('inquiry.message')} required hint={t('inquiry.messageHint')}>
        <textarea
          rows="4"
          required
          minLength={10}
          value={form.mensaje}
          onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
        />
      </Field>

      {error ? <p className="field__error" role="alert">{error}</p> : null}

      <button type="submit" className="btn btn--primary" disabled={submit.isPending}>
        {submit.isPending ? t('inquiry.sending') : t('inquiry.send')}
      </button>
    </form>
  );
}
