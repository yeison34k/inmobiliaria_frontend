/**
 * Interruptores de negocio del frontend.
 *
 * El core de la inmobiliaria es la venta. Con `ARRIENDOS` apagado desaparecen
 * el modulo de arrendamientos, la opcion "Arrendar" del sitio publico y la
 * operacion "arriendo" de los formularios y filtros.
 *
 * Nada se borra: volver a encenderlo es poner `true` aqui y
 * `FEATURE_ARRIENDOS=true` en el `.env` del backend.
 *
 * Se lee de la variable de entorno si existe, para poder encenderlo en un
 * ambiente sin tocar el codigo; el valor de abajo es el que manda por defecto.
 */
export const ARRIENDOS = import.meta.env.VITE_FEATURE_ARRIENDOS === 'true';

/** Las operaciones que el negocio ofrece hoy. */
export const OPERACIONES_ACTIVAS = ARRIENDOS ? ['venta', 'arriendo'] : ['venta'];

/** Para filtrar listas de opciones sin repetir el condicional en cada vista. */
export const operacionHabilitada = (valor) => OPERACIONES_ACTIVAS.includes(valor);
