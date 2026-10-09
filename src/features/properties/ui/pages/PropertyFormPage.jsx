import { operacionHabilitada } from '@app/config/features.js';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Field } from '@shared/ui/Field.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { mediaApi } from '@shared/api/mediaApi.js';
import { ContactPicker } from '@features/contacts';
import { useExperienceMutations, useProperty, usePropertyMutations } from '../../application/usePropertiesQueries.js';
import { OPERATION_LABELS, TYPE_LABELS } from '../../domain/property.js';
import { emptyDetails, serializeDetails } from '../../domain/detailSpecs.js';
import { CONCEPTS, CONCEPT_KEYS, SURROUNDING_KEYS, SURROUNDING_META } from '../../domain/concepts.js';
import { PropertyDetailFields } from '../components/PropertyDetailFields.jsx';
import { PropertyImageManager } from '../components/PropertyImageManager.jsx';

const CITY_COORDS = {
  'bogota': { lat: 4.6533, lng: -74.0836 },
  'bogotá': { lat: 4.6533, lng: -74.0836 },
  'medellin': { lat: 6.2442, lng: -75.5812 },
  'medellín': { lat: 6.2442, lng: -75.5812 },
  'cali': { lat: 3.4516, lng: -76.5320 },
  'barranquilla': { lat: 10.9685, lng: -74.7813 },
  'cartagena': { lat: 10.3910, lng: -75.4794 },
  'bucaramanga': { lat: 7.1254, lng: -73.1198 },
  'mosquera': { lat: 4.7059, lng: -74.2302 },
  'anapoima': { lat: 4.5511, lng: -74.5361 },
  'jamundi': { lat: 3.2606, lng: -76.5414 },
  'jamundí': { lat: 3.2606, lng: -76.5414 },
  'carmen de apicalá': { lat: 4.1481, lng: -74.7244 },
  'carmen de apicala': { lat: 4.1481, lng: -74.7244 },
};

const formVacio = {
  titulo: '',
  descripcion: '',
  precio: '',
  moneda: 'COP',
  tipo: 'apartamento',
  operacion: 'venta',
  direccion: '',
  latitud: '',
  longitud: '',
  destacada: false,
  propietarioId: null,
  caracteristicas: '',
  ubicacion: { pais: 'Colombia', departamento: 'Cundinamarca', ciudad: 'Bogotá', barrio: '' },
  historia: {
    concepto: 'minimal',
    nombreComercial: '',
    titular: '',
    subtitulo: '',
    manifiesto: '',
    videoUrl: '',
    tourUrl: '',
    ctaTexto: 'Agendar recorrido privado',
  },
};

/** Miniatura de paleta de colores de un concepto de landing. */
function ConceptSwatch({ clave }) {
  const concepto = CONCEPTS[clave];
  if (!concepto) return null;
  const { tokens } = concepto;
  return (
    <span className="concepto__swatch" aria-hidden="true">
      <i style={{ background: tokens['--exp-bg'] }} />
      <i style={{ background: tokens['--exp-ink'] }} />
      <i style={{ background: tokens['--exp-accent'] }} />
    </span>
  );
}

/**
 * Formulario Maestro Unificado de Propiedad.
 * Integra ficha comercial, georreferenciación GPS, identidad visual y temas de landing page,
 * especificaciones técnicas, distribución arquitectónica y galería.
 */
export function PropertyFormPage() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const { data: propiedad, isLoading, error, refetch } = useProperty(id);
  const { create, update } = usePropertyMutations({ onError: (e) => toast.error(e.displayMessage) });
  const mutacionesExp = useExperienceMutations(id, { onError: (e) => toast.error(e.displayMessage) });

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'theme' | 'specs' | 'distribution' | 'gallery'
  const [form, setForm] = useState(formVacio);
  const [detalles, setDetalles] = useState(() => emptyDetails(formVacio.tipo));
  const [plantas, setPlantas] = useState([]);
  const [entorno, setEntorno] = useState([]);
  const [subiendoPlano, setSubiendoPlano] = useState(null);

  useEffect(() => {
    if (!propiedad) return;
    setForm({
      titulo: propiedad.titulo,
      descripcion: propiedad.descripcion ?? '',
      precio: String(propiedad.precio),
      moneda: propiedad.moneda,
      tipo: propiedad.tipo,
      operacion: propiedad.operacion,
      direccion: propiedad.direccion ?? '',
      latitud: propiedad.latitud !== null ? String(propiedad.latitud) : '',
      longitud: propiedad.longitud !== null ? String(propiedad.longitud) : '',
      destacada: propiedad.destacada,
      propietarioId: propiedad.propietarioId,
      caracteristicas: (propiedad.caracteristicas ?? []).join(', '),
      ubicacion: {
        pais: propiedad.ubicacion?.pais ?? 'Colombia',
        departamento: propiedad.ubicacion?.departamento ?? '',
        ciudad: propiedad.ubicacion?.ciudad ?? '',
        barrio: propiedad.ubicacion?.barrio ?? '',
      },
      historia: {
        concepto: propiedad.historia?.concepto ?? 'minimal',
        nombreComercial: propiedad.historia?.nombreComercial ?? '',
        titular: propiedad.historia?.titular ?? '',
        subtitulo: propiedad.historia?.subtitulo ?? '',
        manifiesto: propiedad.historia?.manifiesto ?? '',
        videoUrl: propiedad.historia?.videoUrl ?? '',
        tourUrl: propiedad.historia?.tourUrl ?? '',
        ctaTexto: propiedad.historia?.ctaTexto ?? 'Agendar recorrido privado',
      },
    });
    setDetalles({ ...emptyDetails(propiedad.tipo), ...propiedad.detalles });
    setPlantas(propiedad.plantas ?? []);
    setEntorno(propiedad.entorno ?? []);
  }, [propiedad]);

  const cambiarTipo = (tipo) => {
    setForm({ ...form, tipo });
    setDetalles(emptyDetails(tipo));
  };

  const sugerirCoordenadas = () => {
    const ciudad = (form.ubicacion?.ciudad || '').toLowerCase().trim();
    let coords = null;
    for (const [cKey, cVal] of Object.entries(CITY_COORDS)) {
      if (ciudad.includes(cKey)) {
        coords = cVal;
        break;
      }
    }
    if (!coords) coords = { lat: 4.6533, lng: -74.0836 };

    // Añade ligero jitter aleatorio para que los pines no queden superpuestos
    const jitterLat = ((Math.random() - 0.5) * 0.008);
    const jitterLng = ((Math.random() - 0.5) * 0.008);

    setForm((prev) => ({
      ...prev,
      latitud: (coords.lat + jitterLat).toFixed(6),
      longitud: (coords.lng + jitterLng).toFixed(6),
    }));
    toast.info(`Coordenadas georreferenciadas sugeridas para ${form.ubicacion?.ciudad || 'Colombia'}.`);
  };

  const subirPlano = async (index, file) => {
    if (!file) return;
    setSubiendoPlano(index);
    try {
      const { url } = await mediaApi.upload(file, `planos/${propiedad?.codigo || 'nuevo'}`);
      setPlantas((actuales) => actuales.map((p, i) => (i === index ? { ...p, planoUrl: url } : p)));
      toast.success('Plano subido con éxito.');
    } catch (err) {
      toast.error(err.displayMessage ?? 'No se pudo subir el plano');
    } finally {
      setSubiendoPlano(null);
    }
  };

  const guardar = async (event) => {
    event.preventDefault();

    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion || undefined,
      precio: Number(form.precio),
      moneda: form.moneda,
      operacion: form.operacion,
      direccion: form.direccion || undefined,
      latitud: form.latitud !== '' && form.latitud !== null ? Number(form.latitud) : null,
      longitud: form.longitud !== '' && form.longitud !== null ? Number(form.longitud) : null,
      destacada: form.destacada,
      propietarioId: form.propietarioId ?? undefined,
      caracteristicas: form.caracteristicas
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      detalles: serializeDetails(form.tipo, detalles),
      ubicacion: {
        pais: form.ubicacion.pais || undefined,
        departamento: form.ubicacion.departamento,
        ciudad: form.ubicacion.ciudad,
        barrio: form.ubicacion.barrio || undefined,
      },
      historia: {
        concepto: form.historia.concepto || 'minimal',
        nombreComercial: form.historia.nombreComercial || null,
        titular: form.historia.titular || null,
        subtitulo: form.historia.subtitulo || null,
        manifiesto: form.historia.manifiesto || null,
        videoUrl: form.historia.videoUrl || null,
        tourUrl: form.historia.tourUrl || null,
        ctaTexto: form.historia.ctaTexto || null,
      },
    };

    if (editando) {
      update.mutate({ id, ...payload }, {
        onSuccess: async () => {
          // Guardar plantas y entorno si hay cambios
          if (plantas.length > 0) {
            await mutacionesExp.saveFloors.mutateAsync(
              plantas.map(({ id: pid, nombre, descripcion, areaM2, planoUrl }) => ({
                id: pid, nombre, descripcion: descripcion || null, areaM2: areaM2 || null, planoUrl: planoUrl || null,
              }))
            ).catch(() => {});
          }
          if (entorno.length > 0) {
            await mutacionesExp.saveSurroundings.mutateAsync(
              entorno.map(({ id: eid, categoria, nombre, descripcion, distanciaMin }) => ({
                id: eid, categoria, nombre, descripcion: descripcion || null, distanciaMin: distanciaMin || null,
              }))
            ).catch(() => {});
          }
          toast.success('Propiedad y experiencia de landing actualizadas exitosamente');
          refetch();
        },
      });
      return;
    }

    create.mutate({ ...payload, tipo: form.tipo }, {
      onSuccess: (creada) => {
        toast.success(`Propiedad ${creada.codigo} creada con concepto "${form.historia.concepto}".`);
        navigate(`/admin/propiedades/${creada.id}/editar`, { replace: true });
      },
    });
  };

  if (editando && isLoading) return <Spinner />;
  if (editando && error) return <ErrorState error={error} onRetry={refetch} />;

  const guardando = create.isPending || update.isPending;
  const conceptoActual = CONCEPTS[form.historia.concepto] || CONCEPTS.minimal;

  return (
    <section className="form-page">
      <header className="page__header">
        <div>
          <nav className="breadcrumb">
            <Link to="/admin/propiedades">Inventario</Link><span>/</span>
            {editando && <><Link to={`/admin/propiedades/${id}`}>{propiedad?.codigo}</Link><span>/</span></>}
            <span>{editando ? 'Editar Propiedad' : 'Nueva Propiedad'}</span>
          </nav>
          <h1>{editando ? `Editar ${propiedad?.codigo}: ${propiedad?.titulo}` : 'Crear Nueva Propiedad'}</h1>
          <p className="page__subtitle">
            Configure la ficha técnica, georreferenciación en mapa, y la experiencia visual completa de la landing page.
          </p>
        </div>
        <div className="page__actions">
          {editando && propiedad?.slug && (
            <a
              className="btn btn--secondary"
              href={`/propiedades/${propiedad.slug}`}
              target="_blank"
              rel="noreferrer"
              title="Abrir la landing page pública con su tema y recorrido en vivo"
            >
              🌐 Ver Landing Pública ↗
            </a>
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : editando ? 'Guardar Cambios' : 'Crear Propiedad'}
          </button>
        </div>
      </header>

      {/* Selector de Pestañas del Formulario Maestro */}
      <nav className="form-tabs" role="tablist" aria-label="Secciones de la propiedad">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'general'}
          className={`form-tab-btn ${activeTab === 'general' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <span>📋</span> Ficha & Ubicación
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'theme'}
          className={`form-tab-btn ${activeTab === 'theme' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('theme')}
        >
          <span>🎨</span> Landing Page & Temas
          <span className="form-tab-badge" style={{ background: conceptoActual.tokens['--exp-bg-alt'] || '#eee' }}>
            {conceptoActual.nombre}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'specs'}
          className={`form-tab-btn ${activeTab === 'specs' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('specs')}
        >
          <span>📐</span> Especificaciones & Amenidades
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'distribution'}
          className={`form-tab-btn ${activeTab === 'distribution' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          <span>🏛️</span> Distribución & Entorno
          {plantas.length > 0 && <span className="form-tab-badge">{plantas.length} niv.</span>}
        </button>

        {editando && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'gallery'}
            className={`form-tab-btn ${activeTab === 'gallery' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <span>🖼️</span> Galería Multimedia
            {propiedad?.imagenes?.length > 0 && (
              <span className="form-tab-badge">{propiedad.imagenes.length} fotos</span>
            )}
          </button>
        )}
      </nav>

      <form onSubmit={guardar}>
        {/* =========================================================================
            PESTAÑA 1: FICHA GENERAL & UBICACIÓN GPS
            ========================================================================= */}
        {activeTab === 'general' && (
          <div className="tab-pane">
            <fieldset className="fieldset">
              <legend>Datos Principales del Inmueble</legend>
              <Field label="Título de la propiedad" required hint="Nombre descriptivo principal visible en el catálogo">
                <input
                  value={form.titulo}
                  required
                  minLength={5}
                  placeholder="Ej. Penthouse duplex con terraza privada y vista panorámica"
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </Field>

              <Field label="Descripción comercial" hint="Mínimo 30 caracteres para poder publicar la ficha">
                <textarea
                  rows="4"
                  value={form.descripcion}
                  placeholder="Descripción detallada de la arquitectura, iluminación, acabados y confort..."
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </Field>

              <div className="form-grid">
                <Field label="Tipo de propiedad" required hint={editando ? 'Inmutable tras la creación' : undefined}>
                  <select value={form.tipo} disabled={editando} onChange={(e) => cambiarTipo(e.target.value)}>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Operación" required>
                  <select value={form.operacion} onChange={(e) => setForm({ ...form, operacion: e.target.value })}>
                    {Object.entries(OPERATION_LABELS)
                      .filter(([value]) => operacionHabilitada(value))
                      .map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Precio" required>
                  <input
                    type="number"
                    min="1"
                    value={form.precio}
                    required
                    placeholder="Ej. 850000000"
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  />
                </Field>

                <Field label="Moneda">
                  <select value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })}>
                    <option value="COP">COP ($ Pesos Colombianos)</option>
                    <option value="USD">USD ($ Dólares)</option>
                    <option value="EUR">EUR (€ Euros)</option>
                  </select>
                </Field>
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend>Ubicación Geográfica & Coordenadas GPS</legend>
              <div className="form-grid">
                <Field label="Departamento" required>
                  <input
                    value={form.ubicacion.departamento}
                    required
                    placeholder="Ej. Cundinamarca, Antioquia..."
                    onChange={(e) => setForm({ ...form, ubicacion: { ...form.ubicacion, departamento: e.target.value } })}
                  />
                </Field>
                <Field label="Ciudad" required>
                  <input
                    value={form.ubicacion.ciudad}
                    required
                    placeholder="Ej. Bogotá, Medellín, Cali..."
                    onChange={(e) => setForm({ ...form, ubicacion: { ...form.ubicacion, ciudad: e.target.value } })}
                  />
                </Field>
                <Field label="Barrio / Sector">
                  <input
                    value={form.ubicacion.barrio}
                    placeholder="Ej. Chicó Norte, El Poblado, Bocagrande..."
                    onChange={(e) => setForm({ ...form, ubicacion: { ...form.ubicacion, barrio: e.target.value } })}
                  />
                </Field>
                <Field label="Dirección exacta (Confidencial)">
                  <input
                    value={form.direccion}
                    placeholder="Ej. Calle 93 # 14-20 Apto 601"
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  />
                </Field>
              </div>

              {/* Coordenadas para el Mapa Interactivo */}
              <div style={{ marginTop: '1rem', background: 'var(--surface-muted)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      📍 Georreferenciación en el Mapa Interactivo
                    </strong>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                      Permite que la propiedad aparezca en el mapa del catálogo público con su píldora de precio.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={sugerirCoordenadas}
                  >
                    🎯 Sugerir GPS por ciudad
                  </button>
                </div>

                <div className="form-grid">
                  <Field label="Latitud (GPS)" hint="Rango entre -90 y 90">
                    <input
                      type="number"
                      step="any"
                      placeholder="Ej. 4.6750"
                      value={form.latitud}
                      onChange={(e) => setForm({ ...form, latitud: e.target.value })}
                    />
                  </Field>
                  <Field label="Longitud (GPS)" hint="Rango entre -180 y 180">
                    <input
                      type="number"
                      step="any"
                      placeholder="Ej. -74.0520"
                      value={form.longitud}
                      onChange={(e) => setForm({ ...form, longitud: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend>Comercial & Portada</legend>
              <div className="form-grid">
                <ContactPicker
                  label="Propietario del inmueble"
                  tipo="propietario"
                  value={form.propietarioId}
                  onChange={(propietarioId) => setForm({ ...form, propietarioId })}
                />
              </div>
              <label className="checkbox" style={{ marginTop: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={form.destacada}
                  onChange={(e) => setForm({ ...form, destacada: e.target.checked })}
                />
                <span>⭐ Destacar en la portada principal y colecciones destacadas</span>
              </label>
            </fieldset>
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 2: LANDING PAGE & TEMAS VISUALES (CONCEPTOS)
            ========================================================================= */}
        {activeTab === 'theme' && (
          <div className="tab-pane">
            {/* Banner de identidad de la landing */}
            <div className="theme-preview-card">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
                  Tema Visual Activo
                </span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.25rem' }}>
                  {conceptoActual.nombre}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-soft)', maxWidth: '50ch' }}>
                  {conceptoActual.resumen}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ConceptSwatch clave={form.historia.concepto} />
                <span className="badge badge--neutral">
                  Tipografía: {conceptoActual.fuente?.familia || 'Moderna'}
                </span>
              </div>
            </div>

            {/* Selector de Temas de Landing Page */}
            <fieldset className="fieldset">
              <legend>Colección & Concepto Visual de la Landing</legend>
              <p className="field__hint">
                Cada concepto transforma automáticamente la paleta de colores, tipografía editorial, geometrías, espaciado y ritmo de animaciones de la landing pública.
              </p>
              <div className="conceptos">
                {CONCEPT_KEYS.map((clave) => {
                  const concepto = CONCEPTS[clave];
                  return (
                    <button
                      key={clave}
                      type="button"
                      className={form.historia.concepto === clave ? 'concepto is-active' : 'concepto'}
                      onClick={() => setForm({ ...form, historia: { ...form.historia, concepto: clave } })}
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

            {/* Narrativa Emocional & Copywriting */}
            <fieldset className="fieldset">
              <legend>Narrativa & Titulares Emocionales</legend>
              <div className="form-grid">
                <Field label="Nombre comercial del edificio / proyecto" hint="Ej. 'Torre Quantum', 'The Penthouse 85', 'Villa La Serena'">
                  <input
                    value={form.historia.nombreComercial}
                    placeholder="Nombre que refuerza el branding del inmueble"
                    onChange={(e) => setForm({ ...form, historia: { ...form.historia, nombreComercial: e.target.value } })}
                  />
                </Field>

                <Field label="Texto del botón de acción (CTA)" hint="Ej. 'Agendar visita privada', 'Solicitar dossier confidencial'">
                  <input
                    value={form.historia.ctaTexto}
                    placeholder="Agendar recorrido privado"
                    onChange={(e) => setForm({ ...form, historia: { ...form.historia, ctaTexto: e.target.value } })}
                  />
                </Field>
              </div>

              <Field
                label="Titular emocional (Headline de Landing Page)"
                hint="La promesa principal de estilo de vida que cautiva al visitante (se muestra en grande en la portada y al pasar el mouse por la tarjeta)"
              >
                <input
                  value={form.historia.titular}
                  placeholder="Ej. 'La serenidad del bosque a cinco minutos de la 93' o 'Vivir suspendido sobre la bahía'"
                  onChange={(e) => setForm({ ...form, historia: { ...form.historia, titular: e.target.value } })}
                />
              </Field>

              <Field label="Subtítulo narrativo" hint="Frase secundaria de contexto y atmósfera">
                <input
                  value={form.historia.subtitulo}
                  placeholder="Ej. 'Arquitectura bioclimática diseñada para capturar la luz del atardecer'"
                  onChange={(e) => setForm({ ...form, historia: { ...form.historia, subtitulo: e.target.value } })}
                />
              </Field>

              <Field
                label="Manifiesto de la propiedad"
                hint="La inspiración arquitectónica, la experiencia de vivir en este espacio. Separe párrafos con una línea en blanco."
              >
                <textarea
                  rows="6"
                  value={form.historia.manifiesto}
                  placeholder="Escriba el texto editorial que relata cómo se vive un domingo en este lugar..."
                  onChange={(e) => setForm({ ...form, historia: { ...form.historia, manifiesto: e.target.value } })}
                />
              </Field>
            </fieldset>

            {/* Multimedia inmersivo */}
            <fieldset className="fieldset">
              <legend>Multimedia Inmersivo de la Landing</legend>
              <div className="form-grid">
                <Field label="Video recorrido (Hero)" hint="URL de YouTube, Vimeo o MP4 directo">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.historia.videoUrl}
                    onChange={(e) => setForm({ ...form, historia: { ...form.historia, videoUrl: e.target.value } })}
                  />
                </Field>

                <Field label="Tour Virtual 360°" hint="URL interactiva de Matterport, Kuula o visor 360">
                  <input
                    type="url"
                    placeholder="https://my.matterport.com/show/?m=..."
                    value={form.historia.tourUrl}
                    onChange={(e) => setForm({ ...form, historia: { ...form.historia, tourUrl: e.target.value } })}
                  />
                </Field>
              </div>
            </fieldset>
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 3: ESPECIFICACIONES TÉCNICAS & AMENIDADES
            ========================================================================= */}
        {activeTab === 'specs' && (
          <div className="tab-pane">
            <PropertyDetailFields tipo={form.tipo} values={detalles} onChange={setDetalles} />

            <fieldset className="fieldset">
              <legend>Amenidades & Características</legend>
              <Field
                label="Amenidades del inmueble y conjunto"
                hint="Separadas por comas (ej. Piscina climatizada, Gimnasio dotado, Terraza BBQ, Ascensor privado, Planta eléctrica de suplencia total, Seguridad 24/7)"
              >
                <textarea
                  rows="3"
                  value={form.caracteristicas}
                  placeholder="Gimnasio, Jacuzzi, Balcón panorámico, Zona BBQ, Salón comunal, Vigilancia 24h..."
                  onChange={(e) => setForm({ ...form, caracteristicas: e.target.value })}
                />
              </Field>
            </fieldset>
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 4: DISTRIBUCIÓN POR NIVELES & ENTORNO
            ========================================================================= */}
        {activeTab === 'distribution' && (
          <div className="tab-pane">
            <fieldset className="fieldset">
              <legend>Distribución Arquitectónica por Niveles (Plantas)</legend>
              <p className="field__hint">
                Planos y descripción por nivel de la propiedad. Aparecen en la sección interactiva de distribución de la landing page.
              </p>

              {plantas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface-muted)', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 0.75rem', color: 'var(--text-soft)' }}>
                    No se han registrado niveles o plantas arquitectónicas para este inmueble.
                  </p>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => setPlantas([{ nombre: 'Nivel 1 / Planta Principal', descripcion: '', areaM2: '', planoUrl: '' }])}
                  >
                    + Agregar Primer Nivel
                  </button>
                </div>
              ) : (
                plantas.map((planta, index) => (
                  <div key={planta.id ?? index} className="repetidor" style={{ marginBottom: '1.25rem' }}>
                    <div className="form-grid">
                      <Field label="Nombre del nivel" required>
                        <input
                          value={planta.nombre ?? ''}
                          placeholder="Ej. Primer Nivel - Zona Social"
                          onChange={(e) =>
                            setPlantas(plantas.map((p, i) => (i === index ? { ...p, nombre: e.target.value } : p)))
                          }
                        />
                      </Field>
                      <Field label="Área de este nivel (m²)">
                        <input
                          type="number"
                          min="0"
                          value={planta.areaM2 ?? ''}
                          placeholder="Ej. 120"
                          onChange={(e) =>
                            setPlantas(plantas.map((p, i) => (i === index ? { ...p, areaM2: e.target.value } : p)))
                          }
                        />
                      </Field>
                      <Field label="Plano arquitectónico" hint="Suba imagen o pegue URL">
                        <div className="campo-archivo">
                          <input
                            type="url"
                            placeholder="https://..."
                            value={planta.planoUrl ?? ''}
                            onChange={(e) =>
                              setPlantas(plantas.map((p, i) => (i === index ? { ...p, planoUrl: e.target.value } : p)))
                            }
                          />
                          <label className="btn btn--ghost btn--sm">
                            {subiendoPlano === index ? 'Subiendo...' : 'Subir plano'}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              hidden
                              onChange={(e) => subirPlano(index, e.target.files?.[0])}
                            />
                          </label>
                        </div>
                      </Field>
                    </div>

                    {planta.planoUrl && (
                      <div style={{ margin: '0.5rem 0' }}>
                        <img
                          src={planta.planoUrl}
                          alt={`Plano ${planta.nombre}`}
                          style={{ maxHeight: '160px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                      </div>
                    )}

                    <Field label="Descripción de los espacios de este nivel">
                      <input
                        value={planta.descripcion ?? ''}
                        placeholder="Ej. Sala con chimenea, comedor independiente, cocina abierta con isla..."
                        onChange={(e) =>
                          setPlantas(plantas.map((p, i) => (i === index ? { ...p, descripcion: e.target.value } : p)))
                        }
                      />
                    </Field>

                    <button
                      type="button"
                      className="btn btn--ghost btn--xs"
                      style={{ color: '#dc2626' }}
                      onClick={() => setPlantas(plantas.filter((_, i) => i !== index))}
                    >
                      × Eliminar este nivel
                    </button>
                  </div>
                ))
              )}

              {plantas.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() =>
                      setPlantas([...plantas, { nombre: `Nivel ${plantas.length + 1}`, descripcion: '', areaM2: '', planoUrl: '' }])
                    }
                  >
                    + Agregar otro nivel
                  </button>
                </div>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend>Curaduría del Entorno & Puntos de Interés</legend>
              <p className="field__hint">
                Puntos de interés cercanos al inmueble para ilustrar el estilo de vida del vecindario en la landing.
              </p>

              {entorno.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface-muted)', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 0.75rem', color: 'var(--text-soft)' }}>
                    No se han registrado puntos del vecindario.
                  </p>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() =>
                      setEntorno([
                        { categoria: 'gastronomia', nombre: 'Zona Rosa / Restaurantes', descripcion: 'Oferta gastronómica exclusiva', distanciaMin: 5 },
                        { categoria: 'parques', nombre: 'Parque de la 93', descripcion: 'Espacio verde y recreación', distanciaMin: 7 },
                      ])
                    }
                  >
                    + Agregar Puntos Sugeridos
                  </button>
                </div>
              ) : (
                entorno.map((punto, index) => (
                  <div key={punto.id ?? index} className="repetidor" style={{ marginBottom: '1rem' }}>
                    <div className="form-grid">
                      <Field label="Categoría">
                        <select
                          value={punto.categoria ?? 'gastronomia'}
                          onChange={(e) =>
                            setEntorno(entorno.map((pt, i) => (i === index ? { ...pt, categoria: e.target.value } : pt)))
                          }
                        >
                          {SURROUNDING_KEYS.map((k) => (
                            <option key={k} value={k}>{SURROUNDING_META[k].label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Nombre del lugar" required>
                        <input
                          value={punto.nombre ?? ''}
                          placeholder="Ej. Club El Nogal, Colegio Nueva Granada..."
                          onChange={(e) =>
                            setEntorno(entorno.map((pt, i) => (i === index ? { ...pt, nombre: e.target.value } : pt)))
                          }
                        />
                      </Field>
                      <Field label="Distancia a pie/auto (min)">
                        <input
                          type="number"
                          min="0"
                          value={punto.distanciaMin ?? ''}
                          placeholder="Ej. 5"
                          onChange={(e) =>
                            setEntorno(entorno.map((pt, i) => (i === index ? { ...pt, distanciaMin: e.target.value } : pt)))
                          }
                        />
                      </Field>
                    </div>

                    <Field label="Breve reseña del sitio">
                      <input
                        value={punto.descripcion ?? ''}
                        placeholder="Ej. Reconocido por su alta cocina y terrazas al aire libre..."
                        onChange={(e) =>
                          setEntorno(entorno.map((pt, i) => (i === index ? { ...pt, descripcion: e.target.value } : pt)))
                        }
                      />
                    </Field>

                    <button
                      type="button"
                      className="btn btn--ghost btn--xs"
                      style={{ color: '#dc2626' }}
                      onClick={() => setEntorno(entorno.filter((_, i) => i !== index))}
                    >
                      × Quitar punto
                    </button>
                  </div>
                ))
              )}

              {entorno.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() =>
                      setEntorno([...entorno, { categoria: 'servicios', nombre: '', descripcion: '', distanciaMin: '' }])
                    }
                  >
                    + Agregar otro punto de interés
                  </button>
                </div>
              )}
            </fieldset>
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 5: GALERÍA FOTOGRÁFICA
            ========================================================================= */}
        {activeTab === 'gallery' && (
          <div className="tab-pane">
            {editando && propiedad ? (
              <PropertyImageManager propiedad={propiedad} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--surface-muted)', borderRadius: '12px' }}>
                <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
                  📸 Las fotografías se gestionan inmediatamente tras crear el borrador
                </p>
                <p style={{ color: 'var(--text-soft)', maxWidth: '48ch', margin: '0 auto 1.5rem', fontSize: '0.85rem' }}>
                  Guarde los datos básicos y el tema visual para habilitar la subida masiva de imágenes y la selección de foto principal.
                </p>
                <button type="submit" className="btn btn--primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Crear y Subir Imágenes →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Barra Inferior de Guardado Global */}
        <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/admin/propiedades')}>
            ← Volver al Inventario
          </button>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>
              Tema activo: <strong>{conceptoActual.nombre}</strong>
            </span>
            <button type="submit" className="btn btn--primary" disabled={guardando}>
              {guardando ? 'Guardando...' : editando ? 'Guardar Cambios' : 'Crear Propiedad'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
