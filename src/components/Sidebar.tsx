import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Boxes, 
  BarChart3, 
  Settings2, 
  LogOut
} from 'lucide-react';
import { SyncState, MetricsSummary } from '../types';
import logoImage from '../assets/images/logo.png';

export type NavSection = 'dashboard' | 'sales' | 'inventory' | 'analytics' | 'sync_settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  syncState: SyncState;
  metrics: MetricsSummary;
  onOpenNewSale: () => void;
  onRefresh: () => void;
  onOpenConnectModal: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  metrics,
  collapsed,
}) => {
  const navItems = [
    { id: 'dashboard' as NavSection, label: 'Panel', icon: LayoutDashboard },
    { id: 'sales' as NavSection, label: 'Ventas ML', icon: ShoppingBag, badge: metrics.pendingDispatchCount > 0 },
    { id: 'inventory' as NavSection, label: 'Inventario', icon: Boxes, badge: metrics.criticalStockCount > 0 || metrics.lowStockAlertCount > 0 },
    { id: 'analytics' as NavSection, label: 'Reportes', icon: BarChart3 },
    { id: 'sync_settings' as NavSection, label: 'Configuración', icon: Settings2 },
  ];

  return (
    <aside className={`bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-40 transition-all duration-300 ${collapsed ? 'w-20' : 'w-[260px]'}`}>
      {/* Brand */}
      <div className="p-6 flex items-center justify-center mb-2">
        {!collapsed ? (
          <img src={logoImage} alt="Cucciolos" className="h-16 w-auto object-contain" />
        ) : (
          <img src={logoImage} alt="C" className="h-10 w-auto object-contain" />
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center p-2.5 rounded-lg transition-all group relative ${
                isActive 
                  ? 'bg-slate-100 text-slate-900 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
              } ${collapsed ? 'justify-center' : 'justify-start gap-3'}`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-slate-900 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={isActive ? 2.5 : 2} />
              
              {!collapsed && (
                <span className="text-sm">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span className="ml-auto w-5 h-5 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  !
                </span>
              )}
              
              {collapsed && item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 border-2 border-white" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile / Settings */}
      <div className="p-3 mt-auto border-t border-slate-100">
        <div className={`flex items-center p-2 rounded-lg ${collapsed ? 'justify-center' : 'justify-start gap-3'}`}>
          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
            <img src="https://ui-avatars.com/api/?name=Admin&background=f1f5f9&color=0f172a" alt="Admin" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="flex flex-col text-left truncate flex-1 min-w-0">
              <span className="text-slate-900 text-sm font-semibold truncate">Ann Smith</span>
              <span className="text-xs text-slate-500 truncate">Admin</span>
            </div>
          )}
          {!collapsed && (
             <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="Cerrar Sesión">
               <LogOut className="w-4 h-4" />
             </button>
          )}
        </div>
      </div>
    </aside>
  );
};

