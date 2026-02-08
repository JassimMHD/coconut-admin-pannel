import api from '@/lib/api';
import type {
  ManufacturingBatch,
  CreateManufacturingData,
  UpdateManufacturingData,
  ManufacturingStats,
  ProductType,
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

export const manufacturingService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<ManufacturingBatch>> {
    const response = await api.get<PaginatedResponse<ManufacturingBatch>>(`/manufacturing${buildQueryString(params)}`);
    return response.data;
  },

  async getById(id: string): Promise<ManufacturingBatch> {
    const response = await api.get<ApiResponse<ManufacturingBatch>>(`/manufacturing/${id}`);
    return response.data.data;
  },

  async getByProductType(productType: ProductType): Promise<ManufacturingBatch[]> {
    const response = await api.get<ApiResponse<ManufacturingBatch[]>>(`/manufacturing/product-type/${productType}`);
    return response.data.data;
  },

  async getStats(): Promise<ManufacturingStats> {
    const response = await api.get<ApiResponse<ManufacturingStats>>('/manufacturing/stats');
    return response.data.data;
  },

  async create(data: CreateManufacturingData): Promise<ManufacturingBatch> {
    const response = await api.post<ApiResponse<ManufacturingBatch>>('/manufacturing', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateManufacturingData): Promise<ManufacturingBatch> {
    const response = await api.put<ApiResponse<ManufacturingBatch>>(`/manufacturing/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/manufacturing/${id}`);
  },

  async complete(id: string, data: { outputQuantity: number }): Promise<ManufacturingBatch> {
    const response = await api.post<ApiResponse<ManufacturingBatch>>(`/manufacturing/${id}/complete`, data);
    return response.data.data;
  },
};

export default manufacturingService;
