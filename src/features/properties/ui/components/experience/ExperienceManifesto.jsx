import { Reveal } from '@shared/ui/Reveal.jsx';
import { useTranslation } from '@shared/i18n/index.js';

/**
 * Bloque 2: el manifiesto.
 * La inspiracion del arquitecto o como se vive un sabado en esa terraza.
 * Si la propiedad aun no tiene manifiesto, cae a la descripcion tecnica.
 */
export function ExperienceManifesto({ propiedad }) {
  const { isEn } = useTranslation();
  const texto = propiedad.historia?.manifiesto ?? propiedad.descripcion;
  if (!texto) return null;

  const parrafos = texto.split(/\n{2,}/).filter(Boolean);

  return (
    <section className="exp-section exp-manifesto">
      <Reveal className="exp-manifesto__aside" as="aside">
        <p className="exp-kicker">{isEn ? 'The Story' : 'La historia'}</p>
      </Reveal>

      <div className="exp-manifesto__body">
        {parrafos.map((parrafo, index) => (
          <Reveal key={parrafo.slice(0, 24)} delay={index * 90} as="p"
            className={index === 0 ? 'exp-manifesto__lead' : ''}>
            {parrafo}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
