import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import type { AdjustInventoryData } from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const inventoryKeys = {
  all: ['inventory'] as const,
  overview: () => [...inventoryKeys.all, 'overview'] as const,
  batches: () => [...inventoryKeys.all, 'batches'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  byproducts: () => [...inventoryKeys.all, 'byproducts'] as const,
};

export const useInventoryOverview = () => {
  return useQuery({
    queryKey: inventoryKeys.overview(),
    queryFn: () => inventoryService.getOverview(),
  });
};

export const useBatchInventory = () => {
  return useQuery({
    queryKey: inventoryKeys.batches(),
    queryFn: () => inventoryService.getBatchInventory(),
  });
};

export const useProductInventory = () => {
  return useQuery({
    queryKey: inventoryKeys.products(),
    queryFn: () => inventoryService.getProductInventory(),
  });
};

export const useByproductInventory = () => {
  return useQuery({
    queryKey: inventoryKeys.byproducts(),
    queryFn: () => inventoryService.getByproductInventory(),
  });
};

export const useAdjustInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdjustInventoryData) => inventoryService.adjustInventory(data),
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
