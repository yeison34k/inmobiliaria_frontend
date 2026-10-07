import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatMoney } from '@shared/lib/format.js';
import { Reveal } from '@shared/ui/Reveal.jsx';

const CITY_COORDS = {
  'bogota': [4.6533, -74.0836],
  'bogotá': [4.6533, -74.0836],
  'medellin': [6.2442, -75.5812],
  'medellín': [6.2442, -75.5812],
  'cali': [3.4516, -76.5320],
  'barranquilla': [10.9685, -74.7813],
  'cartagena': [10.3910, -75.4794],
  'bucaramanga': [7.1254, -73.1198],
  'mosquera': [4.7059, -74.2302],
  'anapoima': [4.5511, -74.5361],
  'jamundi': [3.2606, -76.5414],
  'jamundí': [3.2606, -76.5414],
  'carmen de apicalá': [4.1481, -74.7244],
  'carmen de apicala': [4.1481, -74.7244],
};

const CATEGORY_ICONS = {
  gastronomia: '🍽️',
  parques: '🌳',
  colegios: '🎓',
  servicios: '🏦',
  vias: '🚗',
  cultura: '🎭',
  salud: '🏥',
};

const CATEGORY_NAMES = {
  gastronomia: 'Gastronomía',
  parques: 'Parques',
  colegios: 'Colegios',
  servicios: 'Servicios',
  vias: 'Vías y Transporte',
  cultura: 'Cultura',
  salud: 'Salud',
};

import { TILE_SERVERS } from '@shared/lib/mapConfig.js';

/**
 * Mapa interactivo de ultra-lujo para la Landing Page de la propiedad.
 * Ofrece cartografía fotográfica Satélite HD, vista Editorial y Noche Luxe,
 * visualización perimetral de vecindario, filtros de entorno por categoría,
 * modo de pantalla completa y cálculo de rutas.
 */
export function PropertyLocationMap({ propiedad }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const poiMarkersRef = useRef(new Map());

  const [activeSkin, setActiveSkin] = useState('voyager'); // 'voyager' | 'satellite' | 'dark'
  const [activePoi, setActivePoi] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Determinar coordenadas base
  const ciudadKey = (propiedad.ubicacion?.ciudad || '').toLowerCase().trim();
  const defaultCoord = CITY_COORDS[ciudadKey] || [4.6533, -74.0836];

  const lat = propiedad.latitud !== null && !isNaN(Number(propiedad.latitud))
    ? Number(propiedad.latitud)
    : defaultCoord[0];

  const lng = propiedad.longitud !== null && !isNaN(Number(propiedad.longitud))
    ? Number(propiedad.longitud)
    : defaultCoord[1];

  const puntosTotales = propiedad.entorno ?? [];

  // Filtrado por categoría
  const puntosFiltrados = selectedCategory === 'todas'
    ? puntosTotales
    : puntosTotales.filter((p) => p.categoria === selectedCategory);

  // Categorías presentes en los puntos
  const categoriasPresentes = Array.from(new Set(puntosTotales.map((p) => p.categoria).filter(Boolean)));

  // Inicializar Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const initialConfig = TILE_SERVERS[activeSkin] || TILE_SERVERS.voyager;
    const tileLayer = L.tileLayer(initialConfig.url, {
      maxZoom: initialConfig.maxZoom || 19,
      subdomains: initialConfig.subdomains || 'abc',
      attribution: initialConfig.attribution,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Halo perimetral de exclusividad (350 metros)
    L.circle([lat, lng], {
      radius: 350,
      color: '#0284c7',
      fillColor: '#0284c7',
      fillOpacity: 0.07,
      weight: 1.5,
      dashArray: '4, 8',
    }).addTo(map);

    // Pin principal de la propiedad de alto impacto
    const propIcon = L.divIcon({
      className: 'exp-map-prop-marker-wrapper',
      html: `
        <div class="exp-map-prop-pin">
          <div class="exp-map-prop-pin__pulse"></div>
          <div class="exp-map-prop-pin__dot"></div>
          <div class="exp-map-prop-pin__badge">
            <span class="exp-map-prop-pin__icon">${propiedad.destacada ? '👑' : '🏠'}</span>
            <span class="exp-map-prop-pin__price">${formatMoney(propiedad.precio, propiedad.moneda)}</span>
          </div>
        </div>
      `,
      iconSize: [120, 50],
      iconAnchor: [60, 42],
    });

    const mainMarker = L.marker([lat, lng], { icon: propIcon, zIndexOffset: 1000 }).addTo(map);
    mainMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 4px; min-width: 180px;">
        <strong style="display: block; font-size: 14px; margin-bottom: 2px; color: #0f172a;">${propiedad.nombrePublico ?? propiedad.titulo}</strong>
        <span style="color: #64748b; font-size: 12px;">${propiedad.direccion ? `${propiedad.direccion}, ` : ''}${propiedad.ubicacion?.ciudad || ''}</span>
        <div style="margin-top: 8px; font-weight: 800; font-size: 14px; color: #0284c7;">
          ${formatMoney(propiedad.precio, propiedad.moneda)}
          ${propiedad.operacion === 'arriendo' ? '<small style="font-size: 10px; color: #64748b;">/mes</small>' : ''}
        </div>
      </div>
    `);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng]);

  // Cambio dinámico de skin cartográfico
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = TILE_SERVERS[activeSkin] || TILE_SERVERS.voyager;
    const newTileLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom || 19,
      subdomains: config.subdomains || 'abc',
      attribution: config.attribution,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [activeSkin]);

  // Dibujar puntos de interés del entorno filtrados
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    poiMarkersRef.current.clear();

    if (!puntosFiltrados.length) return;

    puntosFiltrados.forEach((poi, index) => {
      const angle = (index / puntosFiltrados.length) * 2 * Math.PI + (index % 2 === 0 ? 0.25 : -0.25);
      const distKm = Math.min(0.38, Math.max(0.09, (poi.distanciaMin || 5) * 0.04));
      const poiLat = lat + (distKm / 111) * Math.sin(angle);
      const poiLng = lng + (distKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle);

      const icono = CATEGORY_ICONS[poi.categoria] || '📍';

      const poiIcon = L.divIcon({
        className: 'exp-map-poi-wrapper',
        html: `
          <div class="exp-map-poi-marker ${activePoi?.nombre === poi.nombre ? 'is-active' : ''}" id="poi-pin-${poi.id || index}">
            <span class="exp-map-poi-emoji">${icono}</span>
            <span class="exp-map-poi-name">${poi.nombre}</span>
          </div>
        `,
        iconSize: [110, 32],
        iconAnchor: [55, 16],
      });

      const marker = L.marker([poiLat, poiLng], { icon: poiIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 4px; min-width: 170px;">
          <strong style="color: #0f172a; font-size: 13px;">${icono} ${poi.nombre}</strong>
          ${poi.descripcion ? `<p style="margin: 4px 0 6px; color: #475569; font-size: 12px;">${poi.descripcion}</p>` : ''}
          ${poi.distanciaMin ? `<span style="display: inline-block; padding: 2px 6px; border-radius: 999px; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700;">A ${poi.distanciaMin} min a pie / auto</span>` : ''}
        </div>
      `);

      marker.on('click', () => {
        setActivePoi(poi);
      });

      marker.addTo(layer);
      poiMarkersRef.current.set(poi.id || index, marker);
    });
  }, [puntosFiltrados, lat, lng, activePoi?.nombre]);

  const enfocarPoi = (poi, index) => {
    setActivePoi(poi);
    const marker = poiMarkersRef.current.get(poi.id || index);
    const map = mapInstanceRef.current;
    if (marker && map) {
      map.flyTo(marker.getLatLng(), 17, { animate: true, duration: 0.8 });
      setTimeout(() => marker.openPopup(), 400);
    }
  };

  const centrarPropiedad = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
    }
  };

  const copiarCoordenadas = () => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard?.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 280);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <section className="exp-section exp-mapa-ubicacion">
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p className="exp-kicker">Geolocalización & Entorno de Alta Gama</p>
            <h2 className="exp-title">Ubicación Privilegiada</h2>
            <p className="exp-mapa-lead" style={{ margin: 0, color: 'var(--exp-ink-soft)', maxWidth: '64ch' }}>
              {[propiedad.direccion, propiedad.ubicacion?.barrio, propiedad.ubicacion?.ciudad].filter(Boolean).join(', ')}.
              Inspeccione la propiedad desde la vista Satélite HD o explore los servicios del vecindario.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="exp-mapa-btn"
              onClick={copiarCoordenadas}
              title="Copiar coordenadas geográficas"
            >
              {copiedCoords ? '✓ ¡Coordenadas Copiadas!' : '📋 GPS: ' + lat.toFixed(4) + ', ' + lng.toFixed(4)}
            </button>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="exp-mapa-btn"
              title="Abrir indicaciones en Google Maps"
            >
              🧭 Abrir en Google Maps ↗
            </a>
          </div>
        </div>
      </Reveal>

      {/* Contenedor del Mapa con capacidades de Ultra-Lujo */}
      <div className={`exp-mapa-card ${isFullscreen ? 'exp-mapa-card--fullscreen' : ''}`}>
        {/* Barra superior de controles sobre el mapa */}
        <div className="exp-mapa-header-overlay">
          <div className="exp-mapa-badge">
            <span>📍</span> {[propiedad.ubicacion?.barrio, propiedad.ubicacion?.ciudad].filter(Boolean).join(', ')}
          </div>

          <div className="exp-mapa-controls-right">
            {/* Selector de Capas Cartográficas (Satélite HD, Editorial, Noche Luxe) */}
            <div className="exp-mapa-skins" role="group" aria-label="Capa de mapa">
              {Object.entries(TILE_SERVERS).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  className={`exp-skin-btn ${activeSkin === key ? 'is-active' : ''}`}
                  onClick={() => setActiveSkin(key)}
                  title={`Cambiar a ${config.label}`}
                >
                  <span>{config.icon}</span> {config.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="exp-mapa-btn"
              onClick={centrarPropiedad}
              title="Centrar en el inmueble"
            >
              🎯 Inmueble
            </button>

            <button
              type="button"
              className={`exp-mapa-btn ${isFullscreen ? 'is-active' : ''}`}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa'}
            >
              {isFullscreen ? '✕ Reducir' : '⛶ Pantalla Completa'}
            </button>
          </div>
        </div>

        {/* Lienzo Leaflet */}
        <div
          ref={mapContainerRef}
          className="exp-mapa-canvas"
          style={{ height: isFullscreen ? '100vh' : '520px', width: '100%' }}
        />
      </div>

      {/* Barra de Filtros de Categoría del Entorno */}
      {categoriasPresentes.length > 0 && (
        <div className="exp-mapa-cat-bar" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--exp-ink-soft)', marginRight: '0.3rem' }}>
            Explorar entorno:
          </span>
          <button
            type="button"
            className={`exp-cat-filter-btn ${selectedCategory === 'todas' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('todas')}
          >
            Todos ({puntosTotales.length})
          </button>
          {categoriasPresentes.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`exp-cat-filter-btn ${selectedCategory === cat ? 'is-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_ICONS[cat] || '📍'} {CATEGORY_NAMES[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Lista de Puntos de Interés Interactivos debajo del mapa */}
      {puntosFiltrados.length > 0 && (
        <div className="exp-mapa-poi-grid" style={{ marginTop: '1rem' }}>
          {puntosFiltrados.map((poi, idx) => {
            const icono = CATEGORY_ICONS[poi.categoria] || '📍';
            const isActive = activePoi?.nombre === poi.nombre;
            return (
              <button
                key={poi.id || idx}
                type="button"
                className={`exp-poi-chip ${isActive ? 'is-active' : ''}`}
                onClick={() => enfocarPoi(poi, idx)}
              >
                <span className="exp-poi-chip__icon">{icono}</span>
                <div className="exp-poi-chip__info">
                  <strong>{poi.nombre}</strong>
                  {poi.distanciaMin && <small>A ~{poi.distanciaMin} min</small>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
