import { httpClient } from '@shared/api/httpClient.js';

/** Panel: armar, enviar y medir selecciones. */
export const selectionApi = {
  list: (params) => httpClient.get('/selecciones', params),
  detail: (id) => httpClient.get(`/selecciones/${id}`),
  create: (data) => httpClient.post('/selecciones', data),
  update: (id, data) => httpClient.patch(`/selecciones/${id}`, data),
  send: (id) => httpClient.post(`/selecciones/${id}/envio`),
  archive: (id) => httpClient.post(`/selecciones/${id}/archivo`),
};

/** Publico: lo que abre el cliente con el enlace. */
export const publicSelectionApi = {
  view: (token) => httpClient.get(`/seleccion/${token}`),
  track: (token, data) => httpClient.post(`/seleccion/${token}/eventos`, data),
};
