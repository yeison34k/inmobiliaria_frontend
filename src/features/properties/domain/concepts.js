/**
 * Identidad visual por propiedad.
 *
 * Cada concepto es un sistema de diseno completo: paleta, tipografia,
 * geometria y movimiento. La landing publica se arma con estos tokens,
 * por eso una villa costera y un penthouse industrial no se parecen en nada
 * aunque compartan el mismo codigo.
 *
 * Las claves coinciden con el ENUM `concepto` del backend.
 */
export const CONCEPTS = Object.freeze({
  costero: {
    nombre: 'Costero',
    resumen: 'Tonos arena y azul niebla, tipografia fluida, transiciones largas.',
    sugerido: 'Villas frente al mar, apartamentos con vista, casas de descanso.',
    oscuro: false,
    fuente: { familia: 'Cormorant Garamond', pesos: '300;400;600', tipo: 'serif' },
    tokens: {
      '--exp-bg': '#f7f3ec',
      '--exp-bg-alt': '#efe8dc',
      '--exp-ink': '#2b2721',
      '--exp-ink-soft': 'rgba(43, 39, 33, .62)',
      '--exp-line': 'rgba(43, 39, 33, .14)',
      '--exp-accent': '#6f8fa3',
      '--exp-on-accent': '#ffffff',
      '--exp-display': '"Cormorant Garamond", Georgia, serif',
      '--exp-display-weight': '400',
      '--exp-display-tracking': '-.012em',
      '--exp-display-leading': '1.08',
      '--exp-kicker-tracking': '.28em',
      '--exp-radius': '4px',
      '--exp-ease': 'cubic-bezier(.22, .61, .36, 1)',
      '--exp-duration': '1.1s',
      '--exp-shift': '34px',
    },
  },

  urbano: {
    nombre: 'Urbano industrial',
    resumen: 'Fondo oscuro, tipografia audaz, cortes geometricos rigidos.',
    sugerido: 'Penthouse, lofts, oficinas corporativas, obra nueva en la ciudad.',
    oscuro: true,
    fuente: { familia: 'Archivo', pesos: '400;600;800', tipo: 'sans-serif' },
    tokens: {
      '--exp-bg': '#0d0e11',
      '--exp-bg-alt': '#16181d',
      '--exp-ink': '#f2f2f0',
      '--exp-ink-soft': 'rgba(242, 242, 240, .58)',
      '--exp-line': 'rgba(242, 242, 240, .14)',
      '--exp-accent': '#e2552b',
      '--exp-on-accent': '#ffffff',
      '--exp-display': '"Archivo", Inter, sans-serif',
      '--exp-display-weight': '800',
      '--exp-display-tracking': '-.045em',
      '--exp-display-leading': '.92',
      '--exp-kicker-tracking': '.2em',
      '--exp-radius': '0px',
      '--exp-ease': 'cubic-bezier(.16, 1, .3, 1)',
      '--exp-duration': '.62s',
      '--exp-shift': '22px',
    },
  },

  campestre: {
    nombre: 'Campestre',
    resumen: 'Verdes profundos y crema, serif calida, ritmo pausado.',
    sugerido: 'Fincas, casas de campo, lotes con naturaleza.',
    oscuro: false,
    fuente: { familia: 'Fraunces', pesos: '300;400;600', tipo: 'serif' },
    tokens: {
      '--exp-bg': '#f4f1e9',
      '--exp-bg-alt': '#e9e5d9',
      '--exp-ink': '#22271f',
      '--exp-ink-soft': 'rgba(34, 39, 31, .62)',
      '--exp-line': 'rgba(34, 39, 31, .16)',
      '--exp-accent': '#55663f',
      '--exp-on-accent': '#ffffff',
      '--exp-display': '"Fraunces", Georgia, serif',
      '--exp-display-weight': '400',
      '--exp-display-tracking': '-.02em',
      '--exp-display-leading': '1.05',
      '--exp-kicker-tracking': '.24em',
      '--exp-radius': '10px',
      '--exp-ease': 'cubic-bezier(.33, 1, .68, 1)',
      '--exp-duration': '.95s',
      '--exp-shift': '30px',
    },
  },

  minimal: {
    nombre: 'Minimal',
    resumen: 'Blanco absoluto, mucho aire, tipografia ligera de gran interlineado.',
    sugerido: 'Obra nueva, arquitectura de autor, cualquier inmueble sobrio.',
    oscuro: false,
    fuente: { familia: 'Inter', pesos: '200;300;500', tipo: 'sans-serif' },
    tokens: {
      '--exp-bg': '#ffffff',
      '--exp-bg-alt': '#f5f5f5',
      '--exp-ink': '#101114',
      '--exp-ink-soft': 'rgba(16, 17, 20, .55)',
      '--exp-line': 'rgba(16, 17, 20, .12)',
      '--exp-accent': '#101114',
      '--exp-on-accent': '#ffffff',
      '--exp-display': '"Inter", system-ui, sans-serif',
      '--exp-display-weight': '200',
      '--exp-display-tracking': '-.035em',
      '--exp-display-leading': '1.02',
      '--exp-kicker-tracking': '.3em',
      '--exp-radius': '2px',
      '--exp-ease': 'cubic-bezier(.4, 0, .2, 1)',
      '--exp-duration': '.8s',
      '--exp-shift': '26px',
    },
  },

  nordico: {
    nombre: 'Nordico',
    resumen: 'Luz calida, madera clara y azul palido; tipografia humanista y aireada.',
    sugerido: 'Apartamentos luminosos, obra nueva calida, espacios pequenos bien resueltos.',
    oscuro: false,
    fuente: { familia: 'Jost', pesos: '300;400;500', tipo: 'sans-serif' },
    tokens: {
      '--exp-bg': '#fbf9f6',
      '--exp-bg-alt': '#f0ebe3',
      '--exp-ink': '#1f2328',
      '--exp-ink-soft': 'rgba(31, 35, 40, .58)',
      '--exp-line': 'rgba(31, 35, 40, .12)',
      '--exp-accent': '#8a6a4b',
      '--exp-on-accent': '#ffffff',
      '--exp-display': '"Jost", system-ui, sans-serif',
      '--exp-display-weight': '300',
      '--exp-display-tracking': '-.015em',
      '--exp-display-leading': '1.12',
      '--exp-kicker-tracking': '.26em',
      '--exp-radius': '14px',
      '--exp-ease': 'cubic-bezier(.34, .8, .36, 1)',
      '--exp-duration': '1s',
      '--exp-shift': '32px',
    },
  },

  brutalista: {
    nombre: 'Brutalista',
    resumen: 'Concreto a la vista, condensada pesada, cero curvas y acento senaletico.',
    sugerido: 'Lofts, obra de concreto expuesto, arquitectura de autor.',
    oscuro: false,
    fuente: { familia: 'Archivo Narrow', pesos: '400;600;700', tipo: 'sans-serif' },
    tokens: {
      '--exp-bg': '#d9d7d2',
      '--exp-bg-alt': '#c6c4be',
      '--exp-ink': '#15161a',
      '--exp-ink-soft': 'rgba(21, 22, 26, .66)',
      '--exp-line': 'rgba(21, 22, 26, .3)',
      '--exp-accent': '#15161a',
      '--exp-on-accent': '#f2e600',
      '--exp-display': '"Archivo Narrow", "Archivo", sans-serif',
      '--exp-display-weight': '700',
      '--exp-display-tracking': '-.03em',
      '--exp-display-leading': '.9',
      '--exp-kicker-tracking': '.18em',
      '--exp-radius': '0px',
      '--exp-ease': 'cubic-bezier(.2, .9, .3, 1)',
      '--exp-duration': '.42s',
      '--exp-shift': '16px',
    },
  },

  lujo: {
    nombre: 'Alta gama',
    resumen: 'Negro profundo y champan, serif de alto contraste, mucho aire y ritmo lento.',
    sugerido: 'Penthouse premium, propiedades de alto valor, ventas exclusivas.',
    oscuro: true,
    fuente: { familia: 'Bodoni Moda', pesos: '400;500;700', tipo: 'serif' },
    tokens: {
      '--exp-bg': '#0b0a09',
      '--exp-bg-alt': '#141210',
      '--exp-ink': '#f4efe7',
      '--exp-ink-soft': 'rgba(244, 239, 231, .56)',
      '--exp-line': 'rgba(197, 168, 116, .28)',
      '--exp-accent': '#c5a874',
      '--exp-on-accent': '#0b0a09',
      '--exp-display': '"Bodoni Moda", Didot, Georgia, serif',
      '--exp-display-weight': '400',
      '--exp-display-tracking': '-.01em',
      '--exp-display-leading': '1.04',
      '--exp-kicker-tracking': '.34em',
      '--exp-radius': '2px',
      '--exp-ease': 'cubic-bezier(.19, 1, .22, 1)',
      '--exp-duration': '1.25s',
      '--exp-shift': '38px',
    },
  },

  clasico: {
    nombre: 'Clasico',
    resumen: 'Marfil y vino tinto, serif editorial, composicion simetrica.',
    sugerido: 'Casas patrimoniales, barrios tradicionales, propiedades con historia.',
    oscuro: false,
    fuente: { familia: 'Playfair Display', pesos: '400;500;700', tipo: 'serif' },
    tokens: {
      '--exp-bg': '#f7f3ec',
      '--exp-bg-alt': '#efe7da',
      '--exp-ink': '#231f1c',
      '--exp-ink-soft': 'rgba(35, 31, 28, .6)',
      '--exp-line': 'rgba(35, 31, 28, .16)',
      '--exp-accent': '#7a2230',
      '--exp-on-accent': '#ffffff',
      '--exp-display': '"Playfair Display", Georgia, serif',
      '--exp-display-weight': '500',
      '--exp-display-tracking': '-.015em',
      '--exp-display-leading': '1.06',
      '--exp-kicker-tracking': '.26em',
      '--exp-radius': '3px',
      '--exp-ease': 'cubic-bezier(.25, .8, .35, 1)',
      '--exp-duration': '.9s',
      '--exp-shift': '28px',
    },
  },
});

/**
 * Orden en que se ofrecen al asesor: primero los mas usados, al final los
 * de nicho. Es una decision de presentacion, por eso va explicita y no
 * depende del orden en que esten declarados arriba.
 */
export const CONCEPT_KEYS = [
  'minimal', 'urbano', 'costero', 'campestre',
  'nordico', 'clasico', 'brutalista', 'lujo',
];

export const conceptOf = (clave) => CONCEPTS[clave] ?? CONCEPTS.minimal;

/** Tokens listos para el atributo `style` del contenedor de la landing. */
export const conceptStyle = (clave) => conceptOf(clave).tokens;

/**
 * Carga la familia tipografica del concepto una sola vez.
 * Solo se descarga la fuente que la propiedad realmente usa.
 */
export function ensureConceptFont(clave) {
  const { fuente } = conceptOf(clave);
  if (!fuente || typeof document === 'undefined') return;

  const id = `fuente-${fuente.familia.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${
    encodeURIComponent(fuente.familia).replace(/%20/g, '+')
  }:wght@${fuente.pesos}&display=swap`;
  document.head.appendChild(link);
}

/** Categorias del entorno con su etiqueta e icono. */
export const SURROUNDING_META = Object.freeze({
  gastronomia: { label: 'Gastronomia', icono: '◍' },
  cultura: { label: 'Cultura', icono: '◈' },
  naturaleza: { label: 'Naturaleza', icono: '❖' },
  educacion: { label: 'Educacion', icono: '◇' },
  deporte: { label: 'Deporte', icono: '◉' },
  servicios: { label: 'Servicios', icono: '○' },
  transporte: { label: 'Transporte', icono: '◎' },
});

export const SURROUNDING_KEYS = Object.keys(SURROUNDING_META);

/** Formatos editoriales de imagen: definen como se rompe la cuadricula. */
export const IMAGE_FORMATS = Object.freeze({
  panoramica: { label: 'Panoramica', hint: 'Ocupa el ancho completo' },
  vertical: { label: 'Vertical', hint: 'Se empareja con otra vertical' },
  cuadrada: { label: 'Cuadrada', hint: 'Media columna' },
  detalle: { label: 'Detalle', hint: 'Pequena, con aire alrededor' },
});

export const IMAGE_FORMAT_KEYS = Object.keys(IMAGE_FORMATS);
