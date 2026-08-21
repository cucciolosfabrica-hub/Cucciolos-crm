import React from 'react';
import { RefreshCw, PlusCircle, ExternalLink, Sheet, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { SyncState } from '../types';
import { SPREADSHEET_URL } from '../services/sheetsService';

interface HeaderProps {
  syncState: SyncState;
  onRefresh: () => void;
  onOpenNewSale: () => void;
  onOpenConnectModal: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  syncState,
  onRefresh,
  onOpenNewSale,
  onOpenConnectModal,
}) => {
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Identity */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-900 font-black text-xl tracking-tighter">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">CUCCIOLOS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                  CRM MercadoLibre
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Fábrica de Camas & Confort para Mascotas · <a href="https://cucciolos.com.ar/" target="_blank" rel="noreferrer" className="text-slate-700 hover:text-amber-600 transition-colors inline-flex items-center gap-0.5">cucciolos.com.ar <ExternalLink className="w-2.5 h-2.5 inline" /></a>
              </p>
            </div>
          </div>

          {/* Mobile Quick Action */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-sync-btn"
              onClick={onRefresh}
              disabled={syncState.isSyncing}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
              title="Sincronizar ahora"
            >
              <RefreshCw className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin text-amber-600' : ''}`} />
            </button>
            <button
              id="mobile-new-sale-btn"
              onClick={onOpenNewSale}
              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Venta</span>
            </button>
          </div>
        </div>

        {/* Sync Status Info & Controls */}
        <div className="flex flex-wrap items-center justify-between md:justify-end w-full md:w-auto gap-2.5 text-xs">
          
          {/* Gemini Spark 30-min AutoSync Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <div className="flex items-center gap-1.5 text-amber-600 font-medium">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>Gemini Spark:</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Auto 30m</span>
              <span className="font-mono text-amber-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                {formatCountdown(syncState.nextSyncCountdown)}
              </span>
            </div>
          </div>

          {/* Google Sheets Connection Pill */}
          <button
            id="google-sheets-status-pill"
            onClick={onOpenConnectModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              syncState.isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-900/40'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-white border border-slate-200 hover:text-slate-900'
            }`}
          >
            <Sheet className={`w-3.5 h-3.5 ${syncState.isConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="font-medium">
              {syncState.isConnected ? 'Sheets Conectado' : 'Conectar Sheets'}
            </span>
            {syncState.isConnected ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-600" />
            )}
          </button>

          {/* Open Google Sheet Direct Link */}
          <a
            id="open-sheet-link"
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-white border border-slate-200 transition-colors"
            title="Abrir Google Spreadsheet oficial"
          >
            <span>Ver Hoja</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Sync Button Desktop */}
          <button
            id="desktop-sync-btn"
            onClick={onRefresh}
            disabled={syncState.isSyncing}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin text-amber-600' : ''}`} />
            <span>{syncState.isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>

          {/* Register New Sale Primary Button */}
          <button
            id="desktop-new-sale-btn"
            onClick={onOpenNewSale}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Venta</span>
          </button>

        </div>

      </div>
    </header>
  );
};
