import api from '@/lib/api';
import type {
  GeneralExpense,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseStats,
  ExpenseCategory,
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

  async getRecent(limit: number = 5): Promise<GeneralExpense[]> {
    const response = await api.get<ApiResponse<GeneralExpense[]>>(`/expenses/recent?limit=${limit}`);
    return response.data.data;
  },

  async getByCategory(category: ExpenseCategory): Promise<GeneralExpense[]> {
    const response = await api.get<ApiResponse<GeneralExpense[]>>(`/expenses/category/${category}`);
    return response.data.data;
  },

  async getStats(): Promise<ExpenseStats> {
    const response = await api.get<ApiResponse<ExpenseStats>>('/expenses/stats');
    return response.data.data;
  },

  async getSummary(): Promise<{ todayTotal: number; weekTotal: number; monthTotal: number; totalExpenses: number }> {
    const response = await api.get<ApiResponse<{ todayTotal: number; weekTotal: number; monthTotal: number; totalExpenses: number }>>('/expenses/summary');
    return response.data.data;
  },

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
