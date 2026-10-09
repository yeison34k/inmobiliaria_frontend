import { ARRIENDOS } from '@app/config/features.js';
import { useState } from 'react';
import { Badge } from '@shared/ui/Badge.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useMatches, useRequirementMutations, useRequirements } from '../../application/useRequirementsQueries.js';
import { TIPOS, requerimientoVacio, tonoPuntaje } from '../../domain/requirement.js';

const numero = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

/**
 * Que busca este cliente, dentro de su ficha.
 *
 * Al guardar, el sistema barre el inventario y deja las coincidencias a la
 * vista: el asesor sale de aqui con algo concreto que mostrar.
 */
export function RequirementsPanel({ contactoId }) {
  const toast = useToast();
  const [form, setForm] = useState(null);

  const { data: requerimientos = [], isLoading } = useRequirements({ contactoId });
  const { data: coincidencias = [] } = useMatches({ contactoId });
  const { create, update, deactivate, rematch, updateMatch } = useRequirementMutations({
    onError: (e) => toast.error(e.displayMessage),
  });

  const guardar = () => {
    const payload = {
      contactoId,
      titulo: form.titulo || undefined,
      operacion: form.operacion,
      tipos: form.tipos,
      ciudad: form.ciudad || undefined,
      precioMin: numero(form.precioMin),
      precioMax: numero(form.precioMax),
      habitacionesMin: numero(form.habitacionesMin),
      banosMin: numero(form.banosMin),
      areaMin: numero(form.areaMin),
      notas: form.notas || undefined,
    };

    const accion = form.id
      ? update.mutateAsync({ id: form.id, ...payload })
      : create.mutateAsync(payload);

    accion.then((r) => {
      toast.success(
        r.coincidencias
          ? `Guardado. Ya hay ${r.coincidencias} ${r.coincidencias === 1 ? 'opcion' : 'opciones'} que encajan`
          : 'Requerimiento guardado. Le avisamos cuando entre algo que encaje',
      );
      setForm(null);
    }).catch(() => {});
  };

  const alternarTipo = (tipo) => setForm({
    ...form,
    tipos: form.tipos.includes(tipo)
      ? form.tipos.filter((t) => t !== tipo)
      : [...form.tipos, tipo],
  });

  if (isLoading) return <Spinner />;

  return (
    <article className="panel">
      <h2>
        Que busca
        {coincidencias.length ? <span className="panel__count">{coincidencias.length} coincidencias</span> : null}
      </h2>

      {requerimientos.length === 0 && !form ? (
        <p className="panel__hint">
          Registre que busca este cliente y le avisamos apenas entre una
          propiedad que encaje.
        </p>
      ) : null}

      <ul className="requerimientos">
        {requerimientos.map((r) => (
          <li key={r.id}>
            <div className="requerimientos__info">
              <strong>{r.titulo || r.resumen}</strong>
              {r.titulo ? <small>{r.resumen}</small> : null}
              {r.notas ? <small className="texto-tenue">{r.notas}</small> : null}
            </div>
            <div className="requerimientos__acciones">
              {r.coincidencias ? <Badge tone="warning">{r.coincidencias} nuevas</Badge> : null}
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => rematch.mutate(r.id, { onSuccess: () => toast.success('Inventario revisado') })}
              >
                Buscar ahora
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setForm({ ...requerimientoVacio, ...r, id: r.id })}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => deactivate.mutate(r.id)}
              >
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {form ? (
        <div className="repetidor">
          <div className="form-grid">
            <Field label="Titulo" hint="Como lo reconoce usted">
              <input
                value={form.titulo}
                placeholder="Casa familiar en la sabana"
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </Field>
            <Field label="Operacion">
              <select value={form.operacion} onChange={(e) => setForm({ ...form, operacion: e.target.value })}>
                <option value="venta">Compra</option>
                {ARRIENDOS ? <option value="arriendo">Arriendo</option> : null}
              </select>
            </Field>
            <Field label="Ciudad">
              <input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            </Field>
          </div>

          <Field label="Tipo de inmueble" hint="Deje vacio si le sirve cualquiera">
            <div className="status-filter">
              {Object.entries(TIPOS).map(([clave, label]) => (
                <button
                  key={clave}
                  type="button"
                  className={form.tipos.includes(clave) ? 'chip chip--active' : 'chip'}
                  onClick={() => alternarTipo(clave)}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <div className="form-grid">
            <Field label="Presupuesto desde">
              <input type="number" min="0" value={form.precioMin ?? ''}
                onChange={(e) => setForm({ ...form, precioMin: e.target.value })} />
            </Field>
            <Field label="Presupuesto hasta" hint="Toleramos un 10% por encima">
              <input type="number" min="0" value={form.precioMax ?? ''}
                onChange={(e) => setForm({ ...form, precioMax: e.target.value })} />
            </Field>
            <Field label="Habitaciones min.">
              <input type="number" min="0" value={form.habitacionesMin ?? ''}
                onChange={(e) => setForm({ ...form, habitacionesMin: e.target.value })} />
            </Field>
            <Field label="Area min. (m2)">
              <input type="number" min="0" value={form.areaMin ?? ''}
                onChange={(e) => setForm({ ...form, areaMin: e.target.value })} />
            </Field>
          </div>

          <Field label="Notas">
            <input
              value={form.notas ?? ''}
              placeholder="Que no esté sobre avenida; necesita dos parqueaderos"
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </Field>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setForm(null)}>Cancelar</button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={create.isPending || update.isPending}
              onClick={guardar}
            >
              Guardar y buscar
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setForm({ ...requerimientoVacio })}>
          + Registrar que busca
        </button>
      )}

      {coincidencias.length ? (
        <>
          <h3 className="section-title">Opciones que encajan</h3>
          <ul className="coincidencias">
            {coincidencias.map((c) => (
              <li key={c.id}>
                {c.propiedad.imagen
                  ? <img src={c.propiedad.imagen} alt="" />
                  : <span className="coincidencias__vacia" />}
                <div className="coincidencias__info">
                  <strong>{c.propiedad.titulo}</strong>
                  <small>
                    {formatMoney(c.propiedad.precio, c.propiedad.moneda)} · {c.propiedad.ubicacion}
                  </small>
                  {c.motivos.length ? <small className="texto-tenue">{c.motivos.join(' · ')}</small> : null}
                </div>
                <div className="coincidencias__acciones">
                  <Badge tone={tonoPuntaje(c.puntaje)}>{c.puntaje}%</Badge>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => updateMatch.mutate({ id: c.id, estado: 'descartada' })}
                  >
                    No sirve
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}
