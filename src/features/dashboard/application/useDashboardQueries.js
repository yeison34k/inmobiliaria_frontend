import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../infrastructure/dashboardApi.js';

export const useDashboardMetrics = () => useQuery({
  queryKey: ['dashboard', 'metricas'],
  queryFn: () => dashboardApi.metrics(),
  refetchOnWindowFocus: true,
});

export const useDashboardAlerts = (params) => useQuery({
  queryKey: ['dashboard', 'alertas', params],
  queryFn: () => dashboardApi.alerts(params),
});
