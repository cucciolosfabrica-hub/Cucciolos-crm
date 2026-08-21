import { 
  SaleOrder, 
  ProductInventory, 
  SyncState, 
  MetricsSummary, 
  FilterOptions, 
  OrderStatus 
} from '../types';
import { 
  getStoredToken, 
  saveStoredToken, 
  SPREADSHEET_ID 
} from '../services/sheetsService';
import {
  loadOrdersFromFirestore,
  loadProductsFromFirestore,
  saveOrderToFirestore,
  updateProductStockInFirestore,
  batchSyncSheetsDataToFirestore,
  signInWithGoogleOAuth
} from './firestoreService';
import firebaseConfig from '../../firebase-applet-config.json';

export const OAUTH_CLIENT_ID = (firebaseConfig as any).oAuthClientId || '856860599378-5q5du908ch44nhv1dhgstp6ajpvjjpvd.apps.googleusercontent.com';

/**
 * Initialize OAuth token request using Google Identity Services (GSI) or Firebase popup
 */
export async function authenticateWithGoogle(): Promise<string> {
  // Method 1: Try Firebase Auth popup with Google Provider
  try {
    const { token } = await signInWithGoogleOAuth();
    if (token) {
      saveStoredToken(token, 3599);
      return token;
    }
  } catch (firebaseErr) {
    console.warn('Firebase signInWithPopup fallback to GSI client:', firebaseErr);
  }

  // Method 2: Try Google Identity Services (GSI) Token Client
  return new Promise((resolve, reject) => {
    if (typeof window.google?.accounts?.oauth2 !== 'undefined') {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: OAUTH_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/spreadsheets',
          callback: (response: any) => {
            if (response.access_token) {
              saveStoredToken(response.access_token, response.expires_in || 3599);
              resolve(response.access_token);
            } else {
              reject(new Error(response.error || 'No se concedieron permisos'));
            }
          }
        });
        client.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    } else {
      reject(new Error('Google Identity Services no está cargado aún'));
    }
  });
}
