import { httpClient } from '@shared/api/httpClient.js';

export const templateApi = {
  list: (params) => httpClient.get('/plantillas', params),
  save: (data) => httpClient.put('/plantillas', data),
  remove: (id) => httpClient.delete(`/plantillas/${id}`),
  /** El backend arma el mensaje y, si es WhatsApp, el enlace de clic directo. */
  render: (clave, data) => httpClient.post(`/plantillas/${clave}/render`, data),
};
