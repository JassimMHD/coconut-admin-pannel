import api from '@/lib/api';
import type {
  SalesOrder,
  CreateSalesOrderData,
  UpdateSalesOrderData,
  UpdateOrderStatusData,
  AddOrderPaymentData,
  SalesStats,
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

  /**
   * Create a sales order.
   * Required: customerId, items[] (each with itemType, description, quantity, unit, unitPrice)
   * Product/byproduct enums MUST use backend values: 'OIL', 'COPRA', etc. (not 'COCONUT_OIL')
   */
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

  /**
   * Update order status.
   * Backend PATCH /sales/:id/status expects { status, deliveredDate? }
   */
  async updateStatus(id: string, data: UpdateOrderStatusData): Promise<SalesOrder> {
    const response = await api.patch<ApiResponse<SalesOrder>>(`/sales/${id}/status`, data);
    return response.data.data;
  },

  /**
   * Record a payment against an order.
   * Backend PATCH /sales/:id/payment-status expects { amount, paymentMethod, referenceNumber?, ... }
   * NOT just { paymentStatus, paidAmount }
   */
  async addPayment(id: string, data: AddOrderPaymentData): Promise<SalesOrder> {
    const response = await api.patch<ApiResponse<SalesOrder>>(`/sales/${id}/payment-status`, data);
    return response.data.data;
  },
};

export default salesService;
