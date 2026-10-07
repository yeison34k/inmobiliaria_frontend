import { useFollowUpQueue } from '../../application/useContactsQueries.js';
import { formatDate } from '@shared/lib/format.js';

export function FollowUpQueueWidget({ onSelectContact }) {
  const { data } = useFollowUpQueue();

  if (!data || (!data.vencidos?.length && !data.paraHoy?.length)) {
    return null;
  }

  const { vencidos = [], paraHoy = [] } = data;
  const total = vencidos.length + paraHoy.length;

  return (
    <aside className="followup-alert panel panel--bordered">
      <header className="followup-alert__header">
        <div>
          <h3>
            Seguimientos que requieren atención <span className="panel__count">{total}</span>
          </h3>
          <p className="text-muted">
            {vencidos.length > 0 ? `${vencidos.length} vencidos · ` : ''}
            {paraHoy.length} programados para hoy
          </p>
        </div>
      </header>

      <div className="followup-alert__list">
        {vencidos.map((contacto) => (
          <div
            key={contacto.id}
            className="followup-alert__item followup-alert__item--danger"
            onClick={() => onSelectContact(contacto)}
            role="button"
            tabIndex={0}
          >
            <strong>{contacto.nombreCompleto}</strong>
            <span>⚠️ {contacto.proximaAccion}</span>
            <small>{formatDate(contacto.proximaAccionAt)}</small>
          </div>
        ))}

        {paraHoy.map((contacto) => (
          <div
            key={contacto.id}
            className="followup-alert__item followup-alert__item--warning"
            onClick={() => onSelectContact(contacto)}
            role="button"
            tabIndex={0}
          >
            <strong>{contacto.nombreCompleto}</strong>
            <span>📅 {contacto.proximaAccion}</span>
            <small>{formatDate(contacto.proximaAccionAt)}</small>
          </div>
        ))}
      </div>
    </aside>
  );
}
