import React, { useState } from 'react';
import { ProductInventory, SaleOrder, ShippingType, OrderStatus, SalesChannel } from '../types';
import { X, PlusCircle, Sparkles, Check, DollarSign, Package } from 'lucide-react';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductInventory[];
  onAddSale: (newSale: SaleOrder) => Promise<void>;
  isSyncing: boolean;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddSale,
  isSyncing
}) => {
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [quantity, setQuantity] = useState(1);
  const [shippingType, setShippingType] = useState<ShippingType>('Flex en el día');
  const [channel, setChannel] = useState<SalesChannel>('MercadoLibre Premium');
  const [status, setStatus] = useState<OrderStatus>('Por despachar');
  const [buyer, setBuyer] = useState('');
  const [buyerCity, setBuyerCity] = useState('CABA - Palermo');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.sku === selectedSku) || products[0];
  const unitPrice = currentProduct?.price || 48900;
  const totalAmount = unitPrice * quantity;
  const mlCommission = Math.round(totalAmount * (channel === 'MercadoLibre Premium' ? 0.16 : 0.13));
  const netAmount = totalAmount - mlCommission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    setSubmitting(true);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const randomOrderId = `#200000${Math.floor(849000 + Math.random() * 9999)}`;

    const newSale: SaleOrder = {
      id: randomOrderId,
      timestamp: formattedDate,
      productTitle: currentProduct.title,
      sku: currentProduct.sku,
      variant: currentProduct.variant,
      category: currentProduct.category,
      quantity,
      unitPrice,
      totalAmount,
      mlCommission,
      netAmount,
      shippingType,
      shippingCost: shippingType === 'Mercado Envíos Full' ? 0 : 3800,
      status,
      buyer: buyer.trim() || `comprador_ml_${Math.floor(100 + Math.random() * 900)}`,
      buyerCity: buyerCity.trim() || 'CABA / GBA',
      channel,
      notes: notes.trim()
    };

    try {
      await onAddSale(newSale);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillQuickSample = () => {
    const randomProd = products[Math.floor(Math.random() * products.length)];
    if (randomProd) {
      setSelectedSku(randomProd.sku);
    }
    const sampleBuyers = ['veterinaria_nordelta', 'agustin_labrador', 'lucia_gatos_felices', 'estudio_juridico_palermo', 'carolina_canes'];
    const sampleCities = ['CABA - Belgrano', 'CABA - Recoleta', 'San Isidro, GBA', 'Rosario, SF', 'Córdoba Capital'];
    setBuyer(sampleBuyers[Math.floor(Math.random() * sampleBuyers.length)]);
    setBuyerCity(sampleCities[Math.floor(Math.random() * sampleCities.length)]);
    setQuantity(1);
    setShippingType('Flex en el día');
    setNotes('Venta automática generada para simulación.');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 font-bold">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registrar Nueva Venta ML</h3>
              <p className="text-[11px] text-slate-400">Sincroniza directamente con Google Sheets y actualiza stock</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white border border-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Autofil */}
        <div className="flex items-center justify-between py-2 px-3 my-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-400">¿Deseas autocompletar un ejemplo real?</span>
          <button
            type="button"
            onClick={handleFillQuickSample}
            className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar Venta Rápida</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Product Select */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Producto Cucciolos & Modelo:</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
            >
              {products.map(p => (
                <option key={p.sku} value={p.sku}>
                  [{p.sku}] {p.title} - {p.variant} ({formatCurrency(p.price)})
                </option>
              ))}
            </select>
            {currentProduct && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
                <span>Stock fábrica: <strong className={currentProduct.currentStock <= 3 ? 'text-rose-600 font-mono' : 'text-emerald-600 font-mono'}>{currentProduct.currentStock} u.</strong></span>
                <span>Precio Unitario: <strong className="text-slate-800 font-mono">{formatCurrency(currentProduct.price)}</strong></span>
              </div>
            )}
          </div>

          {/* Quantity & Channel Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cantidad:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Canal de Venta:</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as SalesChannel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="MercadoLibre Premium">MercadoLibre Premium (Cuotas)</option>
                <option value="MercadoLibre Clásica">MercadoLibre Clásica</option>
                <option value="Mercado Envíos Full">Mercado Envíos Full</option>
                <option value="Tienda Directa Cucciolos">Tienda Directa / Showroom</option>
              </select>
            </div>
          </div>

          {/* Shipping & Initial Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tipo de Envío:</label>
              <select
                value={shippingType}
                onChange={(e) => setShippingType(e.target.value as ShippingType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="Flex en el día">Flex en el día</option>
                <option value="Mercado Envíos Colecta">Mercado Envíos Colecta</option>
                <option value="Mercado Envíos Full">Mercado Envíos Full</option>
                <option value="Retiro en Fábrica / Acordar">Retiro en Fábrica</option>
                <option value="Correo / Encomienda">Correo / Encomienda</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Estado de Venta:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="Por despachar">Por despachar</option>
                <option value="En camino">En camino</option>
                <option value="Entregado">Entregado</option>
                <option value="Pendiente de pago">Pendiente de pago</option>
              </select>
            </div>
          </div>

          {/* Buyer & Destination City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Usuario Comprador ML:</label>
              <input
                type="text"
                placeholder="ej: cliente_mascotas99"
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Ciudad / Destino:</label>
              <input
                type="text"
                placeholder="ej: CABA - Palermo"
                value={buyerCity}
                onChange={(e) => setBuyerCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Calculated Totals Box */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Venta:</span>
              <span className="font-mono text-base font-extrabold text-slate-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Neto Cucciolos:</span>
              <span className="font-mono text-base font-extrabold text-amber-600">{formatCurrency(netAmount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {successMsg ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Registrado!</span>
                </>
              ) : submitting ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Confirmar Venta</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
