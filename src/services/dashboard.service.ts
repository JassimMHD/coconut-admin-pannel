import api from '@/lib/api';
import type {
  DashboardOverview,
  DashboardAlert,
  ProductionTrend,
  SalesTrend,
  TrendData,
  ApiResponse,
} from '@/types/api.types';

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get<ApiResponse<DashboardOverview>>('/dashboard/overview');
    return response.data.data;
  },

  async getRecentActivity(): Promise<unknown[]> {
    const response = await api.get<ApiResponse<unknown[]>>('/dashboard/recent-activity');
    return response.data.data;
  },

  async getProductionTrends(period: string = '7d'): Promise<ProductionTrend[]> {
    const response = await api.get<ApiResponse<ProductionTrend[]>>(`/dashboard/production-trends?period=${period}`);
    return response.data.data;
  },

  async getSalesTrends(period: string = '7d'): Promise<SalesTrend[]> {
    const response = await api.get<ApiResponse<SalesTrend[]>>(`/dashboard/sales-trends?period=${period}`);
    return response.data.data;
  },

  async getExpenseTrends(period: string = '7d'): Promise<TrendData[]> {
    const response = await api.get<ApiResponse<TrendData[]>>(`/dashboard/expense-trends?period=${period}`);
    return response.data.data;
  },

  async getAlerts(): Promise<DashboardAlert[]> {
    const response = await api.get<ApiResponse<DashboardAlert[]>>('/dashboard/alerts');
    return response.data.data;
  },

  async getQuickStats(): Promise<Record<string, number>> {
    const response = await api.get<ApiResponse<Record<string, number>>>('/dashboard/quick-stats');
    return response.data.data;
  },
};

export default dashboardService;
