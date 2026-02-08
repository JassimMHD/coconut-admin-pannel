import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchesService } from '@/services/batches.service';
import type { CreateBatchData, UpdateBatchData, QueryParams } from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const batchKeys = {
  all: ['batches'] as const,
  lists: () => [...batchKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...batchKeys.lists(), params] as const,
  details: () => [...batchKeys.all, 'detail'] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
  stats: () => [...batchKeys.all, 'stats'] as const,
  recent: (limit?: number) => [...batchKeys.all, 'recent', limit] as const,
};

export const useBatches = (params?: QueryParams) => {
  return useQuery({
    queryKey: batchKeys.list(params),
    queryFn: () => batchesService.getAll(params),
  });
};

export const useBatch = (id: string) => {
  return useQuery({
    queryKey: batchKeys.detail(id),
    queryFn: () => batchesService.getById(id),
    enabled: !!id,
  });
};

export const useRecentBatches = (limit: number = 5) => {
  return useQuery({
    queryKey: batchKeys.recent(limit),
    queryFn: () => batchesService.getRecent(limit),
  });
};

export const useBatchStats = () => {
  return useQuery({
    queryKey: batchKeys.stats(),
    queryFn: () => batchesService.getStats(),
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBatchData) => batchesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      toast.success('Batch created successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBatchData }) =>
      batchesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(id) });
      toast.success('Batch updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => batchesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      toast.success('Batch deleted successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
