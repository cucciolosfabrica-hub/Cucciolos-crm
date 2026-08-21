import React from 'react';
import { Tag, Camera, User, Clock, TrendingUp, AlertCircle, ShoppingBag } from 'lucide-react';
import { MetricsSummary } from '../types';

interface MetricCardsProps {
  metrics: MetricsSummary;
  onFilterByStatus?: (status: string) => void;
  onScrollToStock?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  onFilterByStatus,
  onScrollToStock
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      
      {/* 1. Facturación Total */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos Totales</span>
          <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </div>
        <div className="flex items-end gap-3 mt-1">
          <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
            {formatCurrency(metrics.totalRevenue)}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            +12.4%
          </span>
          <span className="text-xs text-slate-400">vs semana ant.</span>
        </div>
      </div>

      {/* 2. Ganancia Neta */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos Netos</span>
          <Camera className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-end gap-3 mt-1">
          <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
            {formatCurrency(metrics.totalNetRevenue)}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
           <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            +8.2%
          </span>
          <span className="text-xs text-slate-400">margen saludable</span>
        </div>
      </div>

      {/* 3. Unidades Vendidas */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unidades Vendidas</span>
          <ShoppingBag className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-end gap-3 mt-1">
          <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
            {metrics.totalUnitsSold}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Volumen estable</span>
        </div>
      </div>

      {/* 4. Por Despachar */}
      <div 
        onClick={() => onFilterByStatus && onFilterByStatus('Por despachar')}
        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-amber-300 hover:shadow-md transition-all"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Por Despachar</span>
          <Clock className={`w-4 h-4 ${metrics.pendingDispatchCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
        </div>
        <div className="flex items-end gap-3 mt-1">
          <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
            {metrics.pendingDispatchCount}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {metrics.pendingDispatchCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Requiere atención
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
              Al día
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
