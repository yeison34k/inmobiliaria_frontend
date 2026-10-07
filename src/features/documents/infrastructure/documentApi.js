import { httpClient } from '@shared/api/httpClient.js';

export const documentApi = {
  list: (params) => httpClient.get('/documentos', params),
  expiring: (params) => httpClient.get('/documentos/vencimientos', params),
  remove: (id) => httpClient.delete(`/documentos/${id}`),
  attach: ({ archivo, ...campos }) => {
    const formData = new FormData();
    if (archivo) formData.append('archivo', archivo);
    for (const [clave, valor] of Object.entries(campos)) {
      if (valor !== undefined && valor !== null && valor !== '') formData.append(clave, valor);
    }
    return httpClient.upload('/documentos', formData);
  },
};
