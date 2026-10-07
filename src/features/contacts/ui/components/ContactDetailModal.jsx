import { useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Badge } from '@shared/ui/Badge.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { formatDate } from '@shared/lib/format.js';
import { DocumentsPanel } from '@features/documents';
import { RequirementsPanel } from '@features/requirements';
import { UseTemplateModal } from '@features/templates';
import {
  useContact, useContactMutations, useInteractions,
} from '../../application/useContactsQueries.js';
import {
  CONTACT_TYPE_LABELS, CONTACT_TYPE_TONES,
  INTERACTION_RESULTS, INTERACTION_RESULT_LABELS,
  INTERACTION_TYPES, INTERACTION_TYPE_LABELS,
  STAGE_LABELS, STAGE_TONES, ContactStage,
  estaSeguimientoVencido,
} from '../../domain/contact.js';

export function ContactDetailModal({ contactoId, onClose, onEdit }) {
  const toast = useToast();
  const { data: contacto, isLoading, refetch } = useContact(contactoId);
  const { data: interacciones = [], isLoading: cargandoInteracciones } = useInteractions(contactoId);
  const { moveStage, setNextAction, registerInteraction } = useContactMutations({
    onError: (e) => toast.error(e.displayMessage),
  });

  const [tab, setTab] = useState('interacciones'); // 'interacciones' | 'requerimientos' | 'documentos' | 'datos'
  const [nuevaInteraccion, setNuevaInteraccion] = useState({
    tipo: 'llamada',
    resumen: '',
    resultado: 'contacto_efectivo',
    proximaAccion: '',
    proximaAccionAt: '',
  });

  const [usandoPlantilla, setUsandoPlantilla] = useState(false);
  const [editandoAccion, setEditandoAccion] = useState(false);
  const [accionForm, setAccionForm] = useState({ proximaAccion: '', proximaAccionAt: '' });

  if (isLoading || !contacto) {
    return (
      <Modal title="Ficha de Contacto" onClose={onClose} wide>
        <Spinner label="Cargando datos del contacto..." />
      </Modal>
    );
  }

  const guardarInteraccion = async (e) => {
    e.preventDefault();
    if (!nuevaInteraccion.resumen.trim()) {
      toast.error('Ingrese un resumen de la interacción');
      return;
    }
    await registerInteraction.mutateAsync({
      contactoId: contacto.id,
      tipo: nuevaInteraccion.tipo,
      resumen: nuevaInteraccion.resumen,
      resultado: nuevaInteraccion.resultado || undefined,
      proximaAccion: nuevaInteraccion.proximaAccion || undefined,
      proximaAccionAt: nuevaInteraccion.proximaAccionAt ? new Date(nuevaInteraccion.proximaAccionAt).toISOString() : undefined,
    });
    toast.success('Interacción registrada');
    setNuevaInteraccion({
      tipo: 'llamada',
      resumen: '',
      resultado: 'contacto_efectivo',
      proximaAccion: '',
      proximaAccionAt: '',
    });
    refetch();
  };

  const guardarProximaAccion = async () => {
    await setNextAction.mutateAsync({
      id: contacto.id,
      proximaAccion: accionForm.proximaAccion || null,
      proximaAccionAt: accionForm.proximaAccionAt ? new Date(accionForm.proximaAccionAt).toISOString() : null,
    });
    toast.success('Próxima acción actualizada');
    setEditandoAccion(false);
    refetch();
  };

  const cambiarEtapa = async (etapa) => {
    await moveStage.mutateAsync({ id: contacto.id, etapa });
    toast.success(`Contacto movido a ${STAGE_LABELS[etapa] ?? etapa}`);
    refetch();
  };

  const vencido = estaSeguimientoVencido(contacto);

  return (
    <Modal
      title={`${contacto.nombre} ${contacto.apellido ?? ''}`.trim()}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={() => setUsandoPlantilla(true)}>
            Usar plantilla
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => onEdit?.(contacto)}>
            Editar datos básicos
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Cerrar
          </button>
        </>
      }
    >
      <div className="contact-detail">
        {/* Cabecera resumen */}
        <header className="contact-detail__header">
          <div className="contact-detail__badges">
            <Badge tone={CONTACT_TYPE_TONES[contacto.tipo]}>
              {CONTACT_TYPE_LABELS[contacto.tipo]}
            </Badge>
            <Badge tone={STAGE_TONES[contacto.etapa] ?? 'neutral'}>
              {STAGE_LABELS[contacto.etapa] ?? contacto.etapa}
            </Badge>
            {contacto.origen ? (
              <Badge tone="neutral">Origen: {contacto.origen}</Badge>
            ) : null}
            {contacto.vista?.asesorNombre ? (
              <Badge tone="info">Asesor: {contacto.vista.asesorNombre}</Badge>
            ) : null}
          </div>

          <div className="contact-detail__info-grid">
            <div>
              <small>Email</small>
              <p>{contacto.email || '—'}</p>
            </div>
            <div>
              <small>Teléfono</small>
              <p>{contacto.telefono || '—'}</p>
            </div>
            <div>
              <small>Documento</small>
              <p>{contacto.documento || '—'}</p>
            </div>
            <div>
              <small>Creado</small>
              <p>{formatDate(contacto.createdAt)}</p>
            </div>
          </div>
        </header>

        {/* Barra de control de etapa y próxima acción */}
        <div className="contact-detail__control-bar">
          <div className="control-item">
            <label htmlFor="select-etapa"><strong>Etapa en embudo:</strong></label>
            <select
              id="select-etapa"
              value={contacto.etapa}
              onChange={(e) => cambiarEtapa(e.target.value)}
              className="buscador__select"
            >
              {Object.entries(STAGE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="control-item control-item--action">
            <div>
              <strong>Próxima acción:</strong>{' '}
              {contacto.proximaAccion ? (
                <span className={vencido ? 'text-danger font-semibold' : ''}>
                  {contacto.proximaAccion} {contacto.proximaAccionAt ? `(${formatDate(contacto.proximaAccionAt)})` : ''}
                  {vencido ? ' · ¡Vencida!' : ''}
                </span>
              ) : (
                <span className="text-muted">Sin programar</span>
              )}
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setAccionForm({
                  proximaAccion: contacto.proximaAccion || '',
                  proximaAccionAt: contacto.proximaAccionAt ? contacto.proximaAccionAt.slice(0, 16) : '',
                });
                setEditandoAccion(!editandoAccion);
              }}
            >
              {editandoAccion ? 'Cancelar' : 'Programar tarea'}
            </button>
          </div>
        </div>

        {editandoAccion ? (
          <div className="panel panel--bordered" style={{ margin: '1rem 0' }}>
            <h4>Programar siguiente acción de seguimiento</h4>
            <div className="form-grid" style={{ marginTop: '0.5rem' }}>
              <Field label="Acción a realizar">
                <input
                  placeholder="Ej: Llamar a confirmar pre-aprobación del crédito"
                  value={accionForm.proximaAccion}
                  onChange={(e) => setAccionForm({ ...accionForm, proximaAccion: e.target.value })}
                />
              </Field>
              <Field label="Fecha y hora límite">
                <input
                  type="datetime-local"
                  value={accionForm.proximaAccionAt}
                  onChange={(e) => setAccionForm({ ...accionForm, proximaAccionAt: e.target.value })}
                />
              </Field>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn--primary btn--sm" onClick={guardarProximaAccion}>
                Guardar acción
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setAccionForm({ proximaAccion: '', proximaAccionAt: '' });
                  setNextAction.mutate({ id: contacto.id, proximaAccion: null, proximaAccionAt: null }, {
                    onSuccess: () => {
                      toast.success('Acción limpiada');
                      setEditandoAccion(false);
                      refetch();
                    },
                  });
                }}
              >
                Limpiar pendiente
              </button>
            </div>
          </div>
        ) : null}

        {/* Pestañas de contenido */}
        <nav className="tabs" style={{ margin: '1.25rem 0 1rem' }}>
          <button
            type="button"
            className={`tab ${tab === 'interacciones' ? 'is-active' : ''}`}
            onClick={() => setTab('interacciones')}
          >
            Bitácora de interacciones ({interacciones.length})
          </button>
          <button
            type="button"
            className={`tab ${tab === 'requerimientos' ? 'is-active' : ''}`}
            onClick={() => setTab('requerimientos')}
          >
            Que busca
          </button>
          <button
            type="button"
            className={`tab ${tab === 'documentos' ? 'is-active' : ''}`}
            onClick={() => setTab('documentos')}
          >
            Documentos
          </button>
          <button
            type="button"
            className={`tab ${tab === 'datos' ? 'is-active' : ''}`}
            onClick={() => setTab('datos')}
          >
            Notas generales
          </button>
        </nav>

        {tab === 'interacciones' ? (
          <section className="contact-interactions">
            {/* Formulario rápido para nueva interacción */}
            <form onSubmit={guardarInteraccion} className="panel panel--bordered" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Registrar nueva interacción</h4>
              <div className="form-grid">
                <Field label="Tipo">
                  <select
                    value={nuevaInteraccion.tipo}
                    onChange={(e) => setNuevaInteraccion({ ...nuevaInteraccion, tipo: e.target.value })}
                  >
                    {Object.entries(INTERACTION_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Resultado">
                  <select
                    value={nuevaInteraccion.resultado}
                    onChange={(e) => setNuevaInteraccion({ ...nuevaInteraccion, resultado: e.target.value })}
                  >
                    {Object.entries(INTERACTION_RESULT_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Resumen / Qué se habló" required>
                <textarea
                  rows="2"
                  placeholder="Detalle de la llamada, mensaje de WhatsApp o visita..."
                  value={nuevaInteraccion.resumen}
                  onChange={(e) => setNuevaInteraccion({ ...nuevaInteraccion, resumen: e.target.value })}
                />
              </Field>

              <div className="form-grid">
                <Field label="Programar próxima acción (opcional)">
                  <input
                    placeholder="Ej: Enviar opciones por correo"
                    value={nuevaInteraccion.proximaAccion}
                    onChange={(e) => setNuevaInteraccion({ ...nuevaInteraccion, proximaAccion: e.target.value })}
                  />
                </Field>
                <Field label="Fecha límite (opcional)">
                  <input
                    type="datetime-local"
                    value={nuevaInteraccion.proximaAccionAt}
                    onChange={(e) => setNuevaInteraccion({ ...nuevaInteraccion, proximaAccionAt: e.target.value })}
                  />
                </Field>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--sm"
                disabled={registerInteraction.isPending}
                style={{ marginTop: '0.75rem' }}
              >
                {registerInteraction.isPending ? 'Guardando...' : 'Registrar interacción'}
              </button>
            </form>

            {/* Lista timeline de interacciones */}
            {cargandoInteracciones ? <Spinner label="Cargando interacciones..." /> : null}
            {!cargandoInteracciones && interacciones.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>
                Sin interacciones registradas. Use el formulario arriba para documentar el primer contacto.
              </p>
            ) : null}

            {interacciones.length > 0 ? (
              <div className="timeline">
                {interacciones.map((interaccion) => (
                  <div key={interaccion.id} className="timeline__item">
                    <div className="timeline__point" />
                    <div className="timeline__content">
                      <header className="timeline__header">
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Badge tone="info">{INTERACTION_TYPE_LABELS[interaccion.tipo] ?? interaccion.tipo}</Badge>
                          {interaccion.resultado ? (
                            <Badge tone="neutral">{INTERACTION_RESULT_LABELS[interaccion.resultado] ?? interaccion.resultado}</Badge>
                          ) : null}
                        </div>
                        <time className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {formatDate(interaccion.createdAt)}
                        </time>
                      </header>
                      <p className="timeline__text" style={{ margin: '0.5rem 0', whiteSpace: 'pre-line' }}>
                        {interaccion.resumen}
                      </p>
                      {interaccion.vista?.usuarioNombre ? (
                        <small className="text-muted">Por: {interaccion.vista.usuarioNombre}</small>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {tab === 'requerimientos' ? (
          <RequirementsPanel contactoId={contacto.id} />
        ) : null}

        {tab === 'documentos' ? (
          <DocumentsPanel contactoId={contacto.id} titulo="Documentos del contacto" />
        ) : null}

        {tab === 'datos' ? (
          <article className="panel panel--bordered">
            <h4>Notas internas del contacto</h4>
            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-line' }}>
              {contacto.notas || 'No hay notas adicionales registradas.'}
            </p>
          </article>
        ) : null}
      </div>

      {usandoPlantilla ? (
        <UseTemplateModal
          contacto={contacto}
          onClose={(resultado) => {
            setUsandoPlantilla(false);
            if (!resultado?.registrar) return;
            registerInteraction.mutate(
              { contactoId, ...resultado.registrar },
              {
                onSuccess: () => {
                  toast.success('Mensaje registrado en la bitácora');
                  refetch();
                },
              },
            );
          }}
        />
      ) : null}
    </Modal>
  );
}
