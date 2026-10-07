export const VisitStatus = Object.freeze({
  PROGRAMADA: 'programada',
  CONFIRMADA: 'confirmada',
  REALIZADA: 'realizada',
  CANCELADA: 'cancelada',
  NO_ASISTIO: 'no_asistio',
});

export const VISIT_STATUS_META = Object.freeze({
  programada: { label: 'Programada', tone: 'info' },
  confirmada: { label: 'Confirmada', tone: 'success' },
  realizada: { label: 'Realizada', tone: 'purple' },
  cancelada: { label: 'Cancelada', tone: 'neutral' },
  no_asistio: { label: 'No asistio', tone: 'danger' },
});

export const VISIT_OUTCOME_META = Object.freeze({
  interesado: { label: 'Interesado', tone: 'success' },
  quiere_ofertar: { label: 'Quiere ofertar', tone: 'purple' },
  segunda_visita: { label: 'Pide segunda visita', tone: 'info' },
  descartado: { label: 'Descartado', tone: 'neutral' },
});

export const VISIT_OUTCOMES = Object.keys(VISIT_OUTCOME_META);

/** Una visita abierta todavia ocupa agenda y admite acciones. */
export const estaAbierta = (visita) =>
  [VisitStatus.PROGRAMADA, VisitStatus.CONFIRMADA].includes(visita?.estado);

/** Visita abierta cuya hora ya paso: hay que registrar que ocurrio. */
export const estaVencida = (visita) =>
  estaAbierta(visita) && new Date(visita.fechaInicio) < new Date();

/** Duraciones ofrecidas al agendar. */
export const DURACIONES = [30, 45, 60, 90, 120];
