import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  recentActivity: () => [...dashboardKeys.all, 'recent-activity'] as const,
  productionTrends: (period?: string) => [...dashboardKeys.all, 'production-trends', period] as const,
  salesTrends: (period?: string) => [...dashboardKeys.all, 'sales-trends', period] as const,
  expenseTrends: (period?: string) => [...dashboardKeys.all, 'expense-trends', period] as const,
  alerts: () => [...dashboardKeys.all, 'alerts'] as const,
  quickStats: () => [...dashboardKeys.all, 'quick-stats'] as const,
};

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: () => dashboardService.getOverview(),
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(),
    queryFn: () => dashboardService.getRecentActivity(),
  });
};

export const useProductionTrends = (period: string = '7d') => {
  return useQuery({
    queryKey: dashboardKeys.productionTrends(period),
    queryFn: () => dashboardService.getProductionTrends(period),
  });
};

export const useSalesTrends = (period: string = '7d') => {
  return useQuery({
    queryKey: dashboardKeys.salesTrends(period),
    queryFn: () => dashboardService.getSalesTrends(period),
  });
};

export const useExpenseTrends = (period: string = '7d') => {
  return useQuery({
    queryKey: dashboardKeys.expenseTrends(period),
    queryFn: () => dashboardService.getExpenseTrends(period),
  });
};

export const useAlerts = () => {
  return useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: () => dashboardService.getAlerts(),
  });
};

export const useQuickStats = () => {
  return useQuery({
    queryKey: dashboardKeys.quickStats(),
    queryFn: () => dashboardService.getQuickStats(),
  });
};
