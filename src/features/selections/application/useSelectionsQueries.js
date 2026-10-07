import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicSelectionApi, selectionApi } from '../infrastructure/selectionApi.js';

export const selectionKeys = {
  all: ['selecciones'],
  list: (filtros) => ['selecciones', 'lista', filtros],
  detail: (id) => ['selecciones', 'detalle', id],
  publica: (token) => ['seleccion-publica', token],
};

export const useSelections = (filtros) => useQuery({
  queryKey: selectionKeys.list(filtros),
  queryFn: () => selectionApi.list(filtros),
});

export const useSelection = (id) => useQuery({
  queryKey: selectionKeys.detail(id),
  queryFn: () => selectionApi.detail(id),
  enabled: Boolean(id),
});

export const usePublicSelection = (token) => useQuery({
  queryKey: selectionKeys.publica(token),
  queryFn: () => publicSelectionApi.view(token),
  enabled: Boolean(token),
  retry: false,
});

export function useSelectionMutations({ onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: selectionKeys.all });

  return {
    create: useMutation({ mutationFn: (d) => selectionApi.create(d), onSuccess: invalidate, onError }),
    update: useMutation({
      mutationFn: ({ id, ...d }) => selectionApi.update(id, d),
      onSuccess: invalidate,
      onError,
    }),
    send: useMutation({ mutationFn: (id) => selectionApi.send(id), onSuccess: invalidate, onError }),
    archive: useMutation({ mutationFn: (id) => selectionApi.archive(id), onSuccess: invalidate, onError }),
  };
}

/** El registro de actividad nunca debe estorbar la navegacion del cliente. */
export function useTrackSelection(token) {
  return (tipo, propiedadId) =>
    publicSelectionApi.track(token, { tipo, propiedadId }).catch(() => {});
}
