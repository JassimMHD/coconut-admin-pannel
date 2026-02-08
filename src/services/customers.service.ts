import api from '@/lib/api';
import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerStats,
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

export const customersService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Customer>> {
    const response = await api.get<PaginatedResponse<Customer>>(`/customers${buildQueryString(params)}`);
    return response.data;
  },

  async getById(id: string): Promise<Customer> {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  async getStats(): Promise<CustomerStats> {
    const response = await api.get<ApiResponse<CustomerStats>>('/customers/stats');
    return response.data.data;
  },

  async create(data: CreateCustomerData): Promise<Customer> {
    const response = await api.post<ApiResponse<Customer>>('/customers', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateCustomerData): Promise<Customer> {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async toggleStatus(id: string): Promise<Customer> {
    const response = await api.patch<ApiResponse<Customer>>(`/customers/${id}/status`);
    return response.data.data;
  },
};

export default customersService;
