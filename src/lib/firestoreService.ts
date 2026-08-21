import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  writeBatch,
  auth,
  googleProvider,
  GoogleAuthProvider,
  signInWithPopup
} from './firebase';
import { SaleOrder, ProductInventory } from '../types';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const SETTINGS_COLLECTION = 'settings';

/**
 * Perform Google Sign-In with popup to get a real OAuth token with Google Sheets scope
 */
export async function signInWithGoogleOAuth(): Promise<{ token: string; user: any }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (!token) {
      throw new Error('No se pudo obtener el token de acceso de Google.');
    }
    return { token, user: result.user };
  } catch (error: any) {
    console.error('Error signing in with Google OAuth:', error);
    throw error;
  }
}

export async function clearAllFirestoreData(): Promise<void> {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(ordersCol);
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    
    const productsCol = collection(db, PRODUCTS_COLLECTION);
    const pSnapshot = await getDocs(productsCol);
    pSnapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    
    await batch.commit();
    console.log('Cleared all firestore data');
  } catch (e) {
    console.error('Failed to clear firestore data', e);
  }
}

/**
 * Load all orders from Firestore.
 */
export async function loadOrdersFromFirestore(): Promise<SaleOrder[]> {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(ordersCol);
    
    if (snapshot.empty) {
      return [];
    }

    const orders: SaleOrder[] = [];
    snapshot.forEach(docSnap => {
      orders.push(docSnap.data() as SaleOrder);
    });

    // Sort newest first
    return orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.warn('Firestore loadOrders error:', error);
    return [];
  }
}

/**
 * Load all product inventory from Firestore.
 */
export async function loadProductsFromFirestore(): Promise<ProductInventory[]> {
  try {
    const productsCol = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsCol);
    
    if (snapshot.empty) {
      return [];
    }

    const products: ProductInventory[] = [];
    snapshot.forEach(docSnap => {
      products.push(docSnap.data() as ProductInventory);
    });

    return products;
  } catch (error) {
    console.warn('Firestore loadProducts error:', error);
    return [];
  }
}

/**
 * Save / Update a single sale order in Firestore
 */
export async function saveOrderToFirestore(order: SaleOrder): Promise<void> {
  try {
    const safeDocId = order.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const orderRef = doc(db, ORDERS_COLLECTION, safeDocId);
    await setDoc(orderRef, {
      ...order,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Failed to save order to Firestore:', error);
  }
}

/**
 * Update stock for a product in Firestore
 */
export async function updateProductStockInFirestore(sku: string, newStock: number, status: 'optimal' | 'low' | 'critical'): Promise<void> {
  try {
    const safeDocId = sku.replace(/[^a-zA-Z0-9_-]/g, '_');
    const prodRef = doc(db, PRODUCTS_COLLECTION, safeDocId);
    await setDoc(prodRef, {
      sku,
      currentStock: newStock,
      status,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Failed to update product stock in Firestore:', error);
  }
}

/**
 * Batch sync orders & products from Google Sheets into Firestore
 */
export async function batchSyncSheetsDataToFirestore(orders: SaleOrder[], products: ProductInventory[]): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. Get all current orders and products to find what to delete
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));

    const currentOrderIds = new Set(ordersSnap.docs.map(d => d.id));
    const currentProductSkus = new Set(productsSnap.docs.map(d => d.id));

    // 2. Add/Update incoming items
    const newOrderIds = new Set<string>();
    for (const order of orders.slice(0, 200)) {
      const safeId = order.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      newOrderIds.add(safeId);
      const orderRef = doc(db, ORDERS_COLLECTION, safeId);
      batch.set(orderRef, { ...order, updatedAt: new Date().toISOString() }, { merge: true });
    }

    const newProductSkus = new Set<string>();
    for (const prod of products) {
      const safeSku = prod.sku.replace(/[^a-zA-Z0-9_-]/g, '_');
      newProductSkus.add(safeSku);
      const prodRef = doc(db, PRODUCTS_COLLECTION, safeSku);
      batch.set(prodRef, { ...prod, updatedAt: new Date().toISOString() }, { merge: true });
    }

    // 3. Delete items that are no longer in the sheet
    currentOrderIds.forEach(id => {
      if (!newOrderIds.has(id)) {
        batch.delete(doc(db, ORDERS_COLLECTION, id));
      }
    });

    currentProductSkus.forEach(sku => {
      if (!newProductSkus.has(sku)) {
        batch.delete(doc(db, PRODUCTS_COLLECTION, sku));
      }
    });

    // Save sync status metadata
    const configRef = doc(db, SETTINGS_COLLECTION, 'sync');
    batch.set(configRef, {
      lastSyncTime: new Date().toISOString(),
      totalOrders: orders.length,
      autoRefreshEnabled: true
    }, { merge: true });

    await batch.commit();
  } catch (error) {
    console.warn('Failed to batch sync to Firestore:', error);
  }
}
