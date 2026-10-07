import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inquiryApi } from '../infrastructure/inquiryApi.js';

export const inquiryKeys = {
  all: ['consultas'],
  list: (filtros) => ['consultas', 'lista', filtros],
};

export const useInquiries = (filtros) => useQuery({
  queryKey: inquiryKeys.list(filtros),
  queryFn: () => inquiryApi.search(filtros),
});

export function useInquiryMutations({ onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    queryClient.invalidateQueries({ queryKey: ['contactos'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return {
    submit: useMutation({ mutationFn: (data) => inquiryApi.submit(data), onError }),
    handle: useMutation({ mutationFn: (id) => inquiryApi.handle(id), onSuccess: invalidate, onError }),
    discard: useMutation({ mutationFn: (id) => inquiryApi.discard(id), onSuccess: invalidate, onError }),
  };
}
