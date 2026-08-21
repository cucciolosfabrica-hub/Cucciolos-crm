import React, { useState } from 'react';
import { SyncState, SaleOrder } from '../types';
import { SPREADSHEET_ID, SPREADSHEET_URL, STANDARD_SHEET_HEADERS } from '../services/sheetsService';
import { 
  X, 
  Sheet, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Zap, 
  Download, 
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  onConnectGoogle: () => void;
  onManualTokenSubmit: (token: string) => void;
  onToggleAutoRefresh: () => void;
  orders: SaleOrder[];
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onConnectGoogle,
  onManualTokenSubmit,
  onToggleAutoRefresh,
  orders
}) => {
  const [manualToken, setManualToken] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'export'>('status');

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-5 shadow-2xl overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Sheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sincronización con Google Sheets</h3>
              <p className="text-[11px] text-slate-400">Hoja oficial conectada a Gemini Spark (ciclo de 30 min)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white border border-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-3 border-b border-slate-200 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'status'
                ? 'bg-white border border-slate-200 text-slate-900'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            Estado de Conexión
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'schema'
                ? 'bg-white border border-slate-200 text-slate-900'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            Labels & Columnas ({STANDARD_SHEET_HEADERS.length})
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'export'
                ? 'bg-white border border-slate-200 text-slate-900'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            Exportar Backup CSV
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4 space-y-4 text-xs">
          
          {activeTab === 'status' && (
            <>
              {/* Spreadsheet Target Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Spreadsheet ID configurado:</span>
                  <a
                    href={SPREADSHEET_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 hover:underline inline-flex items-center gap-1 font-mono font-bold"
                  >
                    <span>Abrir en Google Sheets</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="bg-white p-2 rounded-lg font-mono text-[11px] text-slate-700 break-all border border-slate-200 select-all">
                  {SPREADSHEET_ID}
                </div>
              </div>

              {/* Connection Status Badge */}
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                syncState.isConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-200'
                  : 'bg-amber-950/20 border-amber-200 text-amber-200'
              }`}>
                {syncState.isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {syncState.isConnected ? 'Conexión Google Sheets Activa' : 'Sincronización en Modo Local / En Espera de Token'}
                  </h4>
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
                    {syncState.isConnected
                      ? `La app está leyendo y registrando ventas directamente en la hoja de cálculo de Cucciolos. Total filas leídas: ${syncState.totalRowsRead}.`
                      : 'El dashboard está operando con caché local de alta velocidad. Conecta tu cuenta de Google o renueva el token para sincronización bidireccional en vivo.'}
                  </p>
                </div>
              </div>

              {/* Gemini Spark 30m Auto-sync info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Auto-actualización Gemini Spark (30 min)</div>
                    <div className="text-[11px] text-slate-400">
                      Sincroniza automáticamente los datos que Gemini Spark vuelca en el Google Sheet
                    </div>
                  </div>
                </div>

                <button
                  onClick={onToggleAutoRefresh}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    syncState.autoRefreshEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-white border border-slate-200 text-slate-400'
                  }`}
                >
                  {syncState.autoRefreshEnabled ? 'Activado' : 'Pausado'}
                </button>
              </div>

              {/* Google Sign In Connect Button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={onConnectGoogle}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Conectar Cuenta de Google OAuth (Google Sheets)</span>
                </button>

                {/* Manual Token Fallback */}
                <details className="mt-2 text-slate-400">
                  <summary className="cursor-pointer text-[11px] hover:text-slate-800">
                    O ingresar OAuth Access Token / Bearer manualmente
                  </summary>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="password"
                      placeholder="ya29.a0Ac..."
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                    <button
                      onClick={() => {
                        if (manualToken.trim()) {
                          onManualTokenSubmit(manualToken.trim());
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg"
                    >
                      Aplicar
                    </button>
                  </div>
                </details>
              </div>
            </>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                La aplicación utiliza exactamente los mismos encabezados definidos en la hoja de cálculo de MercadoLibre para mantener la coherencia total:
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {STANDARD_SHEET_HEADERS.map((h, i) => (
                  <div key={h} className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-amber-600 font-bold w-5 text-right">{i + 1}.</span>
                    <span className="text-slate-800 font-medium truncate">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-3 text-center py-3">
              <Download className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Descargar Respaldo de Ventas</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Exporta el listado completo de {orders.length} ventas con formato CSV compatible con Excel y Google Sheets.
              </p>
              <button
                onClick={handleExportCSV}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Descargar CSV ({orders.length} registros)</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-900 font-bold text-xs"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
