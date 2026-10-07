export const DOCUMENT_TYPES = Object.freeze({
  mandato: { label: 'Mandato', ayuda: 'Autorizacion del propietario para comercializar', caduca: true },
  exclusividad: { label: 'Exclusividad', ayuda: 'Contrato de exclusividad vigente', caduca: true },
  tradicion: { label: 'Certificado de tradicion', ayuda: 'Vigencia recomendada: 30 dias', caduca: true },
  avaluo: { label: 'Avaluo', ayuda: 'Avaluo comercial del inmueble', caduca: true },
  paz_y_salvo: { label: 'Paz y salvo', ayuda: 'Administracion, predial o servicios', caduca: true },
  identificacion: { label: 'Identificacion', ayuda: 'Documento del titular', caduca: false },
  contrato: { label: 'Contrato', ayuda: 'Arrendamiento o compraventa', caduca: true },
  promesa: { label: 'Promesa de compraventa', ayuda: 'Promesa firmada', caduca: false },
  otro: { label: 'Otro', ayuda: 'Soporte adicional', caduca: false },
});

export const DOCUMENT_TYPE_KEYS = Object.keys(DOCUMENT_TYPES);

export const VIGENCIA_META = Object.freeze({
  vigente: { label: 'Vigente', tone: 'success' },
  por_vencer: { label: 'Por vencer', tone: 'warning' },
  vencido: { label: 'Vencido', tone: 'danger' },
  sin_vencimiento: { label: 'Sin vencimiento', tone: 'neutral' },
});

/** Sin mandato no se deberia comercializar el inmueble. */
export const faltaMandato = (documentos = []) =>
  !documentos.some((d) => d.tipo === 'mandato' && d.vigencia !== 'vencido');
