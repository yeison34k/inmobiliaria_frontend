import { useState } from 'react';
import { Field } from '@shared/ui/Field.jsx';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue.js';
import { useContacts } from '../../application/useContactsQueries.js';
import { ContactFormModal } from './ContactFormModal.jsx';

/**
 * Selector de contactos usado por el flujo de operaciones.
 * `tipo` filtra por rol (cliente / propietario) para no ofrecer contactos
 * que el backend rechazaria.
 */
export function ContactPicker({ label, tipo, value, onChange, required = false }) {
  const [texto, setTexto] = useState('');
  const [creando, setCreando] = useState(false);
  const q = useDebouncedValue(texto, 300);
  const { data } = useContacts({ q: q || undefined, tipo, activo: 'true', pageSize: 20 });
  const opciones = data?.items ?? [];
  const seleccionado = opciones.find((c) => c.id === value);

  return (
    <div className="picker">
      <Field label={label} required={required} hint={seleccionado ? seleccionado.email ?? seleccionado.telefono : undefined}>
        <input
          type="search"
          placeholder="Buscar por nombre, email o documento"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </Field>

      <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">— Sin seleccionar —</option>
        {opciones.map((contacto) => (
          <option key={contacto.id} value={contacto.id}>
            {contacto.nombreCompleto} {contacto.documento ? `· ${contacto.documento}` : ''}
          </option>
        ))}
      </select>

      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCreando(true)}>
        + Nuevo contacto
      </button>

      {creando ? (
        <ContactFormModal
          onClose={() => setCreando(false)}
          onSaved={(contacto) => onChange(contacto.id)}
        />
      ) : null}
    </div>
  );
}
