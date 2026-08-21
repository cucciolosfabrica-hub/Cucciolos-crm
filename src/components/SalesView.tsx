import React from 'react';
import { motion } from 'motion/react';
import { SaleOrder, FilterOptions, OrderStatus } from '../types';
import { SalesTable } from './SalesTable';
import { Download, PlusCircle, ShoppingBag, DollarSign, Package, Clock, CheckCircle2 } from 'lucide-react';
import { STANDARD_SHEET_HEADERS } from '../services/sheetsService';

interface SalesViewProps {
  orders: SaleOrder[];
  filterOptions: FilterOptions;
  onUpdateFilter: (newFilters: Partial<FilterOptions>) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onOpenNewSale: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  orders,
  filterOptions,
  onUpdateFilter,
  onUpdateOrderStatus,
  onOpenNewSale
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = STANDARD_SHEET_HEADERS.join(',');
    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${o.timestamp}"`,
      `"${o.productTitle.replace(/"/g, '""')}"`,
      `"${o.sku}"`,
      `"${o.variant.replace(/"/g, '""')}"`,
      o.quantity,
      o.unitPrice,
      o.totalAmount,
      o.mlCommission,
      o.netAmount,
      `"${o.shippingType}"`,
      `"${o.status}"`,
      `"${o.buyer}"`,
      `"${o.buyerCity}"`,
      `"${o.channel}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cucciolos_ventas_ml_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFilteredRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalFilteredNet = orders.reduce((sum, o) => sum + o.netAmount, 0);
  const totalUnits = orders.reduce((sum, o) => sum + o.quantity, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Control Maestro de Ventas MercadoLibre
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro sincronizado con Google Sheets, cálculo automático de comisiones y logística
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            title="Descargar todas las ventas en formato CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNewSale}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Venta</span>
          </button>
        </div>
      </div>

      {/* Sales Table and Filters */}
      <SalesTable
        orders={orders}
        filterOptions={filterOptions}
        onUpdateFilter={onUpdateFilter}
        onUpdateOrderStatus={onUpdateOrderStatus}
      />
    </motion.div>
  );
};
