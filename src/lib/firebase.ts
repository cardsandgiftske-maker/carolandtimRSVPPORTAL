import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { RSVPResponse } from '../types/rsvp';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Non-fatal connectivity probe
    console.debug('Firestore probe result:', error);
  }
}
testConnection();

const RSVPS_COLLECTION = 'rsvps';

export async function fetchRSVPsFromFirestore(): Promise<RSVPResponse[]> {
  try {
    const snapshot = await getDocs(collection(db, RSVPS_COLLECTION));
    const items: RSVPResponse[] = [];
    snapshot.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as RSVPResponse);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, RSVPS_COLLECTION);
    return [];
  }
}

export async function saveRSVPToFirestore(rsvp: RSVPResponse): Promise<void> {
  const docRef = doc(db, RSVPS_COLLECTION, rsvp.id);
  try {
    await setDoc(docRef, rsvp);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${RSVPS_COLLECTION}/${rsvp.id}`);
  }
}

export async function deleteRSVPFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, RSVPS_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${RSVPS_COLLECTION}/${id}`);
  }
}

export function subscribeToRSVPs(
  onData: (rsvps: RSVPResponse[]) => void,
  onError?: (error: unknown) => void
) {
  const colRef = collection(db, RSVPS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: RSVPResponse[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as RSVPResponse);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, RSVPS_COLLECTION);
      if (onError) onError(error);
    }
  );
}
