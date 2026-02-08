import api from '@/lib/api';
import type {
  Processing,
  CreateProcessingData,
  UpdateProcessingData,
  ProcessingStats,
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

export const processingService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Processing>> {
    const response = await api.get<PaginatedResponse<Processing>>(`/processing${buildQueryString(params)}`);
    return response.data;
  },

  async getById(id: string): Promise<Processing> {
    const response = await api.get<ApiResponse<Processing>>(`/processing/${id}`);
    return response.data.data;
  },

  async getStats(): Promise<ProcessingStats> {
    const response = await api.get<ApiResponse<ProcessingStats>>('/processing/stats');
    return response.data.data;
  },

  async create(data: CreateProcessingData): Promise<Processing> {
    const response = await api.post<ApiResponse<Processing>>('/processing', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateProcessingData): Promise<Processing> {
    const response = await api.put<ApiResponse<Processing>>(`/processing/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/processing/${id}`);
  },

  async complete(id: string, data: { outputQuantity: number; wasteQuantity: number }): Promise<Processing> {
    const response = await api.post<ApiResponse<Processing>>(`/processing/${id}/complete`, data);
    return response.data.data;
  },
};

export default processingService;
