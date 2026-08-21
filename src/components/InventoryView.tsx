import React from 'react';
import { motion } from 'motion/react';
import { ProductInventory } from '../types';
import { StockAlerts } from './StockAlerts';
import { Boxes, AlertTriangle, PackageCheck, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { NavSection } from './Sidebar';

interface InventoryViewProps {
  products: ProductInventory[];
  onUpdateStock: (sku: string, newStock: number) => void;
  onFilterBySku: (sku: string) => void;
  onNavigateSection: (section: NavSection) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onUpdateStock,
  onFilterBySku,
  onNavigateSection
}) => {
  const criticalProducts = products.filter(p => p.currentStock <= 2);
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockThreshold && p.currentStock > 2);
  const optimalProducts = products.filter(p => p.currentStock > p.minStockThreshold);
  const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Top Banner & High Level Inventory KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock in Factory */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-slate-200/50">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Total Fábrica</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {totalStock} <span className="text-xs font-normal text-slate-400">unidades</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {products.length} SKUs activos
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Stock Alert */}
        <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-slate-200/50 ${
          criticalProducts.length > 0
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Riesgo de Quiebre</span>
            <div className="text-2xl font-black font-mono mt-1 text-rose-600 flex items-center gap-2">
              <span>{criticalProducts.length}</span>
              {criticalProducts.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-slate-900 animate-pulse">
                  Urgente
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ≤ 2 unidades restantes
            </div>
          </div>
          <div className={`p-3 rounded-xl border ${
            criticalProducts.length > 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white border border-slate-200 text-slate-400 border-slate-200'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Threshold */}
        <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-slate-200/50 ${
          lowStockProducts.length > 0
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Bajo Umbral Mínimo</span>
            <div className="text-2xl font-black font-mono mt-1 text-amber-600">
              {lowStockProducts.length} <span className="text-xs font-normal text-slate-400">SKUs</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Próximos a reposición
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Optimal Stock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-slate-200/50">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Nivel Óptimo</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
              {optimalProducts.length} <span className="text-xs font-normal text-slate-400">SKUs</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Confort y abastecimiento OK
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Stock Alerts & Catalog Component */}
      <StockAlerts
        products={products}
        onUpdateStock={onUpdateStock}
        onFilterBySku={(sku) => {
          onFilterBySku(sku);
          onNavigateSection('sales');
        }}
      />
    </motion.div>
  );
};
