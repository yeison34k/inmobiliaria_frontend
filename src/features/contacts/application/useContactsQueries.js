import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '../infrastructure/contactApi.js';

export const contactKeys = {
  all: ['contactos'],
  list: (filtros) => ['contactos', 'lista', filtros],
  detail: (id) => ['contactos', 'detalle', id],
  seguimiento: (params) => ['contactos', 'seguimiento', params],
  interactions: (id) => ['contactos', id, 'interacciones'],
};

export const useContacts = (filtros) => useQuery({
  queryKey: contactKeys.list(filtros),
  queryFn: () => contactApi.search(filtros),
});

export const useContact = (id) => useQuery({
  queryKey: contactKeys.detail(id),
  queryFn: () => contactApi.detail(id),
  enabled: Boolean(id),
});

export const useFollowUpQueue = (params = {}) => useQuery({
  queryKey: contactKeys.seguimiento(params),
  queryFn: () => contactApi.seguimiento(params),
});

export const useInteractions = (contactoId) => useQuery({
  queryKey: contactKeys.interactions(contactoId),
  queryFn: () => contactApi.getInteracciones(contactoId),
  enabled: Boolean(contactoId),
});

export function useContactMutations({ onError } = {}) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: contactKeys.all });

  return {
    create: useMutation({ mutationFn: (data) => contactApi.create(data), onSuccess: invalidate, onError }),
    update: useMutation({
      mutationFn: ({ id, ...data }) => contactApi.update(id, data),
      onSuccess: invalidate,
      onError,
    }),
    deactivate: useMutation({ mutationFn: (id) => contactApi.deactivate(id), onSuccess: invalidate, onError }),
    moveStage: useMutation({
      mutationFn: ({ id, etapa }) => contactApi.moverEtapa(id, etapa),
      onSuccess: invalidate,
      onError,
    }),
    setNextAction: useMutation({
      mutationFn: ({ id, proximaAccion, proximaAccionAt }) =>
        contactApi.proximaAccion(id, { proximaAccion, proximaAccionAt }),
      onSuccess: invalidate,
      onError,
    }),
    assignAdvisor: useMutation({
      mutationFn: ({ id, asesorId }) => contactApi.asignarAsesor(id, asesorId),
      onSuccess: invalidate,
      onError,
    }),
    registerInteraction: useMutation({
      mutationFn: ({ contactoId, ...data }) => contactApi.registrarInteraccion(contactoId, data),
      onSuccess: (_data, variables) => {
        invalidate();
        queryClient.invalidateQueries({ queryKey: contactKeys.interactions(variables.contactoId) });
      },
      onError,
    }),
  };
}
