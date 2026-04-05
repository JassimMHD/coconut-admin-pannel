import api from '@/lib/api';
import type {
  SystemSetting,
  BusinessSettings,
  InventorySettings,
  ApiResponse,
} from '@/types/api.types';

export const settingsService = {
  /** GET /settings — returns all settings */
  async getAll(): Promise<SystemSetting[]> {
    const response = await api.get<ApiResponse<SystemSetting[]>>('/settings');
    return response.data.data;
  },

  /**
   * PUT /settings — bulk update settings.
   * Backend expects { settings: [{ key, value, description?, dataType? }] }
   */
  async bulkUpdate(settings: Array<{ key: string; value: string; description?: string; dataType?: string }>): Promise<SystemSetting[]> {
    const response = await api.put<ApiResponse<SystemSetting[]>>('/settings', { settings });
    return response.data.data;
  },

  /** POST /settings/reset — reset all settings to defaults (SUPER_ADMIN only) */
  async reset(): Promise<SystemSetting[]> {
    const response = await api.post<ApiResponse<SystemSetting[]>>('/settings/reset');
    return response.data.data;
  },

  /** GET /settings/business */
  async getBusinessSettings(): Promise<BusinessSettings> {
    const response = await api.get<ApiResponse<BusinessSettings>>('/settings/business');
    return response.data.data;
  },

  /** GET /settings/inventory */
  async getInventorySettings(): Promise<InventorySettings> {
    const response = await api.get<ApiResponse<InventorySettings>>('/settings/inventory');
    return response.data.data;
  },

  /** GET /settings/display */
  async getDisplaySettings(): Promise<Record<string, string>> {
    const response = await api.get<ApiResponse<Record<string, string>>>('/settings/display');
    return response.data.data;
  },

  /** GET /settings/key/:key */
  async getByKey(key: string): Promise<SystemSetting> {
    const response = await api.get<ApiResponse<SystemSetting>>(`/settings/key/${key}`);
    return response.data.data;
  },

  /**
   * PUT /settings/key/:key — update a single setting by key.
   * Backend expects { value, description?, dataType? }
   */
  async updateByKey(key: string, value: string, description?: string, dataType?: string): Promise<SystemSetting> {
    const response = await api.put<ApiResponse<SystemSetting>>(`/settings/key/${key}`, { value, description, dataType });
    return response.data.data;
  },
};

export default settingsService;
