import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { visitApi } from '../infrastructure/visitApi.js';

export const visitKeys = {
  all: ['visitas'],
  agenda: (params) => ['visitas', 'agenda', params],
  list: (filtros) => ['visitas', 'lista', filtros],
};

export const useAgenda = (params) => useQuery({
  queryKey: visitKeys.agenda(params),
  queryFn: () => visitApi.agenda(params),
});

export const useVisits = (filtros) => useQuery({
  queryKey: visitKeys.list(filtros),
  queryFn: () => visitApi.search(filtros),
});

export function useVisitMutations({ onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: visitKeys.all });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['consultas'] });
  };

  return {
    schedule: useMutation({ mutationFn: (d) => visitApi.schedule(d), onSuccess: invalidate, onError }),
    confirm: useMutation({ mutationFn: (id) => visitApi.confirm(id), onSuccess: invalidate, onError }),
    complete: useMutation({
      mutationFn: ({ id, ...d }) => visitApi.complete(id, d),
      onSuccess: invalidate,
      onError,
    }),
    cancel: useMutation({
      mutationFn: ({ id, motivo }) => visitApi.cancel(id, motivo),
      onSuccess: invalidate,
      onError,
    }),
    noShow: useMutation({
      mutationFn: ({ id, notas }) => visitApi.noShow(id, notas),
      onSuccess: invalidate,
      onError,
    }),
    reschedule: useMutation({
      mutationFn: ({ id, ...d }) => visitApi.reschedule(id, d),
      onSuccess: invalidate,
      onError,
    }),
  };
}
