import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SaleOrder } from '../types';

interface SalesChartProps {
  orders: SaleOrder[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ orders }) => {
  const chartData = useMemo(() => {
    // Generate last 7 days data
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => o.timestamp.startsWith(dateStr));
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      data.push({
        name: d.toLocaleDateString('es-AR', { weekday: 'short' }),
        revenue: revenue
      });
    }
    return data;
  }, [orders]);

  return (
    <div className="h-full flex flex-col flex-1 min-h-[250px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Evolución de Ingresos</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-900 border border-slate-200 rounded-md">Semanal</button>
          <button className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-md">Mensual</button>
        </div>
      </div>
      
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={10}
              style={{ textTransform: 'capitalize' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', padding: '12px' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '14px' }}
              labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px', textTransform: 'capitalize' }}
              formatter={(value: number) => [`$${value.toLocaleString('es-AR')}`, 'Ingresos']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#2563eb" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
