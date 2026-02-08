// API Response Types

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User & Auth Types
export type UserRole = 'VIEWER' | 'OPERATOR' | 'ACCOUNTANT' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Supplier Types
export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  notes: string | null;
  status: SupplierStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    batches: number;
  };
  balance?: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  };
}

export interface CreateSupplierData {
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  notes?: string;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  status?: SupplierStatus;
}

export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
  blacklisted: number;
  totalPendingPayments: number;
}

// Customer Types
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
  receivable?: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  };
}

export interface CreateCustomerData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  status?: CustomerStatus;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  totalReceivables: number;
}

// Batch Types
export type BatchStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type QualityGrade = 'A' | 'B' | 'C' | 'MIXED';

export interface CoconutBatch {
  id: string;
  batchNumber: string;
  supplierId: string;
  supplier?: Supplier;
  receivedDate: string;
  totalQuantity: number;
  goodQuantity: number;
  badQuantity: number;
  qualityGrade: QualityGrade;
  pricePerUnit: number;
  totalCost: number;
  status: BatchStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: User;
}

export interface CreateBatchData {
  supplierId: string;
  receivedDate: string;
  totalQuantity: number;
  goodQuantity: number;
  badQuantity: number;
  qualityGrade: QualityGrade;
  pricePerUnit: number;
  notes?: string;
}

export interface UpdateBatchData extends Partial<CreateBatchData> {
  status?: BatchStatus;
}

export interface BatchStats {
  totalBatches: number;
  pendingBatches: number;
  processingBatches: number;
  completedBatches: number;
  totalCoconuts: number;
  totalCost: number;
}

// Processing Types
export type ProcessingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type RemovalType = 'HUSK' | 'SHELL' | 'BOTH';

export interface Processing {
  id: string;
  batchId: string;
  batch?: CoconutBatch;
  startTime: string;
  endTime: string | null;
  removalType: RemovalType;
  inputQuantity: number;
  outputQuantity: number;
  wasteQuantity: number;
  status: ProcessingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: User;
}

export interface CreateProcessingData {
  batchId: string;
  startTime: string;
  removalType: RemovalType;
  inputQuantity: number;
  notes?: string;
}

export interface UpdateProcessingData {
  endTime?: string;
  outputQuantity?: number;
  wasteQuantity?: number;
  status?: ProcessingStatus;
  notes?: string;
}

export interface ProcessingStats {
  totalProcessings: number;
  inProgress: number;
  completed: number;
  totalInput: number;
  totalOutput: number;
  totalWaste: number;
  efficiency: number;
}

// Manufacturing Types
export type ProductType = 'COCONUT_OIL' | 'VIRGIN_COCONUT_OIL' | 'COCONUT_MILK' | 'COCONUT_CREAM' | 'DESICCATED_COCONUT' | 'COCONUT_FLOUR' | 'COCONUT_WATER' | 'COCONUT_CHIPS';
export type ManufacturingStatus = 'PENDING' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'COMPLETED' | 'FAILED';

export interface ManufacturingBatch {
  id: string;
  batchNumber: string;
  productType: ProductType;
  startTime: string;
  endTime: string | null;
  inputQuantity: number;
  outputQuantity: number;
  outputUnit: string;
  status: ManufacturingStatus;
  qualityScore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: User;
  inputs?: ManufacturingInput[];
}

export interface ManufacturingInput {
  id: string;
  manufacturingBatchId: string;
  processingId: string;
  quantity: number;
  processing?: Processing;
}

export interface CreateManufacturingData {
  productType: ProductType;
  startTime: string;
  inputQuantity: number;
  processingIds: string[];
  notes?: string;
}

export interface UpdateManufacturingData {
  endTime?: string;
  outputQuantity?: number;
  outputUnit?: string;
  status?: ManufacturingStatus;
  qualityScore?: number;
  notes?: string;
}

export interface ManufacturingStats {
  totalBatches: number;
  inProgress: number;
  completed: number;
  failed: number;
  byProductType: Record<ProductType, number>;
}

// Inventory Types
export interface ProductInventory {
  id: string;
  productType: ProductType;
  quantity: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  lastRestocked: string | null;
  expiryDate: string | null;
  updatedAt: string;
}

export interface ByproductInventory {
  id: string;
  byproductType: string;
  quantity: number;
  unit: string;
  updatedAt: string;
}

export interface BatchInventory {
  id: string;
  batchId: string;
  batch?: CoconutBatch;
  availableQuantity: number;
  processedQuantity: number;
  cancelledQuantity: number;
  updatedAt: string;
}

export interface InventoryOverview {
  batches: BatchInventory[];
  products: ProductInventory[];
  byproducts: ByproductInventory[];
}

export interface InventoryStats {
  totalBatchesInStock: number;
  totalProductsInStock: number;
  lowStockItems: number;
  expiringItems: number;
}

export interface LowStockItem {
  id: string;
  productType: ProductType;
  currentStock: number;
  minStockLevel: number;
  unit: string;
}

export interface ExpiringItem {
  id: string;
  productType: ProductType;
  quantity: number;
  unit: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

// Sales Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';

export interface SalesOrderItem {
  id: string;
  orderId: string;
  productType: ProductType;
  byproductType: string | null;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  orderDate: string;
  deliveryDate: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: User;
  items?: SalesOrderItem[];
}

export interface CreateSalesOrderData {
  customerId: string;
  orderDate: string;
  deliveryDate?: string;
  items: {
    productType?: ProductType;
    byproductType?: string;
    quantity: number;
    pricePerUnit: number;
  }[];
  discount?: number;
  tax?: number;
  notes?: string;
}

export interface UpdateSalesOrderData {
  deliveryDate?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  discount?: number;
  tax?: number;
  notes?: string;
}

export interface SalesStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  thisMonthRevenue: number;
}

// Expense Types
export type ExpenseCategory = 'UTILITIES' | 'SALARIES' | 'MAINTENANCE' | 'SUPPLIES' | 'TRANSPORT' | 'MARKETING' | 'RENT' | 'INSURANCE' | 'TAXES' | 'OTHER';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface GeneralExpense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  status: ExpenseStatus;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: User;
  approvedById: string | null;
  approvedBy?: User;
}

export interface CreateExpenseData {
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  notes?: string;
  receiptUrl?: string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  status?: ExpenseStatus;
}

export interface ExpenseStats {
  totalExpenses: number;
  pendingApproval: number;
  thisMonthTotal: number;
  byCategory: Record<ExpenseCategory, number>;
}

// Dashboard Types
export interface DashboardOverview {
  todaysBatches: number;
  todaysProcessing: number;
  todaysProduction: number;
  todaysOrders: number;
  todaysRevenue: number;
  todaysExpenses: number;
  lowStockAlerts: number;
  pendingOrders: number;
}

export interface DashboardAlert {
  id: string;
  type: 'LOW_STOCK' | 'EXPIRING_SOON' | 'PENDING_PAYMENT' | 'PENDING_ORDER' | 'QUALITY_ISSUE';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  createdAt: string;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface ProductionTrend {
  period: string;
  batches: number;
  processing: number;
  manufacturing: number;
}

export interface SalesTrend {
  period: string;
  orders: number;
  revenue: number;
}

// Reports Types
export interface DailySummary {
  id: string;
  date: string;
  totalBatches: number;
  totalCoconuts: number;
  totalProcessed: number;
  totalManufactured: number;
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  createdAt: string;
}

export interface ReportParams {
  startDate: string;
  endDate: string;
  type?: string;
}

// Settings Types
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  updatedAt: string;
}

export interface BusinessSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  currency: string;
  timezone: string;
}

export interface InventorySettings {
  lowStockThreshold: number;
  expiryWarningDays: number;
  autoReorderEnabled: boolean;
}

// Query Params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export type QueryParams = PaginationParams & SortParams & FilterParams;
