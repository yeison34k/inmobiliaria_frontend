import { httpClient } from '@shared/api/httpClient.js';

export const requirementApi = {
  list: (params) => httpClient.get('/requerimientos', params),
  create: (data) => httpClient.post('/requerimientos', data),
  update: (id, data) => httpClient.patch(`/requerimientos/${id}`, data),
  deactivate: (id) => httpClient.delete(`/requerimientos/${id}`),
  rematch: (id) => httpClient.post(`/requerimientos/${id}/buscar`),
  matches: (params) => httpClient.get('/requerimientos/coincidencias', params),
  updateMatch: (id, estado) => httpClient.put(`/requerimientos/coincidencias/${id}`, { estado }),
};
