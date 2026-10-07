import { API_BASE_URL, httpClient } from '@shared/api/httpClient.js';

export const settingsApi = {
  get: () => httpClient.get('/configuracion'),
  update: (data) => httpClient.put('/configuracion', data),
  getPortalFeedJsonUrl: () => `${API_BASE_URL}/api/configuracion/portales/feed.json`,
  getPortalFeedXmlUrl: () => `${API_BASE_URL}/api/configuracion/portales/feed.xml`,
};
