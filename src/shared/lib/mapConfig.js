/**
 * Configuración centralizada de cartografía y proveedores de tiles (CARTO & Esri).
 */
export const CARTO_API_KEY =
  import.meta.env.VITE_CARTO_API_KEY || 'cb1_459r_1_6277a8a4ade5dbb21a79270e';

const cartoKeyParam = CARTO_API_KEY ? `?key=${encodeURIComponent(CARTO_API_KEY)}` : '';

export const TILE_SERVERS = {
  voyager: {
    id: 'voyager',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${cartoKeyParam}`,
    attribution: '&copy; <a href="https://carto.com/" target="_blank" rel="noreferrer">CARTO</a> &copy; OpenStreetMap',
    label: 'Editorial',
    icon: '🗺️',
    subdomains: 'abcd',
    maxZoom: 20,
  },
  satellite: {
    id: 'satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Earthstar Geographics',
    label: 'Satélite HD',
    icon: '🛰️',
    subdomains: 'abc',
    maxZoom: 19,
  },
  dark: {
    id: 'dark',
    url: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoKeyParam}`,
    attribution: '&copy; <a href="https://carto.com/" target="_blank" rel="noreferrer">CARTO</a> &copy; OpenStreetMap',
    label: 'Noche Luxe',
    icon: '🌙',
    subdomains: 'abcd',
    maxZoom: 20,
  },
};
