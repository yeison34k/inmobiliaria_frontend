import { useRef, useState } from 'react';
import { Badge } from '@shared/ui/Badge.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useTemplateMutations, useTemplates } from '../../application/useTemplatesQueries.js';
import { CHANNEL_META, VARIABLES, claveDesde, plantillaVacia } from '../../domain/template.js';

/** Variables escritas en la plantilla que el sistema no sabe reemplazar. */
const desconocidas = (cuerpo) => {
  const usadas = [...String(cuerpo ?? '').matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)].map((m) => m[1]);
  return [...new Set(usadas)].filter((v) => !(v in VARIABLES));
};

/**
 * Editor de plantillas.
 *
 * El punto no es tener textos guardados sino que la calidad del mensaje
 * no dependa de quien lo escriba: el asesor elige, revisa y envia desde
 * su propio numero. Aqui solo se decide que va a decir.
 */
export function TemplatesPanel() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const cuerpoRef = useRef(null);

  const { data: plantillas = [], isLoading } = useTemplates();
  const { save, remove } = useTemplateMutations({ onError: (e) => toast.error(e.displayMessage) });

  const sinReemplazo = form ? desconocidas(form.cuerpo) : [];

  /** Inserta la variable donde esta el cursor, no al final del texto. */
  const insertar = (variable) => {
    const campo = cuerpoRef.current;
    const marca = `{{${variable}}}`;
    if (!campo) {
      setForm({ ...form, cuerpo: `${form.cuerpo}${marca}` });
      return;
    }
    const { selectionStart: inicio, selectionEnd: fin } = campo;
    const cuerpo = `${form.cuerpo.slice(0, inicio)}${marca}${form.cuerpo.slice(fin)}`;
    setForm({ ...form, cuerpo });
    requestAnimationFrame(() => {
      campo.focus();
      campo.setSelectionRange(inicio + marca.length, inicio + marca.length);
    });
  };

  const guardar = () => {
    const payload = {
      id: form.id || undefined,
      clave: form.clave || claveDesde(form.nombre),
      nombre: form.nombre,
      canal: form.canal,
      asunto: form.canal === 'correo' ? (form.asunto || null) : null,
      cuerpo: form.cuerpo,
    };

    save.mutateAsync(payload)
      .then(() => {
        toast.success('Plantilla guardada');
        setForm(null);
      })
      .catch(() => {});
  };

  if (isLoading) return <Spinner />;

  return (
    <article className="plantillas">
      <header className="plantillas__header">
        <div>
          <h3>Plantillas de mensaje</h3>
          <p className="panel__hint">
            Lo que el asesor manda por WhatsApp o correo sin redactarlo de cero.
            Las variables entre llaves se reemplazan al usarla.
          </p>
        </div>
        {!form ? (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setForm({ ...plantillaVacia })}>
            Nueva plantilla
          </button>
        ) : null}
      </header>

      {plantillas.length === 0 && !form ? (
        <p className="panel__hint">Todavia no hay plantillas. Cree la primera y quedara disponible para todo el equipo.</p>
      ) : null}

      <ul className="plantillas__lista">
        {plantillas.map((p) => {
          const meta = CHANNEL_META[p.canal] ?? { label: p.canal, tone: 'neutral' };
          return (
            <li key={p.id}>
              <div className="plantillas__info">
                <strong>{p.nombre}</strong>
                <Badge tone={meta.tone}>{meta.label}</Badge>
                {p.variablesDesconocidas?.length ? (
                  <Badge tone="danger">revisar variables</Badge>
                ) : null}
                <small className="texto-tenue">{p.clave}</small>
                <p className="plantillas__extracto">{p.cuerpo}</p>
              </div>
              <div className="plantillas__acciones">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setForm({ ...plantillaVacia, ...p, asunto: p.asunto ?? '' })}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => remove.mutate(p.id, { onSuccess: () => toast.success('Plantilla eliminada') })}
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {form ? (
        <div className="plantillas__editor">
          <div className="form-grid">
            <Field label="Nombre" required hint="Como la reconoce el equipo">
              <input
                value={form.nombre}
                placeholder="Confirmar visita"
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </Field>
            <Field label="Canal">
              <select value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value })}>
                <option value="whatsapp">WhatsApp</option>
                <option value="correo">Correo</option>
              </select>
            </Field>
            {form.canal === 'correo' ? (
              <Field label="Asunto">
                <input
                  value={form.asunto ?? ''}
                  placeholder="Su visita del {{fecha}}"
                  onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                />
              </Field>
            ) : null}
          </div>

          <Field label="Mensaje" required>
            <textarea
              ref={cuerpoRef}
              rows={7}
              value={form.cuerpo}
              placeholder="Hola {{cliente}}, le confirmo la visita a {{propiedad}} el {{fecha}}."
              onChange={(e) => setForm({ ...form, cuerpo: e.target.value })}
            />
          </Field>

          <div className="plantillas__variables">
            <span className="plantillas__variables-titulo">Insertar variable</span>
            {Object.entries(VARIABLES).map(([clave, descripcion]) => (
              <button
                key={clave}
                type="button"
                className="chip"
                title={descripcion}
                onClick={() => insertar(clave)}
              >
                {clave}
              </button>
            ))}
          </div>

          {sinReemplazo.length ? (
            <p className="plantillas__alerta">
              {sinReemplazo.length === 1
                ? `La variable {{${sinReemplazo[0]}}} no existe y se enviara tal cual.`
                : `Estas variables no existen y se enviaran tal cual: ${sinReemplazo.map((v) => `{{${v}}}`).join(', ')}.`}
            </p>
          ) : null}

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setForm(null)}>Cancelar</button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={save.isPending || !form.nombre.trim() || form.cuerpo.trim().length < 5}
              onClick={guardar}
            >
              Guardar plantilla
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
