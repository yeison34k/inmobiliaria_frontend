import { httpClient } from '@shared/api/httpClient.js';

/** Catalogo publico: no requiere sesion. */
export const catalogApi = {
  search: (params) => httpClient.get('/catalogo', params),
  detailBySlug: (slug) => httpClient.get(`/catalogo/${slug}`),
};

/** Inventario del panel: requiere sesion. */
export const propertyApi = {
  search: (params) => httpClient.get('/propiedades', params),
  detail: (id) => httpClient.get(`/propiedades/${id}`),
  create: (data) => httpClient.post('/propiedades', data),
  update: (id, data) => httpClient.patch(`/propiedades/${id}`, data),
  remove: (id) => httpClient.delete(`/propiedades/${id}`),
  changeStatus: (id, data) => httpClient.post(`/propiedades/${id}/estado`, data),
  priceHistory: (id) => httpClient.get(`/propiedades/${id}/precios`),
  history: (id) => httpClient.get(`/propiedades/${id}/historial`),

  // --- imagenes ---
  addImageByUrl: (id, data) => httpClient.post(`/propiedades/${id}/imagenes`, data),
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append('imagen', file);
    return httpClient.upload(`/propiedades/${id}/imagenes`, formData);
  },
  removeImage: (id, imagenId) => httpClient.delete(`/propiedades/${id}/imagenes/${imagenId}`),
  setMainImage: (id, imagenId) => httpClient.post(`/propiedades/${id}/imagenes/${imagenId}/principal`),
  updateImageMeta: (id, imagenId, meta) => httpClient.patch(`/propiedades/${id}/imagenes/${imagenId}`, meta),

  // --- experiencia: identidad visual, narrativa, plantas y entorno ---
  updateStory: (id, data) => httpClient.patch(`/propiedades/${id}/historia`, data),
  setFloors: (id, plantas) => httpClient.put(`/propiedades/${id}/plantas`, { plantas }),
  setSurroundings: (id, entorno) => httpClient.put(`/propiedades/${id}/entorno`, { entorno }),
};

export const locationApi = {
  list: (params) => httpClient.get('/ubicaciones', params),
  cities: () => httpClient.get('/ubicaciones/ciudades'),
};
