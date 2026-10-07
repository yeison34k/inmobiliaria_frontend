import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leasesApi } from '../infrastructure/leasesApi.js';
import { LEASE_STATUSES } from '../domain/lease.js';

export function useLeases({ q = '', estado = 'todos' } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['arrendamientos', { q, estado }],
    queryFn: () => leasesApi.list({ q: q || undefined, estado: estado !== 'todos' ? estado : undefined, pageSize: 100 }),
  });

  const { data: metricsData } = useQuery({
    queryKey: ['arrendamientos-metricas'],
    queryFn: () => leasesApi.metrics(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => leasesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrendamientos'] });
      queryClient.invalidateQueries({ queryKey: ['arrendamientos-metricas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const settlementMutation = useMutation({
    mutationFn: ({ contratoId, payload }) => leasesApi.addSettlement(contratoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrendamientos'] });
      queryClient.invalidateQueries({ queryKey: ['arrendamientos-metricas'] });
    },
  });

  const contratos = data?.items || [];

  const totalCanones = metricsData?.totalCanones ?? contratos
    .filter((c) => c.estado !== LEASE_STATUSES.TERMINADO)
    .reduce((sum, c) => sum + (c.canon || 0), 0);

  const totalHonorariosEstimados = metricsData?.totalHonorariosEstimados ?? contratos
    .filter((c) => c.estado !== LEASE_STATUSES.TERMINADO)
    .reduce((sum, c) => sum + Math.round((c.canon || 0) * ((c.comisionPorcentaje || 8) / 100)), 0);

  const totalActivos = metricsData?.totalActivos ?? contratos.filter((c) => c.estado === LEASE_STATUSES.ACTIVO).length;
  const totalPorVencer = metricsData?.polizasPorVencer ?? 0;

  const registrarLiquidacion = async (contratoId, liquidacionData) => {
    return settlementMutation.mutateAsync({ contratoId, payload: liquidacionData });
  };

  const agregarContrato = async (nuevoContrato) => {
    return createMutation.mutateAsync(nuevoContrato);
  };

  return {
    contratos,
    isLoading,
    error,
    refetch,
    totalCanones,
    totalHonorariosEstimados,
    totalActivos,
    totalPorVencer,
    registrarLiquidacion,
    agregarContrato,
  };
}
