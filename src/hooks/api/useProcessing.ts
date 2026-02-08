import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processingService } from '@/services/processing.service';
import type { CreateProcessingData, UpdateProcessingData, QueryParams } from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const processingKeys = {
  all: ['processing'] as const,
  lists: () => [...processingKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...processingKeys.lists(), params] as const,
  details: () => [...processingKeys.all, 'detail'] as const,
  detail: (id: string) => [...processingKeys.details(), id] as const,
  stats: () => [...processingKeys.all, 'stats'] as const,
};

export const useProcessingList = (params?: QueryParams) => {
  return useQuery({
    queryKey: processingKeys.list(params),
    queryFn: () => processingService.getAll(params),
  });
};

export const useProcessing = (id: string) => {
  return useQuery({
    queryKey: processingKeys.detail(id),
    queryFn: () => processingService.getById(id),
    enabled: !!id,
  });
};

export const useProcessingStats = () => {
  return useQuery({
    queryKey: processingKeys.stats(),
    queryFn: () => processingService.getStats(),
  });
};

export const useCreateProcessing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProcessingData) => processingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
      toast.success('Processing record created successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateProcessing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProcessingData }) =>
      processingService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
      queryClient.invalidateQueries({ queryKey: processingKeys.detail(id) });
      toast.success('Processing record updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useDeleteProcessing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => processingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
      toast.success('Processing record deleted successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useCompleteProcessing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { outputQuantity: number; wasteQuantity: number } }) =>
      processingService.complete(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: processingKeys.all });
      queryClient.invalidateQueries({ queryKey: processingKeys.detail(id) });
      toast.success('Processing completed successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
