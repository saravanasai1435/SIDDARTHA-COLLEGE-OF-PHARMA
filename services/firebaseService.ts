import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AppState } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to Firestore. Runs initially on mount.
 */
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore safety connection test completed.");
    return true;
  } catch (error) {
    console.warn("Firestore connection check failed:", error);
    return false;
  }
}

/**
 * Retrieves the safety portal state directly from Firestore.
 */
export async function fetchStateFromFirestore(): Promise<AppState | null> {
  const path = 'portalData/current';
  try {
    const docRef = doc(db, 'portalData', 'current');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().state) {
      console.log("State safely retrieved from Firestore Database.");
      return docSnap.data().state as AppState;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Atomically backs up the entire state to the Firestore DB safety net.
 */
export async function saveStateToFirestore(state: AppState): Promise<boolean> {
  const path = 'portalData/current';
  try {
    const docRef = doc(db, 'portalData', 'current');
    await setDoc(docRef, {
      state: state,
      updatedAt: new Date().toISOString()
    });
    console.log("Institutional state safely backed up to Google Firestore.");
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}
