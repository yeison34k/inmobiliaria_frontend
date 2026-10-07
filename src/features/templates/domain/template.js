export const TemplateChannel = Object.freeze({
  WHATSAPP: 'whatsapp',
  CORREO: 'correo',
});

export const CHANNEL_META = Object.freeze({
  whatsapp: { label: 'WhatsApp', tone: 'success' },
  correo: { label: 'Correo', tone: 'info' },
});

/**
 * Lo que el editor ofrece insertar. Es la misma lista que valida el
 * backend; si alguien escribe una variable que no esta aqui, la plantilla
 * la reporta como desconocida en vez de dejarla pasar en silencio.
 */
export const VARIABLES = Object.freeze({
  cliente: 'Nombre del cliente',
  asesor: 'Nombre del asesor',
  propiedad: 'Nombre o titulo de la propiedad',
  precio: 'Precio con formato',
  ubicacion: 'Barrio y ciudad',
  enlace: 'Enlace a la ficha o seleccion',
  fecha: 'Fecha y hora de la visita',
  inmobiliaria: 'Nombre de la inmobiliaria',
});

export const plantillaVacia = {
  clave: '',
  nombre: '',
  canal: TemplateChannel.WHATSAPP,
  asunto: '',
  cuerpo: '',
};

/** Clave legible a partir del nombre, para no pedirla dos veces. */
export const claveDesde = (nombre) => String(nombre ?? '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 60);
