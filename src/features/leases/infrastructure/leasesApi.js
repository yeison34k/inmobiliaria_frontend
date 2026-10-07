import { httpClient } from '@shared/api/httpClient.js';

export const leasesApi = {
  list: (params) => httpClient.get('/arrendamientos', params),
  metrics: () => httpClient.get('/arrendamientos/metricas'),
  getById: (id) => httpClient.get(`/arrendamientos/${id}`),
  create: (data) => httpClient.post('/arrendamientos', data),
  addSettlement: (id, data) => httpClient.post(`/arrendamientos/${id}/liquidaciones`, data),
};
