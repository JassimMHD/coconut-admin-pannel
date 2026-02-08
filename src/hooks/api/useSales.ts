import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '@/services/sales.service';
import type { CreateSalesOrderData, UpdateSalesOrderData, QueryParams, OrderStatus, PaymentStatus } from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const salesKeys = {
  all: ['sales'] as const,
  lists: () => [...salesKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...salesKeys.lists(), params] as const,
  details: () => [...salesKeys.all, 'detail'] as const,
  detail: (id: string) => [...salesKeys.details(), id] as const,
  stats: () => [...salesKeys.all, 'stats'] as const,
  recent: (limit?: number) => [...salesKeys.all, 'recent', limit] as const,
};

export const useSalesOrders = (params?: QueryParams) => {
  return useQuery({
    queryKey: salesKeys.list(params),
    queryFn: () => salesService.getAll(params),
  });
};

export const useSalesOrder = (id: string) => {
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => salesService.getById(id),
    enabled: !!id,
  });
};

export const useRecentSalesOrders = (limit: number = 5) => {
  return useQuery({
    queryKey: salesKeys.recent(limit),
    queryFn: () => salesService.getRecent(limit),
  });
};

export const useSalesStats = () => {
  return useQuery({
    queryKey: salesKeys.stats(),
    queryFn: () => salesService.getStats(),
  });
};

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesOrderData) => salesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      toast.success('Sales order created successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalesOrderData }) =>
      salesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      queryClient.invalidateQueries({ queryKey: salesKeys.detail(id) });
      toast.success('Sales order updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useDeleteSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      toast.success('Sales order deleted successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      salesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      toast.success('Order status updated');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentStatus, paidAmount }: { id: string; paymentStatus: PaymentStatus; paidAmount?: number }) =>
      salesService.updatePaymentStatus(id, paymentStatus, paidAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      toast.success('Payment status updated');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
