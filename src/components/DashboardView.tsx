import React from 'react';
import { motion } from 'motion/react';
import { 
  SaleOrder, 
  ProductInventory, 
  MetricsSummary, 
  OrderStatus 
} from '../types';
import { MetricCards } from './MetricCards';
import { SalesChart } from './SalesChart';
import { ProductPerformance } from './ProductPerformance';
import { 
  Pencil,
  AlertCircle
} from 'lucide-react';
import { NavSection } from './Sidebar';
import { getProductThumbnail } from '../utils/productUtils';

interface DashboardViewProps {
  orders: SaleOrder[];
  products: ProductInventory[];
  metrics: MetricsSummary;
  onNavigateSection: (section: NavSection) => void;
  onFilterByStatus: (status: string) => void;
  onFilterBySku: (sku: string) => void;
  onOpenNewSale: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  metrics,
  onNavigateSection,
  onFilterByStatus,
  onFilterBySku,
  onOpenNewSale,
  onUpdateOrderStatus
}) => {
  // Urgent dispatch orders (Por despachar)
  const urgentOrders = orders.filter(o => o.status === 'Por despachar').slice(0, 4);

  // Critical stock products
  const criticalStockProducts = products.filter(p => p.currentStock <= p.minStockThreshold).slice(0, 4);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* 1. Metric Cards KPI Grid */}
      <MetricCards
        metrics={metrics}
        onFilterByStatus={(status) => {
          onFilterByStatus(status as any);
          onNavigateSection('sales');
        }}
        onScrollToStock={() => onNavigateSection('inventory')}
      />

      {/* 2. Main Layout Grid (2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Left: Current Reservations (Urgent Orders) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Pedidos Urgentes</h3>
            <button 
              onClick={() => {
                onFilterByStatus('Por despachar');
                onNavigateSection('sales');
              }}
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors shrink-0"
            >
              Ver todos
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {urgentOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No hay pedidos pendientes urgentes.
              </div>
            ) : (
              <div className="space-y-3">
                {urgentOrders.map(order => (
                  <div key={order.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden shrink-0 bg-white">
                        <img src={getProductThumbnail(order.productTitle, order.variant).imageUrl} alt={order.productTitle} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-slate-900">{order.id}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">Hace 20 min</span>
                        </div>
                        <span className="font-semibold text-slate-800 text-sm truncate" title={order.productTitle}>
                          {order.productTitle}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-mono">{order.sku}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <div className="inline-flex items-center gap-1 shrink-0">
                            <span className="w-2 h-2 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: getProductThumbnail(order.productTitle, order.variant).colorHex }}></span>
                            <span className="truncate">{getProductThumbnail(order.productTitle, order.variant).colorName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 shrink-0">
                      <div className="flex flex-col items-start sm:items-end">
                         <span className="text-xs text-slate-500 font-medium">Cant: {order.quantity}</span>
                      </div>
                      <button 
                        onClick={() => onUpdateOrderStatus(order.id, 'En camino')}
                        className="flex items-center justify-center bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0"
                      >
                        Despachar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Right: Average Check Size (Sales Chart) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col overflow-hidden">
          <SalesChart orders={orders} />
        </div>

        {/* Bottom Left: Reservations Per Day (Critical Stock) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Alertas de Stock</h3>
            <div className="flex gap-2 shrink-0">
              <button className="px-3 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">Crítico</button>
              <button className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md hidden sm:block">Todos</button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {criticalStockProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Inventario saludable.
              </div>
            ) : (
              <div className="space-y-4">
                {criticalStockProducts.map(product => {
                  const stockPercent = Math.max(0, Math.min(100, (product.currentStock / product.minStockThreshold) * 50));
                  return (
                    <div key={product.sku} className="flex flex-col gap-2 border-b border-slate-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden shrink-0 bg-white">
                            <img src={getProductThumbnail(product.title, product.variant).imageUrl} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-800 text-sm truncate" title={product.title}>
                              {product.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              <span className="font-mono truncate">{product.sku}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <div className="inline-flex items-center gap-1 shrink-0">
                                <span className="w-2 h-2 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: getProductThumbnail(product.title, product.variant).colorHex }}></span>
                                <span className="truncate">{getProductThumbnail(product.title, product.variant).colorName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">{product.currentStock} und.</span>
                          <span className="text-xs text-rose-600 font-medium">Mín: {product.minStockThreshold}</span>
                        </div>
                      </div>
                      {/* Visual Stock Bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 rounded-full" 
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right: Most Popular Menu Items (Product Performance) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col overflow-hidden">
          <ProductPerformance
            products={products}
            orders={orders}
            onFilterBySku={(sku) => {
              onFilterBySku(sku);
              onNavigateSection('sales');
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
