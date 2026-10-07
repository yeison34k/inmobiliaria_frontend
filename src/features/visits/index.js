/** API publica del feature agenda de visitas. */
export { AgendaPage } from './ui/pages/AgendaPage.jsx';
export { ScheduleVisitModal } from './ui/components/ScheduleVisitModal.jsx';
export { VisitOutcomeModal } from './ui/components/VisitOutcomeModal.jsx';
export { VisitStatusBadge, VisitOutcomeBadge } from './ui/components/VisitStatusBadge.jsx';
export { useAgenda, useVisits, useVisitMutations } from './application/useVisitsQueries.js';
export { VisitStatus, VISIT_STATUS_META, estaAbierta, estaVencida } from './domain/visit.js';
