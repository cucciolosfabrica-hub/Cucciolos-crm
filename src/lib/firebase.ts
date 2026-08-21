import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore with configured databaseId or default
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

export { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  writeBatch, 
  onSnapshot,
  GoogleAuthProvider,
  signInWithPopup
};
