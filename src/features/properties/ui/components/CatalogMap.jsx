import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatMoney } from '@shared/lib/format.js';
import { OPERATION_LABELS, TYPE_LABELS } from '../../domain/property.js';
import { detailsSummary } from '../../domain/detailSpecs.js';

import { TILE_SERVERS } from '@shared/lib/mapConfig.js';

/**
 * Precio corto para el globo del marcador.
 *
 * Todo lo que pasa del millon se dice en millones, igual que los KPI del
 * panel. Antes habia una rama en "B": en espanol un billon es un millon de
 * millones, asi que "$3.4B" se leia como mil veces el precio real. Y el
 * separador decimal sale de Intl, no de toFixed, para que en espanol sea
 * la coma.
 */
function formatShortPrice(val, operacion) {
  if (!val) return '$0';
  const sufijo = operacion === 'arriendo' ? '/m' : '';

  if (val >= 1_000_000) {
    const millones = val / 1_000_000;
    const decimales = millones >= 100 || Number.isInteger(millones) ? 0 : 1;
    const texto = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    }).format(millones);
    return `$${texto}M${sufijo}`;
  }

  return `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val / 1000)}k${sufijo}`;
}

/**
 * Mapa interactivo de ultra-lujo para exploración de inmuebles.
 * Incluye capas intercambiables (Editorial, Noche Luxe, Satélite HD),
 * pines con aura luminosa, carrusel de fotografías en tarjeta flotante,
 * búsqueda en vivo sobre el mapa y modo de pantalla completa.
 */
export function CatalogMap({
  propiedades = [],
  hoveredPropertyId = null,
  onSelectProperty = null,
  height = '640px',
  showFloatingCard = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markersMapRef = useRef(new Map());

  const [activeSkin, setActiveSkin] = useState('voyager'); // 'voyager' | 'dark' | 'satellite'
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [mapSearch, setMapSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Propiedades válidas con coordenadas
  const georreferenciadas = propiedades.filter(
    (p) => p.latitud !== null && p.longitud !== null && !isNaN(p.latitud) && !isNaN(p.longitud)
  );

  // Filtrado interno opcional por búsqueda directa sobre el mapa
  const propiedadesAMostrar = mapSearch.trim()
    ? georreferenciadas.filter((p) => {
        const q = mapSearch.toLowerCase();
        return (
          p.titulo?.toLowerCase().includes(q) ||
          p.ubicacion?.ciudad?.toLowerCase().includes(q) ||
          p.ubicacion?.barrio?.toLowerCase().includes(q)
        );
      })
    : georreferenciadas;

  // Inicialización del mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [4.6533, -74.0836],
      zoom: 12,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Capa base inicial
    const initialConfig = TILE_SERVERS[activeSkin] || TILE_SERVERS.voyager;
    const tileLayer = L.tileLayer(initialConfig.url, {
      maxZoom: initialConfig.maxZoom || 19,
      subdomains: initialConfig.subdomains || 'abc',
      attribution: initialConfig.attribution,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Cambio dinámico de Skin / Capa Cartográfica sin recargar marcadores
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

  // Actualizar marcadores cuando cambian las propiedades o el filtro interno
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markersMapRef.current.clear();

    if (propiedadesAMostrar.length === 0) return;

    const bounds = L.latLngBounds();

    propiedadesAMostrar.forEach((prop) => {
      const lat = Number(prop.latitud);
      const lng = Number(prop.longitud);
      bounds.extend([lat, lng]);

      const isArriendo = prop.operacion === 'arriendo';
      const isDestacada = Boolean(prop.destacada);
      const shortPrice = formatShortPrice(prop.precio, prop.operacion);
      const isSelected = selectedProperty?.id === prop.id;
      const isHovered = hoveredPropertyId === prop.id;

      // Icono HTML enriquecido con aura y estados de hover
      const icon = L.divIcon({
        className: 'catalog-map-marker-wrapper',
        html: `
          <div class="luxury-map-pin ${isArriendo ? 'luxury-map-pin--arriendo' : 'luxury-map-pin--venta'} ${isDestacada ? 'luxury-map-pin--destacada' : ''} ${isSelected ? 'is-selected' : ''} ${isHovered ? 'is-hovered' : ''}" id="map-pin-${prop.id}">
            ${isDestacada ? '<span class="luxury-map-pin__crown">👑</span>' : isArriendo ? '<span class="luxury-map-pin__icon">🔑</span>' : '<span class="luxury-map-pin__icon">🏷️</span>'}
            <span class="luxury-map-pin__text">${shortPrice}</span>
          </div>
        `,
        iconSize: [92, 36],
        iconAnchor: [46, 18],
      });

      const marker = L.marker([lat, lng], { icon });

      marker.on('click', () => {
        setSelectedProperty(prop);
        setCurrentPhotoIndex(0);
        if (onSelectProperty) onSelectProperty(prop);
        map.panTo([lat, lng], { animate: true, duration: 0.6 });
      });

      marker.addTo(markersLayer);
      markersMapRef.current.set(prop.id, marker);
    });

    if (bounds.isValid() && !mapSearch) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: false,
      });
    }
  }, [propiedadesAMostrar.length, activeSkin, hoveredPropertyId, selectedProperty?.id, mapSearch]);

  // Manejar hover exterior
  useEffect(() => {
    if (!hoveredPropertyId) return;
    const marker = markersMapRef.current.get(hoveredPropertyId);
    if (marker) {
      const el = document.getElementById(`map-pin-${hoveredPropertyId}`);
      if (el) el.classList.add('is-hovered');
    }
    return () => {
      if (hoveredPropertyId) {
        const el = document.getElementById(`map-pin-${hoveredPropertyId}`);
        if (el) el.classList.remove('is-hovered');
      }
    };
  }, [hoveredPropertyId]);

  const fitAllBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || georreferenciadas.length === 0) return;
    const bounds = L.latLngBounds();
    georreferenciadas.forEach((p) => bounds.extend([Number(p.latitud), Number(p.longitud)]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  };

  // Fotos de la propiedad seleccionada para el carrusel interno
  const fotosSeleccionada = selectedProperty
    ? (selectedProperty.imagenes?.length ? selectedProperty.imagenes.map((i) => i.url) : [selectedProperty.imagenPrincipal]).filter(Boolean)
    : [];

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (fotosSeleccionada.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % fotosSeleccionada.length);
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (fotosSeleccionada.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + fotosSeleccionada.length) % fotosSeleccionada.length);
  };

  return (
    <div
      className={`luxury-map-outer ${isFullscreen ? 'luxury-map-outer--fullscreen' : ''}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Barra de Controles Flotante de Alta Gama */}
      <div className="luxury-map-topbar">
        {/* Contador & Búsqueda rápida sobre el mapa */}
        <div className="luxury-map-search-badge">
          <span className="luxury-map-counter-pill">
            📍 {propiedadesAMostrar.length} inmuebles
          </span>
          <div className="luxury-map-mini-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Filtrar zona o barrio..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
            />
            {mapSearch && (
              <button type="button" onClick={() => setMapSearch('')} className="luxury-map-clear-btn">
                ×
              </button>
            )}
          </div>
        </div>

        {/* Selector de Capas Cartográficas */}
        <div className="luxury-map-actions">
          <div className="luxury-map-skins" role="group" aria-label="Estilo del mapa">
            {Object.entries(TILE_SERVERS).map(([key, config]) => (
              <button
                key={key}
                type="button"
                className={`luxury-skin-btn ${activeSkin === key ? 'is-active' : ''}`}
                onClick={() => setActiveSkin(key)}
                title={`Cambiar a vista ${config.label}`}
              >
                <span>{config.icon}</span> {config.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="luxury-map-icon-btn"
            onClick={fitAllBounds}
            title="Ajustar encuadre a todas las propiedades"
          >
            🎯 Recentrar
          </button>

          <button
            type="button"
            className={`luxury-map-icon-btn ${isFullscreen ? 'is-active' : ''}`}
            onClick={() => {
              setIsFullscreen((prev) => !prev);
              setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
            }}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa'}
          >
            {isFullscreen ? '✕ Reducir' : '⛶ Pantalla Completa'}
          </button>
        </div>
      </div>

      {/* Contenedor Leaflet */}
      <div ref={mapContainerRef} className="luxury-map-canvas" />

      {/* Tarjeta Flotante Interactiva de Gran Impacto (con Carrusel de Fotos) */}
      {showFloatingCard && selectedProperty && (
        <div className="luxury-map-floating-drawer">
          <button
            type="button"
            className="luxury-drawer-close"
            onClick={() => setSelectedProperty(null)}
            aria-label="Cerrar vista previa"
          >
            ×
          </button>

          <div className="luxury-drawer-content">
            {/* Carrusel de Fotografías dentro del mapa */}
            <div className="luxury-drawer-media">
              {fotosSeleccionada.length > 0 ? (
                <img
                  src={fotosSeleccionada[currentPhotoIndex] || fotosSeleccionada[0]}
                  alt={selectedProperty.titulo}
                  className="luxury-drawer-img"
                />
              ) : (
                <div className="luxury-drawer-placeholder">Sin imagen</div>
              )}

              {/* Controles del carrusel */}
              {fotosSeleccionada.length > 1 && (
                <>
                  <button
                    type="button"
                    className="drawer-carousel-btn drawer-carousel-btn--prev"
                    onClick={handlePrevPhoto}
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="drawer-carousel-btn drawer-carousel-btn--next"
                    onClick={handleNextPhoto}
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>
                  <div className="drawer-carousel-indicators">
                    {currentPhotoIndex + 1} / {fotosSeleccionada.length}
                  </div>
                </>
              )}

              {/* Badges superiores */}
              <div className="luxury-drawer-badges">
                <span className={`drawer-op-badge ${selectedProperty.operacion === 'arriendo' ? 'badge--arriendo' : 'badge--venta'}`}>
                  {OPERATION_LABELS[selectedProperty.operacion]}
                </span>
                {selectedProperty.destacada && (
                  <span className="drawer-gold-badge">👑 Destacada</span>
                )}
                {(selectedProperty.tourUrl || selectedProperty.historia?.tourUrl) && (
                  <span className="drawer-tour-badge">🥽 Tour 3D</span>
                )}
              </div>
            </div>

            {/* Información y llamada a la acción */}
            <div className="luxury-drawer-details">
              <span className="luxury-drawer-zone">
                {[selectedProperty.ubicacion?.barrio, selectedProperty.ubicacion?.ciudad].filter(Boolean).join(', ')}
              </span>

              <h3 className="luxury-drawer-title">
                {selectedProperty.nombrePublico ?? selectedProperty.titulo}
              </h3>

              <div className="luxury-drawer-specs">
                <span>{TYPE_LABELS[selectedProperty.tipo] ?? selectedProperty.tipo}</span>
                {detailsSummary(selectedProperty) && <span> · {detailsSummary(selectedProperty)}</span>}
              </div>

              <div className="luxury-drawer-footer">
                <div>
                  <span className="luxury-drawer-price-label">Precio</span>
                  <p className="luxury-drawer-price">
                    {formatMoney(selectedProperty.precio, selectedProperty.moneda)}
                    {selectedProperty.operacion === 'arriendo' && <small>/mes</small>}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {(selectedProperty.tourUrl || selectedProperty.historia?.tourUrl) && (
                    <a
                      href={`/propiedades/${selectedProperty.slug}#tour-3d`}
                      className="btn btn--outline btn--sm drawer-3d-btn"
                      title="Explorar modelo 3D virtual interactivo"
                    >
                      🥽 Tour 3D
                    </a>
                  )}
                  <a
                    href={`/propiedades/${selectedProperty.slug}`}
                    className="btn btn--primary btn--sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Explorar Ficha →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
