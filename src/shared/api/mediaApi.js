import { httpClient } from './httpClient.js';

/**
 * Subida de archivos al proveedor configurado (Cloudinary o disco local).
 * Devuelve { url, publicId, provider }: la base de datos solo guarda la URL.
 */
export const mediaApi = {
  upload: (file, folder) => {
    const formData = new FormData();
    formData.append('imagen', file);
    if (folder) formData.append('folder', folder);
    return httpClient.upload('/media/imagenes', formData);
  },
};
