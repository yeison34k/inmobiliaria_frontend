import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requirementApi } from '../infrastructure/requirementApi.js';

export const requirementKeys = {
  all: ['requerimientos'],
  list: (filtros) => ['requerimientos', 'lista', filtros],
  matches: (filtros) => ['requerimientos', 'coincidencias', filtros],
};

export const useRequirements = (filtros) => useQuery({
  queryKey: requirementKeys.list(filtros),
  queryFn: () => requirementApi.list(filtros),
  enabled: filtros?.contactoId !== null,
});

export const useMatches = (filtros) => useQuery({
  queryKey: requirementKeys.matches(filtros),
  queryFn: () => requirementApi.matches(filtros),
});

export function useRequirementMutations({ onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: requirementKeys.all });
    queryClient.invalidateQueries({ queryKey: ['avisos'] });
  };

  return {
    create: useMutation({ mutationFn: (d) => requirementApi.create(d), onSuccess: invalidate, onError }),
    update: useMutation({
      mutationFn: ({ id, ...d }) => requirementApi.update(id, d),
      onSuccess: invalidate,
      onError,
    }),
    deactivate: useMutation({ mutationFn: (id) => requirementApi.deactivate(id), onSuccess: invalidate, onError }),
    rematch: useMutation({ mutationFn: (id) => requirementApi.rematch(id), onSuccess: invalidate, onError }),
    updateMatch: useMutation({
      mutationFn: ({ id, estado }) => requirementApi.updateMatch(id, estado),
      onSuccess: invalidate,
      onError,
    }),
  };
}
