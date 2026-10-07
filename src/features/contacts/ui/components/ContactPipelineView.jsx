import { Badge } from '@shared/ui/Badge.jsx';
import { formatDate } from '@shared/lib/format.js';
import {
  CONTACT_TYPE_LABELS, CONTACT_TYPE_TONES,
  ContactStage, STAGE_LABELS, STAGE_TONES,
  estaSeguimientoVencido,
} from '../../domain/contact.js';

const ETAPAS_EMBUDO = [
  ContactStage.NUEVO,
  ContactStage.CONTACTADO,
  ContactStage.CALIFICADO,
  ContactStage.VISITANDO,
  ContactStage.NEGOCIANDO,
  ContactStage.CERRADO,
  ContactStage.PERDIDO,
];

export function ContactPipelineView({ contactos = [], onSelectContact }) {
  // Agrupar contactos por etapa
  const porEtapa = Object.fromEntries(ETAPAS_EMBUDO.map((e) => [e, []]));
  for (const c of contactos) {
    const etapa = porEtapa[c.etapa] ? c.etapa : ContactStage.NUEVO;
    porEtapa[etapa].push(c);
  }

  return (
    <div className="pipeline-board">
      {ETAPAS_EMBUDO.map((etapa) => {
        const lista = porEtapa[etapa] || [];
        return (
          <div key={etapa} className="pipeline-col">
            <header className="pipeline-col__header">
              <span className={`pipeline-col__badge badge badge--${STAGE_TONES[etapa] ?? 'neutral'}`}>
                {STAGE_LABELS[etapa]}
              </span>
              <span className="pipeline-col__count">{lista.length}</span>
            </header>

            <div className="pipeline-col__body">
              {lista.length === 0 ? (
                <div className="pipeline-card pipeline-card--empty">
                  Sin contactos en esta etapa
                </div>
              ) : (
                lista.map((contacto) => {
                  const vencido = estaSeguimientoVencido(contacto);
                  return (
                    <article
                      key={contacto.id}
                      className={`pipeline-card ${vencido ? 'is-overdue' : ''}`}
                      onClick={() => onSelectContact(contacto)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') onSelectContact(contacto); }}
                    >
                      <div className="pipeline-card__top">
                        <strong className="pipeline-card__title">
                          {contacto.nombreCompleto}
                        </strong>
                        <Badge tone={CONTACT_TYPE_TONES[contacto.tipo]}>
                          {CONTACT_TYPE_LABELS[contacto.tipo]}
                        </Badge>
                      </div>

                      <div className="pipeline-card__contact">
                        {contacto.telefono ? <span>📞 {contacto.telefono}</span> : null}
                        {contacto.email ? <span>✉️ {contacto.email}</span> : null}
                      </div>

                      {contacto.proximaAccion ? (
                        <div className={`pipeline-card__action ${vencido ? 'pipeline-card__action--danger' : ''}`}>
                          <small><strong>Próximo:</strong> {contacto.proximaAccion}</small>
                          {contacto.proximaAccionAt ? (
                            <small className="text-muted">{formatDate(contacto.proximaAccionAt)}</small>
                          ) : null}
                        </div>
                      ) : (
                        <div className="pipeline-card__action pipeline-card__action--none">
                          <small className="text-muted">Sin próxima acción programada</small>
                        </div>
                      )}

                      {contacto.vista?.asesorNombre ? (
                        <footer className="pipeline-card__footer">
                          <small>Asesor: {contacto.vista.asesorNombre}</small>
                        </footer>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
