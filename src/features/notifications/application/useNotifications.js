import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../infrastructure/notificationApi.js';

export const notificationKeys = { all: ['avisos'] };

/**
 * Avisos del asesor.
 * Se refrescan solos cada minuto: no vale la pena un websocket para esto,
 * y asi el panel no queda mudo si el asesor lo deja abierto.
 */
export const useNotifications = () => useQuery({
  queryKey: notificationKeys.all,
  queryFn: () => notificationApi.list(),
  refetchInterval: 60_000,
  refetchOnWindowFocus: true,
});

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  return {
    markRead: useMutation({ mutationFn: (id) => notificationApi.markRead(id), onSuccess: invalidate }),
    markAllRead: useMutation({ mutationFn: () => notificationApi.markAllRead(), onSuccess: invalidate }),
  };
}
