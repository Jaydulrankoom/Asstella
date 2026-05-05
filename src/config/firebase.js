import { env } from './env.js';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

let firebaseConfig = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.warn("Failed to load firebase-applet-config.json:", e.message);
}

let app = null;

try {
  if (!admin.apps.length) {
    const envProjectId = env.FIREBASE_PROJECT_ID;
    const configProjectId = firebaseConfig?.projectId;

    if (env.FIREBASE_PROJECT_ID && env.FIREBASE_PRIVATE_KEY) {
      console.log("Firebase Admin: Initializing with service account env vars for project:", envProjectId);
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
      });
    } else {
      const activeProjectId = envProjectId || configProjectId;
      if (activeProjectId) {
        console.log("Firebase Admin: Initializing with project ID:", activeProjectId);
        app = admin.initializeApp({
          projectId: activeProjectId
        });
      } else {
        console.log("Firebase Admin: Initializing with default credentials");
        app = admin.initializeApp();
      }
    }
  } else {
    app = admin.apps[0];
  }
} catch (e) {
  console.warn("Firebase Admin setup error (non-fatal):", e.message);
}

const createMockQuery = () => {
  const query = {
    where: () => query,
    orderBy: () => query,
    limit: () => query,
    offset: () => query,
    get: async () => ({ docs: [], empty: true, size: 0 }),
    onSnapshot: (success) => {
      success({ docs: [], empty: true, size: 0 });
      return () => {};
    },
    count: () => ({ get: async () => ({ data: () => ({ count: 0 }) }) }),
    doc: () => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
      onSnapshot: (success) => {
        success({ exists: false, data: () => null });
        return () => {};
      },
    }),
    add: async () => ({ id: 'mock-id' }),
  };
  return query;
};

// Lazy-initialize DB to prevent startup crashes
let _db = null;
export const getDb = () => {
  if (_db) return _db;
  
  if (app) {
    try {
      const envProjectId = env.FIREBASE_PROJECT_ID;
      const configProjectId = firebaseConfig?.projectId;
      const configDbId = firebaseConfig?.firestoreDatabaseId;
      const envDbId = process.env.FIRESTORE_DATABASE_ID; // Common in AI Studio shared envs

      // Priority: 1. Env DB ID, 2. Config DB ID (if project matches), 3. Default
      const effectiveDbId = envDbId || (configDbId && (!envProjectId || envProjectId === configProjectId) ? configDbId : null);
      
      if (effectiveDbId) {
        try {
          _db = getFirestore(effectiveDbId);
          console.log(`Firebase Admin: Initialized with databaseId: ${effectiveDbId}`);
          return _db;
        } catch (e) {
          console.warn(`Failed to init Firestore with databaseId "${effectiveDbId}", falling back to default. Error: ${e.message}`);
        }
      }

      // Default fallback (e.g., "(default)" database)
      _db = getFirestore();
      console.log("Firebase Admin: Initialized with default database");
      return _db;
    } catch (error) {
      console.warn("Firestore initialization failed. Error message:", error.message);
      if (error.message.includes('NOT_FOUND') || error.message.includes('Database not found')) {
        console.error("CRITICAL: Firestore Database instance not found. Ensure the database specified in firebase-applet-config.json exists.");
      }
      
      // Return a partially working mock if everything fails to prevent total server crash
      return { 
        collection: () => createMockQuery(),
        doc: (path) => createMockQuery().doc(path)
      };
    }
  }
  
  _db = { 
    collection: () => createMockQuery(),
    doc: (path) => createMockQuery().doc(path),
    runTransaction: async () => { throw new Error("Firestore not initialized"); },
    batch: () => ({
      set: () => {},
      update: () => {},
      delete: () => {},
      commit: async () => { throw new Error("Firestore not initialized"); }
    })
  };
  return _db;
};

export const db = new Proxy({}, {
  get: (target, prop) => {
    return getDb()[prop];
  }
});

let _auth = null;
export const auth = new Proxy({}, {
  get: (target, prop) => {
    if (!_auth) {
      _auth = app ? getAuth() : { verifyIdToken: () => { throw new Error("Firebase Auth not initialized"); } };
    }
    return _auth[prop];
  }
});

let _storage = null;
export const storage = new Proxy({}, {
  get: (target, prop) => {
    if (!_storage) {
      _storage = app ? getStorage() : { bucket: () => { throw new Error("Firebase Storage not initialized"); } };
    }
    return _storage[prop];
  }
});
export { admin };

export const getTimestamp = () => admin.apps.length ? admin.firestore.FieldValue.serverTimestamp() : new Date();
