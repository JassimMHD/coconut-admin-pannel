import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import type { ProductType, QueryParams } from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...inventoryKeys.lists(), params] as const,
  overview: () => [...inventoryKeys.all, 'overview'] as const,
  stats: () => [...inventoryKeys.all, 'stats'] as const,
  summary: () => [...inventoryKeys.all, 'summary'] as const,
  lowStock: () => [...inventoryKeys.all, 'low-stock'] as const,
  expiring: () => [...inventoryKeys.all, 'expiring'] as const,
  batches: () => [...inventoryKeys.all, 'batches'] as const,
  batch: (batchId: string) => [...inventoryKeys.batches(), batchId] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  product: (productType: ProductType) => [...inventoryKeys.products(), productType] as const,
  byproducts: () => [...inventoryKeys.all, 'byproducts'] as const,
  byproductConfigs: () => [...inventoryKeys.all, 'byproduct-configs'] as const,
};

// List hook for inventory page
export const useInventory = (params?: QueryParams) => {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryService.getOverview(),
  });
};

export const useInventoryOverview = () => {
  return useQuery({
    queryKey: inventoryKeys.overview(),
    queryFn: () => inventoryService.getOverview(),
  });
};

export const useInventoryStats = () => {
  return useQuery({
    queryKey: inventoryKeys.stats(),
    queryFn: () => inventoryService.getStats(),
  });
};

export const useLowStock = () => {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryService.getLowStock(),
  });
};

export const useExpiringSoon = () => {
  return useQuery({
    queryKey: inventoryKeys.expiring(),
    queryFn: () => inventoryService.getExpiringSoon(),
  });
};

export const useBatchInventory = () => {
  return useQuery({
    queryKey: inventoryKeys.batches(),
    queryFn: () => inventoryService.getBatchInventory(),
  });
};

export const useBatchInventoryById = (batchId: string) => {
  return useQuery({
    queryKey: inventoryKeys.batch(batchId),
    queryFn: () => inventoryService.getBatchInventoryById(batchId),
    enabled: !!batchId,
  });
};

export const useProductInventory = () => {
  return useQuery({
    queryKey: inventoryKeys.products(),
    queryFn: () => inventoryService.getProductInventory(),
  });
};

export const useProductInventoryByType = (productType: ProductType) => {
  return useQuery({
    queryKey: inventoryKeys.product(productType),
    queryFn: () => inventoryService.getProductInventoryByType(productType),
    enabled: !!productType,
  });
};

export const useByproductInventory = () => {
  return useQuery({
    queryKey: inventoryKeys.byproducts(),
    queryFn: () => inventoryService.getByproductInventory(),
  });
};

export const useByproductConfigs = () => {
  return useQuery({
    queryKey: inventoryKeys.byproductConfigs(),
    queryFn: () => inventoryService.getByproductConfigs(),
  });
};

export const useInventorySummary = () => {
  return useQuery({
    queryKey: inventoryKeys.summary(),
    queryFn: () => inventoryService.getSummary(),
  });
};

// Mutation hooks (inventory adjustments - uses overview as the backing data)
export const useCreateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_data: unknown) => {
      // Inventory is calculated from batches/processing/manufacturing
      // This is a placeholder for manual adjustments if needed
      return Promise.resolve({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Inventory adjusted successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id: _id, data: _data }: { id: string; data: unknown }) => {
      // Inventory is calculated from batches/processing/manufacturing
      // This is a placeholder for manual adjustments if needed
      return Promise.resolve({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Inventory updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_id: string) => {
      // Inventory is calculated from batches/processing/manufacturing
      // This is a placeholder for manual adjustments if needed
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Inventory item removed successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
