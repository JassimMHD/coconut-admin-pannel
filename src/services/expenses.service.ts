import api from '@/lib/api';
import type {
  GeneralExpense,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseStats,
  ExpenseSummary,
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

export const expensesService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<GeneralExpense>> {
    const response = await api.get<PaginatedResponse<GeneralExpense>>(`/expenses${buildQueryString(params)}`);
    return response.data;
  },

  async getById(id: string): Promise<GeneralExpense> {
    const response = await api.get<ApiResponse<GeneralExpense>>(`/expenses/${id}`);
    return response.data.data;
  },

  async getStats(): Promise<ExpenseStats> {
    const response = await api.get<ApiResponse<ExpenseStats>>('/expenses/stats');
    return response.data.data;
  },

  /** Get expense summary — supports groupBy: 'category' | 'month' | 'day' */
  async getSummary(params?: { dateFrom?: string; dateTo?: string; groupBy?: 'category' | 'month' | 'day' }): Promise<ExpenseSummary> {
    const response = await api.get<ApiResponse<ExpenseSummary>>(`/expenses/summary${buildQueryString(params as QueryParams)}`);
    return response.data.data;
  },

  /**
   * Create a general expense.
   * category must be backend enum: 'TRANSPORT'|'LABOUR'|'COMMISSION'|'FUEL'|'ELECTRICITY'|'MAINTENANCE'|'PACKAGING'|'STORAGE'|'OTHER'
   * expenseDate must be ISO datetime string (e.g. new Date(dateStr).toISOString())
   * paymentMethod is NOT a backend field — do not include it
   */
  async create(data: CreateExpenseData): Promise<GeneralExpense> {
    const response = await api.post<ApiResponse<GeneralExpense>>('/expenses', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateExpenseData): Promise<GeneralExpense> {
    const response = await api.put<ApiResponse<GeneralExpense>>(`/expenses/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};

export default expensesService;
