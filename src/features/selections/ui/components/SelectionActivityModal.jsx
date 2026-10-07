import { Modal } from '@shared/ui/Modal.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { formatDateTime } from '@shared/lib/format.js';
import { useSelection } from '../../application/useSelectionsQueries.js';
import { EVENTO_META } from '../../domain/selection.js';

/**
 * Que hizo el cliente con lo que se le envio.
 * Es la diferencia entre llamar a ciegas y llamar al que ya volvio tres
 * veces a la misma ficha.
 */
export function SelectionActivityModal({ seleccionId, onClose }) {
  const { data: seleccion, isLoading } = useSelection(seleccionId);

  if (isLoading || !seleccion) {
    return <Modal title="Actividad" onClose={onClose}><Spinner /></Modal>;
  }

  const { actividad } = seleccion;
  const favoritas = actividad.resumen.filter((r) => r.tipo === 'marco_favorita');
  const vistas = actividad.resumen.filter((r) => r.tipo === 'vio_propiedad');

  return (
    <Modal title={`Actividad · ${seleccion.codigo}`} onClose={onClose} wide>
      <p className="modal__lead">
        <strong>{seleccion.titulo}</strong><br />
        {seleccion.cliente ? `Enviada a ${seleccion.cliente}` : 'Sin cliente asignado'}
        {seleccion.enviadaAt ? ` · ${formatDateTime(seleccion.enviadaAt)}` : ''}
      </p>

      {actividad.aperturas === 0 ? (
        <p className="panel__warning">
          El cliente todavia no ha abierto el enlace. Vale la pena un mensaje
          recordandoselo antes de dar la seleccion por perdida.
        </p>
      ) : (
        <div className="stats">
          <article className="stat">
            <p className="stat__label">Aperturas</p>
            <p className="stat__value">{actividad.aperturas}</p>
          </article>
          <article className="stat stat--success">
            <p className="stat__label">Marcadas</p>
            <p className="stat__value">{favoritas.reduce((s, f) => s + f.veces, 0)}</p>
          </article>
          <article className="stat stat--info">
            <p className="stat__label">Vistas en detalle</p>
            <p className="stat__value">{vistas.reduce((s, v) => s + v.veces, 0)}</p>
          </article>
        </div>
      )}

      {actividad.eventos.length ? (
        <>
          <h3 className="section-title">Linea de tiempo</h3>
          <ul className="timeline">
            {actividad.eventos.map((evento) => {
              const meta = EVENTO_META[evento.tipo] ?? { label: evento.tipo, icono: '•' };
              return (
                <li key={evento.id}>
                  <div className="timeline__head">
                    <span aria-hidden="true">{meta.icono}</span>
                    <strong>{meta.label}</strong>
                  </div>
                  <small>
                    {evento.propiedad ? `${evento.propiedad} · ` : ''}
                    {formatDateTime(evento.createdAt)}
                  </small>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </Modal>
  );
}
