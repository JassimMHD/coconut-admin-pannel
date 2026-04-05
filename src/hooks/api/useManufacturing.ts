import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturingService } from '@/services/manufacturing.service';
import type {
  CreateManufacturingData,
  UpdateManufacturingData,
  CreateConversionRatioData,
  UpdateConversionRatioData,
  QueryParams,
} from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const manufacturingKeys = {
  all: ['manufacturing'] as const,
  lists: () => [...manufacturingKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...manufacturingKeys.lists(), params] as const,
  details: () => [...manufacturingKeys.all, 'detail'] as const,
  detail: (id: string) => [...manufacturingKeys.details(), id] as const,
  stats: () => [...manufacturingKeys.all, 'stats'] as const,
  conversionRatios: () => [...manufacturingKeys.all, 'conversion-ratios'] as const,
  conversionRatiosList: (params?: QueryParams) => [...manufacturingKeys.conversionRatios(), params] as const,
};

export const useManufacturingList = (params?: QueryParams) => {
  return useQuery({
    queryKey: manufacturingKeys.list(params),
    queryFn: () => manufacturingService.getAll(params),
  });
};

/** Alias kept for page compatibility */
export const useManufacturing = (params?: QueryParams) => useManufacturingList(params);

export const useManufacturingRecord = (id: string) => {
  return useQuery({
    queryKey: manufacturingKeys.detail(id),
    queryFn: () => manufacturingService.getById(id),
    enabled: !!id,
  });
};

export const useManufacturingStats = () => {
  return useQuery({
    queryKey: manufacturingKeys.stats(),
    queryFn: () => manufacturingService.getStats(),
  });
};

/** Load conversion ratios to populate Manufacturing form dropdown */
export const useConversionRatios = (params?: QueryParams) => {
  return useQuery({
    queryKey: manufacturingKeys.conversionRatiosList(params),
    queryFn: () => manufacturingService.getConversionRatios(params),
  });
};

export const useCreateManufacturing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManufacturingData) => manufacturingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.all });
      toast.success('Manufacturing batch created successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateManufacturing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateManufacturingData }) =>
      manufacturingService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.all });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.detail(id) });
      toast.success('Manufacturing batch updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useDeleteManufacturing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => manufacturingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.all });
      toast.success('Manufacturing batch deleted successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useCreateConversionRatio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversionRatioData) => manufacturingService.createConversionRatio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.conversionRatios() });
      toast.success('Conversion ratio created successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateConversionRatio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConversionRatioData }) =>
      manufacturingService.updateConversionRatio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.conversionRatios() });
      toast.success('Conversion ratio updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
