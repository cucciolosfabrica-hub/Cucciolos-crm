import { SaleOrder, ProductInventory, ShippingType, OrderStatus, SalesChannel, ProductCategory } from '../types';

export const SPREADSHEET_ID = '1917rSlsGpaxRYigZH3KwUzGtTLboBJGnFs-6jGyBmoM';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=0#gid=0`;

const STORAGE_KEYS = {
  ORDERS: 'cucciolos_crm_orders_v1',
  PRODUCTS: 'cucciolos_crm_products_v1',
  ACCESS_TOKEN: 'cucciolos_gapi_token',
  TOKEN_EXPIRY: 'cucciolos_gapi_token_exp',
  LAST_SYNC: 'cucciolos_last_sync_timestamp',
  CUSTOM_SHEET_ID: 'cucciolos_custom_sheet_id'
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; expires_in?: number }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

// Default standard sheet headers that we initialize if sheet is empty or when creating new rows
export const STANDARD_SHEET_HEADERS = [
  'ID Venta',
  'Fecha y Hora',
  'Producto',
  'SKU',
  'Variante / Talle / Color',
  'Cantidad',
  'Precio Unitario ($ ARS)',
  'Total Venta ($ ARS)',
  'Comisión ML ($)',
  'Neto Cucciolos ($)',
  'Tipo de Envío',
  'Estado de Venta',
  'Comprador ML',
  'Ciudad / Destino',
  'Canal de Venta',
  'Notas / Seguimiento'
];

export function getStoredToken(): string | null {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (token && expiry && Date.now() < parseInt(expiry, 10)) {
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredToken(token: string, expiresInSeconds: number = 3599) {
  try {
    // We extend the expiry artificially to 30 days so the user stays "logged in" in the UI.
    // If the token actually expires, the API will fail and fallback to Firestore gracefully.
    const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); 
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
  } catch (e) {
    console.warn('Could not persist OAuth token in localStorage', e);
  }
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  } catch {}
}

export function loadCachedData(): { orders: SaleOrder[]; products: ProductInventory[] } {
  try {
    const ordersStr = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const productsStr = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return {
      orders: ordersStr ? JSON.parse(ordersStr) : [],
      products: productsStr ? JSON.parse(productsStr) : [],
    };
  } catch (e) {
    console.warn('Error reading local cache', e);
    return { orders: [], products: [] };
  }
}

export function saveCachedData(orders: SaleOrder[], products: ProductInventory[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (e) {
    console.warn('Error writing local cache', e);
  }
}

// Clean number parser for currency values like "$ 48.900,00", "48900", "48.900"
export function parseNumericValue(val: any, fallback = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const str = String(val).trim().replace(/[$\s]/g, '');
  if (!str) return fallback;
  // Handle Argentine format e.g. "48.900,50" or standard "48900.50"
  let cleanStr = str;
  if (cleanStr.includes('.') && cleanStr.includes(',')) {
    cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
  } else if (cleanStr.includes(',') && !cleanStr.includes('.')) {
    cleanStr = cleanStr.replace(',', '.');
  } else if (cleanStr.includes('.') && cleanStr.indexOf('.') === cleanStr.lastIndexOf('.') && cleanStr.length - cleanStr.indexOf('.') === 4) {
    // Looks like 48.900 (thousands separator)
    cleanStr = cleanStr.replace('.', '');
  }
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? fallback : parsed;
}

// Map row array from Google Sheet into SaleOrder
export function mapSheetRowToOrder(row: any[], headerMap: Record<string, number>, rowIndex: number): SaleOrder | null {
  if (!row || row.length === 0 || !row[0]) return null;

  const getCol = (possibleKeys: string[]): string => {
    for (const key of possibleKeys) {
      const idx = headerMap[key.toLowerCase()];
      if (idx !== undefined && row[idx] !== undefined && row[idx] !== null) {
        return String(row[idx]).trim();
      }
    }
    return '';
  };

  const id = getCol(['id venta', 'id', 'orden', '# orden', '# orden ml', 'nro orden', 'codigo venta']) || `#200000${849000 + rowIndex}`;
  const timestamp = getCol(['fecha y hora', 'fecha', 'timestamp', 'fecha venta', 'hora']) || new Date().toISOString().replace('T', ' ').slice(0, 16);
  const productTitle = getCol(['producto', 'titulo', 'título', 'publicacion', 'publicación', 'nombre', 'descripcion', 'descripción', 'detalle', 'item', 'artículo', 'articulo']) || `Producto de fila ${rowIndex}`;
  const sku = getCol(['sku', 'codigo', 'código', 'referencia', 'ref', 'id producto']) || `SKU-FILA-${rowIndex}`;
  const variant = getCol(['variante / talle / color', 'variante', 'talle', 'color', 'modelo', 'tamaño', 'medida']) || '-';
  
  const quantity = Math.max(1, Math.round(parseNumericValue(getCol(['cantidad', 'unidades', 'cant']), 1)));
  const totalAmount = parseNumericValue(getCol(['total venta ($ ars)', 'total', 'monto total', 'total venta', 'precio total']), 45000);
  const unitPrice = parseNumericValue(getCol(['precio unitario ($ ars)', 'precio unitario', 'precio unit', 'precio']), totalAmount / quantity);
  
  // Calculate commission if not in sheet (ML standard is approx 13-15%)
  const commissionRaw = parseNumericValue(getCol(['comisión ml ($)', 'comision ml', 'comision', 'comisión']), 0);
  const mlCommission = commissionRaw > 0 ? commissionRaw : Math.round(totalAmount * 0.15);
  const netAmount = parseNumericValue(getCol(['neto cucciolos ($)', 'neto', 'monto neto', 'ganancia neta']), totalAmount - mlCommission);

  const shippingRaw = getCol(['tipo de envío', 'tipo envio', 'envio', 'envío', 'metodo envio']);
  let shippingType: ShippingType = 'Mercado Envíos Full';
  if (/flex/i.test(shippingRaw)) shippingType = 'Flex en el día';
  else if (/colecta/i.test(shippingRaw)) shippingType = 'Mercado Envíos Colecta';
  else if (/retiro|acordar|fabrica|fábrica/i.test(shippingRaw)) shippingType = 'Retiro en Fábrica / Acordar';
  else if (/correo|encomienda/i.test(shippingRaw)) shippingType = 'Correo / Encomienda';

  const statusRaw = getCol(['estado de venta', 'estado', 'status', 'estado envio']);
  let status: OrderStatus = 'Entregado';
  if (/despachar|pendiente despacho|preparar/i.test(statusRaw)) status = 'Por despachar';
  else if (/camino|transito|tránsito|enviado/i.test(statusRaw)) status = 'En camino';
  else if (/pago|pendiente/i.test(statusRaw)) status = 'Pendiente de pago';
  else if (/cancelado|anulado/i.test(statusRaw)) status = 'Cancelado';
  else if (/reclamo|devolucion|devolución/i.test(statusRaw)) status = 'Reclamo / Devolución';

  const buyer = getCol(['comprador ml', 'comprador', 'usuario', 'cliente', 'nombre comprador']) || 'comprador_ml';
  const buyerCity = getCol(['ciudad / destino', 'ciudad', 'destino', 'localidad', 'provincia', 'ubicacion']) || 'CABA / GBA';

  const channelRaw = getCol(['canal de venta', 'canal', 'plataforma', 'tipo publicacion']);
  let channel: SalesChannel = 'MercadoLibre Premium';
  if (/clasica|clásica/i.test(channelRaw)) channel = 'MercadoLibre Clásica';
  else if (/full/i.test(channelRaw)) channel = 'Mercado Envíos Full';
  else if (/tienda|web|directa/i.test(channelRaw)) channel = 'Tienda Directa Cucciolos';

  // Infer category from product title
  let category: ProductCategory = 'Cuchas & Moisés';
  if (/colchoneta/i.test(productTitle)) category = 'Colchonetas Antidesgarro';
  else if (/donut|nido|donut|anti-estres/i.test(productTitle)) category = 'Camas Donut & Nido';
  else if (/bolso|transportador|canil/i.test(productTitle)) category = 'Bolsos de Transporte';
  else if (/almohadon|almohadón/i.test(productTitle)) category = 'Almohadones & Accesorios';

  const notes = getCol(['notas / seguimiento', 'notas', 'observaciones', 'comentarios']);

  return {
    id,
    timestamp,
    productTitle,
    sku,
    variant,
    category,
    quantity,
    unitPrice,
    totalAmount,
    mlCommission,
    netAmount,
    shippingType,
    shippingCost: shippingType === 'Mercado Envíos Full' ? 0 : 3800,
    status,
    buyer,
    buyerCity,
    channel,
    notes,
    sheetRowIndex: rowIndex
  };
}

// Fetch live sheet values using Google Sheets REST API
export async function fetchLiveSpreadsheetData(token: string, spreadsheetId: string = SPREADSHEET_ID, existingProducts: ProductInventory[] = []): Promise<{
  orders: SaleOrder[];
  products: ProductInventory[];
  rawHeaders: string[];
  totalRows: number;
}> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z500?valueRenderOption=FORMATTED_VALUE`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMsg = `Error HTTP ${response.status}`;
    try {
      const errJson = JSON.parse(errorBody);
      parsedMsg = errJson?.error?.message || parsedMsg;
    } catch {}
    throw new Error(parsedMsg);
  }

  const data = await response.json();
  const rows: any[][] = data.values || [];

  if (rows.length === 0) {
    // Empty sheet, return defaults
    return {
      orders: [],
      products: [],
      rawHeaders: STANDARD_SHEET_HEADERS,
      totalRows: 0
    };
  }

  const headerRow: string[] = rows[0].map(h => String(h || '').trim());
  const headerMap: Record<string, number> = {};
  headerRow.forEach((col, idx) => {
    headerMap[col.toLowerCase()] = idx;
  });

  const parsedOrders: SaleOrder[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row && row.some(cell => String(cell || '').trim().length > 0)) {
      const order = mapSheetRowToOrder(row, headerMap, i + 1);
      if (order) {
        parsedOrders.push(order);
      }
    }
  }

  // If no rows parsed (only header row existed), use empty array
  const finalOrders = parsedOrders.length > 0 ? parsedOrders : [];

  // Derive base products from orders since there is no separate products sheet
  const derivedProducts: ProductInventory[] = [];
  const seenSkus = new Set<string>();
  
  finalOrders.forEach(o => {
    if (!seenSkus.has(o.sku)) {
      seenSkus.add(o.sku);
      const existing = existingProducts.find(p => p.sku === o.sku);
      derivedProducts.push({
        sku: o.sku,
        title: o.productTitle,
        category: o.category || 'Varios',
        variant: o.variant || '-',
        currentStock: existing ? existing.currentStock : 50, // Use existing stock or default to 50
        minStockThreshold: existing ? existing.minStockThreshold : 5,
        price: o.unitPrice,
        status: existing ? existing.status : 'optimal',
        unitsSoldTotal: existing ? existing.unitsSoldTotal : 0
      });
    }
  });

  // Recalculate inventory products and stock status
  const products = recalculateInventory(finalOrders, derivedProducts);

  return {
    orders: finalOrders,
    products,
    rawHeaders: headerRow,
    totalRows: parsedOrders.length
  };
}

// Append a new sale directly to Google Sheet
export async function appendSaleToGoogleSheet(
  sale: SaleOrder, 
  token: string, 
  spreadsheetId: string = SPREADSHEET_ID
): Promise<boolean> {
  const rowValues = [
    sale.id,
    sale.timestamp,
    sale.productTitle,
    sale.sku,
    sale.variant,
    sale.quantity,
    sale.unitPrice,
    sale.totalAmount,
    sale.mlCommission,
    sale.netAmount,
    sale.shippingType,
    sale.status,
    sale.buyer,
    sale.buyerCity,
    sale.channel,
    sale.notes || ''
  ];

  const range = 'A1:P1';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [rowValues]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo registrar la venta en Google Sheets: ${errorText}`);
  }

  return true;
}

// Update order status in Google Sheet if rowIndex is known
export async function updateOrderStatusInSheet(
  rowIndex: number,
  newStatus: OrderStatus,
  token: string,
  spreadsheetId: string = SPREADSHEET_ID
): Promise<boolean> {
  if (!rowIndex || rowIndex < 2) return false;
  // Assuming column L is 'Estado de Venta'
  const range = `L${rowIndex}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [[newStatus]]
    })
  });

  return response.ok;
}

// Recalculate inventory levels based on current stock catalog and recent orders
export function recalculateInventory(orders: SaleOrder[], baseProducts: ProductInventory[]): ProductInventory[] {
  const soldBySku: Record<string, number> = {};
  
  orders.forEach(o => {
    soldBySku[o.sku] = (soldBySku[o.sku] || 0) + (o.quantity || 1);
  });

  return baseProducts.map(prod => {
    const sold = soldBySku[prod.sku] || 0;
    // Calculate realistic remaining stock
    const currentStock = Math.max(0, prod.currentStock);
    let status: 'critical' | 'low' | 'optimal' = 'optimal';
    if (currentStock <= 2) {
      status = 'critical';
    } else if (currentStock <= prod.minStockThreshold) {
      status = 'low';
    }

    return {
      ...prod,
      currentStock,
      status,
      unitsSoldTotal: prod.unitsSoldTotal + sold
    };
  });
}
