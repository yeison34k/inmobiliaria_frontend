import { Field } from '@shared/ui/Field.jsx';
import { specFor } from '../../domain/detailSpecs.js';

/**
 * Campos especificos del tipo de propiedad, generados desde DETAIL_SPECS.
 * Un lote nunca muestra "banos" porque su spec no lo declara.
 */
export function PropertyDetailFields({ tipo, values, onChange }) {
  const spec = specFor(tipo);
  if (!spec.length) return null;

  const set = (name, value) => onChange({ ...values, [name]: value });

  return (
    <fieldset className="fieldset">
      <legend>Datos del tipo: {tipo}</legend>
      <div className="form-grid">
        {spec.map((field) => {
          if (field.type === 'boolean') {
            return (
              <label key={field.name} className="checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.name])}
                  onChange={(e) => set(field.name, e.target.checked)}
                />
                <span>{field.label}</span>
              </label>
            );
          }

          if (field.type === 'select') {
            return (
              <Field key={field.name} label={field.label}>
                <select value={values[field.name] ?? ''} onChange={(e) => set(field.name, e.target.value)}>
                  {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </Field>
            );
          }

          if (field.type === 'tags') {
            const value = Array.isArray(values[field.name])
              ? values[field.name].join(', ')
              : values[field.name] ?? '';
            return (
              <Field key={field.name} label={field.label} hint={field.hint}>
                <input value={value} onChange={(e) => set(field.name, e.target.value)} />
              </Field>
            );
          }

          return (
            <Field key={field.name} label={field.label} required={field.required}>
              <input
                type="number"
                min={field.min}
                step="any"
                value={values[field.name] ?? ''}
                onChange={(e) => set(field.name, e.target.value)}
              />
            </Field>
          );
        })}
      </div>
    </fieldset>
  );
}
