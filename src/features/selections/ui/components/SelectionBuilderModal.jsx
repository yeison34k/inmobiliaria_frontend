import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { ContactPicker } from '@features/contacts';
import { PropertyPicker } from '@features/properties';
import { useSelectionMutations } from '../../application/useSelectionsQueries.js';
import { MAX_PROPIEDADES } from '../../domain/selection.js';

const vacio = { titulo: '', mensaje: '', contactoId: null };

/**
 * Arma la seleccion: a quien va, que opciones lleva y que nota
 * acompana a cada una. La nota por propiedad es lo que diferencia un
 * envio pensado de una lista de enlaces.
 */
export function SelectionBuilderModal({ seleccion, onClose }) {
  const toast = useToast();
  const { create, update } = useSelectionMutations({ onError: (e) => toast.error(e.displayMessage) });

  const [form, setForm] = useState(seleccion ? {
    titulo: seleccion.titulo,
    mensaje: seleccion.mensaje ?? '',
    contactoId: seleccion.contactoId ?? null,
  } : vacio);

  const [items, setItems] = useState(
    (seleccion?.propiedades ?? []).map((p) => ({
      propiedadId: p.propiedadId,
      nota: p.nota ?? '',
      resumen: p.resumen ?? null,
    })),
  );

  const agregar = (propiedad) => {
    if (!propiedad) return;
    if (items.some((i) => i.propiedadId === propiedad.id)) {
      toast.info('Esa propiedad ya esta en la seleccion');
      return;
    }
    if (items.length >= MAX_PROPIEDADES) {
      toast.error(`Maximo ${MAX_PROPIEDADES} opciones: mas confunden al cliente`);
      return;
    }
    setItems([...items, { propiedadId: propiedad.id, nota: '', resumen: propiedad }]);
  };

  const guardar = () => {
    if (!form.titulo.trim()) {
      toast.error('Pongale un titulo a la seleccion');
      return;
    }
    if (!items.length) {
      toast.error('Agregue al menos una propiedad');
      return;
    }

    const payload = {
      ...form,
      mensaje: form.mensaje || undefined,
      contactoId: form.contactoId ?? undefined,
      propiedades: items.map((i) => ({ propiedadId: i.propiedadId, nota: i.nota || null })),
    };

    const accion = seleccion
      ? update.mutateAsync({ id: seleccion.id, ...payload })
      : create.mutateAsync(payload);

    accion.then(() => {
      toast.success(seleccion ? 'Seleccion actualizada' : 'Seleccion creada');
      onClose();
    }).catch(() => {});
  };

  const guardando = create.isPending || update.isPending;

  return (
    <Modal
      title={seleccion ? `Editar ${seleccion.codigo}` : 'Nueva seleccion'}
      onClose={onClose}
      wide
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
        <Field label="Titulo" required hint="Lo primero que lee el cliente">
          <input
            value={form.titulo}
            placeholder="Tres opciones en el norte"
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
        </Field>
        <ContactPicker
          label="Cliente"
          tipo="cliente"
          value={form.contactoId}
          onChange={(contactoId) => setForm({ ...form, contactoId })}
        />
      </div>

      <Field label="Mensaje" hint="Por que le manda justo estas opciones">
        <textarea
          rows="2"
          value={form.mensaje}
          placeholder="Ana, estas son las que mejor encajan con lo que me conto."
          onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
        />
      </Field>

      <fieldset className="fieldset">
        <legend>Opciones ({items.length}/{MAX_PROPIEDADES})</legend>

        <PropertyPicker
          label="Agregar propiedad"
          value={null}
          onChange={() => {}}
          onSelectProperty={agregar}
        />

        {items.length === 0 ? (
          <p className="panel__hint">Agregue entre tres y cinco opciones: es lo que mejor funciona.</p>
        ) : (
          <ul className="sel-items">
            {items.map((item, index) => (
              <li key={item.propiedadId}>
                <div className="sel-items__info">
                  <strong>{item.resumen?.titulo ?? item.resumen?.nombrePublico ?? 'Propiedad'}</strong>
                  <small>
                    {item.resumen?.codigo}
                    {item.resumen?.precio ? ` · ${formatMoney(item.resumen.precio, item.resumen.moneda)}` : ''}
                  </small>
                  <input
                    value={item.nota}
                    placeholder="Nota para el cliente sobre esta opcion"
                    onChange={(e) => setItems(items.map((i, n) =>
                      (n === index ? { ...i, nota: e.target.value } : i)))}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setItems(items.filter((_, n) => n !== index))}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
    </Modal>
  );
}
