import api from '@/lib/api';
import type {
  CoconutBatch,
  CreateBatchData,
  UpdateBatchData,
  GradeBatchData,
  BatchStats,
  BatchExpense,
  CreateBatchExpenseData,
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

  /**
   * Create a new coconut batch.
   * Required: supplierId, pickedDate (ISO datetime), initialQuantity, pricePerBig, pricePerSmall
   */
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

  /**
   * Grade a batch — sets bigCount, smallCount, cancelledCount.
   * POST /batches/:id/grade
   */
  async grade(id: string, data: GradeBatchData): Promise<CoconutBatch> {
    const response = await api.post<ApiResponse<CoconutBatch>>(`/batches/${id}/grade`, data);
    return response.data.data;
  },

  /** Get expenses attached to a batch */
  async getExpenses(batchId: string): Promise<BatchExpense[]> {
    const response = await api.get<ApiResponse<BatchExpense[]>>(`/batches/${batchId}/expenses`);
    return response.data.data;
  },

  /** Add an expense to a batch */
  async addExpense(batchId: string, data: CreateBatchExpenseData): Promise<BatchExpense> {
    const response = await api.post<ApiResponse<BatchExpense>>(`/batches/${batchId}/expenses`, data);
    return response.data.data;
  },
};

export default batchesService;
