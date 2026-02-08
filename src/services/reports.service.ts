import api from '@/lib/api';
import type {
  DailySummary,
  ReportParams,
  ApiResponse,
} from '@/types/api.types';

export const reportsService = {
  async getDailySummary(date?: string): Promise<DailySummary> {
    const params = date ? `?date=${date}` : '';
    const response = await api.get<ApiResponse<DailySummary>>(`/reports/daily-summary${params}`);
    return response.data.data;
  },

  async getDailySummaries(params: ReportParams): Promise<DailySummary[]> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const response = await api.get<ApiResponse<DailySummary[]>>(`/reports/daily-summaries?${searchParams}`);
    return response.data.data;
  },

  async generateDailySummary(date?: string): Promise<DailySummary> {
    const response = await api.post<ApiResponse<DailySummary>>('/reports/daily-summary', { date });
    return response.data.data;
  },

  async getProductionChart(params: ReportParams): Promise<unknown> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const response = await api.get<ApiResponse<unknown>>(`/reports/production-chart?${searchParams}`);
    return response.data.data;
  },

  async getAuditLogs(params: ReportParams): Promise<unknown[]> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const response = await api.get<ApiResponse<unknown[]>>(`/reports/audit-logs?${searchParams}`);
    return response.data.data;
  },

  async getSummary(params: ReportParams): Promise<unknown> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const response = await api.get<ApiResponse<unknown>>(`/reports/summary?${searchParams}`);
    return response.data.data;
  },

  async getProfitabilityReport(params: ReportParams): Promise<{ totalRevenue: number; totalCosts: number; netProfit: number; profitMargin: number; byProduct?: Array<{ product: string; revenue: number; cost: number; profit: number; margin: number }> }> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const response = await api.get<ApiResponse<{ totalRevenue: number; totalCosts: number; netProfit: number; profitMargin: number; byProduct?: Array<{ product: string; revenue: number; cost: number; profit: number; margin: number }> }>>(`/reports/profitability?${searchParams}`);
    return response.data.data;
  },

  async getSalesReportData(params: ReportParams): Promise<{ totalOrders: number; totalRevenue: number; averageOrderValue: number; pendingPayments: number; topCustomers?: Array<{ id: string; name: string; orderCount: number; totalValue: number }> }> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const response = await api.get<ApiResponse<{ totalOrders: number; totalRevenue: number; averageOrderValue: number; pendingPayments: number; topCustomers?: Array<{ id: string; name: string; orderCount: number; totalValue: number }> }>>(`/reports/sales?${searchParams}`);
    return response.data.data;
  },

  async generateProductionReport(params: ReportParams): Promise<Blob> {
    const response = await api.post('/reports/generate/production', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  async generateSalesReport(params: ReportParams): Promise<Blob> {
    const response = await api.post('/reports/generate/sales', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  async generateExpenseReport(params: ReportParams): Promise<Blob> {
    const response = await api.post('/reports/generate/expense', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  async generateFinancialReport(params: ReportParams): Promise<Blob> {
    const response = await api.post('/reports/generate/financial', params, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default reportsService;
