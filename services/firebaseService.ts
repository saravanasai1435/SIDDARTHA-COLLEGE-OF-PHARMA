import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AppState } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (errMessage.includes('permission') || errMessage.includes('insufficient') || errMessage.includes('PERMISSION_DENIED')) {
    console.error('Firestore Security Rule Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  }
}

/**
 * Validates connection to Firestore. Runs initially on mount.
 */
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test completed.");
    return true;
  } catch (error) {
    console.warn("Firestore connection check notice:", error);
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
