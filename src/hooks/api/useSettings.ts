import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const settingsKeys = {
  all: ['settings'] as const,
  business: () => [...settingsKeys.all, 'business'] as const,
  inventory: () => [...settingsKeys.all, 'inventory'] as const,
  display: () => [...settingsKeys.all, 'display'] as const,
  byKey: (key: string) => [...settingsKeys.all, 'key', key] as const,
};

export const useAllSettings = () => {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => settingsService.getAll(),
  });
};

export const useBusinessSettings = () => {
  return useQuery({
    queryKey: settingsKeys.business(),
    queryFn: () => settingsService.getBusinessSettings(),
  });
};

export const useInventorySettings = () => {
  return useQuery({
    queryKey: settingsKeys.inventory(),
    queryFn: () => settingsService.getInventorySettings(),
  });
};

export const useDisplaySettings = () => {
  return useQuery({
    queryKey: settingsKeys.display(),
    queryFn: () => settingsService.getDisplaySettings(),
  });
};

export const useSettingByKey = (key: string) => {
  return useQuery({
    queryKey: settingsKeys.byKey(key),
    queryFn: () => settingsService.getByKey(key),
    enabled: !!key,
  });
};

export const useBulkUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Array<{ key: string; value: string; description?: string; dataType?: string }>) =>
      settingsService.bulkUpdate(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useUpdateSettingByKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value, description, dataType }: { key: string; value: string; description?: string; dataType?: string }) =>
      settingsService.updateByKey(key, value, description, dataType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Setting updated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useResetSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsService.reset(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Settings reset to default values');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
