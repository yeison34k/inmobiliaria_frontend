import { httpClient } from '@shared/api/httpClient.js';

export const notificationApi = {
  list: (params) => httpClient.get('/avisos', params),
  markRead: (id) => httpClient.post(`/avisos/${id}/leida`),
  markAllRead: () => httpClient.post('/avisos/leidas'),
};
