import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processingService } from '@/services/processing.service';
import type {
  CreateProcessingData,
  UpdateProcessingData,
  CreateRemovalTypeData,
  UpdateRemovalTypeData,
  QueryParams,
} from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const processingKeys = {
  all: ['processing'] as const,
  lists: () => [...processingKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...processingKeys.lists(), params] as const,
  details: () => [...processingKeys.all, 'detail'] as const,
  detail: (id: string) => [...processingKeys.details(), id] as const,
  stats: () => [...processingKeys.all, 'stats'] as const,
  removalTypes: () => [...processingKeys.all, 'removal-types'] as const,
  removalTypesList: (params?: QueryParams) => [...processingKeys.removalTypes(), params] as const,
};

export const useProcessingList = (params?: QueryParams) => {
  return useQuery({
    queryKey: processingKeys.list(params),
    queryFn: () => processingService.getAll(params),
  });
};

/** Alias kept for back-compat — pages can use useProcessingList directly */
export const useProcessing = (params?: QueryParams) => useProcessingList(params);

export const useProcessingRecord = (id: string) => {
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

/** Load removal type configs to populate Processing form dropdown */
export const useRemovalTypes = (params?: QueryParams) => {
  return useQuery({
    queryKey: processingKeys.removalTypesList(params),
    queryFn: () => processingService.getRemovalTypes(params),
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

export const useCreateRemovalType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRemovalTypeData) => processingService.createRemovalType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.removalTypes() });
      toast.success('Removal type created successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateRemovalType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRemovalTypeData }) =>
      processingService.updateRemovalType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processingKeys.removalTypes() });
      toast.success('Removal type updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
