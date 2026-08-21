import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  SaleOrder, 
  ProductInventory, 
  SyncState, 
  MetricsSummary, 
  FilterOptions, 
  OrderStatus 
} from './types';
import { 
  loadCachedData, 
  saveCachedData, 
  getStoredToken, 
  saveStoredToken, 
  fetchLiveSpreadsheetData, 
  appendSaleToGoogleSheet, 
  updateOrderStatusInSheet, 
  SPREADSHEET_ID 
} from './services/sheetsService';
import {
  loadOrdersFromFirestore,
  loadProductsFromFirestore,
  saveOrderToFirestore,
  updateProductStockInFirestore,
  batchSyncSheetsDataToFirestore,
  clearAllFirestoreData
} from './lib/firestoreService';
import { authenticateWithGoogle } from './lib/authService';

// Layout & Components
import { Sidebar, NavSection } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { SalesView } from './components/SalesView';
import { InventoryView } from './components/InventoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SyncSettingsView } from './components/SyncSettingsView';
import { NewSaleModal } from './components/NewSaleModal';
import { ConnectModal } from './components/ConnectModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';

import { 
  CheckCircle2, 
  LayoutDashboard, 
  ShoppingBag, 
  Boxes, 
  BarChart3, 
  Settings2, 
  PlusCircle, 
  RefreshCw,
  X,
  Zap,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

import logoImage from './assets/images/logo.png';

export default function App() {
  // Navigation & UI States
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Core Data State (Starts clean and empty)
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [products, setProducts] = useState<ProductInventory[]>([]);

  // Modals & Notifications
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'success' | 'info' | 'error' } | null>(null);

  // Filters State
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchQuery: '',
    statusFilter: 'all',
    channelFilter: 'all',
    shippingFilter: 'all',
    categoryFilter: 'all',
    dateRange: 'all'
  });

  // Sync State
  const [syncState, setSyncState] = useState<SyncState>(() => {
    const existingToken = getStoredToken();
    return {
      spreadsheetId: SPREADSHEET_ID,
      lastSyncTime: new Date(),
      nextSyncCountdown: 1800, // 30 minutes
      isSyncing: false,
      syncError: null,
      source: existingToken ? 'google_sheets_live' : 'local_cached',
      totalRowsRead: 0,
      isConnected: !!existingToken,
      accessToken: existingToken,
      autoRefreshEnabled: true,
      geminiSparkLastUpdate: new Date().toISOString()
    };
  });

  const showToast = (title: string, desc?: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Initial Firestore Hydration
  useEffect(() => {
    async function hydrateFromFirestore() {
      // ONE-TIME PURGE OF SIMULATED DATA
      if (localStorage.getItem('purged_simulated_v2') !== 'true') {
        try {
          await clearAllFirestoreData();
          localStorage.setItem('purged_simulated_v2', 'true');
        } catch (e) {
          console.error(e);
        }
      }

      setIsInitialLoading(true);
      const existingToken = getStoredToken();
      if (!existingToken) {
        setOrders([]);
        setProducts([]);
        setIsInitialLoading(false);
        return;
      }

      try {
        const [firestoreOrders, firestoreProducts] = await Promise.all([
          loadOrdersFromFirestore(),
          loadProductsFromFirestore()
        ]);
        
        if (firestoreOrders && firestoreOrders.length > 0) {
          setOrders(firestoreOrders);
        }
        if (firestoreProducts && firestoreProducts.length > 0) {
          setProducts(firestoreProducts);
        }
      } catch (err) {
        console.warn('Could not hydrate from Firestore:', err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    hydrateFromFirestore();
  }, []);

  // 2. Perform Sync with Google Sheets & Cloud Firestore
  const performSync = useCallback(async (tokenToUse?: string) => {
    const token = tokenToUse || syncState.accessToken || getStoredToken();
    
    setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    if (token) {
      try {
        const currentProducts = await loadProductsFromFirestore();
        const liveData = await fetchLiveSpreadsheetData(token, SPREADSHEET_ID, currentProducts);
        setOrders(liveData.orders);
        setProducts(liveData.products);
        saveCachedData(liveData.orders, liveData.products);

        // Sync live data to Firestore
        batchSyncSheetsDataToFirestore(liveData.orders, liveData.products);

        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          isConnected: true,
          accessToken: token,
          source: 'google_sheets_live',
          totalRowsRead: liveData.totalRows,
          lastSyncTime: new Date(),
          nextSyncCountdown: 1800,
          geminiSparkLastUpdate: new Date().toISOString()
        }));

        showToast('¡Sincronizado con Google Sheets & Firestore!', `${liveData.orders.length} ventas actualizadas.`);
      } catch (err: any) {
        console.warn('Live sync fallback to cache/Firestore:', err);
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          syncError: err?.message || 'Error de sincronización con Google Sheets',
          lastSyncTime: new Date(),
          nextSyncCountdown: 1800
        }));
        showToast('Modo sin conexión / Firestore', 'Usando datos persistentes en Firestore y caché local.', 'info');
      }
    } else {
      setTimeout(() => {
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: new Date(),
          nextSyncCountdown: 1800
        }));
        showToast('Datos locales y Firestore actualizados', 'El dashboard está al día.');
      }, 500);
    }
  }, [syncState.accessToken]);

  // 3. Auto-sync Timer (30 minutes countdown for Gemini Spark cycles)
  useEffect(() => {
    if (!syncState.autoRefreshEnabled) return;

    const interval = setInterval(() => {
      setSyncState(prev => {
        if (prev.nextSyncCountdown <= 1) {
          performSync();
          return { ...prev, nextSyncCountdown: 1800 };
        }
        return { ...prev, nextSyncCountdown: prev.nextSyncCountdown - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [syncState.autoRefreshEnabled, performSync]);

  // 4. Initial Sync on Mount if token exists
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      performSync(token);
    }
  }, []);

  // 5. Connect Google Account via Google OAuth
  const handleConnectGoogle = async () => {
    try {
      showToast('Iniciando Google OAuth...', 'Abre la ventana emergente para conceder permisos.', 'info');
      const token = await authenticateWithGoogle();
      if (token) {
        setSyncState(prev => ({
          ...prev,
          accessToken: token,
          isConnected: true
        }));
        performSync(token);
        setIsConnectOpen(false);
        showToast('¡Cuenta de Google Conectada!', 'Acceso verificado a Google Sheets.');
      }
    } catch (e: any) {
      console.warn('Google OAuth error:', e);
      showToast('Error de autenticación', e?.message || 'No se pudo conectar la cuenta de Google', 'error');
      setIsConnectOpen(true);
    }
  };

  const handleManualTokenSubmit = (token: string) => {
    saveStoredToken(token, 3599);
    setSyncState(prev => ({
      ...prev,
      accessToken: token,
      isConnected: true
    }));
    performSync(token);
    setIsConnectOpen(false);
  };

  // 6. Register New Sale Handler
  const handleAddSale = async (newSale: SaleOrder) => {
    const updatedOrders = [newSale, ...orders];
    setOrders(updatedOrders);

    let affectedProduct: ProductInventory | undefined;
    const updatedProducts = products.map(p => {
      if (p.sku === newSale.sku) {
        const newStock = Math.max(0, p.currentStock - newSale.quantity);
        let status: 'critical' | 'low' | 'optimal' = 'optimal';
        if (newStock <= 2) status = 'critical';
        else if (newStock <= p.minStockThreshold) status = 'low';

        const updated = {
          ...p,
          currentStock: newStock,
          status,
          unitsSoldTotal: p.unitsSoldTotal + newSale.quantity
        };
        affectedProduct = updated;
        return updated;
      }
      return p;
    });
    setProducts(updatedProducts);
    saveCachedData(updatedOrders, updatedProducts);

    saveOrderToFirestore(newSale);
    if (affectedProduct) {
      updateProductStockInFirestore(affectedProduct.sku, affectedProduct.currentStock, affectedProduct.status);
    }

    const token = syncState.accessToken || getStoredToken();
    if (token) {
      try {
        await appendSaleToGoogleSheet(newSale, token, SPREADSHEET_ID);
        showToast('Venta registrada & sincronizada en Google Sheets y Firestore', `Orden ${newSale.id} añadida.`);
      } catch (err: any) {
        console.warn('Could not append to Google Sheets', err);
        showToast('Venta guardada en Firestore', 'Se sincronizará con Google Sheets en la próxima conexión.', 'info');
      }
    } else {
      showToast('Venta registrada y guardada en Firestore', `Orden ${newSale.id} añadida al CRM.`);
    }
  };

  // 7. Update Order Status Handler
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const targetOrder = orders[orderIndex];
    const updatedOrders = [...orders];
    const modifiedOrder = { ...targetOrder, status: newStatus };
    updatedOrders[orderIndex] = modifiedOrder;
    setOrders(updatedOrders);
    saveCachedData(updatedOrders, products);

    saveOrderToFirestore(modifiedOrder);

    const token = syncState.accessToken || getStoredToken();
    if (token && targetOrder.sheetRowIndex) {
      try {
        await updateOrderStatusInSheet(targetOrder.sheetRowIndex, newStatus, token, SPREADSHEET_ID);
        showToast('Estado actualizado en Google Sheets & Firestore', `${orderId} marcado como "${newStatus}"`);
      } catch (e) {
        console.warn('Status sheet update failed', e);
        showToast('Estado actualizado en Firestore', `${orderId} marcado como "${newStatus}"`);
      }
    } else {
      showToast('Estado actualizado en Firestore', `${orderId} marcado como "${newStatus}"`);
    }
  };

  // 8. Update Product Stock Directly
  const handleUpdateStock = (sku: string, newStock: number) => {
    let affectedStatus: 'critical' | 'low' | 'optimal' = 'optimal';
    const updated = products.map(p => {
      if (p.sku === sku) {
        if (newStock <= 2) affectedStatus = 'critical';
        else if (newStock <= p.minStockThreshold) affectedStatus = 'low';
        return { ...p, currentStock: newStock, status: affectedStatus };
      }
      return p;
    });
    setProducts(updated);
    saveCachedData(orders, updated);
    updateProductStockInFirestore(sku, newStock, affectedStatus);
    showToast('Stock de fábrica actualizado en Firestore', `SKU ${sku}: ${newStock} unidades.`);
  };

  // 9. Computed Metrics
  const metrics = useMemo<MetricsSummary>(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalNetRevenue = orders.reduce((sum, o) => sum + o.netAmount, 0);
    const totalUnitsSold = orders.reduce((sum, o) => sum + o.quantity, 0);
    const totalOrders = orders.length;
    const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const pendingDispatchCount = orders.filter(o => o.status === 'Por despachar').length;
    const inTransitCount = orders.filter(o => o.status === 'En camino').length;
    const deliveredCount = orders.filter(o => o.status === 'Entregado').length;

    const lowStockAlertCount = products.filter(p => p.currentStock <= p.minStockThreshold).length;
    const criticalStockCount = products.filter(p => p.currentStock <= 2).length;

    return {
      totalRevenue,
      totalNetRevenue,
      totalUnitsSold,
      totalOrders,
      averageTicket,
      pendingDispatchCount,
      inTransitCount,
      deliveredCount,
      lowStockAlertCount,
      criticalStockCount,
      growthVsYesterdayPercent: 14.8
    };
  }, [orders, products]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased selection:bg-amber-500 selection:text-black">
      
      {/* Toast Notification with Motion */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-4 z-50 pointer-events-auto"
          >
            <div className={`border px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm backdrop-blur-xl ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-100'
                : toastMessage.type === 'info'
                ? 'bg-white border-blue-200 text-blue-100'
                : 'bg-white border-amber-200 text-slate-900'
            }`}>
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : toastMessage.type === 'info' ? (
                <Zap className="w-5 h-5 text-blue-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold">{toastMessage.title}</p>
                {toastMessage.desc && <p className="text-[11px] text-slate-400 mt-0.5">{toastMessage.desc}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(sec) => setCurrentSection(sec)}
          syncState={syncState}
          metrics={metrics}
          onOpenNewSale={() => setIsNewSaleOpen(true)}
          onRefresh={() => performSync()}
          onOpenConnectModal={() => setIsConnectOpen(true)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 md:hidden flex flex-col justify-between"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={logoImage} alt="Cucciolos" className="h-8 object-contain" />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-white border border-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                {[
                  { id: 'dashboard' as NavSection, label: 'Panel de Control', icon: LayoutDashboard },
                  { id: 'sales' as NavSection, label: `Ventas ML (${orders.length})`, icon: ShoppingBag },
                  { id: 'inventory' as NavSection, label: 'Inventario', icon: Boxes },
                  { id: 'analytics' as NavSection, label: 'Reportes', icon: BarChart3 },
                  { id: 'sync_settings' as NavSection, label: 'Configuración', icon: Settings2 }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-colors ${
                        isActive 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => {
                    setIsNewSaleOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Registrar Venta</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8 bg-[#f8f9fc] h-screen overflow-y-auto">
        
        {/* Top Navbar */}
        <TopNavbar
          currentSection={currentSection}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          syncState={syncState}
          metrics={metrics}
          onRefresh={() => performSync()}
          onOpenNewSale={() => setIsNewSaleOpen(true)}
          onOpenConnectModal={() => setIsConnectOpen(true)}
        />

        {/* Dynamic Section Router */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-2 pb-24 md:pb-6">
          {isInitialLoading ? (
            <LoadingSkeleton />
          ) : !syncState.isConnected && currentSection !== 'sync_settings' ? (
            <AnimatePresence mode="wait">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-[70vh] text-center"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Settings2 className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sin Datos de Google Sheets</h2>
                <p className="text-slate-500 mt-3 max-w-md text-sm leading-relaxed">
                  Para ver tus ventas, métricas e inventario de productos, necesitas conectar tu cuenta de Google y sincronizar el documento.
                </p>
                <button 
                  onClick={() => setCurrentSection('sync_settings')}
                  className="mt-8 px-8 py-3 bg-[#c5f03a] text-[#2c2d33] hover:bg-[#b0d634] transition-colors font-bold rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className="w-5 h-5" />
                  Conectar a Sheets
                </button>
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait">
              {currentSection === 'dashboard' && (
                <DashboardView
                  key="dashboard"
                  orders={orders}
                  products={products}
                  metrics={metrics}
                  onNavigateSection={(sec) => setCurrentSection(sec)}
                  onFilterByStatus={(status) => setFilterOptions(prev => ({ ...prev, statusFilter: status }))}
                  onFilterBySku={(sku) => setFilterOptions(prev => ({ ...prev, searchQuery: sku }))}
                  onOpenNewSale={() => setIsNewSaleOpen(true)}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                />
              )}

              {currentSection === 'sales' && (
                <SalesView
                  key="sales"
                  orders={orders}
                  filterOptions={filterOptions}
                  onUpdateFilter={(newF) => setFilterOptions(prev => ({ ...prev, ...newF }))}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onOpenNewSale={() => setIsNewSaleOpen(true)}
                />
              )}

              {currentSection === 'inventory' && (
                <InventoryView
                  key="inventory"
                  products={products}
                  onUpdateStock={handleUpdateStock}
                  onFilterBySku={(sku) => setFilterOptions(prev => ({ ...prev, searchQuery: sku }))}
                  onNavigateSection={(sec) => setCurrentSection(sec)}
                />
              )}

              {currentSection === 'analytics' && (
                <AnalyticsView
                  key="analytics"
                  orders={orders}
                  products={products}
                  metrics={metrics}
                />
              )}

              {currentSection === 'sync_settings' && (
                <SyncSettingsView
                  key="sync_settings"
                  syncState={syncState}
                  onConnectGoogle={handleConnectGoogle}
                  onManualTokenSubmit={handleManualTokenSubmit}
                  onToggleAutoRefresh={() => setSyncState(prev => ({ ...prev, autoRefreshEnabled: !prev.autoRefreshEnabled }))}
                  onRefresh={() => performSync()}
                  orders={orders}
                />
              )}
            </AnimatePresence>
          )}
        </main>

      </div>

      {/* Modals */}
      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        products={products}
        onAddSale={handleAddSale}
        isSyncing={syncState.isSyncing}
      />

      <ConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        syncState={syncState}
        onConnectGoogle={handleConnectGoogle}
        onManualTokenSubmit={handleManualTokenSubmit}
        onToggleAutoRefresh={() => setSyncState(prev => ({ ...prev, autoRefreshEnabled: !prev.autoRefreshEnabled }))}
        orders={orders}
      />

      {/* Mobile Bottom Sticky Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-3 pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 relative px-2">
          
          <button
            onClick={() => setCurrentSection('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 w-16 ${
              currentSection === 'dashboard' ? 'text-amber-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Panel</span>
          </button>

          <button
            onClick={() => setCurrentSection('sales')}
            className={`flex flex-col items-center justify-center gap-1 relative w-16 ${
              currentSection === 'sales' ? 'text-amber-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span>Ventas</span>
            {metrics.pendingDispatchCount > 0 && (
              <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
            )}
          </button>

          {/* Spacer for center button */}
          <div className="w-16"></div>

          {/* Big Center Action (Absolute) */}
          <button
            onClick={() => setIsNewSaleOpen(true)}
            className="absolute left-1/2 -top-6 -translate-x-1/2 flex items-center justify-center bg-slate-900 text-white w-14 h-14 rounded-full shadow-lg shadow-slate-900/20 ring-4 ring-white active:scale-95 transition-transform"
          >
            <PlusCircle className="w-6 h-6" />
          </button>

          <button
            onClick={() => setCurrentSection('inventory')}
            className={`flex flex-col items-center justify-center gap-1 relative w-16 ${
              currentSection === 'inventory' ? 'text-amber-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <Boxes className="w-5 h-5 mb-0.5" />
            <span>Stock</span>
            {metrics.criticalStockCount > 0 && (
              <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-rose-500 animate-ping ring-2 ring-white" />
            )}
          </button>

          <button
            onClick={() => performSync()}
            disabled={syncState.isSyncing}
            className="flex flex-col items-center justify-center gap-1 w-16 hover:text-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mb-0.5 ${syncState.isSyncing ? 'animate-spin text-amber-600' : ''}`} />
            <span>Sinc</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
