import api from '@/lib/api';
import type {
  SystemSetting,
  BusinessSettings,
  InventorySettings,
  ApiResponse,
} from '@/types/api.types';

export const settingsService = {
  async getAll(): Promise<SystemSetting[]> {
    const response = await api.get<ApiResponse<SystemSetting[]>>('/settings');
    return response.data.data;
  },

  async update(settings: Partial<Record<string, string>>): Promise<SystemSetting[]> {
    const response = await api.put<ApiResponse<SystemSetting[]>>('/settings', settings);
    return response.data.data;
  },

  async reset(): Promise<SystemSetting[]> {
    const response = await api.post<ApiResponse<SystemSetting[]>>('/settings/reset');
    return response.data.data;
  },

  async getBusinessSettings(): Promise<BusinessSettings> {
    const response = await api.get<ApiResponse<BusinessSettings>>('/settings/business');
    return response.data.data;
  },

  async getInventorySettings(): Promise<InventorySettings> {
    const response = await api.get<ApiResponse<InventorySettings>>('/settings/inventory');
    return response.data.data;
  },

  async getDisplaySettings(): Promise<Record<string, string>> {
    const response = await api.get<ApiResponse<Record<string, string>>>('/settings/display');
    return response.data.data;
  },

  async getByKey(key: string): Promise<SystemSetting> {
    const response = await api.get<ApiResponse<SystemSetting>>(`/settings/key/${key}`);
    return response.data.data;
  },

  async updateByKey(key: string, value: string): Promise<SystemSetting> {
    const response = await api.put<ApiResponse<SystemSetting>>(`/settings/key/${key}`, { value });
    return response.data.data;
  },
};

export default settingsService;
