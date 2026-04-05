import api from '@/lib/api';
import type {
  Supplier,
  CreateSupplierData,
  UpdateSupplierData,
  SupplierStats,
  SupplierPayment,
  CreateSupplierPaymentData,
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

export const suppliersService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Supplier>> {
    const response = await api.get<PaginatedResponse<Supplier>>(`/suppliers${buildQueryString(params)}`);
    return response.data;
  },

  async getById(id: string): Promise<Supplier> {
    const response = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return response.data.data;
  },

  async getStats(): Promise<SupplierStats> {
    const response = await api.get<ApiResponse<SupplierStats>>('/suppliers/stats');
    return response.data.data;
  },

  async create(data: CreateSupplierData): Promise<Supplier> {
    const response = await api.post<ApiResponse<Supplier>>('/suppliers', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateSupplierData): Promise<Supplier> {
    const response = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },

  /**
   * Toggle supplier active status.
   * Backend PATCH /suppliers/:id/status expects { isActive: boolean }
   */
  async updateStatus(id: string, isActive: boolean): Promise<Supplier> {
    const response = await api.patch<ApiResponse<Supplier>>(`/suppliers/${id}/status`, { isActive });
    return response.data.data;
  },

  /** Record a payment to a supplier */
  async addPayment(supplierId: string, data: CreateSupplierPaymentData): Promise<SupplierPayment> {
    const response = await api.post<ApiResponse<SupplierPayment>>(`/suppliers/${supplierId}/payments`, data);
    return response.data.data;
  },

  /** Get payment history for a supplier */
  async getPayments(supplierId: string): Promise<SupplierPayment[]> {
    const response = await api.get<ApiResponse<SupplierPayment[]>>(`/suppliers/${supplierId}/payments`);
    return response.data.data;
  },
};

export default suppliersService;
