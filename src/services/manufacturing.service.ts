import api from '@/lib/api';
import type {
  ManufacturingBatch,
  CreateManufacturingData,
  UpdateManufacturingData,
  ManufacturingStats,
  ManufacturingExpense,
  ConversionRatio,
  CreateConversionRatioData,
  UpdateConversionRatioData,
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

  async getStats(): Promise<ManufacturingStats> {
    const response = await api.get<ApiResponse<ManufacturingStats>>('/manufacturing/stats');
    return response.data.data;
  },

  /**
   * Create a manufacturing batch.
   * Required: productType, conversionRatioId (cuid), totalCoconutsUsed (int), quantityProduced, unit
   */
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

  /** Get expenses attached to a manufacturing batch */
  async getExpenses(manufacturingBatchId: string): Promise<ManufacturingExpense[]> {
    const response = await api.get<ApiResponse<ManufacturingExpense[]>>(`/manufacturing/${manufacturingBatchId}/expenses`);
    return response.data.data;
  },

  // ---- Conversion Ratio endpoints ----

  /** Get all conversion ratios — used to populate dropdown in form */
  async getConversionRatios(params?: QueryParams): Promise<ConversionRatio[]> {
    const response = await api.get<ApiResponse<ConversionRatio[]>>(`/manufacturing/conversion-ratios${buildQueryString(params)}`);
    return response.data.data;
  },

  async getConversionRatioById(id: string): Promise<ConversionRatio> {
    const response = await api.get<ApiResponse<ConversionRatio>>(`/manufacturing/conversion-ratios/${id}`);
    return response.data.data;
  },

  async createConversionRatio(data: CreateConversionRatioData): Promise<ConversionRatio> {
    const response = await api.post<ApiResponse<ConversionRatio>>('/manufacturing/conversion-ratios', data);
    return response.data.data;
  },

  async updateConversionRatio(id: string, data: UpdateConversionRatioData): Promise<ConversionRatio> {
    const response = await api.put<ApiResponse<ConversionRatio>>(`/manufacturing/conversion-ratios/${id}`, data);
    return response.data.data;
  },
};

export default manufacturingService;
