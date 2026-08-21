export type ShippingType = 
  | 'Flex en el día'
  | 'Mercado Envíos Colecta'
  | 'Mercado Envíos Full'
  | 'Retiro en Fábrica / Acordar'
  | 'Correo / Encomienda';

export type OrderStatus = 
  | 'Entregado'
  | 'En camino'
  | 'Por despachar'
  | 'Pendiente de pago'
  | 'Cancelado'
  | 'Reclamo / Devolución';

export type SalesChannel = 
  | 'MercadoLibre Clásica'
  | 'MercadoLibre Premium'
  | 'Mercado Envíos Full'
  | 'Tienda Directa Cucciolos';

export type ProductCategory = 
  | 'Cuchas & Moisés'
  | 'Colchonetas Antidesgarro'
  | 'Camas Donut & Nido'
  | 'Bolsos de Transporte'
  | 'Almohadones & Accesorios'
  | 'Varios';

export interface SaleOrder {
  id: string; // e.g. "#200000849201"
  timestamp: string; // "2026-08-20 11:45"
  productTitle: string;
  sku: string;
  variant: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number; // ARS
  totalAmount: number; // ARS
  mlCommission: number; // ARS
  netAmount: number; // ARS
  shippingType: ShippingType;
  shippingCost: number;
  status: OrderStatus;
  buyer: string;
  buyerCity: string;
  channel: SalesChannel;
  notes?: string;
  sheetRowIndex?: number;
}

export interface ProductInventory {
  sku: string;
  title: string;
  category: ProductCategory;
  variant: string;
  currentStock: number;
  minStockThreshold: number;
  price: number;
  costPrice?: number;
  status: 'critical' | 'low' | 'optimal';
  unitsSoldTotal: number;
  mlListingUrl?: string;
}

export interface SyncState {
  spreadsheetId: string;
  lastSyncTime: Date | null;
  nextSyncCountdown: number; // seconds remaining in 30min cycle
  isSyncing: boolean;
  syncError: string | null;
  source: 'google_sheets_live' | 'local_cached' | 'public_sheet';
  totalRowsRead: number;
  isConnected: boolean;
  accessToken: string | null;
  autoRefreshEnabled: boolean;
  geminiSparkLastUpdate: string | null;
}

export interface MetricsSummary {
  totalRevenue: number;
  totalNetRevenue: number;
  totalUnitsSold: number;
  totalOrders: number;
  averageTicket: number;
  pendingDispatchCount: number;
  inTransitCount: number;
  deliveredCount: number;
  lowStockAlertCount: number;
  criticalStockCount: number;
  growthVsYesterdayPercent: number;
}

export interface FilterOptions {
  searchQuery: string;
  statusFilter: string;
  channelFilter: string;
  shippingFilter: string;
  categoryFilter: string;
  dateRange: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'all';
}
