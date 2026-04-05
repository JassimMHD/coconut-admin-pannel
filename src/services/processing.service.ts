import api from '@/lib/api';
import type {
  Processing,
  CreateProcessingData,
  UpdateProcessingData,
  ProcessingStats,
  RemovalTypeConfig,
  CreateRemovalTypeData,
  UpdateRemovalTypeData,
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

  /**
   * Create a processing record.
   * Required: batchId (cuid), removalTypeId (cuid), coconutGrade ('BIG'|'SMALL'|'CANCELLED'), quantity (int)
   */
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

  // ---- Removal Type Config endpoints ----

  /** Get all removal type configurations */
  async getRemovalTypes(params?: QueryParams): Promise<RemovalTypeConfig[]> {
    const response = await api.get<ApiResponse<RemovalTypeConfig[]>>(`/processing/removal-types${buildQueryString(params)}`);
    return response.data.data;
  },

  /** Get a single removal type config */
  async getRemovalTypeById(id: string): Promise<RemovalTypeConfig> {
    const response = await api.get<ApiResponse<RemovalTypeConfig>>(`/processing/removal-types/${id}`);
    return response.data.data;
  },

  /** Create a removal type config */
  async createRemovalType(data: CreateRemovalTypeData): Promise<RemovalTypeConfig> {
    const response = await api.post<ApiResponse<RemovalTypeConfig>>('/processing/removal-types', data);
    return response.data.data;
  },

  /** Update a removal type config */
  async updateRemovalType(id: string, data: UpdateRemovalTypeData): Promise<RemovalTypeConfig> {
    const response = await api.put<ApiResponse<RemovalTypeConfig>>(`/processing/removal-types/${id}`, data);
    return response.data.data;
  },
};

export default processingService;
