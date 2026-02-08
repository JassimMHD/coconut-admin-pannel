import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manufacturingService } from '@/services/manufacturing.service';
import type { CreateManufacturingData, UpdateManufacturingData, QueryParams, ProductType } from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const manufacturingKeys = {
  all: ['manufacturing'] as const,
  lists: () => [...manufacturingKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...manufacturingKeys.lists(), params] as const,
  details: () => [...manufacturingKeys.all, 'detail'] as const,
  detail: (id: string) => [...manufacturingKeys.details(), id] as const,
  stats: () => [...manufacturingKeys.all, 'stats'] as const,
  byProductType: (productType: ProductType) => [...manufacturingKeys.all, 'product-type', productType] as const,
};

export const useManufacturingList = (params?: QueryParams) => {
  return useQuery({
    queryKey: manufacturingKeys.list(params),
    queryFn: () => manufacturingService.getAll(params),
  });
};

export const useManufacturing = (id: string) => {
  return useQuery({
    queryKey: manufacturingKeys.detail(id),
    queryFn: () => manufacturingService.getById(id),
    enabled: !!id,
  });
};

export const useManufacturingByProductType = (productType: ProductType) => {
  return useQuery({
    queryKey: manufacturingKeys.byProductType(productType),
    queryFn: () => manufacturingService.getByProductType(productType),
    enabled: !!productType,
  });
};

export const useManufacturingStats = () => {
  return useQuery({
    queryKey: manufacturingKeys.stats(),
    queryFn: () => manufacturingService.getStats(),
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

export const useCompleteManufacturing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { outputQuantity: number } }) =>
      manufacturingService.complete(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.all });
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.detail(id) });
      toast.success('Manufacturing batch completed successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
