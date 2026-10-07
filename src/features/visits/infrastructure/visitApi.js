import { httpClient } from '@shared/api/httpClient.js';

/** Cada endpoint es una decision de la agenda, no un PATCH generico. */
export const visitApi = {
  agenda: (params) => httpClient.get('/visitas/agenda', params),
  search: (params) => httpClient.get('/visitas', params),
  schedule: (data) => httpClient.post('/visitas', data),
  confirm: (id) => httpClient.post(`/visitas/${id}/confirmacion`),
  complete: (id, data) => httpClient.post(`/visitas/${id}/resultado`, data),
  cancel: (id, motivo) => httpClient.post(`/visitas/${id}/cancelacion`, { motivo }),
  noShow: (id, notas) => httpClient.post(`/visitas/${id}/ausencia`, { notas }),
  reschedule: (id, data) => httpClient.post(`/visitas/${id}/reprogramacion`, data),
};
