import { httpClient } from '@shared/api/httpClient.js';

export const contactApi = {
  search: (params) => httpClient.get('/contactos', params),
  detail: (id) => httpClient.get(`/contactos/${id}`),
  create: (data) => httpClient.post('/contactos', data),
  update: (id, data) => httpClient.patch(`/contactos/${id}`, data),
  deactivate: (id) => httpClient.delete(`/contactos/${id}`),

  seguimiento: (params) => httpClient.get('/contactos/seguimiento', params),
  getInteracciones: (id) => httpClient.get(`/contactos/${id}/interacciones`),
  registrarInteraccion: (id, data) => httpClient.post(`/contactos/${id}/interacciones`, data),
  proximaAccion: (id, data) => httpClient.put(`/contactos/${id}/proxima-accion`, data),
  moverEtapa: (id, etapa) => httpClient.put(`/contactos/${id}/etapa`, { etapa }),
  asignarAsesor: (id, asesorId) => httpClient.put(`/contactos/${id}/asesor`, { asesorId }),
};
