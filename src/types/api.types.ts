// ==========================================
// API Response Types — aligned to backend
// ==========================================

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

// ==========================================
// ENUMS — must exactly match backend Prisma enums
// ==========================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'ACCOUNTANT' | 'VIEWER';

export type CoconutGrade = 'BIG' | 'SMALL' | 'CANCELLED';

export type RemovalTypeEnum = 'NORMAL' | 'JUMBO' | 'DC' | 'MAALU';

export type CancelledHandling = 'LOSS' | 'REDUCED_SALE';

export type ProductType =
  | 'OIL'
  | 'COPRA'
  | 'DESICCATED_COCONUT'
  | 'COCONUT_MILK'
  | 'COCONUT_CREAM'
  | 'COCONUT_WATER'
  | 'VIRGIN_COCONUT_OIL';

export type ByproductType = 'HUSK' | 'SHELL' | 'COIR' | 'PITH' | 'SHELL_CHARCOAL';

export type UnitOfMeasure = 'KG' | 'LITRE' | 'PIECE' | 'TONNE' | 'GALLON';

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT' | 'MOBILE_PAYMENT';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ExpenseCategory =
  | 'TRANSPORT'
  | 'LABOUR'
  | 'COMMISSION'
  | 'FUEL'
  | 'ELECTRICITY'
  | 'MAINTENANCE'
  | 'PACKAGING'
  | 'STORAGE'
  | 'OTHER';

export type TransactionType =
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_MADE'
  | 'REFUND_ISSUED'
  | 'REFUND_RECEIVED'
  | 'CREDIT_NOTE'
  | 'DEBIT_NOTE';

// ==========================================
// USER & AUTH
// ==========================================

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
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

// ==========================================
// SUPPLIERS
// ==========================================

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  paymentTermDays: number;
  creditLimit: number;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountName?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  supplierBalance?: {
    totalPurchases: number;
    totalPaid: number;
    balance: number;
  };
  _count?: {
    batches: number;
  };
}

export interface CreateSupplierData {
  name: string;
  contactPerson?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  paymentTermDays?: number;
  creditLimit?: number;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountName?: string;
  notes?: string;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  isActive?: boolean;
}

export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
  totalBalance: number;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  batchId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface CreateSupplierPaymentData {
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate?: string;
  batchId?: string;
  notes?: string;
}

// ==========================================
// CUSTOMERS
// ==========================================

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';

export interface Customer {
  id: string;
  code: string;
  name: string;
  customerType: string;
  contactPerson?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  paymentTermDays: number;
  creditLimit: number;
  taxId?: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  accountReceivable?: {
    totalSales: number;
    totalReceived: number;
    balance: number;
    overdueAmount: number;
  };
  _count?: {
    salesOrders: number;
  };
}

export interface CreateCustomerData {
  name: string;
  customerType?: string;
  contactPerson?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  paymentTermDays?: number;
  creditLimit?: number;
  taxId?: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  isActive?: boolean;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  totalReceivables: number;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  orderId?: string;
  transactionType: TransactionType;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  chequeNumber?: string;
  chequeDate?: string;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface CreateCustomerPaymentData {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionType?: TransactionType;
  referenceNumber?: string;
  chequeNumber?: string;
  chequeDate?: string;
  paymentDate?: string;
  orderId?: string;
  notes?: string;
}

// ==========================================
// COCONUT BATCHES
// ==========================================

export interface CoconutBatch {
  id: string;
  batchCode: string;
  supplierId: string;
  createdById: string;
  pickedDate: string;
  purchaseDate: string;
  receivedDate: string;
  initialQuantity: number;
  bigCount: number;
  smallCount: number;
  cancelledCount: number;
  pricePerBig: number;
  pricePerSmall: number;
  pricePerCancelled: number;
  cancelledHandling: CancelledHandling;
  totalBuyCost: number;
  isGraded: boolean;
  isProcessed: boolean;
  isFullyProcessed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
  createdBy?: User;
}

export interface CreateBatchData {
  supplierId: string;
  pickedDate: string;           // ISO datetime string
  purchaseDate?: string;        // ISO datetime string
  receivedDate?: string;        // ISO datetime string
  initialQuantity: number;
  pricePerBig: number;
  pricePerSmall: number;
  pricePerCancelled?: number;
  cancelledHandling?: CancelledHandling;
  notes?: string;
}

export interface UpdateBatchData {
  pickedDate?: string;
  purchaseDate?: string;
  receivedDate?: string;
  pricePerBig?: number;
  pricePerSmall?: number;
  pricePerCancelled?: number;
  cancelledHandling?: CancelledHandling;
  notes?: string;
}

export interface GradeBatchData {
  bigCount: number;
  smallCount: number;
  cancelledCount: number;
}

export interface BatchStats {
  totalBatches: number;
  gradedBatches: number;
  processedBatches: number;
  totalCoconuts: number;
  totalBuyCost: number;
}

export interface BatchExpense {
  id: string;
  batchId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptNumber?: string;
  expenseDate: string;
  notes?: string;
  createdAt: string;
}

export interface CreateBatchExpenseData {
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptNumber?: string;
  expenseDate?: string;
  notes?: string;
}

// ==========================================
// REMOVAL TYPE CONFIG
// ==========================================

export interface RemovalTypeConfig {
  id: string;
  type: RemovalTypeEnum;
  name: string;
  description?: string;
  costPerCoconut: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRemovalTypeData {
  type: RemovalTypeEnum;
  name: string;
  description?: string;
  costPerCoconut: number;
  isActive?: boolean;
}

export interface UpdateRemovalTypeData {
  name?: string;
  description?: string;
  costPerCoconut?: number;
  isActive?: boolean;
}

// ==========================================
// PROCESSING
// ==========================================

export interface Processing {
  id: string;
  batchId: string;
  processedById: string;
  removalTypeId: string;
  coconutGrade: CoconutGrade;
  quantity: number;
  costPerCoconut: number;
  totalProcessingCost: number;
  processingDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  batch?: CoconutBatch;
  processedBy?: User;
  removalType?: RemovalTypeConfig;
}

export interface CreateProcessingData {
  batchId: string;
  removalTypeId: string;
  coconutGrade: CoconutGrade;
  quantity: number;
  processingDate?: string;
  notes?: string;
}

export interface UpdateProcessingData {
  quantity?: number;
  processingDate?: string;
  notes?: string;
}

export interface ProcessingStats {
  totalProcessings: number;
  totalCoconutsProcessed: number;
  totalProcessingCost: number;
}

// ==========================================
// CONVERSION RATIO
// ==========================================

export interface ConversionRatio {
  id: string;
  productType: ProductType;
  name: string;
  description?: string;
  coconutsPerUnit: number;
  outputUnit: UnitOfMeasure;
  huskYieldKg: number;
  shellYieldKg: number;
  coirYieldKg: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversionRatioData {
  productType: ProductType;
  name: string;
  description?: string;
  coconutsPerUnit: number;
  outputUnit: UnitOfMeasure;
  huskYieldKg?: number;
  shellYieldKg?: number;
  coirYieldKg?: number;
  isActive?: boolean;
}

export interface UpdateConversionRatioData {
  name?: string;
  description?: string;
  coconutsPerUnit?: number;
  outputUnit?: UnitOfMeasure;
  huskYieldKg?: number;
  shellYieldKg?: number;
  coirYieldKg?: number;
  isActive?: boolean;
}

// ==========================================
// MANUFACTURING
// ==========================================

export interface ManufacturingBatch {
  id: string;
  batchCode: string;
  productType: ProductType;
  conversionRatioId: string;
  manufacturedById: string;
  totalCoconutsUsed: number;
  quantityProduced: number;
  unit: UnitOfMeasure;
  qualityGrade?: string;
  qualityNotes?: string;
  labourCost: number;
  utilityCost: number;
  packagingCost: number;
  otherCost: number;
  totalCost: number;
  costPerUnit: number;
  manufacturingDate: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  conversionRatio?: ConversionRatio;
  manufacturedBy?: User;
}

export interface CreateManufacturingData {
  productType: ProductType;
  conversionRatioId: string;
  totalCoconutsUsed: number;
  quantityProduced: number;
  unit: UnitOfMeasure;
  qualityGrade?: string;
  qualityNotes?: string;
  labourCost?: number;
  utilityCost?: number;
  packagingCost?: number;
  otherCost?: number;
  manufacturingDate?: string;
  expiryDate?: string;
  processingIds?: string[];
  notes?: string;
}

export interface UpdateManufacturingData {
  quantityProduced?: number;
  qualityGrade?: string;
  qualityNotes?: string;
  labourCost?: number;
  utilityCost?: number;
  packagingCost?: number;
  otherCost?: number;
  expiryDate?: string;
  notes?: string;
}

export interface ManufacturingStats {
  totalBatches: number;
  totalCoconutsUsed: number;
  totalQuantityProduced: number;
  totalCost: number;
}

export interface ManufacturingExpense {
  id: string;
  manufacturingBatchId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptNumber?: string;
  expenseDate: string;
  notes?: string;
  createdAt: string;
}

// ==========================================
// INVENTORY
// ==========================================

export interface ProductInventory {
  id: string;
  productType: ProductType;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  unit: UnitOfMeasure;
  averageCost: number;
  totalValue: number;
  reorderLevel: number;
  lastUpdated: string;
}

export interface ByproductInventory {
  id: string;
  byproductConfigId: string;
  totalStock: number;
  unit: UnitOfMeasure;
  averageCost: number;
  lastUpdated: string;
  byproductConfig?: {
    type: ByproductType;
    name: string;
    defaultPricePerUnit: number;
  };
}

export interface BatchInventory {
  id: string;
  batchId: string;
  grade: CoconutGrade;
  initialStock: number;
  currentStock: number;
  processedCount: number;
  soldCount: number;
  lostCount: number;
  lastUpdated: string;
  batch?: CoconutBatch;
}

export interface InventoryOverview {
  batches: BatchInventory[];
  products: ProductInventory[];
  byproducts: ByproductInventory[];
}

export interface AdjustInventoryData {
  type: 'batch' | 'product' | 'byproduct';
  itemId: string;
  adjustment: number;
  reason: string;
  reference?: string;
}

// ==========================================
// SALES ORDERS
// ==========================================

export interface SalesOrderItem {
  id: string;
  orderId: string;
  itemType: 'PRODUCT' | 'BYPRODUCT';
  productType?: ProductType;
  byproductType?: ByproductType;
  description: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  unitCost: number;
  discountPercent: number;
  lineTotal: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  createdById: string;
  orderDate: string;
  expectedDelivery?: string;
  deliveredDate?: string;
  status: OrderStatus;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  balanceDue: number;
  dueDate?: string;
  shippingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  createdBy?: User;
  items?: SalesOrderItem[];
}

export interface SalesOrderItemInput {
  itemType: 'PRODUCT' | 'BYPRODUCT';
  productType?: ProductType;
  byproductType?: ByproductType;
  description: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  unitCost?: number;
  discountPercent?: number;
}

export interface CreateSalesOrderData {
  customerId: string;
  orderDate?: string;
  expectedDelivery?: string;
  discountPercent?: number;
  taxPercent?: number;
  dueDate?: string;
  shippingAddress?: string;
  notes?: string;
  items: SalesOrderItemInput[];
}

export interface UpdateSalesOrderData {
  expectedDelivery?: string;
  discountPercent?: number;
  taxPercent?: number;
  dueDate?: string;
  shippingAddress?: string;
  notes?: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
  deliveredDate?: string;
}

export interface AddOrderPaymentData {
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  chequeNumber?: string;
  chequeDate?: string;
  paymentDate?: string;
  notes?: string;
}

export interface SalesStats {
  totalOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  pendingPayments: number;
}

// ==========================================
// GENERAL EXPENSES
// ==========================================

export interface GeneralExpense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptNumber?: string;
  expenseDate: string;
  notes?: string;
  periodMonth?: number;
  periodYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptNumber?: string;
  expenseDate?: string;      // ISO datetime string
  notes?: string;
  periodMonth?: number;
  periodYear?: number;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

export interface ExpenseStats {
  totalExpenses: number;
  thisMonthTotal: number;
  byCategory: Partial<Record<ExpenseCategory, number>>;
}

export interface ExpenseSummary {
  total: number;
  byCategory: Partial<Record<ExpenseCategory, number>>;
  byMonth: Array<{ month: string; total: number }>;
}

// ==========================================
// DASHBOARD
// ==========================================

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

// ==========================================
// SETTINGS
// ==========================================

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  dataType?: 'string' | 'number' | 'boolean' | 'json';
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

// ==========================================
// QUERY PARAMS
// ==========================================

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
  dateFrom?: string;
  dateTo?: string;
  startDate?: string;
  endDate?: string;
}

export type QueryParams = PaginationParams & SortParams & FilterParams & Record<string, string | number | boolean | undefined>;
