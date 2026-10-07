import { httpClient } from '@shared/api/httpClient.js';

/** Adaptador HTTP del feature auth. Es el unico que conoce las rutas. */
export const authApi = {
  login: (credenciales) => httpClient.post('/auth/login', credenciales),
  me: () => httpClient.get('/auth/me'),
  updateProfile: (data) => httpClient.patch('/auth/me', data),
  changePassword: (data) => httpClient.patch('/auth/me/password', data),
  listUsers: (params) => httpClient.get('/auth/usuarios', params),
  createUser: (data) => httpClient.post('/auth/usuarios', data),
  updateUser: (id, data) => httpClient.patch(`/auth/usuarios/${id}`, data),
};
