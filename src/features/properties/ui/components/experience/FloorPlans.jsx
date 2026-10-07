import { useState } from 'react';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { formatArea } from '@shared/lib/format.js';
import { DummyFloorPlanSVG } from './DummyFloorPlanSVG.jsx';

/**
 * Bloque 5b: planos por nivel, interactivos.
 * El visitante elige "Planta alta" o "Nivel Social" y ve el plano y las fotos de ese nivel.
 * Si no hay plano subido o falla la carga, renderiza automáticamente un plano
 * arquitectónico vectorial esquemático (Dummy Floor Plan) en alta resolución.
 */
export function FloorPlans({ propiedad }) {
  const rawPlantas = propiedad.plantas ?? [];

  // Si la propiedad no tiene plantas explícitas, generamos una distribución esquemática por defecto
  const plantas = rawPlantas.length > 0 ? rawPlantas : [
    {
      id: 'planta-general',
      nombre: propiedad.tipo === 'lote' ? 'Zonificación de Linderos' : 'Planta de Distribución Integral',
      descripcion: propiedad.tipo === 'lote'
        ? `Levantamiento técnico de linderos, topografía y proyección de huella edificable (${propiedad.detalles?.frenteM || 30}m de frente × ${propiedad.detalles?.fondoM || 50}m de fondo).`
        : `Distribución espacial con zonificación integrada de áreas sociales, descanso y servicios (${propiedad.area || 120} m²).`,
      areaM2: propiedad.area || (propiedad.tipo === 'lote' ? propiedad.detalles?.areaM2 : 120),
      planoUrl: null,
    },
  ];

  const [activa, setActiva] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [zoomPlano, setZoomPlano] = useState(false);

  const planta = plantas[Math.min(activa, plantas.length - 1)];
  const fotos = (propiedad.imagenes ?? []).filter((img) => img.plantaId === planta.id);

  const handleTabChange = (index) => {
    setActiva(index);
    setImgError(false);
  };

  return (
    <section className="exp-section exp-plantas" id="seccion-plantas">
      <Reveal>
        <p className="exp-kicker">Distribución Arquitectónica</p>
        <h2 className="exp-title">
          {propiedad.tipo === 'lote' ? 'Plano de linderos y zonificación' : 'Recorra la propiedad por niveles'}
        </h2>
      </Reveal>

      {plantas.length > 1 ? (
        <Reveal delay={100} className="exp-plantas__tabs" as="nav">
          {plantas.map((nivel, index) => (
            <button
              key={nivel.id}
              type="button"
              className={index === activa ? 'is-active' : ''}
              onClick={() => handleTabChange(index)}
            >
              <span>{nivel.nombre}</span>
              {nivel.areaM2 ? <em>{formatArea(nivel.areaM2)}</em> : null}
            </button>
          ))}
        </Reveal>
      ) : null}

      <Reveal delay={160} className="exp-plantas__panel">
        <div
          className={`exp-plantas__plano ${zoomPlano ? 'is-zoomed' : ''}`}
          style={{ position: 'relative', cursor: 'zoom-in' }}
          onClick={() => setZoomPlano(!zoomPlano)}
          title="Haga clic para ampliar el plano"
        >
          {planta.planoUrl && !imgError ? (
            <img
              src={planta.planoUrl}
              alt={`Plano de ${planta.nombre}`}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <DummyFloorPlanSVG
              nombre={planta.nombre}
              areaM2={planta.areaM2}
              tipo={propiedad.tipo}
              codigo={propiedad.codigo}
            />
          )}

          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
              letterSpacing: '0.04em',
            }}
          >
            ✦ {zoomPlano ? 'Clic para reducir' : 'Clic para ampliar plano'}
          </div>
        </div>

        <div className="exp-plantas__info">
          <h3>{planta.nombre}</h3>
          {planta.areaM2 ? <p className="exp-plantas__area">{formatArea(planta.areaM2)}</p> : null}
          {planta.descripcion ? <p>{planta.descripcion}</p> : null}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              margin: '1.25rem 0',
              padding: '0.75rem',
              background: 'var(--exp-bg-alt, #f1f5f9)',
              borderRadius: 'var(--exp-radius, 8px)',
              border: '1px solid var(--exp-line, #e2e8f0)',
              fontSize: '0.75rem',
              color: 'var(--exp-ink-soft, #64748b)',
            }}
          >
            <span>📏 Acotaciones en metros</span>
            <span>·</span>
            <span>🧭 Orientación al Norte</span>
            <span>·</span>
            <span>📐 Escala 1:100</span>
          </div>

          {fotos.length ? (
            <ul className="exp-plantas__fotos">
              {fotos.map((foto) => (
                <li key={foto.id}>
                  <img src={foto.url} alt={foto.alt ?? planta.nombre} loading="lazy" />
                  {foto.titulo ? <span>{foto.titulo}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
