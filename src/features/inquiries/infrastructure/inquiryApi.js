import { httpClient } from '@shared/api/httpClient.js';

export const inquiryApi = {
  /** Publico: formulario de contacto del sitio. */
  submit: (data) => httpClient.post('/contacto', data),
  search: (params) => httpClient.get('/consultas', params),
  handle: (id) => httpClient.post(`/consultas/${id}/atender`),
  discard: (id) => httpClient.post(`/consultas/${id}/descartar`),
};
