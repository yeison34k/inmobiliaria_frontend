import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../infrastructure/documentApi.js';

export const documentKeys = {
  all: ['documentos'],
  list: (filtros) => ['documentos', 'lista', filtros],
  expiring: (dias) => ['documentos', 'vencimientos', dias],
};

export const useDocuments = (filtros) => useQuery({
  queryKey: documentKeys.list(filtros),
  queryFn: () => documentApi.list(filtros),
  enabled: Boolean(filtros?.propiedadId || filtros?.operacionId || filtros?.contactoId),
});

export const useAllDocuments = (filtros = {}) => useQuery({
  queryKey: documentKeys.list(filtros),
  queryFn: () => documentApi.list(filtros),
});

export const useExpiringDocuments = (dias = 30) => useQuery({
  queryKey: documentKeys.expiring(dias),
  queryFn: () => documentApi.expiring({ dias }),
});

export function useDocumentMutations({ onError, onSuccess } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: documentKeys.all });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return {
    attach: useMutation({
      mutationFn: (d) => documentApi.attach(d),
      onSuccess: (...args) => {
        invalidate();
        onSuccess?.(...args);
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: (id) => documentApi.remove(id),
      onSuccess: (...args) => {
        invalidate();
        onSuccess?.(...args);
      },
      onError,
    }),
  };
}
