import React, { useState } from 'react';
import { ProductInventory } from '../types';
import { Search } from 'lucide-react';
import { getProductThumbnail } from '../utils/productUtils';

interface StockAlertsProps {
  products: ProductInventory[];
  onUpdateStock: (sku: string, newStock: number) => void;
  onFilterBySku?: (sku: string) => void;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ 
  products, 
  onUpdateStock,
  onFilterBySku 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [customStockInput, setCustomStockInput] = useState<number>(0);

  const handleQuickAdd = (sku: string, current: number, addAmount: number) => {
    onUpdateStock(sku, current + addAmount);
  };

  const handleSaveCustomStock = (sku: string) => {
    onUpdateStock(sku, customStockInput);
    setEditingSku(null);
  };

  const filteredProducts = products
    .filter(p => p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.currentStock - b.currentStock); // Sort by lowest stock first

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Inventario y Catálogo</h3>
          <p className="text-sm text-slate-500">Gestión de stock de todos los SKUs activos</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar producto o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-shadow"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredProducts.map(product => {
          const isCritical = product.currentStock <= 2;
          const isLow = product.currentStock <= product.minStockThreshold && !isCritical;
          const percentage = Math.max(0, Math.min(100, (product.currentStock / (product.minStockThreshold * 2)) * 100));
          
          return (
            <div key={product.sku} className="group border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Product Info */}
              <div className="flex-1 min-w-0 flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-white">
                  <img src={getProductThumbnail(product.title, product.variant).imageUrl} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-slate-900">{product.sku}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                      isLow ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isCritical ? 'Crítico' : isLow ? 'Stock Bajo' : 'Óptimo'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 truncate" title={product.title}>{product.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="truncate">{product.variant}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <div className="inline-flex items-center gap-1 shrink-0">
                      <span className="w-2 h-2 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: getProductThumbnail(product.title, product.variant).colorHex }}></span>
                      {getProductThumbnail(product.title, product.variant).colorName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Bar & Controls */}
              <div className="w-full sm:w-64 shrink-0 flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold tabular-nums leading-none text-slate-900">
                    {product.currentStock}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Mínimo: {product.minStockThreshold}</span>
                </div>
                
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.max(2, percentage)}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="w-full sm:w-auto shrink-0 flex items-center gap-2 sm:pl-4 sm:border-l border-slate-100">
                {editingSku === product.sku ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={customStockInput}
                      onChange={(e) => setCustomStockInput(parseInt(e.target.value, 10) || 0)}
                      className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-sm text-slate-900 font-mono text-center"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveCustomStock(product.sku)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingSku(null)}
                      className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <button
                      onClick={() => handleQuickAdd(product.sku, product.currentStock, 5)}
                      className="flex-1 sm:flex-none px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-mono text-xs font-medium transition-colors"
                      title="Sumar +5 unidades fabricadas"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleQuickAdd(product.sku, product.currentStock, 15)}
                      className="flex-1 sm:flex-none px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-mono text-xs font-medium transition-colors"
                      title="Sumar +15 unidades fabricadas"
                    >
                      +15
                    </button>
                    <button
                      onClick={() => {
                        setEditingSku(product.sku);
                        setCustomStockInput(product.currentStock);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                      title="Fijar stock exacto"
                    >
                      Fijar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
