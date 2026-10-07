import { useState, useRef, useEffect } from 'react';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { useTranslation } from '@shared/i18n/index.js';

/**
 * Genera estancias sugeridas según el tipo de inmueble para facilitar
 * la exploración guiada en el recorrido 3D.
 */
function obtenerEstanciasSugeridas(tipo, isEn) {
  const t = (tipo ?? '').toLowerCase();
  if (t === 'apartamento') {
    return [
      { id: 'sala', icono: '🛋️', label: isEn ? 'Living Room & Window View' : 'Salón Principal & Ventanal' },
      { id: 'cocina', icono: '🍳', label: isEn ? 'Kitchen & Island' : 'Cocina & Isla' },
      { id: 'suite', icono: '🛏️', label: isEn ? 'Master Suite' : 'Master Suite' },
      { id: 'bano', icono: '🛁', label: isEn ? 'Master Bath' : 'Baño Principal' },
      { id: 'terraza', icono: '🌅', label: isEn ? 'Balcony / Terrace' : 'Balcón / Terraza' },
    ];
  }
  if (t === 'casa') {
    return [
      { id: 'acceso', icono: '🏡', label: isEn ? 'Facade & Porch' : 'Fachada & Porche' },
      { id: 'salon', icono: '🛋️', label: isEn ? 'Great Living Room' : 'Gran Salón Social' },
      { id: 'cocina', icono: '🍳', label: isEn ? 'Gourmet Kitchen' : 'Cocina Gourmet' },
      { id: 'suite', icono: '🛏️', label: isEn ? 'Master Suite' : 'Suite Principal' },
      { id: 'jardin', icono: '🌿', label: isEn ? 'Garden & Outdoor Deck' : 'Jardín & Terraza Exterior' },
    ];
  }
  if (t === 'oficina') {
    return [
      { id: 'recepcion', icono: '🏢', label: isEn ? 'Reception & Lobby' : 'Recepción & Foyer' },
      { id: 'juntas', icono: '💼', label: isEn ? 'Boardroom' : 'Sala de Juntas' },
      { id: 'operativo', icono: '🖥️', label: isEn ? 'Open Office Area' : 'Área Operativa' },
      { id: 'lounge', icono: '☕', label: isEn ? 'Break Room & Lounge' : 'Espacio Break & Lounge' },
    ];
  }
  if (t === 'lote' || t === 'terreno') {
    return [
      { id: 'aerea', icono: '🌐', label: isEn ? '360° Aerial View' : 'Perspectiva Aérea 360°' },
      { id: 'frente', icono: '📐', label: isEn ? 'Front Boundary' : 'Lindero Frontal' },
      { id: 'paisaje', icono: '🌄', label: isEn ? 'Surrounding Landscape' : 'Panorámica del Entorno' },
      { id: 'acceso', icono: '🛣️', label: isEn ? 'Access Road' : 'Vía de Conexión' },
    ];
  }
  return [
    { id: 'social', icono: '🛋️', label: isEn ? 'Social Area' : 'Área Social' },
    { id: 'privada', icono: '🛏️', label: isEn ? 'Private Area' : 'Área Privada' },
    { id: 'exterior', icono: '🌿', label: isEn ? 'Outdoor Zone' : 'Zona Exterior' },
  ];
}

/**
 * Bloque de Recorrido Virtual 3D Inmersivo de Alta Fidelidad.
 * Integra gemelos espaciales Matterport / Kuula con controles de pantalla completa,
 * selector de estancias guiadas y tips de interacción espacial.
 */
export function VirtualTour({ propiedad }) {
  const url = propiedad.historia?.tourUrl;
  const { isEn } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [estanciaActiva, setEstanciaActiva] = useState(null);
  const [mostrarGuia, setMostrarGuia] = useState(true);
  const [cargandoIframe, setCargandoIframe] = useState(true);
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);
  const wrapRef = useRef(null);

  const estancias = obtenerEstanciasSugeridas(propiedad.tipo, isEn);

  useEffect(() => {
    if (!wrapRef.current || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [inView]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!url) return null;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Error al alternar pantalla completa:', err);
    }
  };

  const reiniciarRecorrido = () => {
    setCargandoIframe(true);
    setIframeKey((prev) => prev + 1);
  };

  const seleccionarEstancia = (estancia) => {
    setEstanciaActiva(estancia);
  };

  return (
    <section id="tour-3d" className="exp-section exp-tour">
      <Reveal>
        <div className="exp-tour__header-pre">
          <span className="exp-tour__live-pill">
            <span className="exp-tour__live-dot" />
            {isEn ? '3D IMMERSIVE SPACE' : 'ESPACIO INMERSIVO 3D'}
          </span>
          <span className="exp-kicker">{isEn ? 'Interactive Spatial Twin' : 'Modelo Espacial Interactivo'}</span>
        </div>
        <h2 className="exp-title">
          {isEn ? 'Walk through the property before visiting in person' : 'Camine la propiedad antes de visitarla'}
        </h2>
        <p className="exp-tour__description">
          {isEn
            ? 'High-definition three-dimensional digital twin. Walk room by room, appreciate high-end finishes, and understand the true floor layout.'
            : 'Gemelo digital tridimensional de alta definición. Explore los espacios a escala real, aprecie los acabados y descubra la distribución habitación por habitación.'}
        </p>
      </Reveal>

      {/* Selector de estancias y ambientes */}
      <Reveal delay={80}>
        <div className="exp-tour__hotspots">
          <span className="exp-tour__hotspots-label">
            {isEn ? 'Room-by-room exploration:' : 'Exploración por ambiente:'}
          </span>
          <div className="exp-tour__hotspots-list" role="tablist" aria-label={isEn ? 'Tour rooms' : 'Ambientes del recorrido'}>
            {estancias.map((est) => {
              const isActive = estanciaActiva?.id === est.id;
              return (
                <button
                  key={est.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`exp-tour__hotspot-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => seleccionarEstancia(est)}
                >
                  <span className="exp-tour__hotspot-icon">{est.icono}</span>
                  <span className="exp-tour__hotspot-name">{est.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Contenedor principal del reproductor espacial */}
      <Reveal delay={140}>
        <div
          ref={containerRef}
          className={`exp-tour__player-container ${isFullscreen ? 'is-fullscreen' : ''}`}
        >
          {/* Barra de herramientas superior del visor */}
          <div className="exp-tour__toolbar">
            <div className="exp-tour__toolbar-info">
              <span className="exp-tour__badge-vr">
                🥽 {url.includes('kuula.co') ? 'Kuula 360° Tour' : '360° Spatial Tour'}
              </span>
              {estanciaActiva && (
                <span className="exp-tour__active-focus">
                  📍 {estanciaActiva.icono} {estanciaActiva.label}
                </span>
              )}
            </div>

            <div className="exp-tour__toolbar-actions">
              <button
                type="button"
                className="exp-tour__tool-btn"
                onClick={reiniciarRecorrido}
                title={isEn ? 'Reset tour perspective' : 'Reiniciar perspectiva inicial del recorrido'}
              >
                <span>🔄</span>
                <span className="exp-tour__tool-text">{isEn ? 'Reset' : 'Reiniciar'}</span>
              </button>

              <button
                type="button"
                className="exp-tour__tool-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? (isEn ? 'Exit full screen' : 'Salir de pantalla completa') : (isEn ? 'View in full screen' : 'Ver en pantalla completa')}
              >
                <span>{isFullscreen ? '🗗' : '⛶'}</span>
                <span className="exp-tour__tool-text">
                  {isFullscreen ? (isEn ? 'Exit' : 'Salir') : (isEn ? 'Full Screen' : 'Pantalla Completa')}
                </span>
              </button>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="exp-tour__tool-btn exp-tour__tool-btn--external"
                title={isEn ? 'Open tour in external full window' : 'Abrir recorrido en ventana completa externa'}
              >
                <span>↗</span>
                <span className="exp-tour__tool-text">{isEn ? 'External window' : 'Ventana externa'}</span>
              </a>
            </div>
          </div>

          {/* Iframe con loader diferido (Lazy load espacial) */}
          <div ref={wrapRef} className="exp-tour__iframe-wrap">
            {inView ? (
              <>
                {cargandoIframe && (
                  <div className="exp-tour__loader">
                    <div className="exp-tour__spinner" />
                    <p>{isEn ? 'Loading 3D spatial tour...' : 'Cargando modelo espacial 3D...'}</p>
                    <small>{isEn ? 'Connecting to immersive cloud' : 'Conectando con la nube inmersiva'}</small>
                  </div>
                )}

                <iframe
                  key={iframeKey}
                  src={url}
                  title={`Recorrido virtual 3D de ${propiedad.nombrePublico}`}
                  allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope; magnetometer"
                  allowFullScreen
                  frameBorder="0"
                  loading="lazy"
                  onLoad={() => setCargandoIframe(false)}
                />
              </>
            ) : (
              <div
                className="exp-tour__loader"
                style={{ cursor: 'pointer' }}
                onClick={() => setInView(true)}
              >
                <div className="exp-tour__spinner" />
                <p>{isEn ? '3D Tour Ready' : 'Recorrido 3D Listo'}</p>
                <small>{isEn ? 'Scroll into view or click to start' : 'Desplácese hacia aquí o haga clic para iniciar'}</small>
              </div>
            )}
          </div>

          {/* Guía flotante interactiva de navegación */}
          {mostrarGuia && (
            <div className="exp-tour__guide-ribbon">
              <div className="exp-tour__guide-text">
                <span className="exp-tour__guide-icon">💡</span>
                <span>
                  <strong>{isEn ? 'Navigation:' : 'Navegación:'}</strong>{' '}
                  {isEn
                    ? 'Drag with mouse or finger to look 360° · Click floor discs to advance · Scroll wheel to zoom in/out.'
                    : 'Arrastre con el mouse o dedo para rotar 360° · Haga clic en los círculos del suelo para avanzar · Rueda del mouse para acercar/alejar.'}
                </span>
              </div>
              <button
                type="button"
                className="exp-tour__guide-close"
                onClick={() => setMostrarGuia(false)}
                title={isEn ? 'Hide tips' : 'Ocultar consejos'}
                aria-label={isEn ? 'Close guide' : 'Cerrar guía'}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

