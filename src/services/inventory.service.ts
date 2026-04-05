import api from '@/lib/api';
import type {
  InventoryOverview,
  ProductInventory,
  ByproductInventory,
  BatchInventory,
  AdjustInventoryData,
  ApiResponse,
} from '@/types/api.types';

export const inventoryService = {
  /**
   * GET /inventory — returns full inventory overview: batches, products, byproducts
   */
  async getOverview(): Promise<InventoryOverview> {
    const response = await api.get<ApiResponse<InventoryOverview>>('/inventory');
    return response.data.data;
  },

  /** GET /inventory/batch — all batch inventory records */
  async getBatchInventory(): Promise<BatchInventory[]> {
    const response = await api.get<ApiResponse<BatchInventory[]>>('/inventory/batch');
    return response.data.data;
  },

  /** GET /inventory/products — all product inventory records */
  async getProductInventory(): Promise<ProductInventory[]> {
    const response = await api.get<ApiResponse<ProductInventory[]>>('/inventory/products');
    return response.data.data;
  },

  /** GET /inventory/byproducts — all byproduct inventory records */
  async getByproductInventory(): Promise<ByproductInventory[]> {
    const response = await api.get<ApiResponse<ByproductInventory[]>>('/inventory/byproducts');
    return response.data.data;
  },

  /**
   * PATCH /inventory/adjust — adjust inventory quantity
   * type: 'batch'|'product'|'byproduct', itemId, adjustment (positive or negative), reason
   */
  async adjustInventory(data: AdjustInventoryData): Promise<void> {
    await api.patch('/inventory/adjust', data);
  },
};

export default inventoryService;
