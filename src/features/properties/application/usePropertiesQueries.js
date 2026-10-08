import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogApi, locationApi, propertyApi } from '../infrastructure/propertyApi.js';

export const propertyKeys = {
  all: ['propiedades'],
  list: (filtros) => ['propiedades', 'lista', filtros],
  detail: (id) => ['propiedades', 'detalle', id],
  history: (id) => ['propiedades', 'historial', id],
  catalog: (filtros) => ['catalogo', filtros],
  catalogDetail: (slug) => ['catalogo', 'detalle', slug],
};

// ------------------------------- lectura -------------------------------

export const useCatalogSearch = (filtros, options = {}) => useQuery({
  queryKey: propertyKeys.catalog(filtros),
  queryFn: () => catalogApi.search(filtros),
  ...options,
});

export const useCatalogProperty = (slug) => useQuery({
  queryKey: propertyKeys.catalogDetail(slug),
  queryFn: () => catalogApi.detailBySlug(slug),
  enabled: Boolean(slug),
});

export const usePropertiesSearch = (filtros) => useQuery({
  queryKey: propertyKeys.list(filtros),
  queryFn: () => propertyApi.search(filtros),
});

export const useProperty = (id) => useQuery({
  queryKey: propertyKeys.detail(id),
  queryFn: () => propertyApi.detail(id),
  enabled: Boolean(id),
});

export const usePropertyHistory = (id) => useQuery({
  queryKey: propertyKeys.history(id),
  queryFn: () => propertyApi.history(id),
  enabled: Boolean(id),
});

export const usePropertyPriceHistory = (id) => useQuery({
  queryKey: ['propiedades', 'precios', id],
  queryFn: () => propertyApi.priceHistory(id),
  enabled: Boolean(id),
});

export const useCities = () => useQuery({
  queryKey: ['ubicaciones', 'ciudades'],
  queryFn: () => locationApi.cities(),
  staleTime: 5 * 60 * 1000,
});

// ------------------------------ escritura ------------------------------

/** Mutaciones del inventario; invalidan las listas afectadas. */
export function usePropertyMutations({ onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = (id) => {
    queryClient.invalidateQueries({ queryKey: propertyKeys.all });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    if (id) queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
  };

  const create = useMutation({
    mutationFn: (data) => propertyApi.create(data),
    onSuccess: () => invalidate(),
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }) => propertyApi.update(id, data),
    onSuccess: (_result, variables) => invalidate(variables.id),
    onError,
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, estado, motivo }) => propertyApi.changeStatus(id, { estado, motivo }),
    onSuccess: (_result, variables) => invalidate(variables.id),
    onError,
  });

  const remove = useMutation({
    mutationFn: (id) => propertyApi.remove(id),
    onSuccess: () => invalidate(),
    onError,
  });

  return { create, update, changeStatus, remove };
}

/**
 * Mutaciones de la experiencia: identidad visual, narrativa, plantas,
 * entorno y metadatos editoriales de cada imagen.
 */
export function useExperienceMutations(propiedadId, { onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propiedadId) });
    queryClient.invalidateQueries({ queryKey: ['catalogo'] });
  };

  return {
    saveStory: useMutation({
      mutationFn: (data) => propertyApi.updateStory(propiedadId, data),
      onSuccess: invalidate,
      onError,
    }),
    saveFloors: useMutation({
      mutationFn: (plantas) => propertyApi.setFloors(propiedadId, plantas),
      onSuccess: invalidate,
      onError,
    }),
    saveSurroundings: useMutation({
      mutationFn: (entorno) => propertyApi.setSurroundings(propiedadId, entorno),
      onSuccess: invalidate,
      onError,
    }),
    saveImageMeta: useMutation({
      mutationFn: ({ imagenId, ...meta }) => propertyApi.updateImageMeta(propiedadId, imagenId, meta),
      onSuccess: invalidate,
      onError,
    }),
  };
}

/** Gestion de imagenes de una propiedad concreta. */
export function usePropertyImageMutations(propiedadId, { onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propiedadId) });
    queryClient.invalidateQueries({ queryKey: propertyKeys.all });
  };

  return {
    upload: useMutation({
      mutationFn: (file) => propertyApi.uploadImage(propiedadId, file),
      onSuccess: invalidate,
      onError,
    }),
    addByUrl: useMutation({
      mutationFn: (data) => propertyApi.addImageByUrl(propiedadId, data),
      onSuccess: invalidate,
      onError,
    }),
    remove: useMutation({
      mutationFn: (imagenId) => propertyApi.removeImage(propiedadId, imagenId),
      onSuccess: invalidate,
      onError,
    }),
    setMain: useMutation({
      mutationFn: (imagenId) => propertyApi.setMainImage(propiedadId, imagenId),
      onSuccess: invalidate,
      onError,
    }),
  };
}
