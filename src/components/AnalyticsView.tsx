import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { SaleOrder, ProductInventory, MetricsSummary } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Percent, 
  Award, 
  ShoppingBag, 
  Truck,
  ArrowUpRight,
  Layers
} from 'lucide-react';

interface AnalyticsViewProps {
  orders: SaleOrder[];
  products: ProductInventory[];
  metrics: MetricsSummary;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  orders,
  products,
  metrics
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  const totalRevenue = metrics.totalRevenue;
  const totalNet = metrics.totalNetRevenue;
  const totalCommission = orders.reduce((sum, o) => sum + o.mlCommission, 0);
  const totalShipping = orders.reduce((sum, o) => sum + o.shippingCost, 0);
  
  const effectiveMargin = totalRevenue > 0 ? Math.round((totalNet / totalRevenue) * 100) : 0;

  // Channel Distribution
  const channelBreakdown = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; net: number; units: number; orders: number; color: string }> = {
      'MercadoLibre Premium': { name: 'MercadoLibre Premium (Cuotas)', revenue: 0, net: 0, units: 0, orders: 0, color: '#f59e0b' },
      'Mercado Envíos Full': { name: 'Mercado Envíos Full', revenue: 0, net: 0, units: 0, orders: 0, color: '#10b981' },
      'MercadoLibre Clásica': { name: 'MercadoLibre Clásica', revenue: 0, net: 0, units: 0, orders: 0, color: '#3b82f6' },
      'Tienda Directa Cucciolos': { name: 'Tienda Directa / Showroom', revenue: 0, net: 0, units: 0, orders: 0, color: '#a855f7' }
    };

    orders.forEach(o => {
      const ch = map[o.channel] ? o.channel : 'MercadoLibre Premium';
      map[ch].revenue += o.totalAmount;
      map[ch].net += o.netAmount;
      map[ch].units += o.quantity;
      map[ch].orders += 1;
    });

    const totalRev = totalRevenue || 1;
    return Object.values(map)
      .filter(c => c.revenue > 0)
      .map(c => ({
        ...c,
        percentage: Math.round((c.revenue / totalRev) * 100)
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders, totalRevenue]);

  // Category Distribution
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; units: number }> = {};
    
    orders.forEach(o => {
      if (!map[o.category]) {
        map[o.category] = { name: o.category, revenue: 0, units: 0 };
      }
      map[o.category].revenue += o.totalAmount;
      map[o.category].units += o.quantity;
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // top 5
  }, [orders]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue ML */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm group hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facturación Bruta ML</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% transaccionado</span>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm group hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Neto Cucciolos</span>
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(totalNet)}
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Margen efectivo: <strong className="text-amber-600 font-mono">{effectiveMargin}%</strong>
          </div>
        </div>

        {/* Comisiones ML */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm group hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Comisiones ML</span>
            <Percent className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(totalCommission)}
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            ~13% a 16% según pub.
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm group hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-end gap-3 mt-1">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(metrics.averageTicket)}
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Por cada venta
          </div>
        </div>
      </div>

      {/* Deep Dive Breakdown: Channels & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Channel Profitability Matrix */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              Canales de Venta
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Desglose de facturación y pedidos por canal
            </p>
          </div>

          <div className="space-y-5">
            {channelBreakdown.map(channel => (
              <div key={channel.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: channel.color }}></span>
                    {channel.name}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-amber-600">{channel.percentage}%</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, channel.percentage)}%`, backgroundColor: channel.color }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1">
                    <span>Bruto:</span>
                    <strong className="text-slate-900 font-mono tabular-nums">{formatCurrency(channel.revenue)}</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Neto:</span>
                    <strong className="text-emerald-600 font-mono tabular-nums">{formatCurrency(channel.net)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Líneas de Producto
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Top categorías por facturación y volumen
            </p>
          </div>

          <div className="space-y-5">
            {categoryBreakdown.map(cat => {
              const share = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0;
              return (
                <div key={cat.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-indigo-600">{share}%</span>
                    </div>
                  </div>
                  
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, share)}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <span>Facturado:</span>
                      <strong className="text-slate-900 font-mono tabular-nums">{formatCurrency(cat.revenue)}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Unidades:</span>
                      <strong className="text-slate-900 font-mono tabular-nums">{cat.units}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </motion.div>
  );
};
