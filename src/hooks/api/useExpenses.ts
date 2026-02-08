import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '@/services/expenses.service';
import type { CreateExpenseData, UpdateExpenseData, QueryParams, ExpenseCategory } from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  stats: () => [...expenseKeys.all, 'stats'] as const,
  summary: () => [...expenseKeys.all, 'summary'] as const,
  recent: (limit?: number) => [...expenseKeys.all, 'recent', limit] as const,
  byCategory: (category: ExpenseCategory) => [...expenseKeys.all, 'category', category] as const,
};

export const useExpenses = (params?: QueryParams) => {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expensesService.getAll(params),
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expensesService.getById(id),
    enabled: !!id,
  });
};

export const useRecentExpenses = (limit: number = 5) => {
  return useQuery({
    queryKey: expenseKeys.recent(limit),
    queryFn: () => expensesService.getRecent(limit),
  });
};

export const useExpensesByCategory = (category: ExpenseCategory) => {
  return useQuery({
    queryKey: expenseKeys.byCategory(category),
    queryFn: () => expensesService.getByCategory(category),
    enabled: !!category,
  });
};

export const useExpenseStats = () => {
  return useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: () => expensesService.getStats(),
  });
};

export const useExpenseSummary = () => {
  return useQuery({
    queryKey: expenseKeys.summary(),
    queryFn: () => expensesService.getSummary(),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseData) => expensesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('Expense created successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) =>
      expensesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      toast.success('Expense updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expensesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('Expense deleted successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
