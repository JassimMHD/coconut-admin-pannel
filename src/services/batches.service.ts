import api from '@/lib/api';
import type {
  CoconutBatch,
  CreateBatchData,
  UpdateBatchData,
  BatchStats,
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

export const batchesService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<CoconutBatch>> {
    const response = await api.get<PaginatedResponse<CoconutBatch>>(`/batches${buildQueryString(params)}`);
    return response.data;
  },

  async getById(id: string): Promise<CoconutBatch> {
    const response = await api.get<ApiResponse<CoconutBatch>>(`/batches/${id}`);
    return response.data.data;
  },

  async getRecent(limit: number = 5): Promise<CoconutBatch[]> {
    const response = await api.get<ApiResponse<CoconutBatch[]>>(`/batches/recent?limit=${limit}`);
    return response.data.data;
  },

  async getStats(): Promise<BatchStats> {
    const response = await api.get<ApiResponse<BatchStats>>('/batches/stats');
    return response.data.data;
  },

  async create(data: CreateBatchData): Promise<CoconutBatch> {
    const response = await api.post<ApiResponse<CoconutBatch>>('/batches', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateBatchData): Promise<CoconutBatch> {
    const response = await api.put<ApiResponse<CoconutBatch>>(`/batches/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/batches/${id}`);
  },
};

export default batchesService;
