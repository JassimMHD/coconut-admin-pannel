import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersService } from '@/services/suppliers.service';
import type { CreateSupplierData, UpdateSupplierData, QueryParams } from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
  stats: () => [...supplierKeys.all, 'stats'] as const,
};

export const useSuppliers = (params?: QueryParams) => {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => suppliersService.getAll(params),
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => suppliersService.getById(id),
    enabled: !!id,
  });
};

export const useSupplierStats = () => {
  return useQuery({
    queryKey: supplierKeys.stats(),
    queryFn: () => suppliersService.getStats(),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierData) => suppliersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success('Supplier created successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierData }) =>
      suppliersService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
      toast.success('Supplier updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success('Supplier deleted successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useToggleSupplierStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success('Supplier status updated');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
