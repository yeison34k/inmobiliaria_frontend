import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { operationApi } from '../infrastructure/operationApi.js';

export const operationKeys = {
  all: ['operaciones'],
  list: (filtros) => ['operaciones', 'lista', filtros],
  detail: (id) => ['operaciones', 'detalle', id],
  commission: (id) => ['operaciones', id, 'comision'],
  payoutReport: (params) => ['operaciones', 'liquidacion', params],
  myCommission: (params) => ['operaciones', 'mi-comision', params],
};

export const useOperations = (filtros) => useQuery({
  queryKey: operationKeys.list(filtros),
  queryFn: () => operationApi.search(filtros),
});

export const useOperation = (id) => useQuery({
  queryKey: operationKeys.detail(id),
  queryFn: () => operationApi.detail(id),
  enabled: Boolean(id),
});

/** Reserva activa de una propiedad (para saber que se puede cerrar). */
export const useActiveOperation = (propiedadId) => useQuery({
  queryKey: operationKeys.list({ propiedadId, estado: 'reservada' }),
  queryFn: () => operationApi.search({ propiedadId, estado: 'reservada', pageSize: 1 }),
  enabled: Boolean(propiedadId),
  select: (data) => data.items[0] ?? null,
});

export const useCommission = (operacionId) => useQuery({
  queryKey: operationKeys.commission(operacionId),
  queryFn: () => operationApi.getCommission(operacionId),
  enabled: Boolean(operacionId),
});

/** Lo que el asesor lleva y lo que tiene por cerrar. */
export const useMyCommission = (params = {}) => useQuery({
  queryKey: operationKeys.myCommission(params),
  queryFn: () => operationApi.getMyCommission(params),
});

export const usePayoutReport = (params = {}) => useQuery({
  queryKey: operationKeys.payoutReport(params),
  queryFn: () => operationApi.getPayoutReport(params),
});

export function useOperationMutations({ onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: operationKeys.all });
    queryClient.invalidateQueries({ queryKey: ['propiedades'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return {
    reserve: useMutation({ mutationFn: (data) => operationApi.reserve(data), onSuccess: invalidate, onError }),
    close: useMutation({
      mutationFn: ({ id, ...data }) => operationApi.close(id, data),
      onSuccess: invalidate,
      onError,
    }),
    cancel: useMutation({
      mutationFn: ({ id, motivo }) => operationApi.cancel(id, { motivo }),
      onSuccess: invalidate,
      onError,
    }),
    directClosing: useMutation({
      mutationFn: (data) => operationApi.directClosing(data),
      onSuccess: invalidate,
      onError,
    }),
    updateNotes: useMutation({
      mutationFn: ({ id, notas }) => operationApi.updateNotes(id, { notas }),
      onSuccess: invalidate,
      onError,
    }),
    setCommission: useMutation({
      mutationFn: ({ operacionId, lineas }) => operationApi.setCommission(operacionId, lineas),
      onSuccess: (_data, variables) => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: operationKeys.commission(variables.operacionId) });
      },
      onError,
    }),
    updatePayoutStatus: useMutation({
      mutationFn: ({ lineaId, ...data }) => operationApi.updatePayoutStatus(lineaId, data),
      onSuccess: () => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: ['operaciones'] });
      },
      onError,
    }),
  };
}
