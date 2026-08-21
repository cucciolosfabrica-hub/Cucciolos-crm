import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SyncState, SaleOrder } from '../types';
import { SPREADSHEET_ID, SPREADSHEET_URL, STANDARD_SHEET_HEADERS } from '../services/sheetsService';
import { 
  Sheet, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Zap, 
  Download, 
  ShieldCheck,
  Database,
  Layers,
  Sparkles,
  Clock
} from 'lucide-react';

interface SyncSettingsViewProps {
  syncState: SyncState;
  onConnectGoogle: () => void;
  onManualTokenSubmit: (token: string) => void;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  orders: SaleOrder[];
}

export const SyncSettingsView: React.FC<SyncSettingsViewProps> = ({
  syncState,
  onConnectGoogle,
  onManualTokenSubmit,
  onToggleAutoRefresh,
  onRefresh,
  orders
}) => {
  const [manualToken, setManualToken] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'export'>('status');

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Sheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Centro de Sincronización Google Sheets & Gemini Spark
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Conexión segura vía OAuth 2.0 y base de datos persistente en la nube de Google
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-amber-600 hover:text-amber-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Abrir Hoja de Cálculo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onRefresh}
              disabled={syncState.isSyncing}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin text-slate-900' : ''}`} />
              <span>{syncState.isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-200 pt-3 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'status'
                ? 'bg-amber-500 text-slate-900 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-800 bg-slate-50 border border-slate-200'
            }`}
          >
            Estado de Conexión & OAuth
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'schema'
                ? 'bg-amber-500 text-slate-900 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-800 bg-slate-50 border border-slate-200'
            }`}
          >
            Estructura de Columnas ({STANDARD_SHEET_HEADERS.length})
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'export'
                ? 'bg-amber-500 text-slate-900 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-800 bg-slate-50 border border-slate-200'
            }`}
          >
            Exportar CSV / Respaldo
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Connection Status & Account */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-200/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Estado de la Conexión Google Sheets</span>
            </h3>

            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
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
                  {syncState.isConnected ? 'Conexión Google Sheets Activa' : 'En Espera de Cuenta de Google'}
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {syncState.isConnected
                    ? `La aplicación está conectada en tiempo real. Se leyeron ${syncState.totalRowsRead} filas de ventas de la hoja oficial de Cucciolos.`
                    : 'La aplicación está lista para sincronizar. Haz clic en el botón de Google para iniciar sesión y vincular tu hoja de cálculo.'}
                </p>
              </div>
            </div>

            {/* Google OAuth Connect Button */}
            <div className="space-y-3 pt-2">
              <button
                onClick={onConnectGoogle}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Vincular Cuenta de Google (Google Sheets)</span>
              </button>

              {/* Manual Token Option */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>O ingresar OAuth Access Token manualmente:</span>
                </span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="ya29.a0Ac..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                  />
                  <button
                    onClick={() => {
                      if (manualToken.trim()) {
                        onManualTokenSubmit(manualToken.trim());
                      }
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg text-xs"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini Spark & Cloud DB Info */}
          <div className="space-y-4">
            
            {/* Auto-Refresh Spark Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-200/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Ciclo de Actualización Gemini Spark
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Auto-sincronización periódica cada 30 minutos
                    </p>
                  </div>
                </div>

                <button
                  onClick={onToggleAutoRefresh}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    syncState.autoRefreshEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-white border border-slate-200 text-slate-400'
                  }`}
                >
                  {syncState.autoRefreshEnabled ? 'Activado (30m)' : 'Pausado'}
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-400">Próxima sincronización en:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatCountdown(syncState.nextSyncCountdown)}</span>
                </div>
              </div>
            </div>

            {/* Cloud Persistence Verification */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-200/50 space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Database className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Persistencia Cloud Firestore</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Todas las ventas, ajustes de stock y cambios de estado se sincronizan automáticamente en Google Cloud Firestore. Los datos se mantienen a salvo incluso si recargas o cierras el navegador.
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Base de datos en la nube conectada</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'schema' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg shadow-slate-200/50 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Mapeo de Columnas de la Hoja de Google Sheets
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              El sistema lee de forma inteligente las siguientes columnas para extraer cada venta:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {STANDARD_SHEET_HEADERS.map((h, i) => (
              <div key={h} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2.5">
                <span className="font-mono text-xs text-amber-600 font-bold w-6 text-right shrink-0">{i + 1}.</span>
                <span className="text-slate-800 text-xs font-semibold truncate">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg shadow-slate-200/50 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Exportar Respaldo Completo</h3>
            <p className="text-xs text-slate-400 mt-1">
              Descarga un archivo CSV estructurado con las {orders.length} órdenes registradas en tu CRM Cucciolos.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all inline-flex items-center gap-2 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Descargar CSV ({orders.length} registros)</span>
          </button>
        </div>
      )}

    </motion.div>
  );
};
