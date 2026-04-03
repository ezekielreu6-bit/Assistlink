'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. Initialize the Firebase App at the top level so it's available for export
let app: FirebaseApp;

if (!getApps().length) {
  try {
    // Attempt to initialize via Firebase App Hosting environment variables
    app = initializeApp();
  } catch (e) {
    // Fallback to the config object
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

// 2. Initialize and EXPORT the SDKs
// This fixes the "db is not exported" and "app is not defined" errors
export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };

/**
 * IMPORTANT: I kept your requested functions below, 
 * but updated them to use the 'app' instance created above.
 */
export function initializeFirebase() {
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// 3. Re-export your other modules
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';