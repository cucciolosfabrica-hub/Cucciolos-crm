import React, { useState } from 'react';
import { SaleOrder, OrderStatus, FilterOptions } from '../types';
import { getProductThumbnail } from '../utils/productUtils';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  User, 
  DollarSign, 
  Eye, 
  Calendar,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface SalesTableProps {
  orders: SaleOrder[];
  filterOptions: FilterOptions;
  onUpdateFilter: (newFilters: Partial<FilterOptions>) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  orders,
  filterOptions,
  onUpdateFilter,
  onUpdateOrderStatus
}) => {
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [statusDropdownOpenId, setStatusDropdownOpenId] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Search query
    if (filterOptions.searchQuery) {
      const q = filterOptions.searchQuery.toLowerCase();
      const match = 
        order.id.toLowerCase().includes(q) ||
        order.productTitle.toLowerCase().includes(q) ||
        order.sku.toLowerCase().includes(q) ||
        order.buyer.toLowerCase().includes(q) ||
        order.buyerCity.toLowerCase().includes(q) ||
        order.variant.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (filterOptions.statusFilter && filterOptions.statusFilter !== 'all') {
      if (order.status !== filterOptions.statusFilter) return false;
    }

    // Channel filter
    if (filterOptions.channelFilter && filterOptions.channelFilter !== 'all') {
      if (order.channel !== filterOptions.channelFilter) return false;
    }

    // Shipping filter
    if (filterOptions.shippingFilter && filterOptions.shippingFilter !== 'all') {
      if (order.shippingType !== filterOptions.shippingFilter) return false;
    }

    // Category filter
    if (filterOptions.categoryFilter && filterOptions.categoryFilter !== 'all') {
      if (order.category !== filterOptions.categoryFilter) return false;
    }

    return true;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Por despachar':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock className="w-3 h-3 text-amber-600" />
        };
      case 'En camino':
        return {
          bg: 'bg-indigo-500/15 text-indigo-600 border-indigo-200',
          icon: <Truck className="w-3 h-3 text-indigo-400" />
        };
      case 'Entregado':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        };
      case 'Pendiente de pago':
        return {
          bg: 'bg-white border border-slate-200 text-slate-700 border-slate-200',
          icon: <Clock className="w-3 h-3 text-slate-400" />
        };
      case 'Cancelado':
      case 'Reclamo / Devolución':
        return {
          bg: 'bg-rose-50 text-rose-300 border-rose-200',
          icon: <AlertCircle className="w-3 h-3 text-rose-600" />
        };
      default:
        return {
          bg: 'bg-white border border-slate-200 text-slate-700 border-slate-200',
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  const getShippingBadgeColor = (type: string) => {
    if (type.includes('Flex')) return 'bg-amber-50 text-amber-600 border-amber-200';
    if (type.includes('Full')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (type.includes('Colecta')) return 'bg-blue-50 text-blue-600 border-blue-200';
    return 'bg-purple-50 text-purple-600 border-purple-200';
  };

  const allStatuses: OrderStatus[] = [
    'Por despachar',
    'En camino',
    'Entregado',
    'Pendiente de pago',
    'Cancelado',
    'Reclamo / Devolución'
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col gap-3 mb-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Registro de Ventas en Vivo</span>
              <span className="text-xs font-mono font-bold bg-white border border-slate-200 text-amber-600 px-2 py-0.5 rounded-full">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'orden' : 'órdenes'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Datos sincronizados directamente desde Google Sheets (actualización cada 30m por Gemini Spark)
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por orden, cliente, SKU..."
              value={filterOptions.searchQuery}
              onChange={(e) => onUpdateFilter({ searchQuery: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {filterOptions.searchQuery && (
              <button
                onClick={() => onUpdateFilter({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Badges & Quick Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 text-xs">
          
          <span className="text-slate-400 text-[11px] font-semibold uppercase flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtrar:
          </span>

          {/* Status Quick Chips */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'Por despachar', label: 'Por Despachar (Urgente)' },
              { id: 'En camino', label: 'En Camino' },
              { id: 'Entregado', label: 'Entregados' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onUpdateFilter({ statusFilter: tab.id })}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterOptions.statusFilter === tab.id
                    ? 'bg-amber-500 text-slate-900 font-bold shadow-sm'
                    : 'bg-slate-50 text-slate-400 hover:text-slate-800 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Shipping Method Dropdown Filter */}
          <select
            value={filterOptions.shippingFilter}
            onChange={(e) => onUpdateFilter({ shippingFilter: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos los envíos</option>
            <option value="Flex en el día">Flex en el día</option>
            <option value="Mercado Envíos Full">Mercado Envíos Full</option>
            <option value="Mercado Envíos Colecta">Mercado Envíos Colecta</option>
            <option value="Retiro en Fábrica / Acordar">Retiro en Fábrica</option>
          </select>

          {/* Reset Filters if any active */}
          {(filterOptions.statusFilter !== 'all' || filterOptions.shippingFilter !== 'all' || filterOptions.searchQuery) && (
            <button
              onClick={() => onUpdateFilter({ statusFilter: 'all', shippingFilter: 'all', searchQuery: '', channelFilter: 'all' })}
              className="text-[11px] text-amber-600 hover:underline ml-auto"
            >
              Limpiar filtros
            </button>
          )}

        </div>

      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50/70 text-slate-500 text-xs font-medium border-y border-slate-200">
            <tr>
              <th className="py-3 px-4 font-medium whitespace-nowrap">ID / Fecha</th>
              <th className="py-3 px-4 font-medium">Producto / Modelo</th>
              <th className="py-3 px-4 font-medium">Comprador / Destino</th>
              <th className="py-3 px-4 font-medium text-right">Cant.</th>
              <th className="py-3 px-4 font-medium text-right">Total ($ ARS)</th>
              <th className="py-3 px-4 font-medium text-right">Neto Cucciolos</th>
              <th className="py-3 px-4 font-medium">Envío</th>
              <th className="py-3 px-4 font-medium">Estado Venta</th>
              <th className="py-3 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No se encontraron ventas con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const statusBadge = getStatusBadge(order.status);
                const isDropdownOpen = statusDropdownOpenId === order.id;

                return (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    {/* ID & Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-medium text-slate-900">{order.id}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {order.timestamp}
                      </div>
                    </td>

                    {/* Product & Variant */}
                    <td className="py-3 px-4 min-w-[240px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                          <img src={getProductThumbnail(order.productTitle, order.variant).imageUrl} alt={order.productTitle} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="font-medium text-slate-900 group-hover:text-slate-700 transition-colors truncate" title={order.productTitle}>
                            {order.productTitle}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            <span className="font-mono">{order.sku}</span>
                            <span className="mx-1.5 text-slate-300">•</span>
                            <div className="inline-flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: getProductThumbnail(order.productTitle, order.variant).colorHex }}></span>
                              {getProductThumbnail(order.productTitle, order.variant).colorName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Buyer & City */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {order.buyer}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {order.buyerCity}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 text-right tabular-nums text-slate-900">
                      {order.quantity}
                    </td>

                    {/* Total ARS */}
                    <td className="py-3 px-4 text-right tabular-nums text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    {/* Net Amount */}
                    <td className="py-3 px-4 text-right tabular-nums font-medium text-slate-900">
                      {formatCurrency(order.netAmount)}
                    </td>

                    {/* Shipping Method */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getShippingBadgeColor(order.shippingType)}`}>
                        {order.shippingType}
                      </span>
                    </td>

                    {/* Order Status with Quick Change */}
                    <td className="py-3 px-4 relative" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setStatusDropdownOpenId(isDropdownOpen ? null : order.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${statusBadge.bg} hover:shadow-sm`}
                          title="Clic para cambiar estado"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          <span>{order.status}</span>
                          <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                        </button>

                        {/* Status Dropdown Menu */}
                        {isDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 w-44 bg-slate-50 border border-slate-200 rounded-lg shadow-xl py-1 z-20">
                            {allStatuses.map(st => (
                              <button
                                key={st}
                                onClick={() => {
                                  onUpdateOrderStatus(order.id, st);
                                  setStatusDropdownOpenId(null);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-white border border-slate-200 ${
                                  order.status === st ? 'text-amber-600 font-bold bg-white' : 'text-slate-700'
                                }`}
                              >
                                <span>{st}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
                        title="Ver detalle completo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Feed (Optimized for Phones & Tablets) */}
      <div className="lg:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No se encontraron ventas con los filtros seleccionados.
          </div>
        ) : (
          filteredOrders.map(order => {
            const statusBadge = getStatusBadge(order.status);

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 active:bg-white transition-colors"
              >
                {/* Top Row: ID, Time, and Status */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 text-xs">{order.id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{order.timestamp}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                    {statusBadge.icon}
                    <span>{order.status}</span>
                  </span>
                </div>

                {/* Product Title & Variant */}
                <div className="flex items-start gap-2.5 mt-2.5">
                  <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden shrink-0 bg-white">
                    <img src={getProductThumbnail(order.productTitle, order.variant).imageUrl} alt={order.productTitle} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">
                      {order.productTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      <span className="font-mono text-slate-700 font-semibold">{order.sku}</span> · {order.variant}
                    </p>
                    <div className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                      <span className="w-2 h-2 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: getProductThumbnail(order.productTitle, order.variant).colorHex }}></span>
                      {getProductThumbnail(order.productTitle, order.variant).colorName}
                    </div>
                  </div>
                </div>

                {/* Buyer & Shipping */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1 text-slate-700">
                    <User className="w-3 h-3 text-slate-400" />
                    {order.buyer}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getShippingBadgeColor(order.shippingType)}`}>
                    {order.shippingType}
                  </span>
                </div>

                {/* Bottom Row: Amount & Actions */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Total: </span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="text-[10px] text-amber-600 font-mono ml-1.5 font-semibold">
                      (Neto: {formatCurrency(order.netAmount)})
                    </span>
                  </div>

                  <button className="text-amber-600 text-xs font-semibold flex items-center gap-0.5">
                    <span>Ver</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl overflow-hidden text-slate-800 max-h-[90vh] flex flex-col justify-between">
            
            <div>
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-amber-600 text-base">{selectedOrder.id}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedOrder.status).bg}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white border border-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Info Body */}
              <div className="space-y-3.5 py-4 overflow-y-auto max-h-[60vh]">
                
                {/* Product Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Producto Cucciolos</div>
                  
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-white">
                      <img src={getProductThumbnail(selectedOrder.productTitle, selectedOrder.variant).imageUrl} alt={selectedOrder.productTitle} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{selectedOrder.productTitle}</h4>
                      <div className="inline-flex items-center gap-1.5 mt-1 text-xs text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: getProductThumbnail(selectedOrder.productTitle, selectedOrder.variant).colorHex }}></span>
                        <span className="font-medium">{getProductThumbnail(selectedOrder.productTitle, selectedOrder.variant).colorName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-400">
                    <div>SKU: <span className="text-slate-800 font-mono font-bold">{selectedOrder.sku}</span></div>
                    <div>Variante: <span className="text-slate-800">{selectedOrder.variant}</span></div>
                    <div>Categoría: <span className="text-slate-800">{selectedOrder.category}</span></div>
                    <div>Cantidad: <span className="text-slate-800 font-bold font-mono">{selectedOrder.quantity} u.</span></div>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Desglose Financiero MercadoLibre</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>Precio Unitario ({selectedOrder.quantity}x):</span>
                      <span className="font-mono">{formatCurrency(selectedOrder.unitPrice)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>Total Venta Bruto:</span>
                      <span className="font-mono text-sm">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 text-xs">
                      <span>- Comisión MercadoLibre (~15%):</span>
                      <span className="font-mono">-{formatCurrency(selectedOrder.mlCommission)}</span>
                    </div>
                    {selectedOrder.shippingCost > 0 && (
                      <div className="flex justify-between text-slate-400 text-xs">
                        <span>Costo Envío / Flex:</span>
                        <span className="font-mono">{formatCurrency(selectedOrder.shippingCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-amber-600 text-sm border-t border-slate-200 pt-1.5">
                      <span>Ganancia Neta Cucciolos:</span>
                      <span className="font-mono">{formatCurrency(selectedOrder.netAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Buyer & Logistics */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Logística & Cliente</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Comprador ML:</span>
                      <span className="font-medium text-slate-900">{selectedOrder.buyer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Ciudad / Destino:</span>
                      <span className="font-medium text-slate-900">{selectedOrder.buyerCity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tipo de Envío:</span>
                      <span className="font-medium text-slate-900">{selectedOrder.shippingType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Canal:</span>
                      <span className="font-medium text-slate-900">{selectedOrder.channel}</span>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-amber-200/90">
                      <span className="font-bold text-amber-600 text-[11px] block">Notas / Observaciones:</span>
                      {selectedOrder.notes}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">Cambiar estado:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newSt = e.target.value as OrderStatus;
                    onUpdateOrderStatus(selectedOrder.id, newSt);
                    setSelectedOrder({ ...selectedOrder, status: newSt });
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-amber-700 font-bold focus:outline-none"
                >
                  {allStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
