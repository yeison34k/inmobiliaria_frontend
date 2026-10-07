import { httpClient } from '@shared/api/httpClient.js';

/** Cada endpoint representa una transicion explicita del negocio. */
export const operationApi = {
  search: (params) => httpClient.get('/operaciones', params),
  detail: (id) => httpClient.get(`/operaciones/${id}`),
  reserve: (data) => httpClient.post('/operaciones/reservas', data),
  close: (id, data) => httpClient.post(`/operaciones/${id}/cierre`, data),
  cancel: (id, data) => httpClient.post(`/operaciones/${id}/caida`, data),
  directClosing: (data) => httpClient.post('/operaciones/cierres-directos', data),
  updateNotes: (id, data) => httpClient.patch(`/operaciones/${id}/notas`, data),

  // Comisiones y liquidación
  getCommission: (id) => httpClient.get(`/operaciones/${id}/comision`),
  setCommission: (id, lineas) => httpClient.put(`/operaciones/${id}/comision`, { lineas }),
  updatePayoutStatus: (lineaId, data) => httpClient.put(`/operaciones/comision/${lineaId}/estado`, data),
  getPayoutReport: (params) => httpClient.get('/operaciones/liquidacion', params),
  getMyCommission: (params) => httpClient.get('/operaciones/mi-comision', params),
};
