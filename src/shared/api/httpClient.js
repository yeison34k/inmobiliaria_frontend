import { ApiError } from './ApiError.js';
import { tokenStorage } from './tokenStorage.js';

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '') || '';

/**
 * Resuelve una URL de archivo multimedia (imágenes, planos, feeds, etc.)
 * Si la URL es relativa (/uploads/...), le antepone API_BASE_URL.
 * Si es una URL local absoluta (http://localhost:3000/uploads/...), reemplaza el host por API_BASE_URL.
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  if (/^https?:\/\/localhost:\d+/i.test(url)) {
    return url.replace(/^https?:\/\/localhost:\d+/i, API_BASE_URL);
  }
  return url;
}

const buildUrl = (path, query) => {
  const url = `${API_BASE_URL}/api${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
};

async function request(path, { method = 'GET', body, query, formData, signal } = {}) {
  const token = tokenStorage.get();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    signal,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) tokenStorage.clear();
    throw new ApiError({
      status: response.status,
      code: payload.error?.code ?? 'HTTP_ERROR',
      message: payload.error?.message ?? `Error ${response.status}`,
      details: payload.error?.details,
    });
  }

  // La API responde { data, meta? }
  return payload.meta ? { items: payload.data, meta: payload.meta } : payload.data;
}

/** Cliente HTTP compartido: los repositorios de cada feature lo usan. */
export const httpClient = {
  get: (path, query, options) => request(path, { ...options, query }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, body, options) => request(path, { ...options, method: 'DELETE', body }),
  upload: (path, formData) => request(path, { method: 'POST', formData }),
};
