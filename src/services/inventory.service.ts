import api from '@/lib/api';
import type {
  InventoryOverview,
  InventoryStats,
  ProductInventory,
  ByproductInventory,
  BatchInventory,
  LowStockItem,
  ExpiringItem,
  ProductType,
  ApiResponse,
} from '@/types/api.types';

export const inventoryService = {
  async getOverview(): Promise<InventoryOverview> {
    const response = await api.get<ApiResponse<InventoryOverview>>('/inventory');
    return response.data.data;
  },

  async getStats(): Promise<InventoryStats> {
    const response = await api.get<ApiResponse<InventoryStats>>('/inventory/stats');
    return response.data.data;
  },

  async getLowStock(): Promise<LowStockItem[]> {
    const response = await api.get<ApiResponse<LowStockItem[]>>('/inventory/low-stock');
    return response.data.data;
  },

  async getExpiringSoon(): Promise<ExpiringItem[]> {
    const response = await api.get<ApiResponse<ExpiringItem[]>>('/inventory/expiring-soon');
    return response.data.data;
  },

  async getBatchInventory(): Promise<BatchInventory[]> {
    const response = await api.get<ApiResponse<BatchInventory[]>>('/inventory/batch');
    return response.data.data;
  },

  async getBatchInventoryById(batchId: string): Promise<BatchInventory> {
    const response = await api.get<ApiResponse<BatchInventory>>(`/inventory/batch/${batchId}`);
    return response.data.data;
  },

  async getProductInventory(): Promise<ProductInventory[]> {
    const response = await api.get<ApiResponse<ProductInventory[]>>('/inventory/products');
    return response.data.data;
  },

  async getProductInventoryByType(productType: ProductType): Promise<ProductInventory> {
    const response = await api.get<ApiResponse<ProductInventory>>(`/inventory/products/${productType}`);
    return response.data.data;
  },

  async getByproductInventory(): Promise<ByproductInventory[]> {
    const response = await api.get<ApiResponse<ByproductInventory[]>>('/inventory/byproducts');
    return response.data.data;
  },

  async getByproductConfigs(): Promise<unknown[]> {
    const response = await api.get<ApiResponse<unknown[]>>('/inventory/byproduct-configs');
    return response.data.data;
  },

  async getSummary(): Promise<{ totalItems: number; totalValue: number; lowStockCount: number; inStockCount: number }> {
    const response = await api.get<ApiResponse<{ totalItems: number; totalValue: number; lowStockCount: number; inStockCount: number }>>('/inventory/summary');
    return response.data.data;
  },
};

export default inventoryService;
