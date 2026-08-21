import React from 'react';
import { 
  Menu, 
  Search,
  PlusCircle,
  RefreshCw,
  CalendarDays
} from 'lucide-react';
import { SyncState, MetricsSummary } from '../types';
import { NavSection } from './Sidebar';

interface TopNavbarProps {
  currentSection: NavSection;
  onOpenMobileMenu: () => void;
  syncState: SyncState;
  metrics: MetricsSummary;
  onRefresh: () => void;
  onOpenNewSale: () => void;
  onOpenConnectModal: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentSection,
  onOpenMobileMenu,
  syncState,
  metrics,
  onRefresh,
  onOpenNewSale,
}) => {
  
  const getTitle = () => {
    switch (currentSection) {
      case 'dashboard': return 'Panel de Control';
      case 'sales': return 'Ventas ML';
      case 'inventory': return 'Inventario';
      case 'analytics': return 'Reportes';
      case 'sync_settings': return 'Configuración';
      default: return 'Resumen';
    }
  };

  const currentDate = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-[#f8f9fc]/95 backdrop-blur-md pt-6 pb-4 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 border-b border-slate-200/50">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 bg-white rounded-lg border border-slate-200 shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight truncate">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium mr-2">Buscar...</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Date */}
        <div className="hidden lg:flex text-sm text-slate-500 font-medium capitalize">
          {currentDate}
        </div>

        {/* Actions (Sync & New) */}
        <div className="flex items-center gap-2 md:pl-4 md:border-l border-slate-200">
          <button 
            onClick={onRefresh}
            className="text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors p-2 md:px-3 md:py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center gap-2 shrink-0"
            title="Sincronizar Datos"
          >
            <RefreshCw className={`w-5 h-5 md:w-4 md:h-4 ${syncState.isSyncing ? 'animate-spin text-amber-500' : ''}`} />
            <span className="hidden md:inline text-sm font-medium">Sincronizar</span>
          </button>
          
          <button 
            onClick={onOpenNewSale}
            className="flex items-center justify-center bg-slate-900 text-white p-2.5 md:px-3 md:py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors gap-2 shadow-sm shrink-0"
          >
            <PlusCircle className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">Nueva Venta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
