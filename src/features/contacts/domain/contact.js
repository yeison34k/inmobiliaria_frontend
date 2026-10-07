export const ContactType = Object.freeze({
  CLIENTE: 'cliente',
  PROPIETARIO: 'propietario',
  AMBOS: 'ambos',
});

export const CONTACT_TYPE_LABELS = Object.freeze({
  cliente: 'Cliente',
  propietario: 'Propietario',
  ambos: 'Cliente y propietario',
});

export const CONTACT_TYPE_TONES = Object.freeze({
  cliente: 'info',
  propietario: 'purple',
  ambos: 'success',
});

export const ContactStage = Object.freeze({
  NUEVO: 'nuevo',
  CONTACTADO: 'contactado',
  CALIFICADO: 'calificado',
  VISITANDO: 'visitando',
  NEGOCIANDO: 'negociando',
  CERRADO: 'cerrado',
  PERDIDO: 'perdido',
});

export const STAGE_LABELS = Object.freeze({
  nuevo: 'Nuevo lead',
  contactado: 'Contactado',
  calificado: 'Calificado',
  visitando: 'En visitas',
  negociando: 'Negociando',
  cerrado: 'Ganado / Cerrado',
  perdido: 'Perdido',
});

export const STAGE_TONES = Object.freeze({
  nuevo: 'info',
  contactado: 'neutral',
  calificado: 'blue',
  visitando: 'purple',
  negociando: 'warning',
  cerrado: 'success',
  perdido: 'danger',
});

export const ETAPAS_ACTIVAS = Object.freeze([
  ContactStage.NUEVO,
  ContactStage.CONTACTADO,
  ContactStage.CALIFICADO,
  ContactStage.VISITANDO,
  ContactStage.NEGOCIANDO,
]);

export const ContactOrigin = Object.freeze({
  WEB: 'web',
  REFERIDO: 'referido',
  PORTAL: 'portal',
  LLAMADA: 'llamada',
  FERIA: 'feria',
  OTRO: 'otro',
});

export const ORIGIN_LABELS = Object.freeze({
  web: 'Web pública',
  referido: 'Referido',
  portal: 'Portal inmobiliario',
  llamada: 'Llamada directa',
  feria: 'Feria o evento',
  otro: 'Otro canal',
});

export const InteractionType = Object.freeze({
  LLAMADA: 'llamada',
  WHATSAPP: 'whatsapp',
  CORREO: 'correo',
  REUNION: 'reunion',
  VISITA: 'visita',
  NOTA: 'nota',
});

export const INTERACTION_TYPES = Object.values(InteractionType);

export const INTERACTION_TYPE_LABELS = Object.freeze({
  llamada: 'Llamada',
  whatsapp: 'WhatsApp',
  correo: 'Correo electrónico',
  reunion: 'Reunión',
  visita: 'Visita',
  nota: 'Nota interna',
});

export const INTERACTION_RESULTS = Object.freeze({
  SIN_RESPUESTA: 'sin_respuesta',
  CONTACTO_EFECTIVO: 'contacto_efectivo',
  AGENDO_VISITA: 'agendo_visita',
  PIDIO_INFO: 'pidio_info',
  NO_INTERESADO: 'no_interesado',
});

export const INTERACTION_RESULT_LABELS = Object.freeze({
  sin_respuesta: 'Sin respuesta',
  contacto_efectivo: 'Contacto efectivo',
  agendo_visita: 'Agendó visita',
  pidio_info: 'Pidió más info',
  no_interesado: 'No interesado',
});

/** Quien puede figurar como comprador/inquilino en una operacion. */
export const puedeSerCliente = (contacto) =>
  [ContactType.CLIENTE, ContactType.AMBOS].includes(contacto?.tipo);

export const puedeSerPropietario = (contacto) =>
  [ContactType.PROPIETARIO, ContactType.AMBOS].includes(contacto?.tipo);

/** Verifica si la proxima accion programada ya vencio */
export const estaSeguimientoVencido = (contacto) => {
  if (!contacto?.proximaAccionAt) return false;
  return new Date(contacto.proximaAccionAt).getTime() < Date.now();
};

export const FINANCIACION_LABELS = Object.freeze({
  no_definido: 'Sin definir',
  contado: 'De contado',
  credito_aprobado: 'Credito aprobado',
  credito_tramite: 'Credito en tramite',
  subsidio: 'Con subsidio',
});

export const PLAZO_LABELS = Object.freeze({
  inmediato: 'Inmediato',
  tres_meses: 'En 3 meses',
  seis_meses: 'En 6 meses',
  explorando: 'Explorando',
});

/** Semaforo del lead: a quien se le dedica el dia. */
export const TEMPERATURA_META = Object.freeze({
  caliente: { label: 'Caliente', tone: 'danger' },
  tibio: { label: 'Tibio', tone: 'warning' },
  frio: { label: 'Frio', tone: 'neutral' },
});
