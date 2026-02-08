import api from '@/lib/api';
import type {
  SalesOrder,
  CreateSalesOrderData,
  UpdateSalesOrderData,
  SalesStats,
  OrderStatus,
  PaymentStatus,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from '@/types/api.types';

const buildQueryString = (params?: QueryParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const salesService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<SalesOrder>> {
    const response = await api.get<PaginatedResponse<SalesOrder>>(`/sales${buildQueryString(params)}`);
    return response.data;
  },

  async getById(id: string): Promise<SalesOrder> {
    const response = await api.get<ApiResponse<SalesOrder>>(`/sales/${id}`);
    return response.data.data;
  },

  async getRecent(limit: number = 5): Promise<SalesOrder[]> {
    const response = await api.get<ApiResponse<SalesOrder[]>>(`/sales/recent?limit=${limit}`);
    return response.data.data;
  },

  async getStats(): Promise<SalesStats> {
    const response = await api.get<ApiResponse<SalesStats>>('/sales/stats');
    return response.data.data;
  },

  async create(data: CreateSalesOrderData): Promise<SalesOrder> {
    const response = await api.post<ApiResponse<SalesOrder>>('/sales', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateSalesOrderData): Promise<SalesOrder> {
    const response = await api.put<ApiResponse<SalesOrder>>(`/sales/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/sales/${id}`);
  },

  async updateStatus(id: string, status: OrderStatus): Promise<SalesOrder> {
    const response = await api.patch<ApiResponse<SalesOrder>>(`/sales/${id}/status`, { status });
    return response.data.data;
  },

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paidAmount?: number): Promise<SalesOrder> {
    const response = await api.patch<ApiResponse<SalesOrder>>(`/sales/${id}/payment-status`, { 
      paymentStatus, 
      paidAmount 
    });
    return response.data.data;
  },
};

export default salesService;
