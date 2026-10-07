import { httpClient } from '@shared/api/httpClient.js';

export const settingsApi = {
  get: () => httpClient.get('/configuracion'),
  update: (data) => httpClient.put('/configuracion', data),
  getPortalFeedJsonUrl: () => `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/configuracion/portales/feed.json`,
  getPortalFeedXmlUrl: () => `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/configuracion/portales/feed.xml`,
};
