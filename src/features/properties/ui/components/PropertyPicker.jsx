import { useState } from 'react';
import { Field } from '@shared/ui/Field.jsx';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue.js';
import { usePropertiesSearch } from '../../application/usePropertiesQueries.js';

export function PropertyPicker({ label = 'Propiedad a visitar', value, onChange, onSelectProperty, required = false }) {
  const [texto, setTexto] = useState('');
  const q = useDebouncedValue(texto, 300);

  const { data } = usePropertiesSearch({
    q: q || undefined,
    estados: 'publicada,borrador,reservada',
    pageSize: 15,
  });

  const opciones = data?.items ?? [];
  const seleccionado = opciones.find((p) => p.id === value);

  const handleSelect = (e) => {
    const id = e.target.value || null;
    onChange(id);
    const prop = opciones.find((p) => p.id === id);
    onSelectProperty?.(prop ?? null);
  };

  return (
    <div className="picker">
      <Field
        label={label}
        required={required}
        hint={seleccionado ? `${seleccionado.codigo} · ${seleccionado.tipo} · ${seleccionado.direccion ?? ''}` : undefined}
      >
        <input
          type="search"
          placeholder="Buscar inmueble por título o código"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </Field>

      <select value={value ?? ''} onChange={handleSelect}>
        <option value="">— Seleccione una propiedad —</option>
        {opciones.map((p) => (
          <option key={p.id} value={p.id}>
            [{p.codigo}] {p.titulo} ({p.tipo} - {p.operacion})
          </option>
        ))}
      </select>
    </div>
  );
}
