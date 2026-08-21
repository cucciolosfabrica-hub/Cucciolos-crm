import React, { useMemo } from 'react';
import { ProductInventory, SaleOrder } from '../types';
import { getProductThumbnail } from '../utils/productUtils';

interface ProductPerformanceProps {
  products: ProductInventory[];
  orders: SaleOrder[];
  onFilterBySku: (sku: string) => void;
}

export const ProductPerformance: React.FC<ProductPerformanceProps> = ({ products, orders, onFilterBySku }) => {
  const topProducts = useMemo(() => {
    const performance = products.map(product => {
      const productOrders = orders.filter(o => o.sku === product.sku);
      const unitsSold = productOrders.reduce((sum, o) => sum + o.quantity, 0);
      const revenue = productOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      return {
        ...product,
        unitsSold,
        revenue
      };
    });

    return performance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4); // Show top 4 to fit in the card
  }, [products, orders]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Más Vendidos</h3>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 text-xs font-medium bg-[#262626] text-white rounded-md">Semanal</button>
          <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-md">Mensual</button>
        </div>
      </div>

      <div className="flex justify-between text-xs font-semibold text-slate-400 mb-4 pb-2 border-b border-slate-50">
        <span className="flex-1">Producto</span>
        <span className="w-16 sm:w-20 text-right">Unidades</span>
        <span className="w-20 sm:w-24 text-right">Ingresos</span>
      </div>

      <div className="flex-1 space-y-4 overflow-hidden">
        {topProducts.map((product, index) => (
          <div 
            key={product.sku}
            onClick={() => onFilterBySku(product.sku)}
            className="flex items-center gap-2 cursor-pointer group border-b border-slate-50 pb-4 last:border-0"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded border border-slate-200 overflow-hidden shrink-0 bg-white">
                <img src={getProductThumbnail(product.title, product.variant).imageUrl} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-slate-800 text-sm truncate group-hover:text-slate-600 transition-colors" title={product.title}>
                  {product.title}
                </span>
                <div className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                  <span className="w-2 h-2 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: getProductThumbnail(product.title, product.variant).colorHex }}></span>
                  <span className="truncate">{getProductThumbnail(product.title, product.variant).colorName}</span>
                </div>
              </div>
            </div>
            
            <div className="w-16 sm:w-20 text-right text-sm text-slate-500 shrink-0">
              {product.unitsSold}
            </div>
            
            <div className="w-20 sm:w-24 text-right text-sm font-bold text-slate-800 shrink-0">
              ${(product.revenue / 1000).toFixed(1)}k
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
