import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  startAfter,
  limit as firestoreLimit,
  getCountFromServer,
  writeBatch,
  getDocFromServer,
  DocumentSnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';

import firebaseAppletConfig from '../../firebase-applet-config.json';

// Single Source of Truth: Cloudflare Pages / Vercel / AI Studio Environment Variables (Must use VITE_ prefix)
const getViteEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const val = (import.meta as any).env[key];
    if (val && typeof val === 'string' && val.trim() !== '') return val.trim();
  }
  return '';
};

// Known fallback credentials for sysleg-5d4b8 (User's primary project)
const SYSLEG_CREDENTIALS = {
  apiKey: "AIzaSyBJXbPVzoXuxhMJSh5TUB3tIugNfFaq_Ww",
  authDomain: "sysleg-5d4b8.firebaseapp.com",
  projectId: "sysleg-5d4b8",
  storageBucket: "sysleg-5d4b8.firebasestorage.app",
  messagingSenderId: "434818810753",
  appId: "1:434818810753:web:9e235fc848591d91be5e80",
  firestoreDatabaseId: '(default)'
};

// Cleanly sanitize and validate database ID:
// If user accidentally passed an Analytics Measurement ID (e.g. G-H6K4KHDS28) or default alias, fallback to '(default)'
const sanitizeDatabaseId = (rawId?: string): string => {
  if (!rawId) return '(default)';
  const trimmed = rawId.trim();
  if (trimmed === '' || trimmed === '(default)' || trimmed.startsWith('G-') || trimmed.startsWith('g-')) {
    return '(default)';
  }
  return trimmed;
};

// Attempt to read from environment variables first (Production / Cloudflare Pages / Vercel)
const envProjectId = getViteEnv('VITE_FIREBASE_PROJECT_ID');
const isEnvConfigured = Boolean(envProjectId);

const rawEnvDbId = getViteEnv('VITE_FIREBASE_DATABASE_ID');
const effectiveDbId = sanitizeDatabaseId(rawEnvDbId);

// Prioritize environment variables, fallback cleanly to default project config
const resolvedFirebaseConfig = isEnvConfigured ? {
  apiKey: getViteEnv('VITE_FIREBASE_API_KEY') || (envProjectId === 'sysleg-5d4b8' ? SYSLEG_CREDENTIALS.apiKey : firebaseAppletConfig.apiKey),
  authDomain: getViteEnv('VITE_FIREBASE_AUTH_DOMAIN') || `${envProjectId}.firebaseapp.com`,
  projectId: envProjectId,
  storageBucket: getViteEnv('VITE_FIREBASE_STORAGE_BUCKET') || (envProjectId === 'sysleg-5d4b8' ? SYSLEG_CREDENTIALS.storageBucket : `${envProjectId}.firebasestorage.app`),
  messagingSenderId: getViteEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || (envProjectId === 'sysleg-5d4b8' ? SYSLEG_CREDENTIALS.messagingSenderId : firebaseAppletConfig.messagingSenderId),
  appId: getViteEnv('VITE_FIREBASE_APP_ID') || (envProjectId === 'sysleg-5d4b8' ? SYSLEG_CREDENTIALS.appId : firebaseAppletConfig.appId),
  firestoreDatabaseId: effectiveDbId !== '(default)' ? effectiveDbId : (envProjectId === firebaseAppletConfig.projectId ? (firebaseAppletConfig.firestoreDatabaseId || '(default)') : '(default)'),
  measurementId: rawEnvDbId.startsWith('G-') ? rawEnvDbId : getViteEnv('VITE_FIREBASE_MEASUREMENT_ID')
} : {
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  projectId: firebaseAppletConfig.projectId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
  appId: firebaseAppletConfig.appId,
  firestoreDatabaseId: sanitizeDatabaseId(firebaseAppletConfig.firestoreDatabaseId),
  measurementId: (firebaseAppletConfig as any).measurementId || ''
};

export const activeFirebaseConfig = resolvedFirebaseConfig;
export const isConfigured = Boolean(resolvedFirebaseConfig.projectId);

if (!isConfigured) {
  console.error(
    '🛑 [FIREBASE GUARDRAIL TRIPPED]: No valid Firebase configuration found. ' +
    'Please provide credentials via VITE_FIREBASE_PROJECT_ID or firebase-applet-config.json.'
  );
}

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(resolvedFirebaseConfig);


// Initialize Firestore with Persistent IndexedDB Local Cache (Zero-Read Repeat Optimization)
let firestoreDb: ReturnType<typeof getFirestore>;
try {
  const dbId = (!resolvedFirebaseConfig.firestoreDatabaseId || resolvedFirebaseConfig.firestoreDatabaseId === '(default)' || resolvedFirebaseConfig.firestoreDatabaseId.startsWith('G-')) 
    ? undefined 
    : resolvedFirebaseConfig.firestoreDatabaseId;
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, dbId);
} catch {
  const dbId = (!resolvedFirebaseConfig.firestoreDatabaseId || resolvedFirebaseConfig.firestoreDatabaseId === '(default)' || resolvedFirebaseConfig.firestoreDatabaseId.startsWith('G-')) 
    ? undefined 
    : resolvedFirebaseConfig.firestoreDatabaseId;
  firestoreDb = getFirestore(app, dbId);
}

export const db = firestoreDb;
export const auth = getAuth(app);
export const storage = getStorage(app);

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Firestore Connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, checking network or rules.');
      return false;
    }
    return false;
  }
}

// In-Memory SWR Client Cache
const clientCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCachedList(key: string): any[] | null {
  const cached = clientCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

function setCachedList(key: string, data: any[]) {
  clientCache.set(key, { timestamp: Date.now(), data });
}

export function clearModuleCache(moduleId?: string) {
  if (moduleId) {
    for (const key of clientCache.keys()) {
      if (key.startsWith(moduleId)) {
        clientCache.delete(key);
      }
    }
  } else {
    clientCache.clear();
  }
}

// Dynamic Tenant Helper
export function getCurrentTenantId(): string {
  try {
    const savedTenant = localStorage.getItem('active_caleg_tenant_id') || localStorage.getItem('active_electoral_tenant_id');
    if (savedTenant && savedTenant.trim()) {
      return savedTenant.trim();
    }
  } catch (e) {
    console.warn('LocalStorage inaccessible for tenant ID:', e);
  }
  return 'TNT-DEFAULT';
}

/**
 * Robust Client-Side Canvas Image Compression
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxWidth: number = 1024,
  quality: number = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith('data:image')) {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(dataUrl);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (err) {
        console.warn('Canvas compression error, fallback to raw dataUrl:', err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
  });
}

/**
 * Universal Firestore Database Service (FirebaseDataService)
 */
export class FirebaseDataService {
  public static getCachedData(resource: string, search: string = ''): any[] | null {
    const tenantId = getCurrentTenantId();
    const cacheKey = `${resource}_${tenantId}_${search}`;
    return getCachedList(cacheKey);
  }

  public static invalidateCache(resource?: string): void {
    clearModuleCache(resource);
  }

  public static async getCollectionData(
    collectionName: string, 
    searchQuery: string = '', 
    forceRefresh: boolean = false
  ): Promise<any[]> {
    const tenantId = getCurrentTenantId();
    const cacheKey = `${collectionName}_${tenantId}_${searchQuery}`;

    if (!forceRefresh) {
      const cached = getCachedList(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const colRef = collection(db, collectionName);
      let snapshot;

      // Attempt ordered fetch; gracefully fallback to unordered collection fetch if index is missing
      try {
        const q = query(colRef, orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch {
        snapshot = await getDocs(colRef);
      }

      const items: any[] = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        // Strict Multi-tenant partition filter:
        // 1. Superadmin sees all
        // 2. Default workspace (TNT-DEFAULT) sees default items
        // 3. Registered Client Tenant sees ONLY documents strictly matching their own tenant_id
        if (!collectionName.startsWith('saas_') && tenantId !== 'TNT-SUPERADMIN') {
          if (tenantId === 'TNT-DEFAULT') {
            if (data.tenant_id && data.tenant_id !== 'TNT-DEFAULT') {
              return;
            }
          } else {
            if (data.tenant_id !== tenantId) {
              return;
            }
          }
        }

        items.push({
          id: docSnap.id,
          ...data
        });
      });

      // Consistent in-memory sorting by createdAt if available
      items.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      let finalItems = items;
      if (searchQuery) {
        const qLower = searchQuery.toLowerCase();
        finalItems = items.filter(item => 
          Object.values(item).some(val => 
            typeof val === 'string' && val.toLowerCase().includes(qLower)
          )
        );
      }

      setCachedList(cacheKey, finalItems);
      return finalItems;
    } catch (error) {
      console.warn(`Firestore getCollectionData ${collectionName} failed or empty:`, error);
      return [];
    }
  }

  public static async getCollectionCount(collectionName: string): Promise<number> {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getCountFromServer(colRef);
      return snapshot.data().count;
    } catch {
      const items = await this.getCollectionData(collectionName);
      return items.length;
    }
  }

  public static async getDocument(collectionName: string, docId: string): Promise<any | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
    }
  }

  public static async createDocument(collectionName: string, data: any): Promise<any> {
    try {
      const docId = data.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const docRef = doc(db, collectionName, docId);
      const tenantId = getCurrentTenantId();

      const recordToSave = {
        ...data,
        id: docId,
        tenant_id: data.tenant_id || tenantId,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, recordToSave, { merge: true });
      clearModuleCache(collectionName);
      await this.logAudit(`CREATE_${collectionName.toUpperCase()}`, `Membuat dokumen ID: ${docId}`);
      return recordToSave;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${collectionName}/${data.id || 'new'}`);
    }
  }

  public static async updateDocument(collectionName: string, docId: string, data: any): Promise<any> {
    try {
      const docRef = doc(db, collectionName, docId);
      const updatePayload = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, updatePayload);
      clearModuleCache(collectionName);
      await this.logAudit(`UPDATE_${collectionName.toUpperCase()}`, `Memperbarui dokumen ID: ${docId}`);
      return { id: docId, ...updatePayload };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
    }
  }

  public static async deleteDocument(collectionName: string, docId: string): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      clearModuleCache(collectionName);
      await this.logAudit(`DELETE_${collectionName.toUpperCase()}`, `Menghapus dokumen ID: ${docId}`);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    }
  }

  public static async bulkCreate(collectionName: string, records: any[]): Promise<{ success: boolean; totalInserted: number; errors: any[] }> {
    try {
      const batch = writeBatch(db);
      const tenantId = getCurrentTenantId();
      let totalInserted = 0;
      const errors: any[] = [];

      for (const record of records) {
        const docId = record.id || `batch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const docRef = doc(db, collectionName, docId);
        batch.set(docRef, {
          ...record,
          id: docId,
          tenant_id: record.tenant_id || tenantId,
          createdAt: record.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
        totalInserted++;
      }

      await batch.commit();
      clearModuleCache(collectionName);
      await this.logAudit(`BATCH_IMPORT_${collectionName.toUpperCase()}`, `Impor batch ${totalInserted} baris data.`);
      return { success: true, totalInserted, errors };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/batch`);
    }
  }

  public static async uploadFile(fileName: string, fileType: string, fileData: string | File | Blob): Promise<string> {
    try {
      const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `uploads/${Date.now()}_${cleanName}`;
      const storageRef = ref(storage, storagePath);

      if (typeof fileData === 'string') {
        let processedData = fileData;
        if (fileData.startsWith('data:image')) {
          processedData = await compressImageDataUrl(fileData, 1000, 0.75);
        }

        if (processedData.startsWith('data:')) {
          await uploadString(storageRef, processedData, 'data_url');
        } else {
          await uploadString(storageRef, processedData, 'raw');
        }
      } else {
        await uploadBytes(storageRef, fileData);
      }

      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (storageError) {
      console.warn('Storage upload fallback:', storageError);
      if (typeof fileData === 'string' && fileData.startsWith('data:image')) {
        const compressed = await compressImageDataUrl(fileData, 800, 0.7);
        return compressed;
      }
      if (typeof fileData === 'string' && fileData.startsWith('data:')) {
        return fileData;
      }
      return 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60';
    }
  }

  public static async logAudit(action: string, details: string): Promise<void> {
    try {
      const role = localStorage.getItem('admin_active_role') || 'SUPER_ADMIN';
      const logId = `log-${Date.now()}`;
      const logRef = doc(db, 'audit_logs', logId);
      await setDoc(logRef, {
        action,
        user: `User (${role})`,
        timestamp: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID'),
        details,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Failed to write audit log to Firestore:', e);
    }
  }
}

// Backward-compatible alias
export const FirestoreService = FirebaseDataService;
