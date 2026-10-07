import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '../infrastructure/templateApi.js';

export const templateKeys = {
  all: ['plantillas'],
  list: (filtros) => ['plantillas', 'lista', filtros],
};

export const useTemplates = (filtros = {}) => useQuery({
  queryKey: templateKeys.list(filtros),
  queryFn: () => templateApi.list(filtros),
  // Las plantillas cambian poco: no vale la pena recargarlas a cada rato
  staleTime: 5 * 60 * 1000,
});

export function useTemplateMutations({ onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: templateKeys.all });

  return {
    save: useMutation({ mutationFn: (d) => templateApi.save(d), onSuccess: invalidate, onError }),
    remove: useMutation({ mutationFn: (id) => templateApi.remove(id), onSuccess: invalidate, onError }),
    render: useMutation({
      mutationFn: ({ clave, ...d }) => templateApi.render(clave, d),
      onError,
    }),
  };
}
