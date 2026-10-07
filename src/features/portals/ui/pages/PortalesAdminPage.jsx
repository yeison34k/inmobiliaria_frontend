import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@features/settings';
import { usePropertiesSearch } from '@features/properties';
import { StatCard } from '@shared/ui/StatCard.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';

export function PortalesAdminPage() {
  const toast = useToast();
  const [copiadoXml, setCopiadoXml] = useState(false);
  const [copiadoJson, setCopiadoJson] = useState(false);

  const xmlUrl = settingsApi.getPortalFeedXmlUrl();
  const jsonUrl = settingsApi.getPortalFeedJsonUrl();

  const { data: propsData } = usePropertiesSearch({
    estados: ['publicada'],
    pageSize: 100,
  });

  const propiedades = propsData?.items || [];
  const conGps = propiedades.filter((p) => p.latitud && p.longitud).length;
  const conFotos = propiedades.filter((p) => (p.imagenes || []).length >= 3).length;

  const copiarPortapapeles = (texto, tipo) => {
    navigator.clipboard?.writeText(texto);
    if (tipo === 'xml') {
      setCopiadoXml(true);
      setTimeout(() => setCopiadoXml(false), 2500);
    } else {
      setCopiadoJson(true);
      setTimeout(() => setCopiadoJson(false), 2500);
    }
    toast.success('Enlace de feed copiado al portapapeles');
  };

  return (
    <section className="portales-page">
      <header className="page__header">
        <div>
          <h1>Sindicación & Portales Inmobiliarios</h1>
          <p className="page__subtitle">
            Feeds automáticos en tiempo real para Finca Raíz, Metrocuadrado, Ciencuadras y agregadores
          </p>
        </div>
      </header>

      {/* Métricas de Sindicación */}
      <div className="stats" style={{ marginBottom: '2rem' }}>
        <StatCard
          label="Inmuebles en Feed"
          value={propiedades.length}
          hint="Listos para replicación automática"
          tone="success"
        />
        <StatCard
          label="Con Georreferenciación GPS"
          value={conGps}
          hint={`${Math.round((conGps / (propiedades.length || 1)) * 100)}% del catálogo geolocalizado`}
          tone={conGps === propiedades.length ? 'success' : 'info'}
        />
        <StatCard
          label="Con 3+ Fotografías"
          value={conFotos}
          hint="Requisito de calidad de los portales"
          tone="info"
        />
      </div>

      {/* Tarjetas de Feeds */}
      <div className="dashboard__grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Feed XML Oficial */}
        <article className="panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge--success" style={{ marginBottom: '0.4rem' }}>Formato Estándar XML</span>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Feed XML para Portales</h2>
            </div>
            <span style={{ fontSize: '1.8rem' }}>📡</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
            Feed XML estructurado compatible con los protocolos de importación de <strong>Finca Raíz, Metrocuadrado y Ciencuadras</strong>. Incluye datos de la inmobiliaria, coordenadas GPS, precios y fotos en alta resolución.
          </p>

          <div style={{ background: 'var(--surface-muted)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1rem', border: '1px solid var(--border)' }}>
            {xmlUrl}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => copiarPortapapeles(xmlUrl, 'xml')}
            >
              {copiadoXml ? '✓ ¡Enlace Copiado!' : '📋 Copiar Enlace Feed'}
            </button>
            <a
              href={xmlUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost btn--sm"
            >
              Inspeccionar XML ↗
            </a>
          </div>
        </article>

        {/* Feed JSON Abierto */}
        <article className="panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge--info" style={{ marginBottom: '0.4rem' }}>REST API / JSON</span>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Feed JSON Open Real Estate</h2>
            </div>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
            Endpoint JSON para integraciones con apps móviles, portales inmobiliarios internacionales (Properati, Trovit, Mitula) o sitios web de aliados comerciales.
          </p>

          <div style={{ background: 'var(--surface-muted)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1rem', border: '1px solid var(--border)' }}>
            {jsonUrl}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => copiarPortapapeles(jsonUrl, 'json')}
            >
              {copiadoJson ? '✓ ¡Enlace Copiado!' : '📋 Copiar Enlace Feed'}
            </button>
            <a
              href={jsonUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost btn--sm"
            >
              Inspeccionar JSON ↗
            </a>
          </div>
        </article>
      </div>

      {/* Guía de Homologación con Portales */}
      <article className="panel" style={{ marginTop: '2rem' }}>
        <h2>Cómo conectar tus portales aliados</h2>
        <ol style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text-soft)', lineHeight: 1.7, margin: '0.75rem 0 0' }}>
          <li>
            <strong>Finca Raíz & Metrocuadrado:</strong> Envía la URL del <code>Feed XML</code> a tu ejecutivo de cuenta del portal para que configuren el crawler automático diario.
          </li>
          <li>
            <strong>Actualizaciones automáticas:</strong> Cada vez que publiques o cambies el precio de un inmueble en este panel, el feed reflejará los cambios de inmediato.
          </li>
          <li>
            <strong>Retiro de inventario:</strong> Cuando un inmueble pase a estado <em>Reservada</em> o <em>Vendida</em>, desaparecerá automáticamente del feed para evitar llamadas innecesarias.
          </li>
        </ol>
      </article>
    </section>
  );
}
