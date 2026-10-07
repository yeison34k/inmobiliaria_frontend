import { httpClient } from '@shared/api/httpClient.js';

export const dashboardApi = {
  metrics: () => httpClient.get('/dashboard/metricas'),
  alerts: (params) => httpClient.get('/dashboard/alertas', params),
};
