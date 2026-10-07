import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Field } from '@shared/ui/Field.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { mediaApi } from '@shared/api/mediaApi.js';
import { useExperienceMutations, useProperty } from '../../application/usePropertiesQueries.js';
import { CONCEPTS, CONCEPT_KEYS, IMAGE_FORMATS, IMAGE_FORMAT_KEYS, SURROUNDING_META, SURROUNDING_KEYS } from '../../domain/concepts.js';

const historiaVacia = {
  concepto: 'minimal', nombreComercial: '', titular: '', subtitulo: '',
  manifiesto: '', videoUrl: '', tourUrl: '', ctaTexto: '',
};

const limpiar = (obj) => Object.fromEntries(
  Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v]),
);

/** Miniatura de la paleta de un concepto. */
function ConceptSwatch({ clave }) {
  const { tokens } = CONCEPTS[clave];
  return (
    <span className="concepto__swatch" aria-hidden="true">
      <i style={{ background: tokens['--exp-bg'] }} />
      <i style={{ background: tokens['--exp-ink'] }} />
      <i style={{ background: tokens['--exp-accent'] }} />
    </span>
  );
}

/**
 * Editor de la experiencia de una propiedad: el asesor define aqui la
 * personalidad con la que el inmueble se presenta al publico.
 */
export function PropertyExperienceEditor() {
  const { id } = useParams();
  const toast = useToast();
  const { data: propiedad, isLoading, error, refetch } = useProperty(id);
  const mutaciones = useExperienceMutations(id, { onError: (e) => toast.error(e.displayMessage) });

  const [historia, setHistoria] = useState(historiaVacia);
  const [plantas, setPlantas] = useState([]);
  const [entorno, setEntorno] = useState([]);
  const [subiendo, setSubiendo] = useState(null);

  /**
   * Sube el plano al mismo almacenamiento que las fotos y deja la URL en el
   * campo. El nivel se guarda cuando el asesor pulsa "Guardar distribucion".
   */
  const subirPlano = async (index, file) => {
    if (!file) return;
    setSubiendo(index);
    try {
      const { url } = await mediaApi.upload(file, `planos/${propiedad.codigo}`);
      setPlantas((actuales) => actuales.map((p, i) => (i === index ? { ...p, planoUrl: url } : p)));
      toast.success('Plano subido. Recuerde guardar la distribucion.');
    } catch (error) {
      toast.error(error.displayMessage ?? 'No se pudo subir el plano');
    } finally {
      setSubiendo(null);
    }
  };

  useEffect(() => {
    if (!propiedad) return;
    setHistoria({ ...historiaVacia, ...Object.fromEntries(
      Object.entries(propiedad.historia ?? {}).map(([k, v]) => [k, v ?? '']),
    ) });
    setPlantas(propiedad.plantas ?? []);
    setEntorno(propiedad.entorno ?? []);
  }, [propiedad]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const guardarHistoria = () => {
    const { completitud, pendientes, ...campos } = historia;
    mutaciones.saveStory.mutate(limpiar(campos), {
      onSuccess: () => toast.success('Identidad y narrativa actualizadas'),
    });
  };

  const guardarPlantas = () => mutaciones.saveFloors.mutate(
    plantas.map(({ id: pid, nombre, descripcion, areaM2, planoUrl }) => ({
      id: pid, nombre, descripcion: descripcion || null, areaM2: areaM2 || null, planoUrl: planoUrl || null,
    })),
    { onSuccess: () => toast.success('Distribucion guardada') },
  );

  const guardarEntorno = () => mutaciones.saveSurroundings.mutate(
    entorno.map(({ id: eid, categoria, nombre, descripcion, distanciaMin }) => ({
      id: eid, categoria, nombre, descripcion: descripcion || null, distanciaMin: distanciaMin || null,
    })),
    { onSuccess: () => toast.success('Entorno guardado') },
  );

  const setPlanta = (index, patch) =>
    setPlantas(plantas.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  const setPunto = (index, patch) =>
    setEntorno(entorno.map((e, i) => (i === index ? { ...e, ...patch } : e)));

  return (
    <section className="form-page">
      <header className="page__header">
        <div>
          <nav className="breadcrumb">
            <Link to="/admin/propiedades">Inventario</Link><span>/</span>
            <Link to={`/admin/propiedades/${id}`}>{propiedad.codigo}</Link><span>/</span>
            <span>Experiencia</span>
          </nav>
          <h1>Experiencia de {propiedad.nombrePublico}</h1>
          <p className="page__subtitle">
            Identidad visual, narrativa y recorrido de la landing publica.
            {propiedad.historia?.pendientes?.length
              ? ` Falta: ${propiedad.historia.pendientes.join(', ')}.`
              : ' Narrativa completa.'}
          </p>
        </div>
        {['publicada', 'reservada'].includes(propiedad.estado) ? (
          <a className="btn btn--ghost" href={`/propiedades/${propiedad.slug}`} target="_blank" rel="noreferrer">
            Ver landing
          </a>
        ) : null}
      </header>

      {/* ---------------------------- concepto ---------------------------- */}
      <fieldset className="fieldset">
        <legend>Identidad visual</legend>
        <p className="field__hint">
          Define paleta, tipografia, geometria y ritmo de las animaciones de toda la landing.
        </p>
        <div className="conceptos">
          {CONCEPT_KEYS.map((clave) => {
            const concepto = CONCEPTS[clave];
            return (
              <button
                key={clave}
                type="button"
                className={historia.concepto === clave ? 'concepto is-active' : 'concepto'}
                onClick={() => setHistoria({ ...historia, concepto: clave })}
              >
                <ConceptSwatch clave={clave} />
                <strong>{concepto.nombre}</strong>
                <span>{concepto.resumen}</span>
                <em>{concepto.sugerido}</em>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ---------------------------- narrativa ---------------------------- */}
      <fieldset className="fieldset">
        <legend>Narrativa</legend>
        <div className="form-grid">
          <Field label="Nombre comercial" hint="Casa Altamira, The Onyx Penthouse...">
            <input
              value={historia.nombreComercial}
              onChange={(e) => setHistoria({ ...historia, nombreComercial: e.target.value })}
            />
          </Field>
          <Field label="Texto del boton" hint="Agendar un recorrido privado">
            <input
              value={historia.ctaTexto}
              onChange={(e) => setHistoria({ ...historia, ctaTexto: e.target.value })}
            />
          </Field>
        </div>

        <Field
          label="Titular emocional"
          hint="Una promesa de estilo de vida, no la ficha tecnica"
        >
          <input
            value={historia.titular}
            placeholder="El amanecer sobre el valle, todos los dias desde su habitacion"
            onChange={(e) => setHistoria({ ...historia, titular: e.target.value })}
          />
        </Field>

        <Field label="Subtitulo">
          <input
            value={historia.subtitulo}
            onChange={(e) => setHistoria({ ...historia, subtitulo: e.target.value })}
          />
        </Field>

        <Field
          label="Manifiesto"
          hint="La inspiracion del arquitecto, la historia del lugar o como se vive un sabado alli. Separe parrafos con una linea en blanco."
        >
          <textarea
            rows="10"
            value={historia.manifiesto}
            onChange={(e) => setHistoria({ ...historia, manifiesto: e.target.value })}
          />
        </Field>

        <div className="form-grid">
          <Field label="Video del hero" hint="MP4 directo, YouTube o Vimeo">
            <input
              type="url"
              value={historia.videoUrl}
              onChange={(e) => setHistoria({ ...historia, videoUrl: e.target.value })}
            />
          </Field>
          <Field label="Recorrido 3D" hint="URL de Matterport, Kuula o similar">
            <input
              type="url"
              value={historia.tourUrl}
              onChange={(e) => setHistoria({ ...historia, tourUrl: e.target.value })}
            />
          </Field>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--primary" disabled={mutaciones.saveStory.isPending} onClick={guardarHistoria}>
            {mutaciones.saveStory.isPending ? 'Guardando...' : 'Guardar narrativa'}
          </button>
        </div>
      </fieldset>

      {/* ------------------------ galeria editorial ------------------------ */}
      <fieldset className="fieldset">
        <legend>Galeria editorial</legend>
        <p className="field__hint">
          El formato define como rompe la cuadricula. El pie de foto aparece bajo la imagen.
        </p>
        <ul className="galeria-edit">
          {(propiedad.imagenes ?? []).map((imagen) => (
            <li key={imagen.id}>
              <img src={imagen.url} alt={imagen.alt ?? ''} />
              <div>
                <select
                  value={imagen.formato}
                  onChange={(e) => mutaciones.saveImageMeta.mutate({ imagenId: imagen.id, formato: e.target.value })}
                >
                  {IMAGE_FORMAT_KEYS.map((clave) => (
                    <option key={clave} value={clave}>{IMAGE_FORMATS[clave].label}</option>
                  ))}
                </select>
                <input
                  defaultValue={imagen.titulo ?? ''}
                  placeholder="Pie de foto"
                  onBlur={(e) => {
                    if ((imagen.titulo ?? '') === e.target.value) return;
                    mutaciones.saveImageMeta.mutate({ imagenId: imagen.id, titulo: e.target.value || null });
                  }}
                />
                <select
                  value={imagen.plantaId ?? ''}
                  onChange={(e) => mutaciones.saveImageMeta.mutate({
                    imagenId: imagen.id,
                    plantaId: e.target.value || null,
                  })}
                >
                  <option value="">Galeria general</option>
                  {(propiedad.plantas ?? []).map((planta) => (
                    <option key={planta.id} value={planta.id}>{planta.nombre}</option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      </fieldset>

      {/* -------------------------- distribucion --------------------------- */}
      <fieldset className="fieldset">
        <legend>Distribucion por niveles</legend>
        {plantas.map((planta, index) => (
          <div key={planta.id ?? index} className="repetidor">
            <div className="form-grid">
              <Field label="Nombre del nivel" required>
                <input value={planta.nombre ?? ''} onChange={(e) => setPlanta(index, { nombre: e.target.value })} />
              </Field>
              <Field label="Area (m2)">
                <input type="number" min="0" value={planta.areaM2 ?? ''} onChange={(e) => setPlanta(index, { areaM2: e.target.value })} />
              </Field>
              <Field
                label="Plano del nivel"
                hint="Suba la imagen del plano o pegue su URL"
              >
                <div className="campo-archivo">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={planta.planoUrl ?? ''}
                    onChange={(e) => setPlanta(index, { planoUrl: e.target.value })}
                  />
                  <label className="btn btn--ghost btn--sm">
                    {subiendo === index ? 'Subiendo...' : 'Subir imagen'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      hidden
                      onChange={(e) => subirPlano(index, e.target.files?.[0])}
                    />
                  </label>
                </div>
              </Field>
              {planta.planoUrl ? (
                <img className="plano-previo" src={planta.planoUrl} alt={`Plano de ${planta.nombre || 'nivel'}`} />
              ) : null}
            </div>
            <Field label="Descripcion">
              <input value={planta.descripcion ?? ''} onChange={(e) => setPlanta(index, { descripcion: e.target.value })} />
            </Field>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPlantas(plantas.filter((_, i) => i !== index))}>
              Quitar nivel
            </button>
          </div>
        ))}
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => setPlantas([...plantas, { nombre: '', descripcion: '', areaM2: '', planoUrl: '' }])}>
            + Agregar nivel
          </button>
          <button type="button" className="btn btn--primary" disabled={mutaciones.saveFloors.isPending} onClick={guardarPlantas}>
            Guardar distribucion
          </button>
        </div>
      </fieldset>

      {/* ----------------------------- entorno ----------------------------- */}
      <fieldset className="fieldset">
        <legend>Curaduria del vecindario</legend>
        {entorno.map((punto, index) => (
          <div key={punto.id ?? index} className="repetidor">
            <div className="form-grid">
              <Field label="Categoria">
                <select value={punto.categoria ?? 'servicios'} onChange={(e) => setPunto(index, { categoria: e.target.value })}>
                  {SURROUNDING_KEYS.map((clave) => (
                    <option key={clave} value={clave}>{SURROUNDING_META[clave].label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Nombre" required>
                <input value={punto.nombre ?? ''} onChange={(e) => setPunto(index, { nombre: e.target.value })} />
              </Field>
              <Field label="Distancia (min)">
                <input type="number" min="0" value={punto.distanciaMin ?? ''} onChange={(e) => setPunto(index, { distanciaMin: e.target.value })} />
              </Field>
            </div>
            <Field label="Descripcion">
              <input value={punto.descripcion ?? ''} onChange={(e) => setPunto(index, { descripcion: e.target.value })} />
            </Field>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEntorno(entorno.filter((_, i) => i !== index))}>
              Quitar punto
            </button>
          </div>
        ))}
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => setEntorno([...entorno, { categoria: 'gastronomia', nombre: '', descripcion: '', distanciaMin: '' }])}>
            + Agregar punto
          </button>
          <button type="button" className="btn btn--primary" disabled={mutaciones.saveSurroundings.isPending} onClick={guardarEntorno}>
            Guardar entorno
          </button>
        </div>
      </fieldset>
    </section>
  );
}
